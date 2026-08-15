<p align="center">
  <img src="public/images/logo.svg" width="120" alt="Underground 014 logo">
</p>

<p align="center">
  <b>A plataforma da cena underground da região 014</b><br>
  Promova seu material, encontre parcerias, divulgue shows e junte a galera.
</p>

<p align="center">
  <a href="https://underground014.com.br"><b>https://underground014.com.br</b></a>
</p>

<br>

## Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/) (auth, database, storage) — accessed directly from the client
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)

## Getting started

```sh
cp .env.example .env    # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm i
npm run dev
```

### Docker

```sh
docker compose -f compose.yml up -d --build
```

### VS Code

Run the default build task with `Ctrl+Shift+B`.

## Supabase migrations & backups

The project is linked to its Supabase project via `supabase/config.toml`. No migration files exist yet — the schema was built by hand in the dashboard, so the first step on a fresh checkout is capturing it as a baseline migration.

### Link (only needed on a new machine)

```sh
supabase link --project-ref <project-ref>   # ref lives in supabase/.temp/project-ref, gitignored
```

### Pull the current schema into a migration

```sh
supabase db pull
```

Writes a timestamped file under `supabase/migrations/` with the full remote schema (tables, RLS policies, functions). Run once to establish the baseline, commit the result. Run again later to capture any drift made directly in the dashboard as a new migration.

### Writing new schema changes

Once the baseline exists, make further changes as migration files instead of editing the dashboard directly:

```sh
supabase migration new <description>   # empty timestamped file to hand-edit
supabase db push                       # apply pending local migrations to the remote project
```

### Backups

Dumps go through the CLI against the linked project. `supabase/backups/` is gitignored — dumps can contain real user data (emails, contact messages) and must never be committed.

```sh
# schema only — safe to inspect/diff, no user data
supabase db dump --linked -f supabase/backups/schema.sql

# data only
supabase db dump --linked --data-only -f supabase/backups/data.sql

# full backup (schema + data)
cat supabase/backups/schema.sql supabase/backups/data.sql > supabase/backups/full-backup-$(date +%Y%m%d).sql
```

## Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                     |
| `npm run build`     | Production build                              |
| `npm run lint`      | Run ESLint                                    |
| `npm run typecheck` | TypeScript-style checking via `jsconfig.json` |
| `npm run preview`   | Preview the production build locally          |

## Project structure

```
src/
├── App.jsx         # routing
├── supabase.js      # Supabase client
├── components/       # shared UI components
├── pages/            # route-level pages
└── lib/              # helpers (auth, storage, utils)
```
