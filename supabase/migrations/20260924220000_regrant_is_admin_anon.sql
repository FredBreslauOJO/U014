-- Migration: re-grant EXECUTE on is_admin() to anon
--
-- 20260924150800_fix_rls_lint_warnings.sql revoked EXECUTE on public.is_admin()
-- from anon/public to silence a Supabase linter warning about broadly-grantable
-- SECURITY DEFINER functions. That broke every RLS policy shaped like
-- `status = 'active' OR public.is_admin()` for anon requests: Postgres needs
-- EXECUTE on is_admin() to evaluate the OR at all, regardless of which branch
-- would actually match, so anon selects against bands/shows/venues/etc. started
-- failing with "permission denied for function is_admin" (401) even for active
-- rows.
--
-- is_admin() only reads auth.uid() against profiles.role; for anon, auth.uid()
-- is null so it always returns false. There is no data exposure or privilege
-- escalation in letting anon call it, so re-granting is safe.

grant execute on function public.is_admin() to anon;
