# Security Policy

## Supported Versions

Only the latest release on `main` is actively maintained and receives security fixes.

| Version | Supported |
|---------|-----------|
| latest  | ✅        |
| older   | ❌        |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

To report a vulnerability, please:

1. Email the maintainers directly (see repository owner contact).
2. Include a clear description of the vulnerability, steps to reproduce, and potential impact.
3. Allow up to 14 days for an initial response.

We will acknowledge your report, investigate, and coordinate a fix and disclosure timeline with you.

## Security Hardening Notes

- Never deploy with default admin credentials (`ADMIN_LOGIN_USERNAME=admin`, `ADMIN_LOGIN_PASSWORD=change-me`).
- `ACTOR_SESSION_SECRET` and `ADMIN_SESSION_SECRET` must each be at least 32 random characters. The app refuses to start in production if these are missing or set to placeholder values.
- All required environment variables are documented in `.env.example` and in the README.
- Never commit `.env` files or real secrets to this repository.
- Enable GitHub secret scanning and Dependabot alerts on any fork or derivative project.
