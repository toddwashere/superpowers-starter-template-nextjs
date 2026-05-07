# Phase 1.2: Styling, Components & Sidebar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Tailwind CSS v4 with shared design tokens, install 40 shadcn/ui components into `packages/ui`, and build a data-driven sidebar navigation for the dashboard app.

**Architecture:** A shared `@workspace/ui` package exports globals.css (Tailwind v4 CSS-first config with OKLCH tokens), shadcn components, and utilities. Each app imports the CSS and adds a PostCSS config. The dashboard uses shadcn's Sidebar primitives with typed nav configs passed per route group layout.

**Tech Stack:** Tailwind CSS v4, shadcn/ui (new-york style), OKLCH colors, tw-animate-css, lucide-react, Next.js 16, pnpm workspaces

**Design spec:** `docs/superpowers/specs/2026-05-07-phase-1-2-styling-and-components-design.md`

---

## File Map

### New files

| File | Purpose |
|------|---------|
| `packages/ui/package.json` | Rewrite with exports, imports, Tailwind v4 deps |
| `packages/ui/components.json` | shadcn CLI config for the UI package |
| `packages/ui/tsconfig.json` | Extend shared TS config (already exists, will be updated) |
| `packages/ui/src/styles/globals.css` | Tailwind v4 tokens, @theme inline, dark mode |
| `packages/ui/src/lib/utils.ts` | `cn()` helper |
| `packages/ui/src/components/*.tsx` | 40 shadcn components (via CLI) |
| `packages/ui/src/hooks/*.ts` | shadcn hooks (via CLI) |
| `apps/dashboard/postcss.config.mjs` | PostCSS with @tailwindcss/postcss |
| `apps/dashboard/app/globals.css` | Import shared CSS + @source for monorepo |
| `apps/dashboard/components.json` | shadcn CLI config for dashboard app |
| `apps/dashboard/types/nav.ts` | NavItem, NavSubItem, NavConfig types |
| `apps/dashboard/nav-items.ts` | Root dashboard nav config |
| `apps/dashboard/common/ui/app-sidebar.tsx` | Main sidebar shell component |
| `apps/dashboard/common/ui/nav-main.tsx` | Nav group renderer |
| `apps/dashboard/common/ui/nav-user.tsx` | User menu in sidebar footer |
| `apps/dashboard/common/ui/org-switcher.tsx` | Org dropdown in sidebar header |
| `apps/dashboard/app/(dashboard)/layout.tsx` | Root dashboard layout with sidebar |
| `apps/dashboard/app/(dashboard)/page.tsx` | Moved from app/page.tsx |
| `apps/dashboard/app/(organization)/[org-slug]/layout.tsx` | Org layout with sidebar |
| `apps/dashboard/app/(organization)/[org-slug]/page.tsx` | Org dashboard page |
| `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts` | Org nav config |
| `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts` | Org settings nav config |
| `apps/www/postcss.config.mjs` | PostCSS with @tailwindcss/postcss |
| `apps/www/app/globals.css` | Import shared CSS + @source |
| `apps/www/components.json` | shadcn CLI config for www app |

### Modified files

| File | Change |
|------|--------|
| `apps/dashboard/package.json` | Add `@workspace/ui`, `lucide-react` deps |
| `apps/www/package.json` | Add `@workspace/ui` dep |
| `apps/dashboard/app/layout.tsx` | Import globals.css |
| `apps/www/app/layout.tsx` | Import globals.css |

---

## Task 1: Set up `packages/ui` foundation

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/styles/globals.css`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/components.json`

- [ ] **Step 1: Rewrite `packages/ui/package.json`**

Replace the entire contents of `packages/ui/package.json` with:

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

- [ ] **Step 2: Update `packages/ui/tsconfig.json`**

Replace the entire contents with:

```json
{
  "extends": "@workspace/tooling/typescript/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

(This is the same as the current file — verify it matches and leave as-is.)

- [ ] **Step 3: Create directories**

```bash
mkdir -p packages/ui/src/styles packages/ui/src/lib packages/ui/src/components packages/ui/src/hooks
```

- [ ] **Step 4: Create `packages/ui/src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Create `packages/ui/src/styles/globals.css`**

Copy the full globals.css **verbatim** from the design spec: `docs/superpowers/specs/2026-05-07-phase-1-2-styling-and-components-design.md`, Section 2 "Design Token System", subsection "src/styles/globals.css". The file is ~125 lines and contains:
- `@import "tailwindcss";` and `@import "tw-animate-css";`
- `@custom-variant dark (&:is(.dark *));`
- `@theme inline { ... }` — all color mappings, sidebar tokens, radius scale
- `:root { ... }` — OKLCH light theme values (neutral base)
- `.dark { ... }` — OKLCH dark theme values
- `@layer base { ... }` — `border-border`, `outline-ring/50`, `bg-background`, `text-foreground`

**Do not paraphrase or summarize — copy the entire CSS block from the spec.**

- [ ] **Step 6: Create `packages/ui/components.json`**

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

- [ ] **Step 7: Install dependencies**

```bash
cd /path/to/monorepo-root
pnpm install
```

Expected: resolves all workspace deps, installs clsx, tailwind-merge, cva, tailwindcss v4, tw-animate-css, @tailwindcss/postcss.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/
git commit -m "feat(ui): set up @workspace/ui with Tailwind v4 tokens and utilities"
```

---

## Task 2: Configure dashboard app for Tailwind v4

**Files:**
- Create: `apps/dashboard/postcss.config.mjs`
- Create: `apps/dashboard/app/globals.css`
- Create: `apps/dashboard/components.json`
- Modify: `apps/dashboard/package.json`
- Modify: `apps/dashboard/app/layout.tsx`

- [ ] **Step 1: Add `@workspace/ui` and `lucide-react` dependencies to `apps/dashboard/package.json`**

Add to the `dependencies` section:

```json
"@workspace/ui": "workspace:*",
"lucide-react": "^0.469"
```

- [ ] **Step 2: Create `apps/dashboard/postcss.config.mjs`**

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 3: Create `apps/dashboard/app/globals.css`**

```css
@import "@workspace/ui/globals.css";
@source "../../../packages/ui/src";
```

- [ ] **Step 4: Create `apps/dashboard/components.json`**

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

- [ ] **Step 5: Update `apps/dashboard/app/layout.tsx`**

Replace entire file with:

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

- [ ] **Step 6: Run `pnpm install` then `pnpm build`**

```bash
pnpm install
pnpm build
```

Expected: both apps build successfully. The dashboard now uses Tailwind v4 via the shared globals.css.

- [ ] **Step 7: Commit**

```bash
git add apps/dashboard/
git commit -m "feat(dashboard): configure Tailwind v4 with shared @workspace/ui tokens"
```

---

## Task 3: Configure www app for Tailwind v4

**Files:**
- Create: `apps/www/postcss.config.mjs`
- Create: `apps/www/app/globals.css`
- Create: `apps/www/components.json`
- Modify: `apps/www/package.json`
- Modify: `apps/www/app/layout.tsx`

- [ ] **Step 1: Add `@workspace/ui` dependency to `apps/www/package.json`**

Add to the `dependencies` section:

```json
"@workspace/ui": "workspace:*"
```

- [ ] **Step 2: Create `apps/www/postcss.config.mjs`**

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 3: Create `apps/www/app/globals.css`**

```css
@import "@workspace/ui/globals.css";
@source "../../../packages/ui/src";
```

- [ ] **Step 4: Create `apps/www/components.json`**

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

- [ ] **Step 5: Update `apps/www/app/layout.tsx`**

Replace entire file with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Starter Template",
    template: "%s — Starter Template",
  },
  description: "A modern SaaS starter template built with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Run `pnpm install` then `pnpm build`**

```bash
pnpm install
pnpm build
```

Expected: both apps build successfully.

- [ ] **Step 7: Commit**

```bash
git add apps/www/
git commit -m "feat(www): configure Tailwind v4 with shared @workspace/ui tokens"
```

---

## Task 4: Install shadcn components

**Files:**
- Create: `packages/ui/src/components/*.tsx` (40 components via CLI)
- Create: `packages/ui/src/hooks/*.ts` (hooks installed by sidebar, etc.)

**Prerequisites:** Tasks 1-3 must be complete. Both apps must build.

- [ ] **Step 1: Install all shadcn components from dashboard app directory**

Run from `apps/dashboard`:

```bash
cd apps/dashboard
npx shadcn@latest add accordion alert alert-dialog avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command dialog drawer dropdown-menu form input input-otp label navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle toggle-group tooltip
```

The CLI reads `components.json`, resolves the `ui` alias to `@workspace/ui/components`, and installs shared component files to `packages/ui/src/components/`. It also installs any required peer dependencies (e.g., `@radix-ui/*`, `recharts`, `react-day-picker`, `embla-carousel-react`, etc.) into `packages/ui/package.json`.

If the CLI prompts for overwriting, choose "Yes" for all.

- [ ] **Step 2: Verify components were installed to the correct location**

```bash
ls packages/ui/src/components/ | head -20
```

Expected: files like `accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`, `avatar.tsx`, `button.tsx`, `sidebar.tsx`, etc.

```bash
ls packages/ui/src/hooks/
```

Expected: `use-mobile.tsx` (installed by sidebar component).

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: both apps build successfully.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/ apps/dashboard/package.json apps/www/package.json pnpm-lock.yaml
git commit -m "feat(ui): install 40 shadcn components into @workspace/ui"
```

---

## Task 5: Create nav types and configs

**Files:**
- Create: `apps/dashboard/types/nav.ts`
- Create: `apps/dashboard/nav-items.ts`
- Create: `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`
- Create: `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts`

- [ ] **Step 1: Create `apps/dashboard/types/nav.ts`**

```bash
mkdir -p apps/dashboard/types
```

```typescript
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

- [ ] **Step 2: Create `apps/dashboard/nav-items.ts`**

This is the root dashboard nav (when no org is selected):

```typescript
import { LayoutDashboard, Building2, Settings } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const rootNavConfig: NavConfig = {
  label: "Platform",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Organizations",
      href: "/organizations",
      icon: Building2,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ],
};
```

- [ ] **Step 3: Create org nav config directories and file**

```bash
mkdir -p apps/dashboard/app/\(organization\)/\[org-slug\]/settings
```

Create `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`:

```typescript
import { LayoutDashboard, Users, Settings } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const orgNavConfig: NavConfig = {
  label: "Organization",
  items: [
    {
      title: "Dashboard",
      href: "/",
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

- [ ] **Step 4: Create org settings nav config**

Create `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts`:

```typescript
import { Settings, CreditCard, Users, Shield } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const orgSettingsNavConfig: NavConfig = {
  label: "Settings",
  items: [
    {
      title: "General",
      href: "/settings/general",
      icon: Settings,
    },
    {
      title: "Members",
      href: "/settings/members",
      icon: Users,
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: CreditCard,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: Shield,
    },
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/types/ apps/dashboard/nav-items.ts apps/dashboard/app/\(organization\)/
git commit -m "feat(dashboard): add nav types and configs for sidebar contexts"
```

---

## Task 6: Build sidebar components

**Files:**
- Create: `apps/dashboard/common/ui/nav-main.tsx`
- Create: `apps/dashboard/common/ui/nav-user.tsx`
- Create: `apps/dashboard/common/ui/org-switcher.tsx`
- Create: `apps/dashboard/common/ui/app-sidebar.tsx`

**Prerequisites:** Task 4 (shadcn components installed) and Task 5 (nav types) must be complete.

- [ ] **Step 1: Create directory**

```bash
mkdir -p apps/dashboard/common/ui
```

- [ ] **Step 2: Create `apps/dashboard/common/ui/nav-main.tsx`**

Renders the main navigation group from a NavConfig. Uses shadcn Sidebar primitives with Collapsible for sub-items.

```tsx
"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import type { NavConfig } from "@/types/nav";

export function NavMain({ config }: { config: NavConfig }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {config.label && <SidebarGroupLabel>{config.label}</SidebarGroupLabel>}
      <SidebarMenu>
        {config.items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.href}
                        >
                          <Link href={subItem.href}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
```

- [ ] **Step 3: Create `apps/dashboard/common/ui/nav-user.tsx`**

Renders a user avatar with dropdown in the sidebar footer. Uses placeholder data until auth is wired in Phase 1.3.

```tsx
"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

const placeholderUser = {
  name: "User",
  email: "user@example.com",
  avatar: "",
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = placeholderUser;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

- [ ] **Step 4: Create `apps/dashboard/common/ui/org-switcher.tsx`**

Renders an org selector in the sidebar header. Uses placeholder data until org backend is wired in Phase 1.3.

```tsx
"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

const placeholderOrgs = [
  { name: "Acme Inc", slug: "acme" },
  { name: "Demo Corp", slug: "demo" },
];

export function OrgSwitcher() {
  const { isMobile } = useSidebar();
  const activeOrg = placeholderOrgs[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeOrg.name.slice(0, 1)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeOrg.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {placeholderOrgs.map((org) => (
              <DropdownMenuItem key={org.slug} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {org.name.slice(0, 1)}
                </div>
                {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

- [ ] **Step 5: Create `apps/dashboard/common/ui/app-sidebar.tsx`**

The main sidebar shell. Composes OrgSwitcher, NavMain, and NavUser.

```tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { OrgSwitcher } from "./org-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import type { NavConfig } from "@/types/nav";

export function AppSidebar({
  navConfig,
  ...props
}: { navConfig: NavConfig } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain config={navConfig} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/dashboard/common/
git commit -m "feat(dashboard): add sidebar components — AppSidebar, NavMain, NavUser, OrgSwitcher"
```

---

## Task 7: Set up route groups and sidebar layouts

**Files:**
- Create: `apps/dashboard/app/(dashboard)/layout.tsx`
- Create: `apps/dashboard/app/(dashboard)/page.tsx`
- Create: `apps/dashboard/app/(organization)/[org-slug]/layout.tsx`
- Create: `apps/dashboard/app/(organization)/[org-slug]/page.tsx`
- Modify: `apps/dashboard/app/page.tsx` (delete — moved to route group)

This task reorganizes the dashboard app's routing into route groups, each with its own sidebar layout.

- [ ] **Step 1: Create `(dashboard)` route group with layout**

```bash
mkdir -p apps/dashboard/app/\(dashboard\)
```

Create `apps/dashboard/app/(dashboard)/layout.tsx`:

```tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import { AppSidebar } from "@/common/ui/app-sidebar";
import { rootNavConfig } from "@/nav-items";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar navConfig={rootNavConfig} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 2: Move dashboard page into route group**

Create `apps/dashboard/app/(dashboard)/page.tsx`:

```tsx
import type { Metadata } from "next";
import { DashboardPageContent } from "@/features/dashboard/ui/dashboard-page-content";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
```

Delete the old `apps/dashboard/app/page.tsx`:

```bash
rm apps/dashboard/app/page.tsx
```

- [ ] **Step 3: Create `(organization)/[org-slug]` route group with layout**

```bash
mkdir -p apps/dashboard/app/\(organization\)/\[org-slug\]
```

Create `apps/dashboard/app/(organization)/[org-slug]/layout.tsx`:

```tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import { AppSidebar } from "@/common/ui/app-sidebar";
import { orgNavConfig } from "./nav-items-org";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar navConfig={orgNavConfig} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 4: Create org dashboard page**

Create `apps/dashboard/app/(organization)/[org-slug]/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Dashboard",
};

export default function OrgDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Organization Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your organization. Select a section from the sidebar.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Verify build and dev server**

```bash
pnpm build
```

Expected: all tasks succeed. Both apps build.

Then start the dev server and visually verify:

```bash
pnpm dev
```

Open `http://localhost:4000` in a browser. Expected:
- Sidebar renders on the left with "Platform" label
- Org switcher in sidebar header
- Navigation items: Dashboard, Organizations, Settings
- User menu in sidebar footer
- Sidebar collapse button (SidebarTrigger) in the header
- Clicking the collapse button shrinks sidebar to icon-only mode

- [ ] **Step 6: Commit**

```bash
git add apps/dashboard/app/ apps/dashboard/common/ apps/dashboard/nav-items.ts
git commit -m "feat(dashboard): add route groups with sidebar layouts"
```

---

## Task 8: Final verification and cleanup

- [ ] **Step 1: Full build check**

```bash
pnpm build
```

Expected: all tasks succeed, zero errors.

- [ ] **Step 2: Verify shadcn component can be imported and rendered**

Update `apps/dashboard/features/dashboard/ui/dashboard-page-content.tsx` to use a shadcn Button to prove the component pipeline works end-to-end:

```tsx
"use client";

import { Button } from "@workspace/ui/components/button";

export function DashboardPageContent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the dashboard.
      </p>
      <Button className="mt-4">Get Started</Button>
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and visually verify**

```bash
pnpm dev
```

Open `http://localhost:4000`. Verify:
- [ ] Page renders with correct Tailwind styles (bg-background, text-foreground)
- [ ] Button renders with correct primary color styling
- [ ] Sidebar is visible and functional
- [ ] Sidebar collapses to icon-only mode
- [ ] Colors match OKLCH neutral theme (near-black primary, light background)

Open `http://localhost:4001`. Verify:
- [ ] www app renders with Tailwind styles applied

- [ ] **Step 4: Verify adding a new shadcn component works**

```bash
cd apps/dashboard
npx shadcn@latest add aspect-ratio
```

Expected: installs to `packages/ui/src/components/aspect-ratio.tsx`.

```bash
rm packages/ui/src/components/aspect-ratio.tsx
```

(Clean up test component — we don't need it yet.)

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: complete Phase 1.2 — Tailwind v4, shadcn components, sidebar navigation"
```

---

## Pre-completed Items

The following spec requirements were already completed during the design phase:

- **ESM import rule** (spec Section 6): Added to `.cursor/rules/shared-ai-guidance.mdc` in commit `d5b58f3`.
- **Rename `packages/ui-common` → `packages/ui`**: Completed in commit `e58f497`.

---

## Verification Checklist

After all tasks are complete, confirm:

- [ ] `pnpm build` succeeds across all packages
- [ ] Dashboard renders with correct OKLCH colors from CSS variables
- [ ] Sidebar renders in the dashboard with nav items
- [ ] Sidebar collapses to icon-only mode
- [ ] shadcn components import and render from `@workspace/ui/components/<name>`
- [ ] `npx shadcn@latest add <new-component>` works from app directory
- [ ] www app renders with Tailwind styles
