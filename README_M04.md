# MENAMarket M04 overlay — Market Detail Routes

Apply this overlay on top of M03.

Purpose:
- add real market detail routing using the repository-backed catalog
- add public market detail page at `/markets/[slug]`
- add public API route at `/api/markets/[slug]`
- add internal admin detail route at `/market-ops/catalog/[slug]`
- keep empty-state behavior truthful when no catalog records exist

This stage still does **not** add:
- fake liquidity
- fake prices
- order books
- wallet connection
- trading actions
- settlement
- funding
