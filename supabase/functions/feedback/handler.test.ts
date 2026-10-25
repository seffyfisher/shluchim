import { DUPLICATE_WINDOW_MS, handle, safeReturnTo, validate, type FeedbackRow, type Store } from "./handler.ts";
const eq = (a: unknown, b: unknown, m = "") => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };

function mem() {
  const rows: FeedbackRow[] = []; const times: number[] = []; const attempts: { ip: string; t: number }[] = [];
  const store: Store = {
    countRecent: (ip, since) => Promise.resolve(attempts.filter((a) => a.ip === ip && a.t >= Date.parse(since)).length),
    logAttempt: (ip) => { attempts.push({ ip, t: Date.now() }); return Promise.resolve(); },
    insert: (r) => { rows.push(r); times.push(Date.now()); return Promise.resolve(); },
    recentRows: (ip, since) => Promise.resolve(rows.filter((r, i) => r.ip_hash === ip && times[i] >= Date.parse(since)).reverse()),
  };
  // age(ms): pretend every stored row was inserted that long ago (to step past the duplicate window).
  const age = (ms: number) => { for (let i = 0; i < times.length; i++) times[i] -= ms; };
  return { rows, store, age };
}
const RT = "https://shluchim.shinlamed.com/posts/x/";
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
  for (let i = 0; i < 6; i++) last = (await handle(post({ ...ok, message: `שלום ${i}` }, "9.9.9.9"), m.store, "s")).headers.get("location")!;
  eq(last, RT + "#feedback-slow"); eq(m.rows.length, 5);
});
Deno.test("open redirect blocked", () => {
  eq(safeReturnTo("https://evil.com/posts/x/"), "https://shluchim.shinlamed.com/");
  eq(safeReturnTo("https://shluchim.shinlamed.com.evil.com/posts/x/"), "https://shluchim.shinlamed.com/");
  eq(safeReturnTo("https://seffyfisher.github.io/shluchim/posts/x/"), "https://shluchim.shinlamed.com/");
  eq(safeReturnTo("http://shluchim.shinlamed.com/posts/x/"), "https://shluchim.shinlamed.com/");
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

Deno.test("double submit: identical resubmit within window → thanks, stored once", async () => {
  const m = mem();
  const a = await handle(post(ok, "7.7.7.7"), m.store, "s"); const b = await handle(post(ok, "7.7.7.7"), m.store, "s");
  eq(a.headers.get("location"), RT + "#feedback-thanks"); eq(b.headers.get("location"), RT + "#feedback-thanks");
  eq(m.rows.length, 1);
});
Deno.test("double submit: JSON variant still answers ok", async () => {
  const m = mem(); await handle(post(ok, "7.7.7.8", "application/json"), m.store, "s");
  const r = await handle(post(ok, "7.7.7.8", "application/json"), m.store, "s");
  eq(r.status, 200); eq(await r.json(), { status: "ok" }); eq(m.rows.length, 1);
});
Deno.test("double submit: empty message/email (nulls) still deduped", async () => {
  const m = mem(); const b = { ...ok, message: "", email: "" };
  await handle(post(b, "7.7.7.9"), m.store, "s"); await handle(post(b, "7.7.7.9"), m.store, "s");
  eq(m.rows.length, 1);
});
Deno.test("not a duplicate: different message / reaction / page / email / ip → stored", async () => {
  const m = mem();
  for (const b of [ok, { ...ok, message: "אחר" }, { ...ok, reaction: "not_really" }, { ...ok, page: "/posts/y/" }, { ...ok, email: "dana@example.com" }]) {
    await handle(post(b, "8.8.8.8"), m.store, "s");
  }
  await handle(post(ok, "8.8.4.4"), m.store, "s");
  eq(m.rows.length, 6);
});
Deno.test("same feedback again after the window → stored again", async () => {
  const m = mem(); await handle(post(ok, "6.6.6.6"), m.store, "s");
  m.age(DUPLICATE_WINDOW_MS + 1000);
  await handle(post(ok, "6.6.6.6"), m.store, "s");
  eq(m.rows.length, 2);
});
Deno.test("duplicate lookup failure fails open: feedback still stored", async () => {
  const m = mem(); const store: Store = { ...m.store, recentRows: () => Promise.reject(new Error("boom")) };
  const r = await handle(post(ok, "5.4.3.2"), store, "s");
  eq(r.headers.get("location"), RT + "#feedback-thanks"); eq(m.rows.length, 1);
});
