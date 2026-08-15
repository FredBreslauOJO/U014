# AGENTS.md

## Project Context

This is a React 18 + Vite app for underground014.com.br with Supabase-backed data access. Keep changes focused on the user's request, preserve existing conventions, and avoid touching unrelated worktree changes.

Start with `README.md` for local setup, environment variables, and deployment notes.

## Key Files

- `src/`: frontend application source.
- `src/supabase.js`: shared Supabase client.
- `vite.config.js`: Vite dev/build configuration.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for frontend-only work.
- Use `docker compose -f compose.yml up -d --build` when the Docker workflow is requested.
- Reuse the existing Supabase client and Vite patterns before adding new integration paths.
- Run the relevant checks from `package.json` before finishing code changes.
