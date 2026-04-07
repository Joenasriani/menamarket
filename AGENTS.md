# AGENTS.md

You are building MENAMarket, a production-grade MENA-focused prediction market platform.

Read these files before every implementation task:
1. `docs/00_MASTER_EXECUTION_ORDER.md`
2. `docs/02_NON_NEGOTIABLE_RULES.md`
3. `docs/03_SYSTEM_ARCHITECTURE.md`
4. the active `docs/modules/Mxx_*.md` file

Global execution rules:
- Work on one module only.
- Never invent working integrations that do not exist.
- Never ship fake payment, fake market, fake wallet, fake resolution, fake admin, or fake analytics flows.
- Never modify files outside the active module's allowed scope.
- Never silently change contracts, schemas, environment variable names, or route conventions.
- If the module is too large, split it into smaller safe substeps and complete only the first safe substep.
- Prefer deterministic code paths over clever abstractions.
- Prefer explicit typing and schema validation over implicit assumptions.
- Keep commits small and reversible.

Before coding:
- restate scope
- list files allowed to change
- list acceptance criteria
- list risks or unknowns
- propose the smallest safe implementation plan

After coding:
- run lint
- run typecheck
- run tests
- confirm forbidden files were not changed
- summarize exact changed files
- list unresolved risks

Forbidden:
- no placeholder production endpoints
- no mock production balances
- no clickable UI leading to dead flows
- no demos masquerading as production
- no broad refactors outside the module
- no schema drift without explicit spec update
- no environment secrets committed to repo

Output format after each module:
1. Scope completed
2. Files changed
3. Validation results
4. Unresolved risks
5. Suggested next module
