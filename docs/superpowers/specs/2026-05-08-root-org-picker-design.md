# Root Org Picker Design

**Date:** 2026-05-08  
**Status:** Approved  
**Scope:** Dashboard app — root layout and page (non-org context)

## Overview

Replace the confusing sidebar-based root layout with a minimal centered layout that shows only what matters: the user's organizations and a way to create a new one. The sidebar is reserved exclusively for the org context.

## Problem

The root `/` (non-org) currently renders the same sidebar chrome as org pages — `SidebarProvider`, `AppSidebar`, etc. This is confusing because:
- It looks like you're already in an org
- The root nav items ("Dashboard", "Organizations", "Settings") don't have matching pages and mostly 404
- The only meaningful action at root is picking or creating an org

## Solution

Remove the sidebar from the `(dashboard)` route group layout. Replace with a minimal centered layout. The root page becomes a clean org-picker.

## Layout: `(dashboard)/layout.tsx`

**Before:** Full sidebar shell (`SidebarProvider` → `AppSidebar` → `SidebarInset` → header → main)

**After:** Minimal centered layout with:
- A slim top header bar containing:
  - Theme toggle (right-aligned)
  - User avatar dropdown with sign-out action (right-aligned)
- Centered content container (`max-w-2xl mx-auto`, padded)
- No sidebar, no nav links

This layout wraps both `/` and `/create-org`.

## Page: Root `/`

**Before:** Placeholder "Welcome to the dashboard" with a "Get Started" button.

**After:** Org-picker page:
- Heading: "Your Organizations"
- List of org cards, each showing:
  - Org name
  - First letter avatar (matching current `OrgSwitcher` style)
  - Clickable — navigates to `/{org-slug}`
- "Create Organization" action at the bottom (button or card, links to `/create-org`)
- Empty state: if user has zero orgs, show friendly message + "Create your first organization" CTA
- Data: uses `authClient.useListOrganizations()` (same hook `OrgSwitcher` uses)

## Files Changed

| File | Change |
|------|--------|
| `apps/dashboard/app/(dashboard)/layout.tsx` | Rewrite — remove sidebar, add minimal centered layout with header |
| `apps/dashboard/app/(dashboard)/page.tsx` | Update to render new org-picker content |
| `apps/dashboard/features/dashboard/ui/dashboard-page-content.tsx` | Rewrite — becomes org-picker UI |
| `apps/dashboard/nav-items.ts` | Delete — no longer needed |

## What Stays Unchanged

| File | Why |
|------|-----|
| `apps/dashboard/app/(organization)/[org-slug]/layout.tsx` | Org context keeps its sidebar |
| `apps/dashboard/app/(dashboard)/create-org/page.tsx` | Same URL, same functionality, now wrapped by the minimal layout (better fit) |
| `apps/dashboard/common/ui/app-sidebar.tsx` | Still used by org layout |
| `apps/dashboard/common/ui/nav-user.tsx` | Still used in org sidebar footer; root layout uses a simplified version or reuses it |
| Auth routes | Untouched |

## Header Component

The slim header needs:
- `ThemeToggle` (from `@workspace/ui/components/theme-toggle`)
- A user menu: avatar, name, sign-out — can be a simplified inline version or reuse parts of `NavUser`

Since `NavUser` is tightly coupled to `SidebarMenu`/`SidebarMenuButton`, the root header should have its own lightweight user menu using standard `DropdownMenu` + `Avatar` (same components, no sidebar dependency).

## Behavior

| State | What User Sees |
|-------|---------------|
| Has orgs | List of org cards, click to navigate |
| Zero orgs | Empty state + "Create your first organization" button |
| Loading | Skeleton cards |
| Click org | Calls `authClient.organization.setActive({ organizationId })` then navigates to `/{org-slug}` (matches `OrgSwitcher` behavior) |
| Click "Create" | Navigates to `/create-org` |
