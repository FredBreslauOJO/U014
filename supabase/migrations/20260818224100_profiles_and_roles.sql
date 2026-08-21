-- Migration: profiles table + role system
-- Adds a `profiles` table (one row per auth user) carrying a `role` used for
-- admin gating, plus a trigger that keeps it populated automatically.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles_select_own" on public.profiles
  for select
  using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select
  using (public.is_admin());

create policy "profiles_update_admin" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that already existed before this migration.
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

-- To promote the first admin, run once by hand in the SQL editor:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
