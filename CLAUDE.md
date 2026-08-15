# CLAUDE.md

This file provides guidance for working in this repository.

## Project overview

`underground014.com.br` is a React 18 + Vite frontend for an underground/live-music community site. Data and auth are handled directly through Supabase from the client. Keep changes focused, preserve existing patterns, and avoid unrelated cleanup unless it is part of the request.

## Commands

- `npm run dev` - start the Vite dev server
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript-style checking via `jsconfig.json`
- `docker compose -f compose.yml up -d --build` - local container workflow

## Architecture

- Routing is defined in `src/App.jsx`.
- Shared client code lives in `src/supabase.js`.
- UI components live under `src/components/`.
- Pages live under `src/pages/`.
