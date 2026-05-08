# Icon Registry Design

**Date:** 2026-05-08  
**Status:** Approved  
**Scope:** Centralized icon registry in `packages/ui`, migration of app-level icons, new skill

## Overview

Create a centralized icon registry (`icon-for.tsx`) in the shared UI package that provides semantically-named, consistently-styled icon components for use across all apps. Each icon wraps a Lucide icon with `forwardRef`, applies a default `size-4` class (overridable), and exposes full `LucideProps`. A companion skill ensures agents always add icons here first.

## Goals

1. **Semantic naming** — decouple "what it means" from "which Lucide icon renders." Changing the icon for a concept is a one-line change in one file.
2. **Consistent base styling** — all icons default to `size-4` via `cn("size-4", props.className)`, overridable by consumers.
3. **Single source of truth** — app code never imports directly from `lucide-react`; it always goes through the registry.

## Scope

- **In scope:** App-level/semantic icons (~16 currently in `apps/dashboard`)
- **Out of scope:** Icons inside shadcn/ui primitives (`packages/ui/src/components/*.tsx`) — those are internal to the component library and stay as direct Lucide imports.

## Component: `icon-for.tsx`

**File:** `packages/ui/src/components/icon-for.tsx`

### Pattern

```tsx
"use client"

import { forwardRef } from "react"
import type { LucideProps } from "lucide-react"
import { CalendarIcon } from "lucide-react"
import { cn } from "#lib/utils"

export const IconForSchedule = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <CalendarIcon
      ref={ref}
      {...props}
      className={cn("size-4", props.className)}
    />
  )
);
IconForSchedule.displayName = "IconForSchedule";
```

### Naming Convention

`IconFor<Concept>` — the name describes the domain concept, NOT the Lucide icon name.

- Good: `IconForDashboard`, `IconForMembers`, `IconForBilling`
- Bad: `IconForLayoutDashboard`, `IconForUsersIcon`, `IconForCreditCard`

### Props Behavior

- `className` — merged with default `size-4` via `cn()`. Consumer can override size: `<IconForDashboard className="size-6" />` and Tailwind's last-class-wins applies.
- All other `LucideProps` pass through (strokeWidth, color, fill, absoluteStrokeWidth, etc.)
- `ref` forwarded to the underlying SVG element (supports tooltips, popovers, measurements)

### Initial Icons (migrated from existing app usage)

| Export | Lucide Icon | Domain Meaning |
|--------|-------------|----------------|
| `IconForDashboard` | `LayoutDashboard` | Dashboard home |
| `IconForOrganization` | `Building2` | Organization entity |
| `IconForSettings` | `Settings` | Settings/preferences |
| `IconForMembers` | `Users` | Members/people list |
| `IconForSecurity` | `Shield` | Security/roles/permissions |
| `IconForBilling` | `CreditCard` | Billing/payments |
| `IconForProfile` | `BadgeCheck` | User profile/account |
| `IconForNotifications` | `Bell` | Notifications |
| `IconForSignOut` | `LogOut` | Sign out action |
| `IconForExpand` | `ChevronsUpDown` | Expand/collapse trigger |
| `IconForAdd` | `Plus` | Add/create action |
| `IconForInvite` | `UserPlus` | Invite member action |
| `IconForRemove` | `UserMinus` | Remove member action |
| `IconForMore` | `MoreHorizontal` | More options menu |
| `IconForClose` | `X` | Close/dismiss action |
| `IconForChevronRight` | `ChevronRight` | Submenu/expand indicator |

### Export

Available to apps via the existing package export mapping:
```tsx
import { IconForDashboard, IconForMembers } from "@workspace/ui/components/icon-for"
```

## Migration Plan

All `apps/dashboard` files that import icons from `"lucide-react"` will be updated to import from `@workspace/ui/components/icon-for` instead.

### Files to migrate

| File | Current Imports | After |
|------|----------------|-------|
| `apps/dashboard/nav-items.ts` | `LayoutDashboard`, `Building2`, `Settings` | `IconForDashboard`, `IconForOrganization`, `IconForSettings` |
| `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts` | `LayoutDashboard`, `Users`, `Settings` | `IconForDashboard`, `IconForMembers`, `IconForSettings` |
| `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts` | `Settings`, `CreditCard`, `Users`, `Shield` | `IconForSettings`, `IconForBilling`, `IconForMembers`, `IconForSecurity` |
| `apps/dashboard/common/ui/nav-user.tsx` | `BadgeCheck`, `Bell`, `ChevronsUpDown`, `LogOut` | `IconForProfile`, `IconForNotifications`, `IconForExpand`, `IconForSignOut` |
| `apps/dashboard/common/ui/nav-main.tsx` | `ChevronRight` | `IconForChevronRight` |
| `apps/dashboard/features/organization/ui/org-switcher.tsx` | `ChevronsUpDown`, `Plus` | `IconForExpand`, `IconForAdd` |
| `apps/dashboard/features/organization/ui/members-page-content.tsx` | `MoreHorizontal`, `Shield`, `UserMinus` | `IconForMore`, `IconForSecurity`, `IconForRemove` |
| `apps/dashboard/features/organization/ui/pending-invitations.tsx` | `X` | `IconForClose` |
| `apps/dashboard/features/organization/ui/invite-member-dialog.tsx` | `UserPlus` | `IconForInvite` |

### NavItem Type

`apps/dashboard/types/nav.ts` currently types nav icons as `LucideIcon` (which is `ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>`). Our `forwardRef<SVGSVGElement, LucideProps>` wrappers produce the same structural type, so they satisfy the constraint without changes. If TypeScript complains due to nominal differences, widen the type to `ComponentType<LucideProps>` — but this is unlikely.

## Skill: `add-icon`

**Canonical path:** `ai/skills/add-icon/SKILL.md`  
**Stubs:** `.cursor/skills/add-icon/SKILL.md` and `.claude/skills/add-icon/SKILL.md`

### Skill Content (summary)

The skill instructs agents to:

1. **Never** import from `lucide-react` in app code (`apps/*`) — always use `@workspace/ui/components/icon-for`
2. **Before using a new icon**, check if an appropriate `IconFor*` already exists in `icon-for.tsx`
3. **If none exists**, add a new entry:
   - Choose a semantic name (`IconFor<Concept>`) describing what it represents
   - Pick the most appropriate Lucide icon
   - Follow the existing `forwardRef` pattern with `cn("size-4", props.className)`
   - Set `displayName`
   - Add the import for the Lucide icon at the top of the file
4. **Exception:** Icons inside `packages/ui/src/components/` (shadcn primitives) continue to import directly from `lucide-react`
5. **Naming:** Describe the domain concept, not the icon name. Think "what does this represent?" not "what does it look like?"

### Skill Trigger

Use when: adding icons to app code, creating new UI features that need icons, or when you see a direct `lucide-react` import in app code that should go through the registry.

## File Changes Summary

| File | Change |
|------|--------|
| `packages/ui/src/components/icon-for.tsx` | New — icon registry with 16 icons |
| `ai/skills/add-icon/SKILL.md` | New — canonical skill |
| `.cursor/skills/add-icon/SKILL.md` | New — stub pointing to canonical |
| `.claude/skills/add-icon/SKILL.md` | New — stub pointing to canonical |
| 9 files in `apps/dashboard/` | Migrate imports from `lucide-react` to `icon-for` |
