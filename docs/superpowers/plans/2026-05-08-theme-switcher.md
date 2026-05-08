# Theme Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Light/Dark/System theme switcher to both the dashboard and www apps, defaulting to light theme.

**Architecture:** Shared `ThemeProvider` wrapper and `ThemeToggle` component live in `packages/ui`. Each app imports and places them in its layout. The toggle is a Lucide icon button that opens a shadcn DropdownMenu with three theme choices.

**Tech Stack:** next-themes, Lucide React (Sun, Moon, Monitor), shadcn DropdownMenu, Radix UI primitives, Tailwind v4 class-based dark mode.

---

### Task 1: Create shared ThemeProvider component

**Files:**
- Create: `packages/ui/src/components/theme-provider.tsx`

- [ ] **Step 1: Create the ThemeProvider wrapper**

```tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  defaultTheme = "light",
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 2: Verify the export resolves via the package**

The `packages/ui/package.json` has `"./components/*": "./src/components/*.tsx"` so apps can import as:

```tsx
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
```

Run: `cd apps/dashboard && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to theme-provider import (may have other pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/theme-provider.tsx
git commit -m "feat(ui): add shared ThemeProvider component"
```

---

### Task 2: Create ThemeToggle component

**Files:**
- Create: `packages/ui/src/components/theme-toggle.tsx`

- [ ] **Step 1: Create the ThemeToggle component**

```tsx
"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "#components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Verify the component file has no TypeScript errors**

Run: `cd packages/ui && npx tsc --noEmit --pretty 2>&1 | grep -i "theme-toggle" || echo "No errors in theme-toggle"`
Expected: No errors related to theme-toggle

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/theme-toggle.tsx
git commit -m "feat(ui): add ThemeToggle component with icon button + dropdown"
```

---

### Task 3: Integrate into Dashboard app

**Files:**
- Modify: `apps/dashboard/features/auth/ui/auth-provider.tsx`
- Modify: `apps/dashboard/common/ui/app-sidebar.tsx`

- [ ] **Step 1: Update auth-provider.tsx to use shared ThemeProvider**

Replace the current contents of `apps/dashboard/features/auth/ui/auth-provider.tsx` with:

```tsx
"use client";

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
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

Changes:
- Import `ThemeProvider` from `@workspace/ui/components/theme-provider` instead of `next-themes`
- Change `defaultTheme` from `"system"` to `"light"`
- Remove redundant props (`attribute`, `enableSystem`, `disableTransitionOnChange`) since the shared wrapper handles them

- [ ] **Step 2: Add ThemeToggle to the sidebar footer**

Update `apps/dashboard/common/ui/app-sidebar.tsx`:

```tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
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
        <ThemeToggle />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

Changes: Added `ThemeToggle` import and placed `<ThemeToggle />` above `<NavUser />` in the footer.

- [ ] **Step 3: Verify dashboard builds**

Run: `cd apps/dashboard && npx next build 2>&1 | tail -10`
Expected: Build succeeds (or only pre-existing warnings)

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/features/auth/ui/auth-provider.tsx apps/dashboard/common/ui/app-sidebar.tsx
git commit -m "feat(dashboard): integrate shared ThemeProvider and ThemeToggle in sidebar"
```

---

### Task 4: Integrate into WWW app

**Files:**
- Modify: `apps/www/app/layout.tsx`

- [ ] **Step 1: Update www root layout with ThemeProvider and ThemeToggle**

Replace the contents of `apps/www/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Changes:
- Added `suppressHydrationWarning` to `<html>` (required by next-themes)
- Wrapped body contents with `<ThemeProvider defaultTheme="light">`
- Added `<ThemeToggle />` in a fixed top-right container

- [ ] **Step 2: Add next-themes to www dependencies**

Run: `cd apps/www && pnpm add next-themes`

This is needed because `ThemeProvider` and `ThemeToggle` use `next-themes` at runtime. The workspace dependency from `@workspace/ui` provides the package, but the www app should declare it explicitly.

- [ ] **Step 3: Verify www builds**

Run: `cd apps/www && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/www/app/layout.tsx apps/www/package.json pnpm-lock.yaml
git commit -m "feat(www): add ThemeProvider and ThemeToggle to marketing site"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start the dashboard dev server and verify toggle works**

Run: `cd apps/dashboard && pnpm dev`

Open http://localhost:4000. Verify:
1. Page loads in light theme (no `.dark` class on `<html>`)
2. Theme toggle icon (sun) is visible in sidebar footer
3. Clicking the toggle opens dropdown with Light, Dark, System options
4. Selecting "Dark" adds `.dark` class to `<html>`, UI switches to dark colors
5. Selecting "Light" removes `.dark` class, UI returns to light
6. Selecting "System" follows OS preference
7. Refreshing the page preserves the last selection (localStorage)

- [ ] **Step 2: Start the www dev server and verify toggle works**

Run: `cd apps/www && pnpm dev`

Open http://localhost:4001. Verify the same 7 checks above, with the toggle appearing fixed in the top-right corner.

- [ ] **Step 3: Final commit (if any adjustments needed)**

```bash
git add -A
git commit -m "fix: adjust theme toggle styling after manual testing"
```

Only commit if adjustments were made during testing. Skip if everything worked on first pass.
