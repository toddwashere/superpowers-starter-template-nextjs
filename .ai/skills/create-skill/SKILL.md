---
name: create-skill
description: >-
  Create new project-level AI agent skills following this monorepo's three-tier
  pattern (canonical .ai/ + .cursor/ and .claude/ wrappers). Use when authoring
  a new skill, adding agent conventions, or asking about SKILL.md structure in
  this project.
disable-model-invocation: true
---

# Create Skill

## Purpose

Use this skill when creating a new project-level skill for this monorepo. Skills encode domain knowledge and project conventions that agents would otherwise invent inconsistently.

## Workflow

### 1. Gather requirements

Understand what the skill does, when it triggers, and what domain knowledge it encodes. If the user provided exact wording for conventions, use it verbatim.

### 2. Choose a name

Lowercase kebab-case, max 64 characters. Name the task, not a concept:
- Good: `add-modal-or-confirm-dialog`, `add-data-model-to-database`
- Bad: `modal-helper`, `database`

### 3. Write the canonical skill at `.ai/skills/<name>/SKILL.md`

```
---
name: <name>
description: >-
  <Third-person. WHAT the skill does + WHEN to use it. Include specific trigger
  terms agents should recognize (e.g., "modal", "dialog", "overlay").>
---

# <Skill Title>

## Purpose

<One paragraph. Why this skill exists and what problem it solves.>

## <Section per major concept>

<Content...>

## Checklist

- [ ] <Verification item>
```

Rules for the body:
- Under 500 lines total.
- Use concrete code snippets and naming examples — not generic instructions.
- Pick one term per concept and use it throughout.
- No time-sensitive information ("if before date X").
- Distill only knowledge the agent wouldn't already have.

### 4. Generate harness wrappers

Create identical lightweight files at:
- `.cursor/skills/<name>/SKILL.md`
- `.claude/skills/<name>/SKILL.md`

Each wrapper has the same frontmatter as the canonical skill. Body:

```markdown
# <Skill Title>

Canonical instructions live at [`.ai/skills/<name>/SKILL.md`](../../../.ai/skills/<name>/SKILL.md).

Before <doing the thing>, read and follow the canonical skill.
```

### 5. Register the skill

**`.cursor/rules/shared-ai-guidance.mdc`** — add one line:

```
When <trigger phrase>, read `.ai/skills/<name>/SKILL.md` before making changes.
```

**`.ai/README.md`** — add a bullet to the Skills list:

```
- [`skills/<name>/SKILL.md`](./skills/<name>/SKILL.md) - <One-line description matching the frontmatter description.>
```

### 6. Present to user for review

Show the draft canonical skill content and await approval before committing.

## Authoring Guidelines

- **Description**: third-person, includes WHAT and WHEN, with specific trigger terms.
- **Body**: under 500 lines. Link to reference files for large content (progressive disclosure).
- **Examples over abstractions**: concrete file paths and code snippets beat generic instructions.
- **Consistent terminology**: one term per concept throughout the skill.
- **No time-sensitive information**: avoid "if before date X, do Y."
- **Verbatim user text**: if the user provides exact wording, use it as-is.

## Wrapper Template

`.cursor/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md`:

```markdown
---
name: <name>
description: >-
  <Same description as canonical>
---

# <Skill Title>

Canonical instructions live at [`.ai/skills/<name>/SKILL.md`](../../../.ai/skills/<name>/SKILL.md).

Before <doing the thing>, read and follow the canonical skill.
```

## Verification Checklist

- [ ] Canonical skill exists at `.ai/skills/<name>/SKILL.md`
- [ ] Cursor wrapper exists at `.cursor/skills/<name>/SKILL.md`
- [ ] Claude wrapper exists at `.claude/skills/<name>/SKILL.md`
- [ ] All three files have matching `name` and `description` frontmatter
- [ ] Wrappers point to canonical path with correct relative link
- [ ] Skill registered in `.cursor/rules/shared-ai-guidance.mdc`
- [ ] Skill listed in `.ai/README.md`
- [ ] Description includes WHAT and WHEN
- [ ] Body is under 500 lines
