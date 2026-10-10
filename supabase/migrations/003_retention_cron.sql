-- Retention (approved by Seffy 2026-10-10): emails 90 days, rejected rows 30 days, rate-limit attempts 1 day.
-- Daily at 01:15 UTC (04:15 Israel summer time). Applied live via the Management API.
create extension if not exists pg_cron with schema pg_catalog;
select cron.unschedule('feedback-retention-daily') where exists (select 1 from cron.job where jobname = 'feedback-retention-daily');
select cron.schedule('feedback-retention-daily', '15 1 * * *', $$
  update public.feedback set email = null where email is not null and created_at < now() - interval '90 days';
  delete from public.feedback where status = 'rejected' and created_at < now() - interval '30 days';
  delete from public.feedback_attempts where created_at < now() - interval '1 day';
$$);
