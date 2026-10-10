// Supabase Edge Function entry: feedback form endpoint for the שלוחים blog. Logic lives in handler.ts.
// Deploy: supabase functions deploy feedback --no-verify-jwt
import { handle, restStore } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL")!; // injected by Supabase
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // injected by Supabase
const salt = Deno.env.get("FEEDBACK_IP_SALT") || "";
if (!salt) console.warn("FEEDBACK_IP_SALT is not set");
const store = restStore(url, key);

Deno.serve((req) => handle(req, store, salt));
