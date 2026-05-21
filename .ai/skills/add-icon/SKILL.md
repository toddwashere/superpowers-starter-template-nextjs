---
name: add-icon
description: Add or use icons in app code through the centralized icon registry. Use when adding icons to features, pages, navigation, actions, or any app-level UI that needs an icon. Never import directly from lucide-react in app code.
---

# Add Icon

## Purpose

Use this skill whenever app code (`apps/*`) needs an icon. The project uses a centralized icon registry at `packages/ui/src/components/icon-for.tsx` that provides semantically-named, consistently-styled icon wrappers.

## Core Rule

App code never imports from `lucide-react` directly. All icons come from `@workspace/ui/components/icon-for`.

ESLint enforces this for all files under `apps/` via `tooling/eslint/apps-architecture.js` (included from the Next.js ESLint config).

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
