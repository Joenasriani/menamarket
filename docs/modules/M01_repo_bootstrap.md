# M01_repo_bootstrap

## Goal
Create a real monorepo foundation for MENAMarket with shared tooling, workspace boundaries, environment documentation, linting, formatting, and test harnesses.

## Why this exists
Without a stable repo foundation, later AI-generated code will drift, duplicate tooling, and create inconsistent quality gates.

## Inputs / dependencies
- none

## Files allowed to change
- package.json
- pnpm-workspace.yaml
- turbo.json or workspace task config if chosen
- tsconfig base files
- ESLint config
- Prettier config
- Vitest base config
- apps/web initial scaffold
- apps/admin initial scaffold
- packages/ui initial scaffold
- packages/api initial scaffold
- tests base folders
- .gitignore
- .env.example

## Files forbidden to change
- contracts business logic
- any market/trading implementation beyond minimal placeholders required for compilation

## Data contracts involved
- none yet; only repo-level config contracts

## UI states
- apps may render only simple shell placeholders that clearly indicate foundational setup, not fake functionality

## Error states
- missing env file guidance
- missing package manager lock guidance

## Edge cases
- monorepo path alias collisions
- test runner path resolution
- shared tsconfig conflicts

## Acceptance criteria
- workspace installs cleanly
- root scripts exist for lint, typecheck, test
- apps and packages compile
- .env.example exists with documented placeholder keys
- README includes setup instructions

## Required tests
- one smoke test proving test runner works
- one lint/typecheck validation path documented

## Definition of done
- acceptance criteria pass
- lint passes
- typecheck passes
- required tests pass
- no forbidden files changed
- summary of changed files is produced

## Output summary format
1. Scope completed
2. Files changed
3. Validation results
4. Unresolved risks
5. Suggested next module
