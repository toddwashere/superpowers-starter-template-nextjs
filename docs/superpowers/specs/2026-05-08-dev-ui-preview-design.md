# Dev UI Preview Page Design

**Date:** 2026-05-08  
**Status:** Approved  
**Scope:** Dashboard app — public design system reference page at `/dev/ui`

## Overview

A single scrollable page that showcases every component, color token, icon, and the sidebar used in the dashboard app. Built for designers and engineers to preview the full design system in both light and dark modes, without authentication.

## Audience

Internal designers and engineers. The page is public (no auth) so it can be shared freely and accessed without logging in.

## Route & Layout

**Route:** `apps/dashboard/app/(dev)/dev/ui/page.tsx`

A new `(dev)` route group with its own minimal layout:
- `ThemeProvider` wrapper (same `next-themes` setup as the rest of the app)
- No auth, no sidebar, no org context
- Plain body with a light background

**Middleware:** Add `/dev` to the public paths array in `apps/dashboard/middleware.ts` so the auth redirect skips this route group entirely.

**Page layout:**
- Fixed top bar: page title ("Design System") and `ThemeToggle` (right-aligned)
- Sticky left TOC (~200px wide) with anchor links to each section, highlights current section on scroll. On small screens the TOC collapses to a horizontal sticky bar or is hidden.
- Scrollable content area to the right of the TOC

The `(dev)` layout imports the app's `globals.css` (which pulls in `@workspace/ui/globals.css`) so all Tailwind tokens and component styles are available.

## TOC Sections

1. Colors & Tokens
2. Typography
3. Icons
4. Sidebar
5. Actions & Form Controls
6. Layout & Feedback
7. Overlays & Navigation
8. Data & Display

## Section 1: Colors & Tokens

### Core Palette

A grid of swatches for each semantic token pair from `globals.css`:

| Token | Foreground Token |
|-------|-----------------|
| `--background` | `--foreground` |
| `--card` | `--card-foreground` |
| `--popover` | `--popover-foreground` |
| `--primary` | `--primary-foreground` |
| `--secondary` | `--secondary-foreground` |
| `--muted` | `--muted-foreground` |
| `--accent` | `--accent-foreground` |
| `--destructive` | — |
| `--border` | — |
| `--input` | — |
| `--ring` | — |

Each swatch: colored rectangle using the CSS variable as background, variable name label, resolved oklch value.

### Sidebar Palette

Same swatch treatment for: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`.

### Chart Colors

The 5 chart tokens (`--chart-1` through `--chart-5`) shown as a horizontal row of colored circles or bars.

### Radius Scale

Visual boxes demonstrating each radius token (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`) applied to a sample element.

All swatches respond to the `ThemeToggle` — designers flip light/dark to compare.

## Section 2: Typography

A scale of Tailwind text sizes, each showing:
- Class name (`text-xs` through `text-4xl`)
- A sample sentence rendered at that size
- Weight variations: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

Also demonstrates `text-foreground` vs `text-muted-foreground` color treatment.

## Section 3: Icons

A grid of all 16 icons from `packages/ui/src/components/icon-for.tsx`. Each cell shows:
- The rendered icon at `size-4` (default) and `size-6` (larger preview)
- The export name (e.g. `IconForDashboard`)
- The underlying Lucide icon name (e.g. `LayoutDashboard`)

## Section 4: Sidebar

A live `AppSidebar` rendered inside a contained box (~600px tall, bordered) so it doesn't take over the page. Uses the real sidebar component with mock data:

- Mock `SidebarProvider` wrapper
- Mock `NavConfig`:
  - "Dashboard" (icon: `IconForDashboard`)
  - "Analytics" (icon: `IconForBilling`)
  - "Users" (icon: `IconForMembers`, sub-items: "Active", "Invited")
  - "Settings" (icon: `IconForSettings`, sub-items: "General", "Billing", "Security")
- Mock org switcher: "Acme Corp" with first-letter avatar
- Mock user in footer: "Jane Designer" / "jane@example.com"
- `ThemeToggle` in footer

All links point to `#` (no navigation). Fully interactive: collapsible to icon mode via the rail, sub-menus expand/collapse, hover states work.

No real data is loaded — this is a public page.

## Section 5: Actions & Form Controls

Each component gets a sub-heading and live examples of variants/states.

- **Button** — all 6 variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) in a row; all size variants (`xs`, `sm`, `default`, `lg`, `icon-xs`, `icon-sm`, `icon`, `icon-lg`); disabled states
- **Input** — default, with placeholder, disabled, with `Label`
- **Textarea** — default, with placeholder, disabled
- **Select** — closed and open state, sample options
- **Checkbox** — unchecked, checked, disabled, with label
- **Radio Group** — 3 options, one selected
- **Switch** — on, off, disabled, with label
- **Slider** — default with value, range example
- **Toggle** — default, pressed, outline variant
- **Toggle Group** — single-select and multi-select examples
- **Form** — composed example: `Label` + `Input` + Zod validation error state
- **Input OTP** — 6-digit OTP input

## Section 6: Layout & Feedback

- **Card** — full example: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardAction`, `CardFooter`
- **Separator** — horizontal and vertical
- **Tabs** — 3-tab example with content
- **Accordion** — 3 collapsible items
- **Collapsible** — standalone with trigger
- **Skeleton** — line, circle, card-shaped loading patterns
- **Alert** — default and destructive variants
- **Progress** — bar at ~60%
- **Scroll Area** — fixed-height box with overflowing content
- **Resizable** — two-panel resizable layout

## Section 7: Overlays & Navigation

- **Dialog** — button opens sample dialog with title, description, actions
- **Alert Dialog** — button opens confirmation dialog ("Are you sure?" pattern)
- **Sheet** — button opens right-side sheet with content
- **Drawer** — button opens bottom drawer
- **Dropdown Menu** — trigger opens menu with items, separators, sub-menu
- **Popover** — trigger opens popover with sample form content
- **Tooltip** — elements with hover tooltips
- **Command** — inline command palette with search + grouped items
- **Navigation Menu** — horizontal nav with dropdown sub-menus
- **Breadcrumb** — sample trail: Home / Settings / General
- **Pagination** — Previous, 1, 2, 3, ..., 10, Next

## Section 8: Data & Display

- **Table** — 5-row sample table (Name, Status, Role, Email columns)
- **Badge** — all variants: `default`, `secondary`, `destructive`, `outline`
- **Avatar** — image avatar, fallback initials, multiple sizes
- **Calendar** — inline calendar with today highlighted
- **Chart** — sample bar or line chart using the 5 chart color tokens
- **Carousel** — 4-item carousel with navigation arrows
- **Sonner/Toast** — button that fires a sample toast notification

## File Structure

```
apps/dashboard/
├── app/(dev)/
│   ├── layout.tsx                    # Minimal layout: ThemeProvider, no auth
│   └── dev/
│       └── ui/
│           └── page.tsx              # Route entry, imports page content
├── features/dev-helpers/
│   └── ui/
│       ├── dev-ui-page-content.tsx   # Main page: TOC + all sections
│       ├── section-colors.tsx
│       ├── section-typography.tsx
│       ├── section-icons.tsx
│       ├── section-sidebar.tsx
│       ├── section-actions.tsx       # Buttons, inputs, forms
│       ├── section-layout.tsx        # Cards, tabs, accordion, etc.
│       ├── section-overlays.tsx      # Dialogs, sheets, menus, etc.
│       └── section-data.tsx          # Tables, badges, charts, etc.
```

## Files Changed

| File | Change |
|------|--------|
| `apps/dashboard/app/(dev)/layout.tsx` | New — minimal layout with ThemeProvider |
| `apps/dashboard/app/(dev)/dev/ui/page.tsx` | New — route entry point |
| `apps/dashboard/features/dev-helpers/ui/dev-ui-page-content.tsx` | New — main page with TOC |
| `apps/dashboard/features/dev-helpers/ui/section-colors.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-typography.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-icons.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-sidebar.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-actions.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-layout.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-overlays.tsx` | New |
| `apps/dashboard/features/dev-helpers/ui/section-data.tsx` | New |
| `apps/dashboard/middleware.ts` | Modified — add `/dev` to public paths |

## What Stays Unchanged

| File | Why |
|------|-----|
| `packages/ui/src/styles/globals.css` | Token source, read-only reference |
| `packages/ui/src/components/*` | All components imported as-is, not modified |
| `packages/ui/src/components/icon-for.tsx` | Icons imported as-is |
| `apps/dashboard/common/ui/app-sidebar.tsx` | Sidebar reused with mock data |
| All existing routes and layouts | No changes to auth, dashboard, or org routes |

## Behavior

| State | What User Sees |
|-------|---------------|
| Page load | Full design system page, light mode by default (or system preference) |
| Click ThemeToggle | All swatches, components, sidebar flip to dark/light |
| Click TOC item | Smooth scroll to that section, TOC highlights current |
| Scroll | TOC highlights the section currently in viewport |
| Interact with sidebar | Collapsible, hover states, sub-menus — all work with mock data |
| Click overlay triggers | Dialogs, sheets, drawers open with sample content |
| No auth | Page loads without login, no real data exposed |
