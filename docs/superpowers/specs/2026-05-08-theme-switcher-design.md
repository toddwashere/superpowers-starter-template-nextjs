# Theme Switcher Design

**Date:** 2026-05-08  
**Status:** Approved  
**Scope:** Both apps (dashboard, www)

## Overview

Add a user-facing theme switcher supporting three modes — Light, Dark, and System — with Light as the default. The toggle uses the standard shadcn icon-button-with-dropdown pattern, built as a shared component in `packages/ui`.

## Requirements

- Users can switch between Light, Dark, and System (OS preference) themes
- Default theme is Light
- Default is changeable in one line of code per app (the `defaultTheme` prop on `ThemeProvider`)
- Toggle uses Lucide React icons (`Sun`, `Moon`, `Monitor`)
- Dashboard: toggle in sidebar footer
- WWW: toggle in site header (fixed top-right until a proper header exists)
- Theme preference persists across sessions (handled by `next-themes` via localStorage)

## Existing Infrastructure

The project already has:
- Tailwind v4 with `@custom-variant dark (&:is(.dark *))` in `packages/ui/src/styles/globals.css`
- Full light/dark CSS design tokens (OKLCH variables) defined on `:root` and `.dark`
- `next-themes` ^0.4 in `packages/ui` and `apps/dashboard`
- Class-based theme switching (`attribute="class"`)
- `suppressHydrationWarning` on dashboard's `<html>` element

What's missing:
- No `ThemeToggle` component
- No shared `ThemeProvider` wrapper (dashboard has its own inline usage)
- WWW app has no theme provider at all

## Architecture

### Component: `ThemeToggle`

**File:** `packages/ui/src/components/theme-toggle.tsx`

A `"use client"` component that:
1. Calls `useTheme()` from `next-themes` to read current theme and `setTheme`
2. Renders a `Button` (variant: `ghost`, size: `icon`) displaying:
   - `Sun` icon when resolved theme is light
   - `Moon` icon when resolved theme is dark
3. On click, opens a `DropdownMenu` with three `DropdownMenuItem` entries:
   - "Light" — icon: `Sun`, calls `setTheme("light")`
   - "Dark" — icon: `Moon`, calls `setTheme("dark")`
   - "System" — icon: `Monitor`, calls `setTheme("system")`
4. Includes `sr-only` text for accessibility ("Toggle theme")

**Dependencies used (all already in `packages/ui`):**
- `next-themes` (useTheme)
- `lucide-react` (Sun, Moon, Monitor)
- Internal: `Button`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`

### Component: `ThemeProvider`

**File:** `packages/ui/src/components/theme-provider.tsx`

A thin wrapper re-exporting `next-themes` `ThemeProvider` with project defaults:

```tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";

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
  );
}
```

The `defaultTheme` prop is the single line a developer changes to adjust the default.

### Exports

Both components exported from the `packages/ui` package barrel so apps import as:
```tsx
import { ThemeToggle, ThemeProvider } from "@workspace/ui/components/theme-toggle";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
```

## App Integration

### Dashboard (`apps/dashboard`)

1. **Root layout** (`apps/dashboard/app/layout.tsx`):
   - Replace the existing inline `ThemeProvider` from `next-themes` (in `auth-provider.tsx`) with the shared `ThemeProvider` from `@workspace/ui`
   - Pass `defaultTheme="light"` (changing the current "system" default)
   - `suppressHydrationWarning` already present on `<html>`

2. **Sidebar** (`apps/dashboard/common/ui/app-sidebar.tsx`):
   - Add `<ThemeToggle />` inside `<SidebarFooter>`, adjacent to `<NavUser />`
   - Exact positioning (above vs inline) is an implementation detail — the toggle is a small icon button that fits naturally in the sidebar footer area

### WWW (`apps/www`)

1. **Root layout** (`apps/www/app/layout.tsx`):
   - Add `suppressHydrationWarning` to `<html>`
   - Wrap `{children}` with `<ThemeProvider defaultTheme="light">`
   - Add `next-themes` to www's `package.json` dependencies (or rely on the workspace dependency from `@workspace/ui`)

2. **Toggle placement**:
   - Create a minimal fixed-position container in the top-right corner of the layout with `<ThemeToggle />`
   - This is a temporary placement; when the www app gains a proper header/nav, the toggle moves there

## Behavior

| User Action | Result |
|---|---|
| First visit (no preference saved) | Light theme applied |
| Select "Dark" | `.dark` class added to `<html>`, dark tokens activate, preference saved to localStorage |
| Select "System" | Theme follows OS preference, updates reactively if OS changes |
| Select "Light" | `.dark` class removed, light tokens active |
| Return visit | Previously selected preference restored from localStorage |

## Accessibility

- Button has `sr-only` label: "Toggle theme"
- Dropdown items have text labels (not icon-only)
- Keyboard navigable (inherited from shadcn DropdownMenu / Radix)
- No flash of unstyled content (FOUC) — `next-themes` injects a blocking script, `disableTransitionOnChange` prevents jarring transitions

## File Changes Summary

| File | Change |
|---|---|
| `packages/ui/src/components/theme-toggle.tsx` | New — ThemeToggle component |
| `packages/ui/src/components/theme-provider.tsx` | New — ThemeProvider wrapper |
| `packages/ui/src/index.ts` (or barrel) | Export new components |
| `apps/dashboard/features/auth/ui/auth-provider.tsx` | Replace inline ThemeProvider with shared one, change default to "light" |
| `apps/dashboard/common/ui/app-sidebar.tsx` | Add ThemeToggle to SidebarFooter |
| `apps/www/app/layout.tsx` | Add ThemeProvider, suppressHydrationWarning, ThemeToggle |
| `apps/www/package.json` | Add `next-themes` if not already resolved via workspace |
