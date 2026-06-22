# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

HackathonHashlama is an early-stage scaffold with two independent TypeScript apps. The frontend and
backend are separate npm packages (no workspace/monorepo tooling); each has its own `package.json`,
`tsconfig.json`, and `node_modules`. The backend persists to a PostgreSQL database; the frontend is
still the default Vite starter and is not yet wired to the API.

The data domain is a registration form for amputees / prosthesis users and their family members
(see `Backend/types.ts` for the intended `RegistrantPayload` shape). The backend also embeds a
**rule-based eligibility engine** (`Backend/engine/`) that maps a registration onto a controlled
person-profile and ranks the Israeli rights the person may be eligible for, each with a likelihood.

## Commands

Run from within `Backend/` or `Frontend/`. `node_modules` is gitignored and not committed, so run
`npm install` in each directory first.

**Backend** (Express 4 + PostgreSQL, run via `ts-node`, CommonJS, TypeScript 4.9):
- `npm run dev` — start with auto-reload (`nodemon` watching `**/*.ts`)
- `npm start` — start once (`ts-node index.ts`)
- `npx ts-node initDb.ts` — run the DB schema setup standalone (it also runs automatically on every
  server start; see warning below)
- Requires a `.env` file with `DATABASE_URL` (a Postgres connection string). The server throws on
  startup if it is missing. The pool connects with `ssl: { rejectUnauthorized: false }`, i.e. it
  expects a hosted/cloud Postgres (Neon, Supabase, Heroku, etc.).
- Serves on `http://localhost:3000` (override with `PORT`).
- No test runner is configured (`npm test` is a placeholder that exits 1).

**Frontend** (Vite 8 + vanilla TypeScript, ESM, no framework):
- `npm run dev` — Vite dev server with HMR
- `npm run build` — type-check (`tsc`) then `vite build` to `dist/`
- `npm run preview` — serve the production build
- **Requires Node ≥20.19 or ≥22.12** (Vite 8). It crashes on Node 18 with
  `ReferenceError: CustomEvent is not defined`. The backend's `ts-node` runs fine on Node 18, so a
  mismatched global Node can run the backend but not the frontend.

`Backend/MyRights.postman_collection.json` is a Postman collection for exercising the API.

## Backend architecture

- `db.ts` — creates and exports a single shared `pg` `Pool` from `DATABASE_URL`. Import `pool` from
  here for all queries; do not create new pools.
- `initDb.ts` — `initDb()` defines the schema. It is invoked in `index.ts` **before** `app.listen`,
  so the server only starts after the DB is reachable and initialized.
- `index.ts` — Express app: middleware (`cors`, `express.json`), routes, then `initDb().then(listen)`.
  Passwords are hashed with `bcrypt` before insert; the `/users` POST maps Postgres unique-violation
  `23505` to HTTP 409.
- `types.ts` — shared domain interfaces for the registration payload (largely `[key: string]: any`
  placeholders at this stage).
- `engine/` — the rule-based eligibility engine, a faithful TypeScript port of a Python service
  (verified bit-exact: identical profile, percentage, status, band, and ranking on real data). Pure
  logic, no Express coupling. Public entrypoint: `evaluate(payload) -> { profile, rights[], meta }`
  (`engine/index.ts`). Internals:
  - `intake.ts` — the ONLY place that knows the questionnaire JSON shape; maps it onto a flat
    `Profile` of controlled person-attributes and reports `missing_inputs` (engine attributes the
    form doesn't capture: disability %, income, vehicle, license). Accepts an optional top-level
    `overrides` object.
  - `vocab.ts` — controlled vocab + `normalize()` (Hebrew synonym tables for injury cause, family
    status, employment, amputation level).
  - `rules.ts` — per-criterion PASS/FAIL/UNKNOWN. Never invents a false negative: absent/ambiguous
    inputs are UNKNOWN, not FAIL.
  - `scoring.ts` — right-level likelihood. Criteria sharing a `logicGroup` are OR'd; groups are AND'd.
    Score reflects positive evidence; hard `unlikely` only on a clean required FAIL or injury-cause
    mismatch.
  - `repository.ts` — loads rights/benefits/criteria/milestones from the shared `pool` once and
    caches them in memory (lazy singleton via `getRepository()`). NUMERIC columns come back from
    node-pg as strings, so they pass through `num()`.
  - `explainer.ts` (deterministic Hebrew text), `serializer.ts` (DTO shape), `types.ts`.

### Routes (`index.ts`)
- `POST /registrations` — store a questionnaire submission **and** evaluate it: persists the form +
  the engine results (`registrations.results` JSONB) and returns `{ id, evaluation }`.
- `POST /evaluate` — stateless evaluation (no storage): questionnaire JSON → ranked rights. The
  contract for downstream consumers.
- `GET /registrations/:id` — fetch a stored registration + its evaluation (`404` if the id is unknown).
- JSONB params are serialized with `jsonbParam()` so arrays/objects round-trip (node-pg otherwise
  builds a Postgres array literal for JS arrays).

The serialized response (`serializer.ts`) is `{ profile, rights[], meta }`. Each ranked right exposes
the likelihood as **`percentage`** (0–100), **`band`** (`low`/`medium`/`high`), and **`status`**
(e.g. `likely_eligible`) — *not* fields named `score`/`likelihood` — plus `explanation_he`,
`met_conditions`, `missing_info`, `benefits[]`, and `milestones[]`. `meta` carries `total_evaluated`,
`missing_inputs`, `disclaimer`, `snapshot_date`, and `form_id`.

### The rights DB
The engine reads `rights`, `benefits`, `criteria`, `milestones`, `right_milestones` — created and
seeded by `initDb()` (it imports a Kol-Zchut COPY dump, `Backend/kolzchut*.sql`). pgvector is
created but the engine does not use the `embedding` column (semantic retrieval only). Milestone
loading degrades gracefully if those tables are absent.

## Important caveats (current branch state)

These are real inconsistencies in the code as it stands — verify intent before building on them:
- **`initDb()` is destructive for `registrations` and runs on every server start.** It
  `DROP TABLE IF EXISTS users` and `registrations`, then recreates `registrations`. Every
  `npm run dev`/`start` wipes registrations. The rights tables use `CREATE TABLE IF NOT EXISTS` and
  are seeded only when empty, so they survive restarts.
- **Orphaned `/users` route.** `POST /users` inserts into a `users` table that `initDb()` drops and
  never recreates — that endpoint fails at runtime. It's leftover scaffold; the live entry points are
  `POST /registrations` and `POST /evaluate`.

## TypeScript / toolchain notes

- Backend `tsconfig.json` is CommonJS + `moduleResolution: node` + `esModuleInterop`, so use default
  imports (`import express from 'express'`); there is no build step in normal dev (`ts-node` runs
  `.ts` directly). The backend is **not** ESM despite the frontend being ESM — keep their conventions
  separate.
- Frontend uses `verbatimModuleSyntax` and `noUnusedLocals`/`noUnusedParameters` (enforced by
  `npm run build`); use `.ts` extensions in relative imports and `import { type X }` for types.
