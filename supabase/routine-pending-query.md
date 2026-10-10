# Routine: fetch new pending feedback (read-only, no email)

```bash
# SINCE = the created_at of the last row you already reported (ISO 8601), or e.g. 1970-01-01T00:00:00Z the first time.
SINCE="2026-10-10T00:00:00Z"
python3 - "$SINCE" > /tmp/fb-q.json <<'PY'
import json, sys
since = sys.argv[1].replace("'", "")
print(json.dumps({"query": f"""
  select id, created_at, page, reaction, message, name
  from public.feedback
  where status = 'pending' and created_at > '{since}'::timestamptz
  order by created_at asc
  limit 50
""", "read_only": True}))
PY
curl -sS -X POST "https://api.supabase.com/v1/projects/tyzswuffvhxnmtaoaskz/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "content-type: application/json" --data @/tmp/fb-q.json
```
Returns a JSON array of `{id, created_at, page, reaction, message, name}`. It **never** selects `email`, `ip_hash`, `user_agent` or `quote_ok`.
`SUPABASE_ACCESS_TOKEN` is an account-level token that can also write, so the query itself must stay a plain `select`. `"read_only": true` asks the API to run it read-only.
To get the full pending count: `select count(*) from public.feedback where status = 'pending'`.
