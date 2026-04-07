# M06_order_book_backend

## Goal
Implement the backend order book read model and public/private schemas for book snapshots without yet enabling live execution.

## Why this exists
The order book must be a real typed data service before UI execution paths or matching logic are added.

## Inputs / dependencies
- M04 complete
- M05 complete

## Files allowed to change
- packages/api order book schemas
- API routes for market order book snapshot
- order book domain service
- database or cache adapters if needed for snapshot storage

## Files forbidden to change
- actual matching engine
- settlement contracts
- fake fills generated for production paths

## Data contracts involved
- order book snapshot schema
- price level schema
- empty book schema

## UI states
- handled in later module; backend only

## Error states
- missing market
- malformed snapshot
- unavailable source

## Edge cases
- empty book
- one-sided book
- halted market book

## Acceptance criteria
- API route returns validated order book snapshot shape
- empty and populated books are supported
- no fake random data generation exists in production code paths

## Required tests
- integration tests for empty and populated book snapshot responses

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
