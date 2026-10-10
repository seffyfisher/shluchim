-- Security hardening (from the 2026-10-10 audit / Supabase security advisors).
-- rls_auto_enable() is a SECURITY DEFINER event-trigger helper in public; anon/authenticated must not execute it via RPC.
do $$ begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
-- Belt and braces: no table/view/sequence privileges for the public API roles on the feedback objects.
revoke all on public.feedback, public.feedback_attempts, public.feedback_public_quotes from anon, authenticated, public;
revoke all on sequence public.feedback_attempts_id_seq from anon, authenticated, public;
