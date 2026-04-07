# MENAMarket M05 overlay — Admin Market Draft Workflow

Apply this overlay on top of M04.

Purpose:
- add a real file-backed draft store for market creation
- keep drafts separate from public market records
- add internal admin form at `/market-ops/create`
- add internal draft list at `/market-ops/drafts`
- add server-side POST API for creating draft records
- enforce strict validation with no silent defaults

This stage still does **not** add:
- direct public publishing
- fake sample drafts
- wallet flows
- trading execution
- settlement
- funding
- fake moderation actions
