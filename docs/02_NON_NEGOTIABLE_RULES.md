# 02_NON_NEGOTIABLE_RULES

## Product integrity
- MENAMarket must not copy Polymarket branding, logos, text, or proprietary assets.
- MENAMarket may implement similar mechanics, but all branding and UX identity must be original.
- No production feature may appear interactive unless the full underlying workflow exists.
- Any unfinished production feature must be hidden or explicitly disabled and labeled.

## Market integrity
- Every market must have a clear question, close time, resolution source, and explicit edge-case rules.
- Resolution rules are part of the product, not optional copy.
- A market without an unambiguous resolution source cannot be published.

## Engineering integrity
- All cross-boundary data must be schema-validated.
- All financial or settlement actions must create durable audit logs.
- All environment variables must be documented in a single source.
- Database migrations must be versioned and reversible when possible.

## AI build discipline
- AI may only change files allowed by the active module.
- AI may not perform broad refactors unless the active module explicitly authorizes them.
- AI may not delete tests unless replaced with stronger tests.
- AI may not replace real logic with mock logic to make tests pass.

## Security and compliance posture
- Restricted geography logic must be feature-flagged before launch.
- Admin actions must be authenticated, authorized, and audited.
- Secrets must never be committed.
- Contract addresses, chain IDs, and settlement-critical constants must be centralized.
