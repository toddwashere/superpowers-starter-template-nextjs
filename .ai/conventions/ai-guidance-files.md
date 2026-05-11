# AI Guidance Files Convention

When adding or editing any LLM-related instruction file (rules, skills, conventions, CLAUDE.md, AGENTS.md, .cursor/rules/, or similar):

1. Put the canonical content in `.ai/` (skills in `.ai/skills/`, conventions in `.ai/conventions/`).
2. Add a lightweight reference in `.cursor/rules/shared-ai-guidance.mdc` (a one-line "When doing X, read `.ai/...`" entry).
3. If a `.claude/skills/` wrapper exists for the topic, update it too. For new skills, create a wrapper that points to the `.ai/` canonical file.

Never put durable instructions only in `.cursor/` or `.claude/`. Those are references, not sources of truth.
