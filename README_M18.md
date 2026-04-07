# MENAMarket M18 overlay — Realtime Feed Surface

Apply this overlay on top of M17.

Purpose:
- add a read-only realtime-style feed endpoint for market activity
- expose recent orders, fills, lifecycle changes, and settlements in a unified timeline
- add a live activity page that refreshes client-side without inventing websocket behavior
- keep everything file-backed and truthful

This stage does not yet add:
- true websocket streaming
- push notifications
- background workers
- external message brokers
