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
