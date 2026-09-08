# Pokedex Frontend

An Angular Pokédex app: browse and search Pokémon, backed by [pokedex-backend](https://github.com/LSvargas25/pokedex-backend) (a small caching proxy in front of the public PokeAPI).

## Features

- Browse and search Pokémon
- Pokémon detail view
- Trainer accounts: sign up / sign in (Supabase Auth)
- Trainer profile: level, XP progress, win/loss record
- Team selection: pick exactly 3 Pokémon, persisted through the backend

## Tech stack

- Angular 20 (standalone components), TypeScript, RxJS, GSAP
- Supabase JS (`@supabase/supabase-js`) for authentication

## Environment variables

Auth and the trainer API are configured through Angular's environment files
(`src/environments/environment.ts`, and `environment.prod.ts` for production
builds):

| Key               | Description                                              | Example                                  |
| ----------------- | -------------------------------------------------------- | ---------------------------------------- |
| `supabaseUrl`     | Supabase project URL                                     | `https://xxxx.supabase.co`              |
| `supabaseAnonKey` | Supabase anon / publishable key (safe to ship publicly) | `sb_publishable_...`                     |
| `apiBaseUrl`      | Base URL of `pokedex-backend`                            | `http://localhost:3000`                  |

The committed values point at the shared Supabase project and a local backend.
The anon key is public by design — row-level security on Supabase protects the
data. To use your own project, edit both environment files.

## Getting started

```bash
npm install
npm start
```

The auth / profile / team flow needs `pokedex-backend` running in parallel:

```bash
# in the pokedex-backend repo
npm install
npm start        # serves http://localhost:3000
```

Backend endpoints used by the frontend (both require
`Authorization: Bearer <supabase access token>`, added automatically by the
HTTP interceptor):

- `GET /api/trainer/me` → `{ id, username, level, xp, xpToNextLevel, wins, losses, team }`
- `PUT /api/trainer/team` with body `{ team: [name1, name2, name3] }` → updated trainer

### Trying the flow

1. Start the backend, then `npm start` the frontend.
2. Power on the Pokédex, open the menu, choose **Trainer Info**.
3. Create an account (trainer name + email + password), then sign in.
4. The profile shows level, XP bar and record. Click **Elegir equipo**.
5. Pick exactly 3 Pokémon and **Guardar equipo** — it returns to the profile.
6. Reload the page: the session and saved team persist.

## Status

Small learning/portfolio project demonstrating a full-stack setup (Angular
frontend + a lightweight Node/Express backend + Supabase Auth) around a public
API.

## Future improvements

- Add tests
- Battle screen
