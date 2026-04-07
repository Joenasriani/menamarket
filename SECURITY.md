# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in MENAMarket, please **do not** open a public GitHub issue.

Report vulnerabilities privately by emailing the repository owner directly (see the GitHub profile for contact details) or by using GitHub's private vulnerability reporting feature on this repository.

Please include:
- A description of the vulnerability and the potential impact
- Steps to reproduce or a proof-of-concept
- Any suggested mitigations

We will acknowledge receipt within 72 hours and aim to provide a resolution timeline within 7 days for critical issues.

## Supported Versions

Only the latest commit on the `main` branch is actively maintained and receives security fixes.

## Security Expectations

- **No secrets in source code.** All secrets and credentials must be supplied via environment variables. Never commit `.env` files.
- **Production secrets must not use placeholder values.** The application will refuse to start in production if session secrets are missing or empty.
- **Change all default credentials before deploying.** The default `ADMIN_LOGIN_PASSWORD=change-me` must be replaced with a strong password before any production deployment.
- **Environment variables are the only supported credential delivery mechanism** for secrets referenced in this codebase.
