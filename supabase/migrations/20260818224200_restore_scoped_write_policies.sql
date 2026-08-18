-- Migration: restore scoped write policies after removing "always true" policies
-- The previous migration (fix_too_permissive_rls_policies) dropped the insecure
-- `USING (true)` / `WITH CHECK (true)` policies on 11 tables per the Supabase
-- linter. For `bands` that was safe -- proper owner-scoped policies already
-- existed alongside the insecure ones. For the other 10 tables it left ZERO
-- INSERT/UPDATE/DELETE policy, silently breaking every write path in the app
-- (band walls, show/venue/partner/news creation, threads, reviews, contact
-- form, banner submissions). This migration adds the scoped replacements,
-- matching how the app actually gates these actions client-side.

-- Venues: any authenticated user can create; owner or admin can edit/delete.
create policy "venues_insert_authenticated" on public.venues
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "venues_update_owner_or_admin" on public.venues
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "venues_delete_owner_or_admin" on public.venues
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- Partners (Guia da Cena): any authenticated user can create; owner or admin can edit/delete.
create policy "partners_insert_authenticated" on public.partners
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "partners_update_owner_or_admin" on public.partners
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "partners_delete_owner_or_admin" on public.partners
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- Shows: any authenticated user can create; owner or admin can edit/delete.
create policy "shows_insert_authenticated" on public.shows
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "shows_update_owner_or_admin" on public.shows
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "shows_delete_owner_or_admin" on public.shows
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- News: any authenticated user can create; owner or admin can edit/delete.
create policy "news_insert_authenticated" on public.news
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "news_update_owner_or_admin" on public.news
  for update to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin())
  with check ((auth.uid())::text = created_by_id or public.is_admin());

create policy "news_delete_owner_or_admin" on public.news
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- Threads: any authenticated user can post; owner or admin can delete. Never updated by the app.
create policy "threads_insert_authenticated" on public.threads
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "threads_delete_owner_or_admin" on public.threads
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- Venue reviews: any authenticated user can post; owner or admin can delete. Never updated.
create policy "venue_reviews_insert_authenticated" on public.venue_reviews
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "venue_reviews_delete_owner_or_admin" on public.venue_reviews
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- Notes (band wall): any authenticated user can post on any band; author or admin can delete.
create policy "notes_insert_authenticated" on public.notes
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "notes_delete_owner_or_admin" on public.notes
  for delete to authenticated
  using ((auth.uid())::text = created_by_id or public.is_admin());

-- Tracks: managed by the owning band's owner/collaborator (mirrors bands' own
-- update/delete policies), or admin. created_by_id is never set on insert, so
-- ownership routes through band_id -> bands instead.
create policy "tracks_insert_band_owner_or_admin" on public.tracks
  for insert to authenticated
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

create policy "tracks_delete_band_owner_or_admin" on public.tracks
  for delete to authenticated
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
  );

-- Banners: any authenticated user can submit a suggestion, forced to 'pending'
-- so a direct API call can't self-approve. Only admin can approve/reject/delete.
create policy "banners_insert_authenticated_pending" on public.banners
  for insert to authenticated
  with check (status = 'pending');

create policy "banners_update_admin" on public.banners
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "banners_delete_admin" on public.banners
  for delete to authenticated
  using (public.is_admin());

-- Contact messages: the contact form is public (no login wall) -- anon and
-- authenticated can both submit. Only admin can read/delete (handled by
-- profiles_select_admin-style access via the admin UI's own service calls;
-- no public read policy exists on this table by design).
create policy "contact_messages_insert_public" on public.contact_messages
  for insert to anon, authenticated
  with check (true);

create policy "contact_messages_delete_admin" on public.contact_messages
  for delete to authenticated
  using (public.is_admin());
