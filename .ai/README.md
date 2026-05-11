# Shared AI Guidance

This folder contains canonical project guidance for AI coding agents.

Tool-specific folders such as `.cursor/` and `.claude/` should keep only lightweight references or wrappers when possible. The durable instructions should live here (`.ai/`) so all agents follow the same project conventions.

## Skills

- [`skills/add-data-model-to-database/SKILL.md`](./skills/add-data-model-to-database/SKILL.md) - Conventions for adding Prisma schema models, domain-owned repositories, and database access patterns.
- [`skills/create-skill/SKILL.md`](./skills/create-skill/SKILL.md) - Create new project-level AI agent skills following this monorepo's three-tier pattern (canonical .ai/ + .cursor/ and .claude/ wrappers).
- [`skills/add-modal-or-confirm-dialog/SKILL.md`](./skills/add-modal-or-confirm-dialog/SKILL.md) - Conventions for adding modals, confirm dialogs, and overlay UI using NiceModal.

## Conventions

- [`conventions/ai-guidance-files.md`](./conventions/ai-guidance-files.md) - Three-tier pattern for AI guidance files (.ai/ canonical, .cursor/ and .claude/ as references).
- [`conventions/critical-tests-in-plans.md`](./conventions/critical-tests-in-plans.md) - Require a "Critical Tests" section in all plans and specs.
- [`conventions/plan-archival.md`](./conventions/plan-archival.md) - Move completed plans and specs to `done/` subdirectories.
