# Icon Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a centralized icon registry in `packages/ui`, migrate all app-level icons from direct `lucide-react` imports, and add an AI skill ensuring future icons go through the registry.

**Architecture:** Single `icon-for.tsx` file in `packages/ui/src/components/` with `forwardRef` wrappers per icon. Each wrapper applies default `size-4` via `cn()` and passes through all `LucideProps`. A companion skill at `.ai/skills/add-icon/SKILL.md` instructs agents to always add icons here first.

**Tech Stack:** React `forwardRef`, `lucide-react` (LucideProps), `cn` from `packages/ui/src/lib/utils`, Tailwind CSS classes.

---

### Task 1: Create the icon registry file

**Files:**
- Create: `packages/ui/src/components/icon-for.tsx`

- [ ] **Step 1: Create the icon registry with all 16 icons**

```tsx
"use client"

import { forwardRef } from "react"
import type { LucideProps } from "lucide-react"
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { cn } from "#lib/utils"

export const IconForDashboard = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <LayoutDashboard
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForDashboard.displayName = "IconForDashboard";

export const IconForOrganization = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Building2
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForOrganization.displayName = "IconForOrganization";

export const IconForSettings = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Settings
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForSettings.displayName = "IconForSettings";

export const IconForMembers = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Users
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForMembers.displayName = "IconForMembers";

export const IconForSecurity = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Shield
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForSecurity.displayName = "IconForSecurity";

export const IconForBilling = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <CreditCard
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForBilling.displayName = "IconForBilling";

export const IconForProfile = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <BadgeCheck
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForProfile.displayName = "IconForProfile";

export const IconForNotifications = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Bell
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForNotifications.displayName = "IconForNotifications";

export const IconForSignOut = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <LogOut
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForSignOut.displayName = "IconForSignOut";

export const IconForExpand = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <ChevronsUpDown
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForExpand.displayName = "IconForExpand";

export const IconForAdd = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Plus
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForAdd.displayName = "IconForAdd";

export const IconForInvite = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <UserPlus
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForInvite.displayName = "IconForInvite";

export const IconForRemove = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <UserMinus
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForRemove.displayName = "IconForRemove";

export const IconForMore = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <MoreHorizontal
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForMore.displayName = "IconForMore";

export const IconForClose = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <X
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForClose.displayName = "IconForClose";

export const IconForChevronRight = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <ChevronRight
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForChevronRight.displayName = "IconForChevronRight";
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd packages/ui && npx tsc --noEmit --pretty 2>&1 | grep -i "icon-for" || echo "No errors in icon-for"`
Expected: No errors related to icon-for

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/icon-for.tsx
git commit -m "feat(ui): add centralized icon registry with 16 semantic icons"
```

---

### Task 2: Migrate nav config files

**Files:**
- Modify: `apps/dashboard/nav-items.ts`
- Modify: `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`
- Modify: `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts`

- [ ] **Step 1: Update `apps/dashboard/nav-items.ts`**

```tsx
import {
  IconForDashboard,
  IconForOrganization,
  IconForSettings,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const rootNavConfig: NavConfig = {
  label: "Platform",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: IconForDashboard,
    },
    {
      title: "Organizations",
      href: "/organizations",
      icon: IconForOrganization,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
    },
  ],
};
```

- [ ] **Step 2: Update `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`**

```tsx
import {
  IconForDashboard,
  IconForMembers,
  IconForSettings,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const orgNavConfig: NavConfig = {
  label: "Organization",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: IconForDashboard,
    },
    {
      title: "Members",
      href: "/members",
      icon: IconForMembers,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Billing", href: "/settings/billing" },
      ],
    },
  ],
};
```

- [ ] **Step 3: Update `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts`**

```tsx
import {
  IconForSettings,
  IconForMembers,
  IconForBilling,
  IconForSecurity,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const orgSettingsNavConfig: NavConfig = {
  label: "Settings",
  items: [
    {
      title: "General",
      href: "/settings/general",
      icon: IconForSettings,
    },
    {
      title: "Members",
      href: "/settings/members",
      icon: IconForMembers,
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: IconForBilling,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: IconForSecurity,
    },
  ],
};
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd apps/dashboard && npx tsc --noEmit --pretty 2>&1 | tail -10`
Expected: No new errors (if the `LucideIcon` type is incompatible with `forwardRef` return type, update `apps/dashboard/types/nav.ts` to use `ComponentType<LucideProps>` instead — see Task 2b below)

- [ ] **Step 5: If type error — update NavItem type**

Only do this if Step 4 shows a type error on the `icon` field. Update `apps/dashboard/types/nav.ts`:

```tsx
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<LucideProps>;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavConfig {
  label?: string;
  items: NavItem[];
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/dashboard/nav-items.ts \
  "apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts" \
  "apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts" \
  apps/dashboard/types/nav.ts
git commit -m "refactor(dashboard): migrate nav config icons to icon registry"
```

---

### Task 3: Migrate dashboard UI components

**Files:**
- Modify: `apps/dashboard/common/ui/nav-user.tsx`
- Modify: `apps/dashboard/common/ui/nav-main.tsx`
- Modify: `apps/dashboard/features/organization/ui/org-switcher.tsx`
- Modify: `apps/dashboard/features/organization/ui/members-page-content.tsx`
- Modify: `apps/dashboard/features/organization/ui/pending-invitations.tsx`
- Modify: `apps/dashboard/features/organization/ui/invite-member-dialog.tsx`

- [ ] **Step 1: Update `apps/dashboard/common/ui/nav-user.tsx`**

Replace the lucide-react import line:
```tsx
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
```
With:
```tsx
import {
  IconForProfile,
  IconForNotifications,
  IconForExpand,
  IconForSignOut,
} from "@workspace/ui/components/icon-for";
```

Replace usages in the component:
- `<ChevronsUpDown className="ml-auto size-4" />` → `<IconForExpand className="ml-auto" />`
- `<BadgeCheck />` → `<IconForProfile />`
- `<Bell />` → `<IconForNotifications />`
- `<LogOut />` → `<IconForSignOut />`

- [ ] **Step 2: Update `apps/dashboard/common/ui/nav-main.tsx`**

Replace the lucide-react import line:
```tsx
import { ChevronRight } from "lucide-react";
```
With:
```tsx
import { IconForChevronRight } from "@workspace/ui/components/icon-for";
```

Replace usage:
- `<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />` → `<IconForChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />`

- [ ] **Step 3: Update `apps/dashboard/features/organization/ui/org-switcher.tsx`**

Replace the lucide-react import line:
```tsx
import { ChevronsUpDown, Plus } from "lucide-react";
```
With:
```tsx
import { IconForExpand, IconForAdd } from "@workspace/ui/components/icon-for";
```

Replace usages:
- `<ChevronsUpDown className="ml-auto" />` → `<IconForExpand className="ml-auto" />`
- `<Plus className="size-4" />` → `<IconForAdd />`

- [ ] **Step 4: Update `apps/dashboard/features/organization/ui/members-page-content.tsx`**

Replace the lucide-react import line:
```tsx
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";
```
With:
```tsx
import { IconForMore, IconForSecurity, IconForRemove } from "@workspace/ui/components/icon-for";
```

Replace usages:
- `<MoreHorizontal className="size-4" />` → `<IconForMore />`
- `<Shield className="mr-2 size-4" />` → `<IconForSecurity className="mr-2" />`
- `<UserMinus className="mr-2 size-4" />` → `<IconForRemove className="mr-2" />`

- [ ] **Step 5: Update `apps/dashboard/features/organization/ui/pending-invitations.tsx`**

Replace the lucide-react import line:
```tsx
import { X } from "lucide-react";
```
With:
```tsx
import { IconForClose } from "@workspace/ui/components/icon-for";
```

Replace usage:
- `<X className="size-4" />` → `<IconForClose />`

- [ ] **Step 6: Update `apps/dashboard/features/organization/ui/invite-member-dialog.tsx`**

Replace the lucide-react import line:
```tsx
import { UserPlus } from "lucide-react";
```
With:
```tsx
import { IconForInvite } from "@workspace/ui/components/icon-for";
```

Replace usage:
- `<UserPlus className="mr-2 size-4" />` → `<IconForInvite className="mr-2" />`

- [ ] **Step 7: Verify dashboard builds**

Run: `cd apps/dashboard && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
git add apps/dashboard/common/ui/nav-user.tsx \
  apps/dashboard/common/ui/nav-main.tsx \
  apps/dashboard/features/organization/ui/org-switcher.tsx \
  apps/dashboard/features/organization/ui/members-page-content.tsx \
  apps/dashboard/features/organization/ui/pending-invitations.tsx \
  apps/dashboard/features/organization/ui/invite-member-dialog.tsx
git commit -m "refactor(dashboard): migrate UI component icons to icon registry"
```

---

### Task 4: Create the AI skill

**Files:**
- Create: `.ai/skills/add-icon/SKILL.md`
- Create: `.cursor/skills/add-icon/SKILL.md`
- Create: `.claude/skills/add-icon/SKILL.md`

- [ ] **Step 1: Create the canonical skill at `.ai/skills/add-icon/SKILL.md`**

```markdown
---
name: add-icon
description: Add or use icons in app code through the centralized icon registry. Use when adding icons to features, pages, navigation, actions, or any app-level UI that needs an icon. Never import directly from lucide-react in app code.
---

# Add Icon

## Purpose

Use this skill whenever app code (`apps/*`) needs an icon. The project uses a centralized icon registry at `packages/ui/src/components/icon-for.tsx` that provides semantically-named, consistently-styled icon wrappers.

## Core Rule

App code never imports from `lucide-react` directly. All icons come from `@workspace/ui/components/icon-for`.

**Exception:** Icons inside `packages/ui/src/components/` (shadcn primitives) continue to import directly from `lucide-react` — those are internal to the component library.

## Before Adding an Icon

1. Check if an appropriate `IconFor*` already exists in `packages/ui/src/components/icon-for.tsx`.
2. If one exists that matches your semantic need, use it.
3. Only create a new icon if no existing one fits the concept.

## Adding a New Icon

Add to `packages/ui/src/components/icon-for.tsx`:

1. Import the Lucide icon at the top of the file (keep imports sorted alphabetically).
2. Add the forwardRef wrapper following the existing pattern:

```tsx
export const IconForConcept = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <LucideIconName
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForConcept.displayName = "IconForConcept";
```

3. Choose a semantic name: `IconFor<Concept>` describes what it represents in the domain, NOT the Lucide icon name.
   - Good: `IconForSchedule`, `IconForPayment`, `IconForTeam`
   - Bad: `IconForCalendarIcon`, `IconForCreditCard`, `IconForUsers`

## Using Icons in App Code

```tsx
import { IconForMembers, IconForAdd } from "@workspace/ui/components/icon-for";

// Default size (size-4):
<IconForMembers />

// Override size:
<IconForMembers className="size-6" />

// Additional styling:
<IconForAdd className="mr-2 text-muted-foreground" />

// All LucideProps work:
<IconForMembers strokeWidth={1.5} />
```

## Naming Guidelines

| Concept | Name | Underlying Icon |
|---------|------|-----------------|
| Domain entity | `IconForOrganization` | Building2 |
| Action | `IconForInvite` | UserPlus |
| Navigation | `IconForDashboard` | LayoutDashboard |
| UI chrome | `IconForExpand` | ChevronsUpDown |

The name should be obvious to someone who hasn't seen the registry — "what would I search for if I needed an icon for X?"

## Checklist

- [ ] Checked `icon-for.tsx` for existing icon that fits
- [ ] Used semantic name (`IconFor<Concept>`)
- [ ] Added to `packages/ui/src/components/icon-for.tsx` (not app code)
- [ ] Import in app code from `@workspace/ui/components/icon-for`
- [ ] No direct `lucide-react` imports in app code
```

- [ ] **Step 2: Create the Cursor stub at `.cursor/skills/add-icon/SKILL.md`**

```markdown
---
name: add-icon
description: Add or use icons in app code through the centralized icon registry. Use when adding icons to features, pages, navigation, actions, or any app-level UI that needs an icon. Never import directly from lucide-react in app code.
---

# Add Icon

Canonical instructions live at [`.ai/skills/add-icon/SKILL.md`](../../../.ai/skills/add-icon/SKILL.md).

Before adding or using icons in app code, read and follow the canonical skill.
```

- [ ] **Step 3: Create the Claude stub at `.claude/skills/add-icon/SKILL.md`**

```markdown
---
name: add-icon
description: Add or use icons in app code through the centralized icon registry. Use when adding icons to features, pages, navigation, actions, or any app-level UI that needs an icon. Never import directly from lucide-react in app code.
---

# Add Icon

Canonical instructions live at [`.ai/skills/add-icon/SKILL.md`](../../../.ai/skills/add-icon/SKILL.md).

Before adding or using icons in app code, read and follow the canonical skill.
```

- [ ] **Step 4: Commit**

```bash
git add .ai/skills/add-icon/SKILL.md .cursor/skills/add-icon/SKILL.md .claude/skills/add-icon/SKILL.md
git commit -m "feat: add icon registry skill for AI agents"
```

---

### Task 5: Update shared AI guidance

**Files:**
- Modify: `.cursor/rules/shared-ai-guidance.mdc`

- [ ] **Step 1: Add icon registry guidance to shared rules**

Add the following line to `.cursor/rules/shared-ai-guidance.mdc` alongside the existing skill references:

```
When adding or using icons in app code (apps/*), read `.ai/skills/add-icon/SKILL.md` before making changes. Never import directly from lucide-react in app code.
```

- [ ] **Step 2: Commit**

```bash
git add .cursor/rules/shared-ai-guidance.mdc
git commit -m "docs: add icon registry reference to shared AI guidance"
```

---

### Task 6: Final verification

- [ ] **Step 1: Verify no lucide-react imports remain in app code**

Run: `cd apps/dashboard && grep -r "from \"lucide-react\"" --include="*.ts" --include="*.tsx" .`
Expected: Only `types/nav.ts` importing `type { LucideIcon }` (or `type { LucideProps }` if type was updated). No component-level icon imports.

- [ ] **Step 2: Verify dashboard builds cleanly**

Run: `cd apps/dashboard && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Verify www still builds**

Run: `cd apps/www && npx next build 2>&1 | tail -10`
Expected: Build succeeds
