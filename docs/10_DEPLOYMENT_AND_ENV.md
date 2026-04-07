# 10_DEPLOYMENT_AND_ENV

## Environments
- local
- staging
- production

## Minimum env variables expected later
- DATABASE_URL
- NEXT_PUBLIC_APP_URL
- SESSION_SECRET
- REDIS_URL
- RPC_URL
- CHAIN_ID
- CONTRACT_REGISTRY_URL

## Rules
- document every env variable before first production use
- no hard-coded secrets
- production-only switches must be explicit
