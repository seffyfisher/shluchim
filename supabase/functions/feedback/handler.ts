// Supabase Edge Function: feedback form endpoint for the שלוחים blog (zero client JS).
// Plain HTML form POST (application/x-www-form-urlencoded) -> validate -> insert (service role) ->
// 303 back to return_to + #feedback-thanks | #feedback-error | #feedback-slow.
// JSON answer ({status}) when the request sends Accept: application/json.
// Deploy with --no-verify-jwt (a plain form cannot send a JWT).

export const ALLOWED_PREFIX = "https://seffyfisher.github.io/shluchim/";
export const RATE_LIMIT = 5; // per IP ...
export const RATE_WINDOW_MS = 10 * 60 * 1000; // ... per 10 minutes (matches the copy "בעוד 10 דקות")
export const MAX_BODY = 16 * 1024; // bytes; a full legit form is < 5 KB
const EMAIL_RE = /^[^\s@<>"]{1,64}@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

export type Outcome = "thanks" | "error" | "slow";
export interface FeedbackRow {
  page: string; reaction: "helped" | "not_really"; message: string | null; name: string | null;
  email: string | null; quote_ok: boolean; ip_hash: string; user_agent: string | null;
}
export interface Store {
  countRecent(ipHash: string, sinceIso: string): Promise<number>;
  logAttempt(ipHash: string): Promise<void>;
  insert(row: FeedbackRow): Promise<void>;
}

export function safeReturnTo(raw: string | null): string {
  if (!raw) return ALLOWED_PREFIX;
  try {
    const u = new URL(raw);
    const clean = `${u.origin}${u.pathname}`;
    if (u.protocol === "https:" && clean.startsWith(ALLOWED_PREFIX) && !u.pathname.includes("..")) return clean;
  } catch { /* fall through */ }
  return ALLOWED_PREFIX;
}

export function stripMarkup(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function clientIp(req: Request): string {
  // Supabase's edge (Cloudflare) sets cf-connecting-ip and overwrites x-forwarded-for, so clients can't spoof it.
  const xff = req.headers.get("x-forwarded-for");
  return (req.headers.get("cf-connecting-ip") || xff?.split(",")[0] || "unknown").trim();
}

type Parsed = { ok: true; row: Omit<FeedbackRow, "ip_hash" | "user_agent"> } | { ok: false };
export function validate(f: URLSearchParams): Parsed {
  const reaction = f.get("reaction");
  if (reaction !== "helped" && reaction !== "not_really") return { ok: false };
  const pageRaw = (f.get("page") || "/").trim();
  if (!pageRaw.startsWith("/") || pageRaw.length > 300) return { ok: false };
  const message = (f.get("message") || "").replace(/\r\n/g, "\n").trim();
  if (message.length > 1000) return { ok: false };
  const name = stripMarkup(f.get("name") || "").slice(0, 60);
  const email = (f.get("email") || "").trim();
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) return { ok: false };
  return {
    ok: true,
    row: {
      page: pageRaw, reaction, message: message || null, name: name || null,
      email: email || null, quote_ok: f.get("quote_ok") === "yes",
    },
  };
}

function respond(req: Request, returnTo: string, outcome: Outcome): Response {
  const wantsJson = (req.headers.get("accept") || "").includes("application/json");
  if (wantsJson) {
    const status = outcome === "thanks" ? "ok" : outcome;
    return new Response(JSON.stringify({ status }), {
      status: outcome === "thanks" ? 200 : outcome === "slow" ? 429 : 400,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }
  return new Response(null, {
    status: 303,
    headers: { location: `${returnTo}#feedback-${outcome}`, "cache-control": "no-store" },
  });
}

export async function handle(req: Request, store: Store, salt: string): Promise<Response> {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
  let form: URLSearchParams;
  const declared = Number(req.headers.get("content-length") || "0");
  if (declared > MAX_BODY) return respond(req, ALLOWED_PREFIX, "error");
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      if (text.length > MAX_BODY) return respond(req, ALLOWED_PREFIX, "error");
      form = new URLSearchParams(text);
    }
    else if (ct.includes("multipart/form-data")) {
      const fd = await req.formData(); form = new URLSearchParams();
      for (const [k, v] of fd) if (typeof v === "string") form.append(k, v);
    } else return respond(req, ALLOWED_PREFIX, "error");
  } catch { return respond(req, ALLOWED_PREFIX, "error"); }

  const returnTo = safeReturnTo(form.get("return_to"));
  try {
    const ipHash = await sha256(salt + clientIp(req));
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    if ((await store.countRecent(ipHash, since)) >= RATE_LIMIT) return respond(req, returnTo, "slow");
    await store.logAttempt(ipHash);
    // Honeypot: filled -> pretend success, store nothing.
    if ((form.get("website") || "").trim() !== "") return respond(req, returnTo, "thanks");
    const v = validate(form);
    if (!v.ok) return respond(req, returnTo, "error");
    const ua = (req.headers.get("user-agent") || "").slice(0, 120) || null;
    await store.insert({ ...v.row, ip_hash: ipHash, user_agent: ua });
    return respond(req, returnTo, "thanks");
  } catch (e) {
    console.error("feedback error", e instanceof Error ? e.message : e);
    return respond(req, returnTo, "error");
  }
}

// PostgREST store using the service role (bypasses RLS). No SDK dependency.
export function restStore(url: string, key: string): Store {
  const h = { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" };
  const base = `${url.replace(/\/$/, "")}/rest/v1`;
  return {
    async countRecent(ipHash, sinceIso) {
      const r = await fetch(`${base}/feedback_attempts?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(sinceIso)}`,
        { method: "HEAD", headers: { ...h, prefer: "count=exact" } });
      if (!r.ok) throw new Error(`count ${r.status}`);
      return Number((r.headers.get("content-range") || "*/0").split("/")[1]) || 0;
    },
    async logAttempt(ipHash) {
      const r = await fetch(`${base}/feedback_attempts`, { method: "POST", headers: { ...h, prefer: "return=minimal" }, body: JSON.stringify({ ip_hash: ipHash }) });
      if (!r.ok) throw new Error(`attempt ${r.status}`);
    },
    async insert(row) {
      const r = await fetch(`${base}/feedback`, { method: "POST", headers: { ...h, prefer: "return=minimal" }, body: JSON.stringify(row) });
      if (!r.ok) throw new Error(`insert ${r.status}`);
    },
  };
}
