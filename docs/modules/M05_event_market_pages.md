# M05_event_market_pages

## Goal
Build real event pages and market pages with rules, close time, outcomes, and safe placeholders only for future order-book sections.

## Why this exists
The market page is where trust is won or lost; users need clarity before later trading flows are added.

## Inputs / dependencies
- M04 complete

## Files allowed to change
- apps/web event page files
- apps/web market page files
- packages/ui display components for rules and metadata

## Files forbidden to change
- order submission backend
- matching engine
- fake trade history

## Data contracts involved
- event detail schema
- market detail schema

## UI states
- event detail
- market detail
- not found
- loading
- error

## Error states
- invalid slug
- missing rules data
- unpublished market access

## Edge cases
- event with multiple markets
- binary vs multi-outcome rendering

## Acceptance criteria
- market page shows question, outcomes, close time, rules, and source clearly
- any future trading panel area is explicitly non-interactive until M06+ exists

## Required tests
- route rendering tests for valid and invalid market slugs

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
