# Dev UI Preview Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public design system preview page at `/dev/ui` in the dashboard app showcasing all components, colors, icons, and sidebar.

**Architecture:** Single scrollable page with sticky TOC, 8 section components rendered sequentially. Public route (no auth) in a `(dev)` route group with minimal layout. All UI components imported from `@workspace/ui`, displayed with mock data only.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4 (oklch CSS variables), shadcn/ui (New York style), Lucide icons via icon registry.

**Spec:** `docs/superpowers/specs/2026-05-08-dev-ui-preview-design.md`

---

### Task 1: Infrastructure — middleware, layout, route, page content

**Files:**
- Modify: `apps/dashboard/middleware.ts` — add `/dev` to public paths
- Create: `apps/dashboard/app/(dev)/layout.tsx` — minimal layout with ThemeProvider
- Create: `apps/dashboard/app/(dev)/dev/ui/page.tsx` — route entry
- Create: `apps/dashboard/features/dev-helpers/ui/dev-ui-page-content.tsx` — main page with sticky TOC

- [ ] **Step 1:** Add `"/dev"` to the `publicPaths` array in `middleware.ts`
- [ ] **Step 2:** Create `(dev)/layout.tsx` — imports `ThemeProvider` and `Toaster`, no auth
- [ ] **Step 3:** Create `dev/ui/page.tsx` — thin wrapper importing `DevUiPageContent`
- [ ] **Step 4:** Create `dev-ui-page-content.tsx` — sticky TOC (left sidebar with anchor links, highlights on scroll via IntersectionObserver) + content area rendering all 8 sections
- [ ] **Step 5:** Verify the route loads at `http://localhost:4000/dev/ui` without auth redirect
- [ ] **Step 6:** Commit

### Task 2: Section — Colors & Tokens

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-colors.tsx`

Renders grids of color swatches using CSS variable backgrounds. Sub-sections: core palette (11 token pairs), sidebar palette (8 tokens), chart colors (5 tokens), radius scale (7 sizes). Each swatch: colored rect + var name + oklch value via `getComputedStyle`.

- [ ] **Step 1:** Implement `SectionColors` with all 4 sub-sections
- [ ] **Step 2:** Verify swatches render in both light/dark
- [ ] **Step 3:** Commit

### Task 3: Section — Typography

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-typography.tsx`

Text size scale (`text-xs` through `text-4xl`) with weight variations. Shows `text-foreground` vs `text-muted-foreground`.

- [ ] **Step 1:** Implement `SectionTypography`
- [ ] **Step 2:** Commit

### Task 4: Section — Icons

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-icons.tsx`

Grid of all 16 icons from `icon-for.tsx`. Each cell: icon at size-4 and size-6, export name, Lucide source name.

- [ ] **Step 1:** Implement `SectionIcons`
- [ ] **Step 2:** Commit

### Task 5: Section — Sidebar

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-sidebar.tsx`

Live `AppSidebar` in a bordered container. Uses real `SidebarProvider` + `AppSidebar` + `SidebarInset` with mock `NavConfig`, mock org switcher (hardcoded "Acme Corp"), mock `NavUser` (hardcoded "Jane Designer"). All links `#`. No auth data.

Key challenge: `OrgSwitcher` and `NavUser` call `authClient` hooks. The preview needs mock versions that render the same UI with hardcoded data but skip auth hooks.

- [ ] **Step 1:** Create `MockOrgSwitcher` — same JSX as real `OrgSwitcher` but with hardcoded orgs array, no `authClient`
- [ ] **Step 2:** Create `MockNavUser` — same JSX as real `NavUser` but with hardcoded user, no `authClient`
- [ ] **Step 3:** Create `MockAppSidebar` — same structure as `AppSidebar` but uses mock switcher/user
- [ ] **Step 4:** Embed in a bordered container with `SidebarProvider`
- [ ] **Step 5:** Commit

### Task 6: Section — Actions & Form Controls

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-actions.tsx`

Showcases: Button (6 variants × sizes × disabled), Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Toggle, ToggleGroup, Form (composed example with Zod), InputOTP.

- [ ] **Step 1:** Implement `SectionActions` with all sub-component showcases
- [ ] **Step 2:** Commit

### Task 7: Section — Layout & Feedback

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-layout.tsx`

Showcases: Card (full composition), Separator, Tabs, Accordion, Collapsible, Skeleton, Alert, Progress, ScrollArea, Resizable.

- [ ] **Step 1:** Implement `SectionLayout` with all sub-component showcases
- [ ] **Step 2:** Commit

### Task 8: Section — Overlays & Navigation

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-overlays.tsx`

Showcases: Dialog, AlertDialog, Sheet, Drawer, DropdownMenu, Popover, Tooltip, Command, NavigationMenu, Breadcrumb, Pagination. Each overlay component gets a trigger button.

- [ ] **Step 1:** Implement `SectionOverlays` with all sub-component showcases
- [ ] **Step 2:** Commit

### Task 9: Section — Data & Display

**Files:**
- Create: `apps/dashboard/features/dev-helpers/ui/section-data.tsx`

Showcases: Table (5-row sample), Badge (4 variants), Avatar (image + fallback), Calendar, Chart (bar chart with chart tokens), Carousel (4 items), Sonner toast (trigger button).

- [ ] **Step 1:** Implement `SectionData` with all sub-component showcases
- [ ] **Step 2:** Commit

### Task 10: Final verification

- [ ] **Step 1:** Load `http://localhost:4000/dev/ui` without logging in
- [ ] **Step 2:** Verify all 8 sections render
- [ ] **Step 3:** Verify ThemeToggle switches all sections between light/dark
- [ ] **Step 4:** Verify TOC anchor links scroll to correct sections
- [ ] **Step 5:** Verify sidebar is interactive (collapse, expand sub-menus)
- [ ] **Step 6:** Verify overlay triggers work (dialogs, sheets, drawers open)
- [ ] **Step 7:** Final commit
