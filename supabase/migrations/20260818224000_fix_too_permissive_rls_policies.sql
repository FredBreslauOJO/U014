-- Migration: Remove overly permissive RLS policies
-- Reason: Public DELETE, INSERT, UPDATE policies with USING (true) allow unauthorized data manipulation
-- These policies override restrictive owner-based policies due to PostgreSQL RLS logic

-- Bands
DROP POLICY IF EXISTS "Public Delete bands" ON public.bands;
DROP POLICY IF EXISTS "Public Insert bands" ON public.bands;
DROP POLICY IF EXISTS "Public Update bands" ON public.bands;
DROP POLICY IF EXISTS "Leitura publica de bandas" ON public.bands;

-- Banners
DROP POLICY IF EXISTS "Public Delete banners" ON public.banners;
DROP POLICY IF EXISTS "Public Insert banners" ON public.banners;
DROP POLICY IF EXISTS "Public Update banners" ON public.banners;

-- Contact Messages
DROP POLICY IF EXISTS "Public Delete contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public Insert contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public Update contact_messages" ON public.contact_messages;

-- News
DROP POLICY IF EXISTS "Public Delete news" ON public.news;
DROP POLICY IF EXISTS "Public Insert news" ON public.news;
DROP POLICY IF EXISTS "Public Update news" ON public.news;

-- Notes
DROP POLICY IF EXISTS "Public Delete notes" ON public.notes;
DROP POLICY IF EXISTS "Public Insert notes" ON public.notes;
DROP POLICY IF EXISTS "Public Update notes" ON public.notes;

-- Partners
DROP POLICY IF EXISTS "Public Delete partners" ON public.partners;
DROP POLICY IF EXISTS "Public Insert partners" ON public.partners;
DROP POLICY IF EXISTS "Public Update partners" ON public.partners;

-- Shows
DROP POLICY IF EXISTS "Public Delete shows" ON public.shows;
DROP POLICY IF EXISTS "Public Insert shows" ON public.shows;
DROP POLICY IF EXISTS "Public Update shows" ON public.shows;

-- Threads
DROP POLICY IF EXISTS "Public Delete threads" ON public.threads;
DROP POLICY IF EXISTS "Public Insert threads" ON public.threads;
DROP POLICY IF EXISTS "Public Update threads" ON public.threads;

-- Tracks
DROP POLICY IF EXISTS "Public Delete tracks" ON public.tracks;
DROP POLICY IF EXISTS "Public Insert tracks" ON public.tracks;
DROP POLICY IF EXISTS "Public Update tracks" ON public.tracks;

-- Venue Reviews
DROP POLICY IF EXISTS "Public Delete venue_reviews" ON public.venue_reviews;
DROP POLICY IF EXISTS "Public Insert venue_reviews" ON public.venue_reviews;
DROP POLICY IF EXISTS "Public Update venue_reviews" ON public.venue_reviews;

-- Venues
DROP POLICY IF EXISTS "Public Delete venues" ON public.venues;
DROP POLICY IF EXISTS "Public Insert venues" ON public.venues;
DROP POLICY IF EXISTS "Public Update venues" ON public.venues;
