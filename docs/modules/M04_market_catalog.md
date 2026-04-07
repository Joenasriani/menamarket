# M04_market_catalog

## Goal
Implement the real event and market catalog domain with typed models, database persistence, seedable development data, and public read APIs.

## Why this exists
The catalog is the foundation for discovery, event pages, and later order book attachment.

## Inputs / dependencies
- M01 complete
- M02 complete

## Files allowed to change
- database schema and migrations
- packages/api market and event schemas
- public API routes for events and markets
- apps/web discovery pages and loaders

## Files forbidden to change
- order placement
- matching engine
- admin publish UI unless explicitly needed for seed workflow

## Data contracts involved
- Event schema
- Market schema
- list response schema
- error response schema

## UI states
- homepage with event list
- category/tag views if implemented
- empty catalog state
- API failure state

## Error states
- malformed seed data
- missing slug
- empty result set

## Edge cases
- duplicate slugs
- unpublished market visibility
- ended vs active states

## Acceptance criteria
- events and markets persist in database
- public listing pages work with typed responses
- no fake chart or fake live price widgets are shown

## Required tests
- integration tests for GET /api/events and GET /api/markets/:slug equivalent route

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
