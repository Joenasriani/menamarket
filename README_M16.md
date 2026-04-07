# MENAMarket M16 overlay — Simple Off-chain Matching

Apply this overlay on top of M15.

Purpose:
- add a simple deterministic matching engine
- store fills in a file-backed catalog
- expose fill and matching endpoints
- use the ledger to transfer matched inventory and reserved cash

This stage does not yet add:
- settlement payouts
- advanced partial collateral logic
- websocket updates
