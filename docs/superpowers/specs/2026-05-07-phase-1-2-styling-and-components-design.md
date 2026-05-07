# Phase 1.2: Styling, Components, and Dashboard Navigation

## Goal

Establish Tailwind CSS v4 with a centralized design token system, initialize the shadcn/ui component library shared across the monorepo via `packages/ui`, and build the data-driven sidebar navigation for the dashboard app.

## Scope

This phase covers three deliverables:

1. **Tailwind v4 + design tokens** — CSS-first config with OKLCH colors, `@theme inline`, light/dark theming
2. **shadcn/ui component library** — ~40 components installed into `packages/ui`, shared across apps
3. **Dashboard sidebar navigation** — data-driven `AppSidebar` with three nav contexts (root, org, org settings)

Out of scope: authentication, data fetching, route protection, org switching logic (backend). Those belong to Phase 1.3+.

---

## 1. Package: `@workspace/ui`

The `packages/ui` package, named `@workspace/ui`, holds all shared UI: design tokens, shadcn components, hooks, and utilities.

### File structure

```
packages/ui/
├── package.json                # @workspace/ui
├── components.json             # shadcn CLI config for this package
├── tsconfig.json
└── src/
    ├── components/             # shadcn components (button, sidebar, etc.)
    ├── hooks/                  # shadcn hooks (use-mobile, etc.)
    ├── lib/
    │   └── utils.ts            # cn() helper (clsx + tailwind-merge)
    └── styles/
        └── globals.css         # Tailwind v4: @import, @theme inline, tokens
```

### package.json

```json
{
  "name": "@workspace/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./components/*": "./src/components/*.tsx"
  },
  "imports": {
    "#components/*": "./src/components/*.tsx",
    "#lib/*": "./src/lib/*.ts",
    "#hooks/*": "./src/hooks/*.ts"
  },
  "dependencies": {
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@workspace/tooling": "workspace:*",
    "tailwindcss": "^4",
    "tw-animate-css": "^1",
    "typescript": "^5.7"
  }
}
```

### components.json (packages/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "#components",
    "utils": "#lib/utils",
    "hooks": "#hooks",
    "lib": "#lib",
    "ui": "#components"
  }
}
```

### src/lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 2. Design Token System (globals.css)

All configuration lives in CSS. No `tailwind.config.ts`. No `tailwind.config.js`.

### src/styles/globals.css

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Key design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tailwind version | v4 (CSS-first) | No JS config file, faster builds, modern color space |
| Color format | OKLCH | shadcn v4 default; perceptually uniform, better gamut |
| Dark mode | `@custom-variant dark` with `.dark` class | Works with SSR, user/system preference |
| Animation | `tw-animate-css` | Replaces deprecated `tailwindcss-animate` |
| Base color | Neutral | Clean, professional default |
| Style | `new-york` | shadcn default going forward (deprecated `default` style) |

---

## 3. App Integration

### postcss.config.mjs (each app)

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### App CSS file (apps/dashboard/app/globals.css)

```css
@import "@workspace/ui/globals.css";
@source "../../../packages/ui/src";
```

The `@source` directive tells Tailwind v4 to scan the shared UI package for class names. The path is relative to the CSS file (`apps/dashboard/app/globals.css` → 3 levels up to monorepo root → `packages/ui/src`). Each app needs this to pick up classes used in shared components.

### Root layout (apps/dashboard/app/layout.tsx)

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### components.json (apps/dashboard)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/common/ui",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
```

The `ui` alias points to `@workspace/ui/components` so shared primitives install there. The `components` alias points to `@/common/ui` so app-specific blocks install into `apps/dashboard/common/ui/`.

### components.json (apps/www)

Same structure but with www-appropriate paths:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
```

The www app uses `@/components` for app-local components (marketing blocks) since it doesn't need the `common/ui/` convention used by the dashboard.

---

## 4. shadcn Components to Install

All installed into `packages/ui/src/components/` (shared across apps).

**Full list (40 components):**

Accordion, Alert, Alert Dialog, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Dialog, Drawer, Dropdown Menu, Form, Input, Input OTP, Label, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, Tooltip

**Installation:** Run from the app directory (e.g., `apps/dashboard`):

```bash
npx shadcn@latest add accordion alert alert-dialog avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command dialog drawer dropdown-menu form input input-otp label navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle toggle-group tooltip
```

The CLI installs shared primitives to `packages/ui/src/components/` and any app-specific hooks/utilities to the app.

**Adding new components later** is a single command:

```bash
cd apps/dashboard
npx shadcn@latest add <component-name>
```

---

## 5. Sidebar Navigation Architecture

### Approach: Data-driven sidebar with context switching

One `AppSidebar` component renders different navigation configs based on the current route context. Three contexts match the route groups defined in the add-new-page skill:

| Context | Route group | Nav config file | What it shows |
|---------|-------------|-----------------|---------------|
| Root dashboard | `(dashboard)/` | `nav-items.ts` | Org list/selector, system-level pages |
| Org dashboard | `(organization)/[org-slug]/` | `nav-items-org.ts` | Org-scoped features |
| Org settings | `(organization)/[org-slug]/settings/` | `nav-items-org-settings.ts` | Members, billing, general settings |

### Dashboard-specific components

Located in `apps/dashboard/common/ui/`:

```
apps/dashboard/common/ui/
├── app-sidebar.tsx        # Main sidebar shell — renders nav config + header + footer
├── org-switcher.tsx       # Org dropdown in sidebar header (DropdownMenu)
├── nav-main.tsx           # Renders main nav group from NavConfig
└── nav-user.tsx           # User avatar + dropdown in sidebar footer
```

### Nav config type

```typescript
// apps/dashboard/types/nav.ts
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
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

### Nav config example

```typescript
// apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { homePath } from "@workspace/routes";
import type { NavConfig } from "@/types/nav";

export const orgNavConfig: NavConfig = {
  label: "Organization",
  items: [
    {
      title: "Dashboard",
      href: homePath(),
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      href: "/members",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Billing", href: "/settings/billing" },
      ],
    },
  ],
};
```

### Layout integration

Each route group layout wraps content in `SidebarProvider` and passes its nav config:

```typescript
// apps/dashboard/app/(organization)/[org-slug]/layout.tsx
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/common/ui/app-sidebar";
import { orgNavConfig } from "./nav-items-org";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar navConfig={orgNavConfig} />
      <SidebarInset>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### AppSidebar component

Built from shadcn Sidebar primitives:

```
SidebarProvider (in layout)
└── Sidebar
    ├── SidebarHeader
    │   └── OrgSwitcher (DropdownMenu + Avatar)
    ├── SidebarContent
    │   └── SidebarGroup
    │       ├── SidebarGroupLabel (from NavConfig.label)
    │       └── SidebarMenu
    │           └── SidebarMenuItem (per NavItem)
    │               ├── SidebarMenuButton (icon + title + link)
    │               └── Collapsible (if NavItem.items exists)
    │                   └── SidebarMenuSub
    │                       └── SidebarMenuSubItem (per NavSubItem)
    ├── SidebarFooter
    │   └── NavUser (Avatar + DropdownMenu)
    └── SidebarRail (drag-to-resize handle)
```

Features from shadcn Sidebar out of the box:
- Collapsible (icon-only mode)
- Mobile responsive (renders as a Sheet on small screens)
- Keyboard navigation
- Theming via sidebar CSS tokens
- Persistent state via cookie

---

## 6. ESM Import Rule

Add to `.cursor/rules/shared-ai-guidance.mdc`:

> Always use ESM `import`/`export` syntax. Never use `require()` or `module.exports`. This applies to all source code, config files, scripts, and generated code across the entire monorepo.

---

## 7. Files Created/Modified Summary

### New files

- `packages/ui/package.json`
- `packages/ui/components.json`
- `packages/ui/tsconfig.json`
- `packages/ui/src/styles/globals.css`
- `packages/ui/src/lib/utils.ts`
- `packages/ui/src/components/*.tsx` (40 shadcn components)
- `packages/ui/src/hooks/*.ts` (shadcn hooks, e.g., use-mobile)
- `apps/dashboard/app/globals.css`
- `apps/dashboard/postcss.config.mjs`
- `apps/dashboard/components.json`
- `apps/dashboard/common/ui/app-sidebar.tsx`
- `apps/dashboard/common/ui/org-switcher.tsx`
- `apps/dashboard/common/ui/nav-main.tsx`
- `apps/dashboard/common/ui/nav-user.tsx`
- `apps/dashboard/types/nav.ts`
- `apps/dashboard/app/(dashboard)/layout.tsx`
- `apps/dashboard/app/(organization)/[org-slug]/layout.tsx`
- `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`
- `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts`
- `apps/dashboard/nav-items.ts`
- `apps/www/app/globals.css`
- `apps/www/postcss.config.mjs`
- `apps/www/components.json`

### Modified files

- `apps/dashboard/app/layout.tsx` — import globals.css, remove existing inline styles
- `apps/www/app/layout.tsx` — import globals.css, remove existing inline styles
- `apps/dashboard/package.json` — add `@workspace/ui` dependency
- `apps/www/package.json` — add `@workspace/ui` dependency
- `pnpm-workspace.yaml` — no change needed (already includes `packages/*`)
- `.cursor/rules/shared-ai-guidance.mdc` — add ESM import rule

### Deleted

None — `packages/ui-common` was already renamed to `packages/ui` prior to this phase.

---

## 8. Verification Criteria

- [ ] `pnpm build` succeeds across all packages
- [ ] Dashboard renders with correct OKLCH colors from CSS variables
- [ ] Dark mode toggle switches theme via `.dark` class on `<html>`
- [ ] shadcn components import and render from `@workspace/ui/components/<name>`
- [ ] Sidebar renders in the dashboard with org nav items
- [ ] Sidebar collapses to icon-only mode
- [ ] Sidebar renders as Sheet on mobile viewport
- [ ] Tailwind IntelliSense resolves custom colors in IDE
- [ ] `npx shadcn@latest add <new-component>` works from app directory
