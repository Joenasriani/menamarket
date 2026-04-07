# M03_auth_wallet_connection

## Goal
Implement a real authentication/session foundation and wallet connection UI boundary without implying live trading readiness.

## Why this exists
Prediction-market products need a user and wallet boundary early, but that boundary must not fake funding or trading ability.

## Inputs / dependencies
- M01 complete
- M02 complete

## Files allowed to change
- apps/web auth/session files
- packages/api auth schemas
- database/auth schema if introduced
- user/session route handlers
- wallet connect components

## Files forbidden to change
- order entry
- settlement logic
- fake balances

## Data contracts involved
- session schema
- auth response schema
- wallet connection state schema

## UI states
- signed out
- connecting
- connected
- session error

## Error states
- invalid session
- wallet connect failure
- missing provider

## Edge cases
- wallet disconnected mid-session
- repeat sign-in attempts

## Acceptance criteria
- session route exists
- connect wallet UI exists
- authenticated header state works
- no fake balances or trading entitlements are shown

## Required tests
- auth route integration test
- wallet component state test

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
