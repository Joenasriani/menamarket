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

This monorepo contains **two separate Next.js apps** that must be deployed as **two separate Vercel projects**:

| App | Purpose | Users |
|---|---|---|
| `apps/web` | Public-facing website (Markets, Activity, Portfolio, etc.) | Everyone — **no login required** to browse |
| `apps/admin` | Internal admin panel (Market Ops, Audit, Drafts, etc.) | Admins only — **login required** |

> **⚠️ Important**: If you only see an admin login page with "Protected internal access" after deploying, you deployed the **admin** app instead of the **web** app. Follow [Option A](#option-a-deploy-from-the-repository-root-web-app) or [Option B](#option-b-deploy-each-app-with-its-own-root-directory) below to deploy the correct app.

### Option A: Deploy from the repository root (web app)

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

### Option B: Deploy each app with its own Root Directory

Create **two** Vercel projects from the same repo:

**Public web app** (what end users see):

| Setting | Value |
|---|---|
| Root Directory | `apps/web` |
| Framework Preset | Next.js |

**Admin panel** (internal, login-protected):

| Setting | Value |
|---|---|
| Root Directory | `apps/admin` |
| Framework Preset | Next.js |

Each app has its own `vercel.json` that handles install and build commands automatically.

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
| `OPENROUTER_API_KEY` | No | Only required if AI features are enabled |
| `OPENROUTER_MODEL` | No | Default: `openrouter/auto`; override to use a specific model |
| `MENAMARKET_API` | No | API base URL for server-side calls. Leave blank on Vercel — the app uses the relative path `/api` (same origin) by default. Only set this if calling from a different origin. |

> **Security note**: The app will refuse to start in production if `ACTOR_SESSION_SECRET` or `ADMIN_SESSION_SECRET` are missing or empty. Never deploy with the default `change-me` password or placeholder secrets.

### Notes on workspace tooling

This repo uses **npm workspaces** (root `package.json`). Vercel is configured to use npm via `"packageManager": "npm@10.9.2"` in `package.json` and the committed `package-lock.json`. There is no `pnpm-workspace.yaml` in this repo; npm is the sole package manager.

## Public preview mode

The public website (`apps/web`) operates in **public preview mode** by default — all market browsing and activity features work without any account or authentication setup.

### What works in public preview

| Feature | Status |
|---|---|
| Homepage | ✅ Available |
| Markets listing (search + filter) | ✅ Available |
| Market detail (read-only pricing, orderbook) | ✅ Available |
| Activity feed | ✅ Available |
| About page | ✅ Available |
| Compliance page | ✅ Available |

### What is disabled in public preview

| Feature | Status | Notes |
|---|---|---|
| Login / Sign-up | ⏳ Coming soon | Shows a clear notice; no form shown without Supabase |
| Portfolio | ⏳ Coming soon | Requires sign-in; shows empty state for guests |
| Funding / Payouts | ⏳ Coming soon | Shows roadmap notice; no actions exposed |
| Order placement | ⏳ Coming soon | Market detail shows read-only orderbook only |

### How public preview detection works

Authentication availability is determined at build time by checking:
- `NEXT_PUBLIC_SUPABASE_URL` — must be a real Supabase project URL (not the placeholder)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — must be non-empty

If either value is missing or empty, the site operates in public preview mode:
- Login and sign-up links are hidden from the navigation
- Login and sign-up pages show a clear "not available" notice
- Funding page shows a roadmap notice with no actions
- Market detail shows read-only orderbook and pricing

### Enabling full mode

To activate authentication and user accounts:

1. Create a [Supabase](https://supabase.com) project.
2. Copy the **Project URL** and **anon (public) key** from your Supabase dashboard.
3. Set the following environment variables (in `.env` locally, or in Vercel's dashboard):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ACTOR_SESSION_SECRET=a-long-random-secret
   ```
4. Rebuild and deploy. Login, signup, portfolio, and funding pages will become active.


