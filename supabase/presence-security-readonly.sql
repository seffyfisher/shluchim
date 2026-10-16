-- Security audit evidence, NOT a migration. Run as the project owner in SQL Editor.
-- Catalog/configuration metadata only: no feedback, email, IP or object contents.
-- Review every API-exposed schema, including any custom schemas in API settings.
begin read only;

-- Effective table/column privileges include inherited grants and PUBLIC grants.
select n.nspname as schema, c.relname as resource, c.relkind,
       c.relowner::regrole as owner,
       c.relrowsecurity as rls, c.relforcerowsecurity as force_rls, c.reloptions,
       r.role,
       has_table_privilege(r.role, c.oid, 'SELECT') as can_select,
       has_any_column_privilege(r.role, c.oid, 'SELECT') as can_select_columns,
       has_table_privilege(r.role, c.oid, 'INSERT') as can_insert,
       has_any_column_privilege(r.role, c.oid, 'INSERT') as can_insert_columns,
       has_table_privilege(r.role, c.oid, 'UPDATE') as can_update,
       has_any_column_privilege(r.role, c.oid, 'UPDATE') as can_update_columns,
       has_table_privilege(r.role, c.oid, 'DELETE') as can_delete,
       has_table_privilege(r.role, c.oid, 'TRUNCATE') as can_truncate
from pg_class c join pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'), ('authenticated')) r(role)
where n.nspname not in ('pg_catalog', 'information_schema')
  and n.nspname not like 'pg_toast%' and n.nspname not like 'pg_temp%'
  and c.relkind in ('r', 'p', 'v', 'm', 'f')
order by n.nspname, c.relname, r.role;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies order by schemaname, tablename, policyname;

select n.nspname as schema, c.relname as sequence, r.role,
       has_sequence_privilege(r.role, c.oid, 'USAGE') as can_use,
       has_sequence_privilege(r.role, c.oid, 'SELECT') as can_read,
       has_sequence_privilege(r.role, c.oid, 'UPDATE') as can_set
from pg_class c join pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'), ('authenticated')) r(role)
where c.relkind = 'S' and n.nspname not in ('pg_catalog', 'information_schema')
order by n.nspname, c.relname, r.role;

-- RPCs need a separate body review: RLS does not constrain SECURITY DEFINER.
select n.nspname as schema, p.proname,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer, p.proconfig,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'storage', 'realtime') and p.prokind = 'f'
order by n.nspname, p.proname;

select n.nspname as schema, d.defaclrole::regrole as owner,
       d.defaclobjtype, d.defaclacl
from pg_default_acl d left join pg_namespace n on n.oid = d.defaclnamespace;

select id, public, file_size_limit, allowed_mime_types from storage.buckets;

rollback;

-- Also inspect Dashboard: API exposed schemas; Security Advisor; Realtime
-- public access, connection/event/join limits; Usage and billing spend cap.
-- Inspect custom RPC bodies and deployed Edge Functions without sharing secrets.
-- RLS/grants for public.feedback, feedback_attempts and feedback_public_quotes
-- must agree with 001_feedback.sql and 002_hardening.sql; their presence in Git
-- does not prove deployment. Check that rls_auto_enable() is not API-callable.
