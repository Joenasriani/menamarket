# 03_SYSTEM_ARCHITECTURE

## Overview
MENAMarket uses a modular architecture designed for a prediction-market application with real-time market data, controlled trading flows, and auditable operations.

## Primary domains
1. web application
2. admin application
3. public API
4. private trading API
5. real-time market stream service
6. order book service
7. matching engine
8. contract interaction layer
9. resolution service
10. audit and surveillance service

## Suggested repo topology
- `apps/web` for public site and authenticated user experience
- `apps/admin` for market operations and moderation
- `packages/ui` shared design system
- `packages/api` shared schemas, service clients, and route contracts
- `contracts` onchain interfaces and settlement-related code
- `tests` integration and e2e coverage

## Frontend architecture
- Next.js app router
- server-rendered public discovery pages where useful
- client-side real-time streams only where required
- shared typed API client
- strict error-state rendering

## Backend architecture
- API layer with explicit domain routes
- schema-driven contracts
- a market data service for events and catalog reads
- an order book service for book snapshots and updates
- later: a matching service for execution and settlement orchestration

## Persistence
- relational database for durable business state
- Redis or equivalent for hot order-book cache later
- object storage for evidence and operational artifacts later

## Observability
- structured logs
- audit log table
- error tracking
- explicit request correlation ids

## Release principle
Each module must be independently testable without implying that later real-money workflows already exist.
