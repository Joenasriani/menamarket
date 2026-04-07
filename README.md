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

## Status
This is a real shell implementation only. Core trading, funding, oracle resolution, and compliance workflows are intentionally deferred to later scoped modules.
