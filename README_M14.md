# MENAMarket M14 overlay — Off-chain Order System

Apply this overlay on top of M13.

Purpose:
- add a real file-backed off-chain order store
- allow order placement and cancellation through public API endpoints
- maintain simple per-market order books and user positions
- keep the system deterministic and local-first, without fake fills

This stage still does not add:
- live matching engine
- balances
- deposits
- withdrawals
- settlement payouts
- websocket updates
