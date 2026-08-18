-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;

GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;

GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;

CREATE TABLE public.bands (
  id                  text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date        timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date        timestamp with time zone,
  created_by_id       text,
  is_sample           boolean                  DEFAULT false,
  name                text                     NOT NULL,
  slug                text,
  logo_url            text,
  photo_url           text,
  gallery             text[],
  bio                 text,
  genre               text,
  genres              text[],
  performance_type    text                     DEFAULT 'ambos'::text,
  city                text,
  whatsapp            text,
  email               text,
  instagram           text,
  youtube             text,
  facebook            text,
  members             text,
  collaborator_emails text[],
  links               jsonb                    DEFAULT '[]'::jsonb,
  featured            boolean                  DEFAULT false,
  videos              jsonb                    DEFAULT '[]'::jsonb
);

ALTER TABLE public.bands
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bands
  ADD CONSTRAINT bands_pkey PRIMARY KEY (id);

GRANT ALL ON public.bands TO anon;

GRANT ALL ON public.bands TO authenticated;

GRANT ALL ON public.bands TO service_role;

CREATE POLICY "Atualizacao de bandas pelos donos" ON public.bands
  FOR UPDATE
  USING
    ((((auth.uid())::text = created_by_id) OR (lower(TRIM(BOTH FROM email)) = lower(TRIM(BOTH FROM (auth.jwt() ->> 'email'::text)))) OR ((collaborator_emails)::text ~~ (('%'::text
    || lower(TRIM(BOTH FROM (auth.jwt() ->> 'email'::text)))) || '%'::text))));

CREATE POLICY "Exclusao de bandas pelos donos" ON public.bands
  FOR DELETE
  USING ((((auth.uid())::text = created_by_id) OR (lower(TRIM(BOTH FROM email)) = lower(TRIM(BOTH FROM (auth.jwt() ->> 'email'::text))))));

CREATE POLICY "Insercao de bandas" ON public.bands
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL));

CREATE POLICY "Leitura Publica Bands" ON public.bands
  FOR SELECT
  USING (true);

CREATE POLICY "Leitura publica de bandas" ON public.bands
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete bands" ON public.bands
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert bands" ON public.bands
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read bands" ON public.bands
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update bands" ON public.bands
  FOR UPDATE
  USING (true);

CREATE TABLE public.banners (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  title         text                     NOT NULL,
  subtitle      text,
  image_url     text,
  link_url      text,
  category      text                     DEFAULT 'destaque'::text,
  author_name   text,
  accent        text                     DEFAULT '#a8f776'::text,
  status        text                     DEFAULT 'pending'::text
);

ALTER TABLE public.banners
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.banners
  ADD CONSTRAINT banners_pkey PRIMARY KEY (id);

GRANT ALL ON public.banners TO anon;

GRANT ALL ON public.banners TO authenticated;

GRANT ALL ON public.banners TO service_role;

CREATE POLICY "Leitura Publica Banners" ON public.banners
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete banners" ON public.banners
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert banners" ON public.banners
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read banners" ON public.banners
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update banners" ON public.banners
  FOR UPDATE
  USING (true);

CREATE TABLE public.contact_messages (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  name          text                     NOT NULL,
  email         text                     NOT NULL,
  subject       text,
  message       text
);

ALTER TABLE public.contact_messages
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);

GRANT ALL ON public.contact_messages TO anon;

GRANT ALL ON public.contact_messages TO authenticated;

GRANT ALL ON public.contact_messages TO service_role;

CREATE POLICY "Leitura Publica Contact" ON public.contact_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete contact_messages" ON public.contact_messages
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert contact_messages" ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read contact_messages" ON public.contact_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update contact_messages" ON public.contact_messages
  FOR UPDATE
  USING (true);

CREATE TABLE public.news (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  title         text                     NOT NULL,
  content       text                     NOT NULL,
  image_url     text,
  author_name   text,
  category      text                     DEFAULT 'geral'::text,
  external_link text
);

ALTER TABLE public.news
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.news
  ADD CONSTRAINT news_pkey PRIMARY KEY (id);

GRANT ALL ON public.news TO anon;

GRANT ALL ON public.news TO authenticated;

GRANT ALL ON public.news TO service_role;

CREATE POLICY "Leitura Publica News" ON public.news
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete news" ON public.news
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert news" ON public.news
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read news" ON public.news
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update news" ON public.news
  FOR UPDATE
  USING (true);

CREATE TABLE public.news_comments (
  id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  news_id       text                     NOT NULL,
  content       text                     NOT NULL,
  author_name   text,
  created_by_id uuid,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.news_comments
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.news_comments
  ADD CONSTRAINT news_comments_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE;

ALTER TABLE public.news_comments
  ADD CONSTRAINT news_comments_pkey PRIMARY KEY (id);

GRANT ALL ON public.news_comments TO anon;

GRANT ALL ON public.news_comments TO authenticated;

GRANT ALL ON public.news_comments TO service_role;

CREATE TABLE public.notes (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  content       text                     NOT NULL,
  band_id       text,
  author_name   text
);

ALTER TABLE public.notes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notes
  ADD CONSTRAINT notes_pkey PRIMARY KEY (id);

GRANT ALL ON public.notes TO anon;

GRANT ALL ON public.notes TO authenticated;

GRANT ALL ON public.notes TO service_role;

CREATE POLICY "Leitura Publica Notes" ON public.notes
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete notes" ON public.notes
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert notes" ON public.notes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read notes" ON public.notes
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update notes" ON public.notes
  FOR UPDATE
  USING (true);

CREATE TABLE public.partners (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  name          text                     NOT NULL,
  category      text                     NOT NULL,
  specialties   text,
  city          text,
  bio           text,
  whatsapp      text,
  email         text,
  instagram     text,
  portfolio_url text,
  photo_url     text
);

ALTER TABLE public.partners
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.partners
  ADD CONSTRAINT partners_pkey PRIMARY KEY (id);

GRANT ALL ON public.partners TO anon;

GRANT ALL ON public.partners TO authenticated;

GRANT ALL ON public.partners TO service_role;

CREATE POLICY "Leitura Publica Partners" ON public.partners
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete partners" ON public.partners
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert partners" ON public.partners
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read partners" ON public.partners
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update partners" ON public.partners
  FOR UPDATE
  USING (true);

CREATE TABLE public.shows (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  title         text                     NOT NULL,
  bands         jsonb                    DEFAULT '[]'::jsonb,
  venues        jsonb                    DEFAULT '[]'::jsonb,
  city          text,
  address       text,
  date          date                     NOT NULL,
  "time"        text,
  description   text,
  ticket_url    text,
  flyer_url     text,
  genre         text,
  genres        text[]
);

ALTER TABLE public.shows
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shows
  ADD CONSTRAINT shows_pkey PRIMARY KEY (id);

GRANT ALL ON public.shows TO anon;

GRANT ALL ON public.shows TO authenticated;

GRANT ALL ON public.shows TO service_role;

CREATE POLICY "Leitura Publica Shows" ON public.shows
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete shows" ON public.shows
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert shows" ON public.shows
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read shows" ON public.shows
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update shows" ON public.shows
  FOR UPDATE
  USING (true);

CREATE TABLE public.threads (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  title         text,
  content       text                     NOT NULL,
  author_name   text,
  category      text                     DEFAULT 'geral'::text,
  parent_id     text,
  image_url     text
);

ALTER TABLE public.threads
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.threads
  ADD CONSTRAINT threads_pkey PRIMARY KEY (id);

GRANT ALL ON public.threads TO anon;

GRANT ALL ON public.threads TO authenticated;

GRANT ALL ON public.threads TO service_role;

CREATE POLICY "Leitura Publica Threads" ON public.threads
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete threads" ON public.threads
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert threads" ON public.threads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read threads" ON public.threads
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update threads" ON public.threads
  FOR UPDATE
  USING (true);

CREATE TABLE public.tracks (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  band_id       text,
  title         text                     NOT NULL,
  url           text                     NOT NULL,
  source        text                     DEFAULT 'youtube'::text,
  playlist_id   text
);

ALTER TABLE public.tracks
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tracks
  ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);

GRANT ALL ON public.tracks TO anon;

GRANT ALL ON public.tracks TO authenticated;

GRANT ALL ON public.tracks TO service_role;

CREATE POLICY "Leitura Publica Tracks" ON public.tracks
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete tracks" ON public.tracks
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert tracks" ON public.tracks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read tracks" ON public.tracks
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update tracks" ON public.tracks
  FOR UPDATE
  USING (true);

CREATE TABLE public.venue_reviews (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  venue_id      text                     NOT NULL,
  author_name   text,
  rating        integer                  DEFAULT 5 NOT NULL,
  comment       text                     NOT NULL
);

ALTER TABLE public.venue_reviews
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.venue_reviews
  ADD CONSTRAINT venue_reviews_pkey PRIMARY KEY (id);

GRANT ALL ON public.venue_reviews TO anon;

GRANT ALL ON public.venue_reviews TO authenticated;

GRANT ALL ON public.venue_reviews TO service_role;

CREATE POLICY "Leitura Publica Venue_Reviews" ON public.venue_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete venue_reviews" ON public.venue_reviews
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert venue_reviews" ON public.venue_reviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read venue_reviews" ON public.venue_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update venue_reviews" ON public.venue_reviews
  FOR UPDATE
  USING (true);

CREATE TABLE public.venues (
  id            text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  created_date  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_date  timestamp with time zone,
  created_by_id text,
  is_sample     boolean                  DEFAULT false,
  name          text                     NOT NULL,
  address       text,
  city          text,
  capacity      integer,
  contact       text,
  instagram     text,
  photo_url     text,
  description   text
);

ALTER TABLE public.venues
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_pkey PRIMARY KEY (id);

GRANT ALL ON public.venues TO anon;

GRANT ALL ON public.venues TO authenticated;

GRANT ALL ON public.venues TO service_role;

CREATE POLICY "Leitura Publica Venues" ON public.venues
  FOR SELECT
  USING (true);

CREATE POLICY "Public Delete venues" ON public.venues
  FOR DELETE
  USING (true);

CREATE POLICY "Public Insert venues" ON public.venues
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public Read venues" ON public.venues
  FOR SELECT
  USING (true);

CREATE POLICY "Public Update venues" ON public.venues
  FOR UPDATE
  USING (true);

CREATE EVENT TRIGGER ensure_rls
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();
