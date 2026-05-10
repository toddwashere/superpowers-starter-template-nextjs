# Shared AI Guidance

This folder contains canonical project guidance for AI coding agents.

Tool-specific folders such as `.cursor/` and `.claude/` should keep only lightweight references or wrappers when possible. The durable instructions should live here (`.ai/`) so all agents follow the same project conventions.

## Skills

- [`skills/add-data-model-to-database/SKILL.md`](./skills/add-data-model-to-database/SKILL.md) - Conventions for adding Prisma schema models, domain-owned repositories, and database access patterns.
- [`skills/create-skill/SKILL.md`](./skills/create-skill/SKILL.md) - Create new project-level AI agent skills following this monorepo's three-tier pattern (canonical .ai/ + .cursor/ and .claude/ wrappers).
