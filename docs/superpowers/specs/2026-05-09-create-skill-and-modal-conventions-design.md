# Create-Skill Meta-Skill and Modal Conventions

## Overview

Two deliverables:

1. A project-level `create-skill` skill that teaches AI agents how to author new skills for this monorepo, following the established three-tier pattern (canonical `.ai/` + lightweight `.cursor/` and `.claude/` wrappers).
2. An `add-modal-or-confirm-dialog` skill, created by following the `create-skill` process, that codifies NiceModal conventions for the project.

The second skill serves as the acceptance test for the first.

## Deliverable 1: `create-skill`

### File Structure

```
.ai/skills/create-skill/SKILL.md              # Canonical content
.cursor/skills/create-skill/SKILL.md           # Lightweight wrapper → .ai/
.claude/skills/create-skill/SKILL.md           # Lightweight wrapper → .ai/
```

### Frontmatter

```yaml
name: create-skill
description: >-
  Create new project-level AI agent skills following this monorepo's three-tier
  pattern (canonical .ai/ + .cursor/ and .claude/ wrappers). Use when authoring
  a new skill, adding agent conventions, or asking about SKILL.md structure in
  this project.
disable-model-invocation: true
```

Explicit invocation only — does not auto-trigger.

### Canonical Skill Content

The `.ai/skills/create-skill/SKILL.md` body covers:

#### Purpose

Use this skill when creating a new project-level skill for this monorepo.

#### Workflow (ordered steps)

1. **Gather requirements** — understand what the skill does, when it triggers, what domain knowledge it encodes. If the user included exact wording, use it verbatim.

2. **Choose a name** — lowercase kebab-case, max 64 chars, descriptive of the task (e.g., `add-modal-or-confirm-dialog`, not `modal-helper`).

3. **Write the canonical skill** at `.ai/skills/<name>/SKILL.md`:
   - YAML frontmatter with `name` and `description` (third-person, includes WHAT + WHEN, specific trigger terms).
   - Markdown body under 500 lines.
   - Concise — only include knowledge the agent wouldn't already have.
   - Include a checklist if the skill has a multi-step workflow.

4. **Generate harness wrappers** — create identical lightweight files in both:
   - `.cursor/skills/<name>/SKILL.md`
   - `.claude/skills/<name>/SKILL.md`

   Each wrapper has the same frontmatter as the canonical skill. The body is:
   ```
   # <Skill Title>

   Canonical instructions live at [`.ai/skills/<name>/SKILL.md`](../../../.ai/skills/<name>/SKILL.md).

   Before <doing the thing>, read and follow the canonical skill.
   ```

5. **Register the skill** — add entries to:
   - `.cursor/rules/shared-ai-guidance.mdc` — a new "When doing X, read `.ai/skills/<name>/SKILL.md` before making changes." line.
   - `.ai/README.md` — add the skill to the skills list.

6. **Present to user for review** — show the draft skill content and get approval before committing.

#### Authoring Guidelines

Distilled best practices for writing skill content in this project:

- **Description**: third-person, includes WHAT the skill does and WHEN to use it, with specific trigger terms.
- **Body**: under 500 lines. Use progressive disclosure (link to reference files) for detailed content.
- **Examples over abstractions**: concrete code snippets and naming examples beat generic instructions.
- **Consistent terminology**: pick one term per concept and stick with it throughout.
- **No time-sensitive information**: avoid "if before date X, do Y."
- **Verbatim user text**: if the user provides exact wording for conventions, use it as-is.

#### Wrapper Template

Provided so agents can copy-paste and fill in blanks rather than reinventing the format each time.

#### Verification Checklist

Before presenting to the user:

- [ ] Canonical skill exists at `.ai/skills/<name>/SKILL.md`
- [ ] Cursor wrapper exists at `.cursor/skills/<name>/SKILL.md`
- [ ] Claude wrapper exists at `.claude/skills/<name>/SKILL.md`
- [ ] All three files have matching `name` and `description` frontmatter
- [ ] Wrappers point to canonical path with correct relative link
- [ ] Skill registered in `.cursor/rules/shared-ai-guidance.mdc`
- [ ] Skill listed in `.ai/README.md`
- [ ] Description includes WHAT and WHEN
- [ ] Body is under 500 lines

## Deliverable 2: `add-modal-or-confirm-dialog`

Created by following the `create-skill` process above. Serves as the acceptance test.

### File Structure

```
.ai/skills/add-modal-or-confirm-dialog/SKILL.md
.cursor/skills/add-modal-or-confirm-dialog/SKILL.md
.claude/skills/add-modal-or-confirm-dialog/SKILL.md
```

### Frontmatter

```yaml
name: add-modal-or-confirm-dialog
description: >-
  Conventions for adding modals, confirm dialogs, and overlay UI using
  NiceModal. Use when adding a modal, dialog, confirm dialog, alert dialog,
  drawer, or any overlay triggered by a user action.
```

No `disable-model-invocation` — this skill should auto-trigger when agents detect modal/dialog work.

### Canonical Skill Content

#### Core Rules

- Use NiceModal (`@ebay/nice-modal-react`) for all modals and related overlays.
- Create a new component with naming `{action}-{model}-button-modal.tsx` (e.g., `add-contact-button-modal.tsx`, `delete-user-confirm-dialog.tsx`).
- ALWAYS summon/open a modal via JavaScript (`NiceModal.show(MyModal, { props })`). Never use `DialogTrigger` or other declarative open mechanisms.
- If there are ever multiple buttons that trigger the same modal on the page, there should only ever be one of that specific modal type rendered.

#### Component Pattern

How to create a NiceModal component:
- Register with `NiceModal.create()`
- Use `useModal()` hook for internal control (resolve, hide)
- Use shadcn `Dialog`/`AlertDialog` as the visual shell inside the NiceModal wrapper

#### Summoning Pattern

How to open a modal from a button:
- `NiceModal.show(MyModal, { prop1, prop2 })`
- No `useState` for open/close — NiceModal manages visibility

#### File Location

Modal components live inside the feature that owns them:
- `apps/dashboard/features/<domain>/ui/{action}-{model}-button-modal.tsx`

#### Migration Guidance

Existing dialogs (`invite-member-dialog.tsx`, `remove-member-dialog.tsx`, `update-member-role-dialog.tsx`) should be migrated to NiceModal when touched, not proactively refactored.

#### Checklist

- [ ] Component uses `NiceModal.create()` wrapper
- [ ] Uses `useModal()` hook internally
- [ ] File named `{action}-{model}-button-modal.tsx`
- [ ] Opened via `NiceModal.show()` from JavaScript
- [ ] Only one instance of a given modal type per page
- [ ] No `DialogTrigger` or declarative open patterns
- [ ] Located in the owning feature's `ui/` directory

### NiceModal Setup (done during implementation, not by the skill)

- Install `@ebay/nice-modal-react` in the dashboard app
- Add `<NiceModal.Provider>` in the app's root layout
- These are one-time setup steps handled during the implementation plan

## Out of Scope

- Migrating existing dialogs to NiceModal (future work, done incrementally)
- Eval/benchmark framework for skills (opted for user-review only)
- Auto-invocation of `create-skill` (explicit only)
