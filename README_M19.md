# MENAMarket M19 overlay — Actor Auth and Session Layer

Apply this overlay on top of M18.

Purpose:
- add lightweight public actor authentication for non-admin users
- create file-backed actor identities
- support signup, login, logout, and session cookies
- expose current actor session through a read-only API
- prepare actor-bound order, ledger, and activity flows without adding OAuth or wallet auth yet

This stage does not yet add:
- social login
- wallet login
- email verification
- password reset
- multi-factor auth
- role hierarchy beyond actor vs admin
