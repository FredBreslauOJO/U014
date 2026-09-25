-- Canonical, readable public URLs for content that previously exposed only IDs.
alter table public.shows add column if not exists slug text;
alter table public.venues add column if not exists slug text;
alter table public.partners add column if not exists slug text;
alter table public.news add column if not exists slug text;
alter table public.threads add column if not exists slug text;

create or replace function public.content_slug(source text, record_id text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(source, 'item')), '[^a-z0-9]+', '-', 'g')) || '-' || left(record_id, 8)
$$;

update public.shows set slug = public.content_slug(title, id) where slug is null;
update public.venues set slug = public.content_slug(name, id) where slug is null;
update public.partners set slug = public.content_slug(name, id) where slug is null;
update public.news set slug = public.content_slug(title, id) where slug is null;
update public.threads set slug = public.content_slug(coalesce(title, content), id) where slug is null;

create unique index if not exists shows_slug_unique on public.shows (slug);
create unique index if not exists venues_slug_unique on public.venues (slug);
create unique index if not exists partners_slug_unique on public.partners (slug);
create unique index if not exists news_slug_unique on public.news (slug);
create unique index if not exists threads_slug_unique on public.threads (slug);

create or replace function public.assign_public_content_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.content_slug(
      case tg_table_name
        when 'shows' then to_jsonb(new)->>'title'
        when 'venues' then to_jsonb(new)->>'name'
        when 'partners' then to_jsonb(new)->>'name'
        when 'news' then to_jsonb(new)->>'title'
        when 'threads' then coalesce(to_jsonb(new)->>'title', to_jsonb(new)->>'content')
      end,
      new.id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists shows_assign_public_slug on public.shows;
create trigger shows_assign_public_slug before insert on public.shows for each row execute function public.assign_public_content_slug();
drop trigger if exists venues_assign_public_slug on public.venues;
create trigger venues_assign_public_slug before insert on public.venues for each row execute function public.assign_public_content_slug();
drop trigger if exists partners_assign_public_slug on public.partners;
create trigger partners_assign_public_slug before insert on public.partners for each row execute function public.assign_public_content_slug();
drop trigger if exists news_assign_public_slug on public.news;
create trigger news_assign_public_slug before insert on public.news for each row execute function public.assign_public_content_slug();
drop trigger if exists threads_assign_public_slug on public.threads;
create trigger threads_assign_public_slug before insert on public.threads for each row execute function public.assign_public_content_slug();
