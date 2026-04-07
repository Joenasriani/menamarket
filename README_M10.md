# MENAMarket M10 overlay — Admin Authentication Guard

Apply this overlay on top of M09.

Purpose:
- add real admin session checks for internal admin routes and APIs
- protect admin pages with a server-side cookie session gate
- require explicit login through an internal admin login form
- keep implementation lightweight and file-free for credentials, using environment variables only

This stage still does not add:
- user accounts for public users
- OAuth
- wallet auth
- role hierarchy beyond a single admin session guard
- trading
- settlement
- funding
