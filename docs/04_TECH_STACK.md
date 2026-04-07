# 04_TECH_STACK

## Proposed baseline
- Monorepo: pnpm workspaces
- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS
- Shared validation: Zod
- Database ORM: Prisma
- Database: PostgreSQL
- Linting: ESLint
- Formatting: Prettier
- Unit tests: Vitest
- E2E tests: Playwright
- Contract development: Foundry or Hardhat
- Package manager: pnpm

## Rules
- keep dependencies minimal
- prefer typed libraries over runtime guesswork
- add new dependencies only when directly justified by a module
