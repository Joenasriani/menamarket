# 09_TESTING_STRATEGY

## Test pyramid
- unit tests for pure logic
- integration tests for API routes and data access
- e2e tests for critical user flows

## Required posture
- each module defines its own mandatory tests
- no module is done without at least one integration or e2e proof where relevant
- tests must cover error states, not only happy paths

## Critical flows for later phases
- auth session creation
- event discovery
- market page rendering
- order book retrieval
- order entry validation
- admin market publish flow
