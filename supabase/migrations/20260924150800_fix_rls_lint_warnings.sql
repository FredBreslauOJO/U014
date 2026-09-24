-- Migration: address Supabase database-linter WARNings
-- 1) contact_messages INSERT policy used a bare `WITH CHECK (true)`. The form
--    is genuinely public (no login wall), so we keep it open to anon +
--    authenticated but add real validation instead of an unconditional true.
-- 2) storage.objects had a broad public SELECT policy on the `underground-images`
--    bucket, which also allows listing every object via the REST API. Public
--    buckets already serve individual objects at /storage/v1/object/public/...
--    without needing a SELECT policy, so the listing-enabling policy is dropped.
-- 3) handle_new_user, is_admin, and rls_auto_enable are SECURITY DEFINER and
--    were callable directly via /rest/v1/rpc/* by anon/authenticated because
--    of the blanket `ALTER DEFAULT PRIVILEGES ... GRANT ALL ON ROUTINES`
--    applied when the project was created. None of them need to be called as
--    RPCs: handle_new_user only runs via its trigger, rls_auto_enable only
--    runs via its event trigger, and is_admin is only invoked from inside RLS
--    policies (which does not require EXECUTE from the calling role's own
--    direct grant list once revoked from anon; policies still evaluate it
--    fine since Postgres checks EXECUTE for the role running the query, so we
--    keep it grantable only to authenticated, which is the only role whose
--    policies call it).

-- 1) contact_messages: replace unconditional WITH CHECK with real validation.
drop policy if exists "contact_messages_insert_public" on public.contact_messages;

create policy "contact_messages_insert_public" on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(trim(name)) > 0
    and char_length(name) <= 200
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(email) <= 320
    and (message is null or char_length(message) <= 5000)
    and (subject is null or char_length(subject) <= 200)
  );

-- 2) storage: drop the broad public SELECT policy that enables listing.
-- Public bucket object URLs work without a SELECT policy on storage.objects.
drop policy if exists "Public Storage Read" on storage.objects;

-- 3) SECURITY DEFINER functions: revoke blanket EXECUTE grants, leaving only
-- what each function actually needs.
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
revoke all on function public.handle_new_user() from public;

revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.rls_auto_enable() from authenticated;
revoke all on function public.rls_auto_enable() from public;

revoke all on function public.is_admin() from anon;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
