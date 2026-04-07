# MENAMarket M20 overlay — Payment and Wallet Rails Abstraction

Apply this overlay on top of M19.

Purpose:
- add a file-backed wallet rails abstraction layer
- support funding intent creation and payout request creation
- separate rail selection from ledger balance logic
- prepare Stripe, crypto, or manual rails later without hardcoding them now

This stage does not yet add:
- real payment provider integration
- real on-chain transfers
- custody
- KYC checks
- automatic reconciliation
