import { handle, safeReturnTo, validate, type FeedbackRow, type Store } from "./handler.ts";
const eq = (a: unknown, b: unknown, m = "") => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };

function mem() {
  const rows: FeedbackRow[] = []; const attempts: { ip: string; t: number }[] = [];
  const store: Store = {
    countRecent: (ip, since) => Promise.resolve(attempts.filter((a) => a.ip === ip && a.t >= Date.parse(since)).length),
    logAttempt: (ip) => { attempts.push({ ip, t: Date.now() }); return Promise.resolve(); },
    insert: (r) => { rows.push(r); return Promise.resolve(); },
  };
  return { rows, store };
}
const RT = "https://seffyfisher.github.io/shluchim/posts/x/";
const post = (body: Record<string, string>, ip = "1.2.3.4", accept = "text/html") =>
  new Request("http://x/feedback", { method: "POST", body: new URLSearchParams(body).toString(),
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip, accept, "user-agent": "test" } });
const ok = { page: "/posts/x/", return_to: RT, reaction: "helped", message: "שלום", name: "<b>דנה</b>", email: "", quote_ok: "yes", website: "" };

Deno.test("happy path → 303 thanks, row stored, name stripped", async () => {
  const m = mem(); const r = await handle(post(ok), m.store, "s");
  eq(r.status, 303); eq(r.headers.get("location"), RT + "#feedback-thanks");
  eq(m.rows.length, 1); eq(m.rows[0].name, "דנה"); eq(m.rows[0].quote_ok, true); eq(m.rows[0].email, null);
  eq(m.rows[0].ip_hash.length, 64);
});
Deno.test("honeypot → fake thanks, nothing stored", async () => {
  const m = mem(); const r = await handle(post({ ...ok, website: "spam" }), m.store, "s");
  eq(r.headers.get("location"), RT + "#feedback-thanks"); eq(m.rows.length, 0);
});
Deno.test("missing reaction / bad email / long message → error", async () => {
  const m = mem();
  for (const b of [{ ...ok, reaction: "" }, { ...ok, email: "dana@" }, { ...ok, message: "א".repeat(1001) }]) {
    const r = await handle(post(b), m.store, "s"); eq(r.headers.get("location"), RT + "#feedback-error");
  }
  eq(m.rows.length, 0);
});
Deno.test("rate limit: 6th within 10 min → slow", async () => {
  const m = mem(); let last = "";
  for (let i = 0; i < 6; i++) last = (await handle(post(ok, "9.9.9.9"), m.store, "s")).headers.get("location")!;
  eq(last, RT + "#feedback-slow"); eq(m.rows.length, 5);
});
Deno.test("open redirect blocked", () => {
  eq(safeReturnTo("https://evil.com/shluchim/"), "https://seffyfisher.github.io/shluchim/");
  eq(safeReturnTo("https://seffyfisher.github.io/other/"), "https://seffyfisher.github.io/shluchim/");
  eq(safeReturnTo("http://seffyfisher.github.io/shluchim/a/"), "https://seffyfisher.github.io/shluchim/");
  eq(safeReturnTo(RT + "?q=1#x"), RT);
});
Deno.test("JSON variant", async () => {
  const m = mem(); const r = await handle(post(ok, "5.5.5.5", "application/json"), m.store, "s");
  eq(r.status, 200); eq(await r.json(), { status: "ok" });
});
Deno.test("name trimmed to 60", () => {
  const v = validate(new URLSearchParams({ ...ok, name: "  " + "x".repeat(80) }));
  if (!v.ok) throw new Error("should be ok"); eq(v.row.name!.length, 60);
});
Deno.test("GET → 405", async () => { eq((await handle(new Request("http://x"), mem().store, "s")).status, 405); });

Deno.test("oversized body → error, nothing stored", async () => {
  const m = mem(); const r = await handle(post({ ...ok, message: "x".repeat(20000) }), m.store, "s");
  eq(r.headers.get("location")!.endsWith("#feedback-error"), true); eq(m.rows.length, 0);
});
Deno.test("SQL-ish input stored verbatim as data", async () => {
  const m = mem(); await handle(post({ ...ok, message: "'); drop table feedback;--" }), m.store, "s");
  eq(m.rows[0].message, "'); drop table feedback;--");
});
