# Contributing to MENAMarket

Thank you for your interest in contributing to MENAMarket, a MENA-focused prediction market platform.

## Before you start

Read these files first — they govern all development work:

1. `AGENTS.md` — execution rules, module discipline, forbidden patterns
2. `CLAUDE.md` — brand identity and operational truths
3. `docs/00_MASTER_EXECUTION_ORDER.md` — module sequencing
4. `docs/02_NON_NEGOTIABLE_RULES.md` — hard constraints

Contributions that violate these rules will not be merged.

## Workflow

1. Fork the repository and create a branch from `main`.
2. Work on **one module at a time** (see `docs/00_MASTER_EXECUTION_ORDER.md`).
3. Follow the acceptance criteria defined in the active module's spec file (`docs/modules/`).
4. Run validation before opening a PR:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```
5. Open a pull request against `main`. The PR description must include:
   - Scope completed
   - Files changed
   - Validation results (lint / typecheck / test)
   - Any unresolved risks

## Code standards

- TypeScript strict mode throughout (see `tsconfig.base.json`).
- No placeholder production endpoints, no fake data masquerading as real.
- No financial action without auditability.
- No broad refactors outside the active module scope.
- Follow existing naming and file structure conventions.

## Environment setup

```bash
cp .env.example .env
# Fill in real values (see .env.example comments)
npm install
npm run dev:web
```

## Testing

```bash
npm test
```

Tests use Node.js built-in test runner (`node --test`). Add test files to `tests/` matching the pattern `*.test.mjs`.

## Security

If you discover a security issue, do **not** open a public issue. See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
