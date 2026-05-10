# Create-Skill Meta-Skill and Modal Conventions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `create-skill` meta-skill that teaches agents how to author project skills, then use it to create an `add-modal-or-confirm-dialog` skill backed by NiceModal installed in the dashboard app.

**Architecture:** Two new skill sets following the three-tier pattern (canonical `.ai/` + lightweight `.cursor/` and `.claude/` wrappers). NiceModal setup is a one-time prerequisite added to the dashboard's root Providers component.

**Tech Stack:** `@ebay/nice-modal-react`, pnpm, Next.js 16, React 19, shadcn Dialog/AlertDialog

---

## File Map

| Action | Path |
|--------|------|
| Modify | `apps/dashboard/package.json` |
| Modify | `apps/dashboard/features/auth/ui/auth-provider.tsx` |
| Create | `.ai/skills/create-skill/SKILL.md` |
| Create | `.cursor/skills/create-skill/SKILL.md` |
| Create | `.claude/skills/create-skill/SKILL.md` |
| Create | `.ai/skills/add-modal-or-confirm-dialog/SKILL.md` |
| Create | `.cursor/skills/add-modal-or-confirm-dialog/SKILL.md` |
| Create | `.claude/skills/add-modal-or-confirm-dialog/SKILL.md` |
| Modify | `.cursor/rules/shared-ai-guidance.mdc` |
| Modify | `.ai/README.md` |

---

### Task 1: Install NiceModal in the dashboard app

**Files:**
- Modify: `apps/dashboard/package.json`

- [ ] **Step 1: Add `@ebay/nice-modal-react` to dashboard dependencies**

Edit `apps/dashboard/package.json`. In the `"dependencies"` block, add after `"@hookform/resolvers"`:

```json
"@ebay/nice-modal-react": "^1",
```

The resulting dependencies block should look like:

```json
"dependencies": {
  "@better-auth-ui/react": "^1",
  "@ebay/nice-modal-react": "^1",
  "@hookform/resolvers": "^5",
  ...
}
```

- [ ] **Step 2: Install the package**

```bash
pnpm install
```

Expected: lock file updated, `@ebay/nice-modal-react` appears in `node_modules`.

- [ ] **Step 3: Verify TypeScript can resolve the package**

```bash
cd apps/dashboard && pnpm type-check
```

Expected: no new errors (the package ships its own types).

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/package.json pnpm-lock.yaml
git commit -m "feat(dashboard): install @ebay/nice-modal-react"
```

---

### Task 2: Add NiceModal.Provider to root Providers

**Files:**
- Modify: `apps/dashboard/features/auth/ui/auth-provider.tsx`

- [ ] **Step 1: Add NiceModal.Provider to Providers**

Replace the contents of `apps/dashboard/features/auth/ui/auth-provider.tsx` with:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { Toaster } from "@workspace/ui/components/sonner";
import type { ReactNode } from "react";
import { getQueryClient } from "../data/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <NiceModal.Provider>
          {children}
        </NiceModal.Provider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Type-check to confirm no errors**

```bash
cd apps/dashboard && pnpm type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/features/auth/ui/auth-provider.tsx
git commit -m "feat(dashboard): add NiceModal.Provider to root Providers"
```

---

### Task 3: Create `create-skill` canonical skill

**Files:**
- Create: `.ai/skills/create-skill/SKILL.md`

- [ ] **Step 1: Create the canonical skill file**

Create `.ai/skills/create-skill/SKILL.md` with the following content:

```markdown
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
```

- [ ] **Step 2: Verify the file was created and line count is reasonable**

```bash
wc -l .ai/skills/create-skill/SKILL.md
```

Expected: under 120 lines (well within the 500-line budget the skill itself mandates).

- [ ] **Step 3: Commit**

```bash
git add .ai/skills/create-skill/SKILL.md
git commit -m "feat(skills): add create-skill canonical skill"
```

---

### Task 4: Create `create-skill` harness wrappers

**Files:**
- Create: `.cursor/skills/create-skill/SKILL.md`
- Create: `.claude/skills/create-skill/SKILL.md`

- [ ] **Step 1: Create the Cursor wrapper**

Create `.cursor/skills/create-skill/SKILL.md`:

```markdown
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

Canonical instructions live at [`.ai/skills/create-skill/SKILL.md`](../../../.ai/skills/create-skill/SKILL.md).

Before creating a new skill, read and follow the canonical skill.
```

- [ ] **Step 2: Create the Claude wrapper**

Create `.claude/skills/create-skill/SKILL.md`:

```markdown
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

Canonical instructions live at [`.ai/skills/create-skill/SKILL.md`](../../../.ai/skills/create-skill/SKILL.md).

Before creating a new skill, read and follow the canonical skill.
```

- [ ] **Step 3: Verify frontmatter matches canonical**

```bash
head -10 .ai/skills/create-skill/SKILL.md
head -10 .cursor/skills/create-skill/SKILL.md
head -10 .claude/skills/create-skill/SKILL.md
```

Expected: all three have identical `name` and `description` fields.

- [ ] **Step 4: Commit**

```bash
git add .cursor/skills/create-skill/SKILL.md .claude/skills/create-skill/SKILL.md
git commit -m "feat(skills): add create-skill harness wrappers"
```

---

### Task 5: Register `create-skill` in guidance files

**Files:**
- Modify: `.cursor/rules/shared-ai-guidance.mdc`
- Modify: `.ai/README.md`

- [ ] **Step 1: Add `create-skill` to `.cursor/rules/shared-ai-guidance.mdc`**

Append before the ESM line (keep the ESM rule last). Add:

```
When creating a new project-level AI skill (SKILL.md), read `.ai/skills/create-skill/SKILL.md` before making changes.
```

The file should end with:

```
When creating a new project-level AI skill (SKILL.md), read `.ai/skills/create-skill/SKILL.md` before making changes.

Always use ESM `import`/`export` syntax. Never use `require()` or `module.exports`. This applies to all source code, config files, scripts, and generated code across the entire monorepo.
```

- [ ] **Step 2: Add `create-skill` to `.ai/README.md`**

The current Skills list in `.ai/README.md` has one entry. Append a second:

```markdown
- [`skills/create-skill/SKILL.md`](./skills/create-skill/SKILL.md) - Create new project-level AI agent skills following this monorepo's three-tier pattern (canonical .ai/ + .cursor/ and .claude/ wrappers).
```

- [ ] **Step 3: Commit**

```bash
git add .cursor/rules/shared-ai-guidance.mdc .ai/README.md
git commit -m "feat(skills): register create-skill in guidance files"
```

---

### Task 6: Create `add-modal-or-confirm-dialog` canonical skill

**Files:**
- Create: `.ai/skills/add-modal-or-confirm-dialog/SKILL.md`

- [ ] **Step 1: Create the canonical skill file**

Create `.ai/skills/add-modal-or-confirm-dialog/SKILL.md`:

```markdown
---
name: add-modal-or-confirm-dialog
description: >-
  Conventions for adding modals, confirm dialogs, and overlay UI using
  NiceModal. Use when adding a modal, dialog, confirm dialog, alert dialog,
  drawer, or any overlay triggered by a user action.
---

# Add Modal or Confirm Dialog

## Purpose

Use this skill when adding any modal, confirm dialog, alert dialog, or overlay to the dashboard app. The project uses NiceModal (`@ebay/nice-modal-react`) to eliminate `useState` open/close boilerplate and ensure a single instance of each modal type per page.

## Core Rules

- Use NiceModal (`@ebay/nice-modal-react`) for **all** modals and related overlays.
- Name the component file `{action}-{model}-button-modal.tsx`.
  - Examples: `add-contact-button-modal.tsx`, `delete-user-confirm-dialog.tsx`
- **Always** open a modal via JavaScript (`NiceModal.show(MyModal, { props })`). Never use `DialogTrigger` or other declarative open mechanisms.
- If multiple buttons on the same page can trigger the same modal, there must be only **one** instance of that modal component rendered in the tree — NiceModal handles the rest.

## Component Pattern

```tsx
// apps/dashboard/features/<domain>/ui/delete-user-confirm-dialog.tsx
"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";

interface DeleteUserConfirmDialogProps {
  userId: string;
  userName: string;
}

export const DeleteUserConfirmDialog = NiceModal.create(
  ({ userId, userName }: DeleteUserConfirmDialogProps) => {
    const modal = useModal();

    async function handleConfirm() {
      // perform the action
      modal.resolve(true);
      modal.hide();
    }

    return (
      <AlertDialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={modal.hide}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
```

For non-destructive modals use shadcn `Dialog` instead of `AlertDialog`:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";

export const AddContactButtonModal = NiceModal.create(
  ({ orgId }: { orgId: string }) => {
    const modal = useModal();
    return (
      <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          {/* form content */}
        </DialogContent>
      </Dialog>
    );
  }
);
```

## Summoning Pattern

Open a modal from a button — no `useState` required:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { DeleteUserConfirmDialog } from "@/features/users/ui/delete-user-confirm-dialog";

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  return (
    <button
      onClick={() => NiceModal.show(DeleteUserConfirmDialog, { userId, userName })}
    >
      Delete
    </button>
  );
}
```

`NiceModal.show()` returns a Promise that resolves with whatever `modal.resolve()` was called with.

## File Location

Modal components live inside the feature that owns them:

```
apps/dashboard/features/<domain>/ui/{action}-{model}-button-modal.tsx
```

Examples:
```
apps/dashboard/features/members/ui/invite-member-button-modal.tsx
apps/dashboard/features/members/ui/remove-member-confirm-dialog.tsx
apps/dashboard/features/contacts/ui/add-contact-button-modal.tsx
```

## Migration Guidance

Existing dialogs (`invite-member-dialog.tsx`, `remove-member-dialog.tsx`, `update-member-role-dialog.tsx`) should be migrated to NiceModal **when touched**, not proactively refactored.

## Checklist

- [ ] Component uses `NiceModal.create()` wrapper
- [ ] Uses `useModal()` hook internally for `visible`, `hide`, and `resolve`
- [ ] File named `{action}-{model}-button-modal.tsx`
- [ ] Opened via `NiceModal.show(Modal, { props })` from JavaScript
- [ ] Only one instance of a given modal type per page
- [ ] No `DialogTrigger` or other declarative open patterns
- [ ] Located in the owning feature's `ui/` directory
- [ ] Uses shadcn `Dialog` (non-destructive) or `AlertDialog` (destructive)
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .ai/skills/add-modal-or-confirm-dialog/SKILL.md
```

Expected: under 500 lines.

- [ ] **Step 3: Commit**

```bash
git add .ai/skills/add-modal-or-confirm-dialog/SKILL.md
git commit -m "feat(skills): add add-modal-or-confirm-dialog canonical skill"
```

---

### Task 7: Create `add-modal-or-confirm-dialog` harness wrappers

**Files:**
- Create: `.cursor/skills/add-modal-or-confirm-dialog/SKILL.md`
- Create: `.claude/skills/add-modal-or-confirm-dialog/SKILL.md`

- [ ] **Step 1: Create the Cursor wrapper**

Create `.cursor/skills/add-modal-or-confirm-dialog/SKILL.md`:

```markdown
---
name: add-modal-or-confirm-dialog
description: >-
  Conventions for adding modals, confirm dialogs, and overlay UI using
  NiceModal. Use when adding a modal, dialog, confirm dialog, alert dialog,
  drawer, or any overlay triggered by a user action.
---

# Add Modal or Confirm Dialog

Canonical instructions live at [`.ai/skills/add-modal-or-confirm-dialog/SKILL.md`](../../../.ai/skills/add-modal-or-confirm-dialog/SKILL.md).

Before adding a modal, dialog, or overlay UI, read and follow the canonical skill.
```

- [ ] **Step 2: Create the Claude wrapper**

Create `.claude/skills/add-modal-or-confirm-dialog/SKILL.md`:

```markdown
---
name: add-modal-or-confirm-dialog
description: >-
  Conventions for adding modals, confirm dialogs, and overlay UI using
  NiceModal. Use when adding a modal, dialog, confirm dialog, alert dialog,
  drawer, or any overlay triggered by a user action.
---

# Add Modal or Confirm Dialog

Canonical instructions live at [`.ai/skills/add-modal-or-confirm-dialog/SKILL.md`](../../../.ai/skills/add-modal-or-confirm-dialog/SKILL.md).

Before adding a modal, dialog, or overlay UI, read and follow the canonical skill.
```

- [ ] **Step 3: Verify frontmatter matches canonical**

```bash
head -8 .ai/skills/add-modal-or-confirm-dialog/SKILL.md
head -8 .cursor/skills/add-modal-or-confirm-dialog/SKILL.md
head -8 .claude/skills/add-modal-or-confirm-dialog/SKILL.md
```

Expected: all three have identical `name` and `description` fields.

- [ ] **Step 4: Commit**

```bash
git add .cursor/skills/add-modal-or-confirm-dialog/SKILL.md .claude/skills/add-modal-or-confirm-dialog/SKILL.md
git commit -m "feat(skills): add add-modal-or-confirm-dialog harness wrappers"
```

---

### Task 8: Register `add-modal-or-confirm-dialog` in guidance files

**Files:**
- Modify: `.cursor/rules/shared-ai-guidance.mdc`
- Modify: `.ai/README.md`

- [ ] **Step 1: Add `add-modal-or-confirm-dialog` to `.cursor/rules/shared-ai-guidance.mdc`**

After the `create-skill` line (before the ESM rule), add:

```
When adding a modal, dialog, confirm dialog, alert dialog, drawer, or any overlay triggered by a user action, read `.ai/skills/add-modal-or-confirm-dialog/SKILL.md` before making changes.
```

Final order of lines (not counting the header):

```
When adding or changing database models...
When adding new pages, routes...
When adding a new app...
When adding or using icons...
When creating a new project-level AI skill...
When adding a modal, dialog, confirm dialog, alert dialog, drawer, or any overlay triggered by a user action, read `.ai/skills/add-modal-or-confirm-dialog/SKILL.md` before making changes.

Always use ESM `import`/`export` syntax...
```

- [ ] **Step 2: Add `add-modal-or-confirm-dialog` to `.ai/README.md`**

Append a third bullet to the Skills list:

```markdown
- [`skills/add-modal-or-confirm-dialog/SKILL.md`](./skills/add-modal-or-confirm-dialog/SKILL.md) - Conventions for adding modals, confirm dialogs, and overlay UI using NiceModal.
```

- [ ] **Step 3: Run final verification**

```bash
# Confirm all skill files exist
ls .ai/skills/create-skill/SKILL.md \
   .cursor/skills/create-skill/SKILL.md \
   .claude/skills/create-skill/SKILL.md \
   .ai/skills/add-modal-or-confirm-dialog/SKILL.md \
   .cursor/skills/add-modal-or-confirm-dialog/SKILL.md \
   .claude/skills/add-modal-or-confirm-dialog/SKILL.md

# Confirm guidance file was updated
grep "create-skill\|add-modal-or-confirm-dialog" .cursor/rules/shared-ai-guidance.mdc

# Confirm README updated
grep "create-skill\|add-modal-or-confirm-dialog" .ai/README.md

# Confirm NiceModal installed
grep "nice-modal" apps/dashboard/package.json

# Confirm Provider in layout
grep "NiceModal" apps/dashboard/features/auth/ui/auth-provider.tsx
```

Expected: all commands return non-empty output.

- [ ] **Step 4: Commit**

```bash
git add .cursor/rules/shared-ai-guidance.mdc .ai/README.md
git commit -m "feat(skills): register add-modal-or-confirm-dialog in guidance files"
```

---

## Self-Review Against Spec

| Spec Requirement | Covered By |
|-----------------|-----------|
| `create-skill` canonical at `.ai/skills/create-skill/SKILL.md` | Task 3 |
| `create-skill` Cursor wrapper | Task 4 |
| `create-skill` Claude wrapper | Task 4 |
| `disable-model-invocation: true` on `create-skill` | Task 3, Task 4 |
| `create-skill` workflow: gather, name, write, wrappers, register, review | Task 3 (embedded in skill body) |
| `create-skill` authoring guidelines in skill body | Task 3 |
| `create-skill` wrapper template in skill body | Task 3 |
| `create-skill` verification checklist in skill body | Task 3 |
| `create-skill` registered in shared-ai-guidance.mdc | Task 5 |
| `create-skill` listed in `.ai/README.md` | Task 5 |
| `add-modal-or-confirm-dialog` canonical at `.ai/skills/add-modal-or-confirm-dialog/SKILL.md` | Task 6 |
| `add-modal-or-confirm-dialog` Cursor wrapper | Task 7 |
| `add-modal-or-confirm-dialog` Claude wrapper | Task 7 |
| No `disable-model-invocation` on `add-modal-or-confirm-dialog` | Task 6, Task 7 |
| Core rules (NiceModal, naming, NiceModal.show, one instance) | Task 6 |
| Component pattern with NiceModal.create + useModal | Task 6 |
| Summoning pattern via NiceModal.show | Task 6 |
| File location convention | Task 6 |
| Migration guidance (when-touched, not proactive) | Task 6 |
| Checklist in add-modal-or-confirm-dialog | Task 6 |
| Install `@ebay/nice-modal-react` in dashboard | Task 1 |
| `NiceModal.Provider` in root layout | Task 2 |
| `add-modal-or-confirm-dialog` registered in shared-ai-guidance.mdc | Task 8 |
| `add-modal-or-confirm-dialog` listed in `.ai/README.md` | Task 8 |
