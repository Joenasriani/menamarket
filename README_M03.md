# MENAMarket M03 overlay — Market Catalog

This overlay is designed to be applied **on top of M02**.

Purpose:
- add a real, schema-driven market catalog system
- keep the catalog empty by default instead of inventing sample markets
- expose a public `/api/markets` endpoint
- render `/markets` from real validated data
- add admin catalog overview routes that reflect real data state only

This stage still does **not** add:
- fake prices
- fake order books
- fake wallet data
- fake portfolio balances
- trading execution
- settlement
- funding
