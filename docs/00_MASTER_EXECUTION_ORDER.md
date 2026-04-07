# 00_MASTER_EXECUTION_ORDER

This file is the authoritative implementation order for MENAMarket.

## Rules
- Do not start a later module until the current module passes its acceptance criteria.
- If a module depends on missing infrastructure, build the smallest enabling layer first.
- Keep a decision log for any architecture deviation.

## Phase A — Repository and shell
1. M01_repo_bootstrap
2. M02_design_system_and_layout_shell

## Phase B — Access and public market surface
3. M03_auth_wallet_connection
4. M04_market_catalog
5. M05_event_market_pages

## Phase C — Trading infrastructure
6. M06_order_book_backend
7. M07_order_entry_ui
8. M08_matching_engine_foundation
9. M09_positions_portfolio

## Phase D — Contracts and settlement
10. M10_contract_interfaces
11. M11_settlement_flow
12. M12_redemption_flow

## Phase E — Resolution and operations
13. M13_resolution_pipeline
14. M14_admin_market_creation
15. M15_surveillance_controls
16. M16_audit_logging

## Phase F — Funding and launch hardening
17. M17_funding_and_withdrawals
18. M18_testing_e2e_and_reconciliation
19. M19_deployment_and_env_hardening
20. M20_launch_readiness_checklist
