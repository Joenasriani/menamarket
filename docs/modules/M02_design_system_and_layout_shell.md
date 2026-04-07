# M02_design_system_and_layout_shell

## Goal
Implement the shared UI foundation, theme tokens, base layout shell, navigation, and generic states for the public web app and admin app.

## Why this exists
A consistent design system prevents UI drift and reduces repetitive AI-generated component variation.

## Inputs / dependencies
- M01_repo_bootstrap completed

## Files allowed to change
- packages/ui/**
- apps/web/app/layout.*
- apps/web/app/page.*
- apps/admin/app/layout.*
- apps/admin/app/page.*
- shared style config files

## Files forbidden to change
- API routes
- database schema
- market business logic

## Data contracts involved
- design tokens
- base component props

## UI states
- default layout
- loading skeleton shell
- empty state card
- error state card

## Error states
- missing token reference
- component prop mismatch

## Edge cases
- SSR-safe theme handling
- duplicated Tailwind config

## Acceptance criteria
- shared button, card, badge, table shell, page header, empty state, and error state components exist
- web and admin apps use shared layout primitives
- branding is original and not a Polymarket imitation

## Required tests
- component smoke tests for at least two shared components
- app renders without hydration errors

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
