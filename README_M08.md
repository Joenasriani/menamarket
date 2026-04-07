# MENAMarket M08 overlay — Market Rules and Resolution Details

Apply this overlay on top of M07.

Purpose:
- extend public market records with explicit rules and resolution metadata
- add dedicated rules fields without inventing trading data
- render those fields on public market detail pages and internal admin detail pages
- keep validation strict so incomplete records fail loudly instead of silently degrading

This stage still does **not** add:
- order books
- pricing
- wallet flows
- settlement execution
- funding
- auto-resolution
