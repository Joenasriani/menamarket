# MENAMarket M06 overlay — Review to Publish Workflow

Apply this overlay on top of M05.

Purpose:
- add explicit review-to-publish workflow from internal drafts into public market records
- require a manual publish action through an internal admin route
- append a validated market record into `data/markets.json`
- preserve the original draft record while marking it published
- create an audit log entry for every publish action

This stage still does **not** add:
- trading execution
- fake market data
- fake order books
- wallet flows
- settlement
- funding
- automatic moderation
