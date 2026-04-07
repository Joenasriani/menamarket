# 08_SECURITY_REQUIREMENTS

## Baseline requirements
- no secrets in repo
- strict input validation
- CSRF protection where applicable
- auth checks on all admin routes
- audit logging on admin and financial actions
- environment segregation between local, staging, and production
- rate limiting on public endpoints likely to be abused
- typed serialization for all API responses

## Minimum pre-launch checks
- dependency audit
- auth boundary review
- route authorization review
- environment variable review
- schema validation review
