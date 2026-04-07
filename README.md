# MENAMarket

MENAMarket is a MENA-focused prediction market platform in staged development.

This repository currently includes:
- M01 monorepo bootstrap
- M02 shared design system and website shell

It does **not** include any fake market data, wallet simulation, payment simulation, or placeholder trading engine logic.

## Current apps
- Public website shell: `apps/web`
- Admin operations shell: `apps/admin`
- Shared UI primitives: `packages/ui`

## Requirements
- Node.js 22+
- npm 10+

## Install

```bash
npm install
```

## Validate

```bash
npm run lint
npm run typecheck
npm test
```

## Run locally

```bash
npm run dev:web
npm run dev:admin
```

Public web app: `http://localhost:3000`
Admin app: `http://localhost:3001`

## Deploy to Vercel

This monorepo deploys `apps/web` to Vercel using npm workspaces.

### Vercel project settings

| Setting | Value |
|---|---|
| Root Directory | *(leave blank — use repo root)* |
| Framework Preset | Next.js *(auto-detected)* |
| Install Command | `npm install` *(set in `vercel.json`)* |
| Build Command | `npm run build:vercel` *(set in `vercel.json`)* |
| Output Directory | `apps/web/.next` *(set in `vercel.json`)* |

The `build:vercel` script runs in order:
1. Build shared workspace packages (`@menamarket/ui`, `@menamarket/api`)
2. Lint (checks required module files are present)
3. Typecheck (TypeScript project references)
4. Tests (Node.js built-in test runner)
5. Next.js production build for `apps/web`

### Required environment variables

Set these in the Vercel project's **Environment Variables** section.
See `.env.example` for the full list and descriptions.

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production` on Vercel |
| `MENAMARKET_APP_URL` | Yes | Public URL of the deployed web app |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `ACTOR_SESSION_SECRET` | Yes | Must be a long random secret (≥ 32 chars) |
| `ADMIN_SESSION_SECRET` | Yes | Must be a long random secret (≥ 32 chars) |
| `ADMIN_LOGIN_USERNAME` | Yes | Change from default `admin` |
| `ADMIN_LOGIN_PASSWORD` | Yes | Change from default `change-me` |
| `PAYMENT_RAILS_ENABLED` | Yes | `true` or `false` |
| `DEFAULT_FUNDING_RAIL` | Yes | e.g. `manual` |
| `DEFAULT_PAYOUT_RAIL` | Yes | e.g. `manual` |
| `MENAMARKET_API` | Yes | Set to the full base URL of the deployed API (e.g. `https://your-project.vercel.app/api`). Set this in the Vercel dashboard. |
| `OPENROUTER_API_KEY` | No | Only required if AI features are enabled |
| `OPENROUTER_MODEL` | No | Defaults to `openrouter/auto:free`. Override to select a specific model. |

> **Security note**: The app will refuse to start in production if `ACTOR_SESSION_SECRET` or `ADMIN_SESSION_SECRET` are missing or empty. Never deploy with the default `change-me` password or placeholder secrets.

### Branch protection (recommended)

Enable the following settings on the `main` branch in the GitHub repository settings:

- **Require status checks to pass before merging** — select the `CI / Lint, typecheck, test, build` check.
- **Require branches to be up to date before merging.**
- **Do not allow bypassing the above settings.**

These settings ensure every PR passes CI before it can be merged.

### Notes on workspace tooling

This repo uses **npm workspaces** (root `package.json`). A `pnpm-workspace.yaml` file also exists for local pnpm compatibility, but Vercel is configured to use npm via `"packageManager": "npm@10.9.2"` in `package.json` and the committed `package-lock.json`.

## Status
This is a real shell implementation only. Core trading, funding, oracle resolution, and compliance workflows are intentionally deferred to later scoped modules.
