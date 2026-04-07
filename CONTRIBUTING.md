# Contributing to MENAMarket

Thank you for your interest in contributing to MENAMarket.

## Before You Contribute

This is a **proprietary project**. By submitting any contribution (code, documentation, data, or configuration) you agree that:
- Your contribution may be incorporated into the project under its proprietary license.
- You have the right to submit the contribution and it does not violate any third-party rights.

## Governance rules (non-negotiable)

All contributions **must** comply with the execution rules in `AGENTS.md` and `docs/02_NON_NEGOTIABLE_RULES.md`. Key points:

- No fake production functionality, no placeholder payment/trading/settlement flows.
- No Polymarket branding, assets, or proprietary code (MENAMarket is a distinct brand).
- One module at a time — do not make broad refactors outside the active module scope.
- No environment secrets committed to the repository.
- No schema drift without an explicit spec update.

## Development setup

```bash
# Requires Node.js 22+ and npm 10+
npm install
npm run lint
npm run typecheck
npm test
```

## Pull request checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build:web` passes
- [ ] No new environment secrets are hardcoded in source files
- [ ] No placeholder production endpoints or fake flows are introduced
- [ ] Changes are scoped to the active module only

## Reporting bugs

Open a GitHub issue with a clear description, steps to reproduce, and expected vs. actual behaviour. For security issues, follow the [Security Policy](SECURITY.md) instead.
