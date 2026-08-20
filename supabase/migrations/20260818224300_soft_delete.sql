-- Migration: soft delete
-- "Deleting" a row now only flips status to 'disabled' instead of removing it.
-- - Adds a status column (active|disabled) to every content table that didn't
--   already have one; banners keeps its existing status column, just extends
--   the allowed values.
-- - Public/anon SELECT policies are consolidated into one per table, scoped
--   to status = 'active' (admins bypass via is_admin() and see everything,
--   including disabled rows, since the admin UI needs to list them).
-- - Adds UPDATE policies (owner-or-admin) to notes/threads/venue_reviews/
--   tracks, which previously only had INSERT+DELETE -- required so a
--   soft-delete UPDATE can actually run under RLS.
-- - Drops DELETE policies everywhere in scope: hard delete is no longer a
--   supported path through the anon/authenticated API, only via service_role
--   directly (e.g. a manual purge in the SQL editor).
-- - Incidental fix: contact_messages had two `USING (true)` SELECT policies
--   -- anyone could list every contact submission via the API. Replaced with
--   admin-only SELECT.

-- ---------------------------------------------------------------------------
-- status columns
-- ---------------------------------------------------------------------------

alter table public.bands add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.shows add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.venues add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.partners add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.news add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.threads add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.venue_reviews add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.notes add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.tracks add column status text not null default 'active' check (status in ('active', 'disabled'));
alter table public.contact_messages add column status text not null default 'active' check (status in ('active', 'disabled'));

alter table public.banners add constraint banners_status_check check (status in ('pending', 'approved', 'rejected', 'disabled'));

-- ---------------------------------------------------------------------------
-- consolidated public SELECT policies (status = 'active', admin sees all)
-- ---------------------------------------------------------------------------

drop policy if exists "Leitura Publica Bands" on public.bands;
drop policy if exists "Public Read bands" on public.bands;
create policy "bands_select_active_or_admin" on public.bands
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Shows" on public.shows;
drop policy if exists "Public Read shows" on public.shows;
create policy "shows_select_active_or_admin" on public.shows
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Venues" on public.venues;
drop policy if exists "Public Read venues" on public.venues;
create policy "venues_select_active_or_admin" on public.venues
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Partners" on public.partners;
drop policy if exists "Public Read partners" on public.partners;
create policy "partners_select_active_or_admin" on public.partners
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica News" on public.news;
drop policy if exists "Public Read news" on public.news;
create policy "news_select_active_or_admin" on public.news
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Threads" on public.threads;
drop policy if exists "Public Read threads" on public.threads;
create policy "threads_select_active_or_admin" on public.threads
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Venue_Reviews" on public.venue_reviews;
drop policy if exists "Public Read venue_reviews" on public.venue_reviews;
create policy "venue_reviews_select_active_or_admin" on public.venue_reviews
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Notes" on public.notes;
drop policy if exists "Public Read notes" on public.notes;
create policy "notes_select_active_or_admin" on public.notes
  for select using (status = 'active' or public.is_admin());

drop policy if exists "Leitura Publica Tracks" on public.tracks;
drop policy if exists "Public Read tracks" on public.tracks;
create policy "tracks_select_active_or_admin" on public.tracks
  for select using (status = 'active' or public.is_admin());

-- contact_messages: was publicly readable by anyone (bug). No public read
-- surface exists in the app -- only the admin inbox needs this.
drop policy if exists "Leitura Publica Contact" on public.contact_messages;
drop policy if exists "Public Read contact_messages" on public.contact_messages;
create policy "contact_messages_select_admin" on public.contact_messages
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- UPDATE policies needed for soft delete (tables that only had INSERT+DELETE)
-- ---------------------------------------------------------------------------

create policy "notes_update_owner_or_admin" on public.notes
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "threads_update_owner_or_admin" on public.threads
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "venue_reviews_update_owner_or_admin" on public.venue_reviews
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "tracks_update_band_owner_or_admin" on public.tracks
  for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.bands b
      where b.id = tracks.band_id
        and (
          (auth.uid())::text = b.created_by_id
          or lower(trim(b.email)) = lower(trim((auth.jwt() ->> 'email')))
          or (b.collaborator_emails)::text ilike '%' || lower(trim((auth.jwt() ->> 'email'))) || '%'
        )
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.bands b
      where b.id = tracks.band_id
        and (
          (auth.uid())::text = b.created_by_id
          or lower(trim(b.email)) = lower(trim((auth.jwt() ->> 'email')))
          or (b.collaborator_emails)::text ilike '%' || lower(trim((auth.jwt() ->> 'email'))) || '%'
        )
    )
  );

create policy "contact_messages_update_admin" on public.contact_messages
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- drop DELETE policies -- hard delete no longer reachable through the API
-- ---------------------------------------------------------------------------

drop policy if exists "Exclusao de bandas pelos donos" on public.bands;
drop policy if exists "shows_delete_owner_or_admin" on public.shows;
drop policy if exists "venues_delete_owner_or_admin" on public.venues;
drop policy if exists "partners_delete_owner_or_admin" on public.partners;
drop policy if exists "news_delete_owner_or_admin" on public.news;
drop policy if exists "threads_delete_owner_or_admin" on public.threads;
drop policy if exists "notes_delete_owner_or_admin" on public.notes;
drop policy if exists "tracks_delete_band_owner_or_admin" on public.tracks;
drop policy if exists "venue_reviews_delete_owner_or_admin" on public.venue_reviews;
drop policy if exists "banners_delete_admin" on public.banners;
drop policy if exists "contact_messages_delete_admin" on public.contact_messages;

-- ---------------------------------------------------------------------------
-- fix bands' pre-existing owner-only UPDATE policy (predates every migration
-- in this branch) -- it had no admin bypass at all, so admin could never
-- edit or soft-delete a band it didn't own.
-- ---------------------------------------------------------------------------

drop policy if exists "Atualizacao de bandas pelos donos" on public.bands;
create policy "bands_update_owner_or_admin" on public.bands
  for update
  using (
    public.is_admin()
    or (auth.uid())::text = created_by_id
    or lower(trim(email)) = lower(trim((auth.jwt() ->> 'email')))
    or (collaborator_emails)::text ilike '%' || lower(trim((auth.jwt() ->> 'email'))) || '%'
  )
  with check (
    public.is_admin()
    or (auth.uid())::text = created_by_id
    or lower(trim(email)) = lower(trim((auth.jwt() ->> 'email')))
    or (collaborator_emails)::text ilike '%' || lower(trim((auth.jwt() ->> 'email'))) || '%'
  );
