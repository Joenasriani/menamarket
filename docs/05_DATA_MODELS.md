# 05_DATA_MODELS

## Core entities
- User
- Session
- WalletConnection
- Event
- Market
- Outcome
- Order
- Trade
- Position
- AuditLog
- ResolutionRecord

## Event
- id
- slug
- title
- category
- description
- status
- startsAt
- endsAt
- createdAt
- updatedAt

## Market
- id
- eventId
- slug
- question
- marketType
- status
- closeTime
- resolutionSource
- rules
- createdAt
- updatedAt

## Outcome
- id
- marketId
- key
- label
- sortOrder

## Order
- id
- marketId
- outcomeId
- side
- orderType
- price
- quantity
- remainingQuantity
- status
- walletAddress
- createdAt

## Trade
- id
- marketId
- buyOrderId
- sellOrderId
- price
- quantity
- executedAt

## Position
- id
- marketId
- outcomeId
- walletAddress
- quantity
- averageEntryPrice
- realizedPnl
- unrealizedPnl

## AuditLog
- id
- actorType
- actorId
- action
- targetType
- targetId
- metadata
- createdAt
