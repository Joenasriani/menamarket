# 06_API_CONTRACTS

## Public routes
- GET /api/events
- GET /api/events/:slug
- GET /api/markets/:slug
- GET /api/markets/:slug/orderbook

## Auth routes
- POST /api/auth/session
- POST /api/auth/logout

## Protected placeholder routes for later modules
- GET /api/me/positions
- GET /api/me/orders

## Rules
- every route must have request and response schemas
- every error state must have a structured shape
- no undocumented route should be used by UI components
