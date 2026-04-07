# MENAMarket M11 overlay — Admin Audit Viewer and Session Policy

Apply this overlay on top of M10.

Purpose:
- add a real admin audit viewer for file-backed audit records
- add a public admin API to inspect audit entries only when authenticated
- strengthen admin session verification with max-age enforcement
- surface audit history for publishing and lifecycle actions without inventing analytics

This stage still does not add:
- trading
- pricing
- wallets
- funding
- multi-role RBAC
- external identity providers
