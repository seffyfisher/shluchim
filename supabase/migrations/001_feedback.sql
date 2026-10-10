-- Feedback block for the שלוחים blog. Moderation happens in this table (Supabase dashboard):
-- set status from 'pending' to 'approved' or 'rejected'. Nothing is public by default.
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  page        text not null check (char_length(page) <= 300),
  reaction    text not null check (reaction in ('helped', 'not_really')),
  message     text check (message is null or char_length(message) <= 1000),
  name        text check (name is null or char_length(name) <= 60),
  email       text check (email is null or char_length(email) <= 254),
  quote_ok    boolean not null default false,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ip_hash     text not null,              -- sha256(salt + ip), never the raw IP
  user_agent  text check (user_agent is null or char_length(user_agent) <= 120)
);

create index if not exists feedback_status_created_idx on public.feedback (status, created_at desc);
create index if not exists feedback_ip_recent_idx on public.feedback (ip_hash, created_at desc);

-- RLS on, with NO policies: anon/authenticated get nothing. Only service_role (Edge Function, dashboard) bypasses RLS.
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

-- Rate-limit attempts (also counts rejected/spam attempts that never reach `feedback`). Same lockdown.
create table if not exists public.feedback_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists feedback_attempts_ip_idx on public.feedback_attempts (ip_hash, created_at desc);
alter table public.feedback_attempts enable row level security;
revoke all on public.feedback_attempts from anon, authenticated;

-- LATER (public quotes, not used at launch): a view exposing only approved + consented text, never email/ip.
-- The name is shown only when consent was given; otherwise anonymous. Read it at BUILD time with the service key,
-- or grant select on the view to anon if a public endpoint is ever wanted.
create or replace view public.feedback_public_quotes
with (security_invoker = true) as
  select id, created_at, page,
         message,
         case when quote_ok and name is not null and name <> '' then name else null end as name
  from public.feedback
  where status = 'approved' and quote_ok and message is not null and message <> '';
revoke all on public.feedback_public_quotes from anon, authenticated;

-- Retention (run daily via pg_cron if enabled, or manually):
--   update public.feedback set email = null where email is not null and created_at < now() - interval '90 days';
--   delete from public.feedback where status = 'rejected' and created_at < now() - interval '30 days';
--   delete from public.feedback_attempts where created_at < now() - interval '1 day';
