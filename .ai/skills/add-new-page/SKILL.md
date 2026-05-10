---
name: add-new-page
description: Add new pages to the dashboard or www Next.js apps following the project's sparse route + feature folder conventions. Use when creating pages, routes, adding navigation entries, or scaffolding new feature UI.
---

# Add New Page

## Purpose

Use this skill whenever adding a new page to `apps/dashboard` or `apps/www`. The project separates routing from UI: thin `page.tsx` files handle routing while feature folders own the actual page content, data fetching, and mutations.

## Core Rule

Routes are sparse. Page content lives in feature folders. Apps never import Prisma directly.

## Before Starting

1. Decide which app owns the page: `apps/dashboard` (authenticated SaaS app) or `apps/www` (public marketing site).
2. Identify the feature area (e.g. `organizations`, `billing`, `account`, `admin`, `auth`).
3. Check if the feature folder already exists under `apps/<app-name>/features/`.
4. Check `packages/routes/src/index.ts` for existing route helpers that may overlap.
5. If the page doesn't clearly fit an existing feature, ask before creating a new feature folder.

## Dashboard vs WWW

The two apps have different concerns:

| Concern      | Dashboard                                                  | WWW                                                       |
| ------------ | ---------------------------------------------------------- | --------------------------------------------------------- |
| Auth         | Protected — use `getCurrentUserAndOrg()` or auth guards    | Public — no auth required                                 |
| Data scoping | Organization-scoped via `orgId`                            | None or global                                            |
| Layout       | Sidebar/app shell layout                                   | Marketing layout                                          |
| SEO          | Simple page titles                                         | Full metadata: title, description, OpenGraph              |
| Directive    | PageContent is typically `'use client'` for interactive UI | Prefer RSC; add `'use client'` only at interactive leaves |
| Navigation   | Update `nav-items.tsx` with sidebar entry                  | Update marketing nav/footer if applicable                 |

If adding a page on the dashboard that is inheritly public, then do not check for auth.

## Implementation Checklist

### 1. Add the Route Helper

Add a route builder function in `packages/routes/src/index.ts`:

```ts
export function settingsPath() {
  return "/settings";
}

export function settingsSecurityPath() {
  return "/settings/security";
}
```

Use descriptive names matching the URL structure. Parameterized routes accept arguments:

```ts
export function organizationMemberPath(memberId: string) {
  return `/organization/members/${memberId}`;
}
```

### 2. Create the App Route

Create a sparse `page.tsx` in the app directory. This file handles routing only:

**Dashboard example** — `apps/dashboard/app/(dashboard)/settings/page.tsx`:

```tsx
import { Metadata } from "next";
import { SettingsPageContent } from "@/features/account/ui/settings-page-content";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsPageContent />;
}
```

**WWW example** — `apps/www/app/pricing/page.tsx`:

```tsx
import { Metadata } from "next";
import { PricingPageContent } from "@/features/marketing/ui/pricing-page-content";

export const metadata: Metadata = {
  title: "Pricing — YourApp",
  description: "Simple, transparent pricing for teams of all sizes.",
  openGraph: {
    title: "Pricing — YourApp",
    description: "Simple, transparent pricing for teams of all sizes.",
  },
};

export default function PricingPage() {
  return <PricingPageContent />;
}
```

Rules for `page.tsx`:

- No business logic, data fetching, or complex UI.
- Export `metadata` or `generateMetadata` for SEO.
- Import and render the single PageContent component.
- Do NOT add `'use client'` to `page.tsx` — keep it a Server Component.

### 3. Create the PageContent Component

Place it in the feature folder under `ui/`:

```
apps/<app-name>/features/<feature>/ui/<feature>-page-content.tsx
```

**Dashboard example** — `apps/dashboard/features/account/ui/settings-page-content.tsx`:

```tsx
"use client";

export function SettingsPageContent() {
  return (
    <div>
      <h1>Settings</h1>
      {/* Feature UI here */}
    </div>
  );
}
```

**WWW example** — `apps/www/features/marketing/ui/pricing-page-content.tsx`:

```tsx
export function PricingPageContent() {
  return (
    <section>
      <h1>Pricing</h1>
      {/* Marketing content here — RSC by default */}
    </section>
  );
}
```

Naming:

- Filename: `kebab-case-page-content.tsx`
- Export: `PascalCasePageContent`
- One PageContent component per file.

### 4. Add Next.js Directives

Apply directives at the correct level:

| File                  | Directive               | When                                                           |
| --------------------- | ----------------------- | -------------------------------------------------------------- |
| `page.tsx`            | None (Server Component) | Always — keeps metadata and data fetching on the server        |
| `*-page-content.tsx`  | `'use client'`          | When the component uses hooks, event handlers, or browser APIs |
| `*-page-content.tsx`  | None (Server Component) | When purely rendering server data (common for www/marketing)   |
| `*-actions.ts`        | `'use server'`          | Server action files for mutations                              |
| Server-only utilities | `import 'server-only'`  | Files that must never be bundled for the client                |

### 5. Update Navigation

**Dashboard**: Add an entry in `nav-items.tsx`:

```ts
{
  title: "Settings",
  href: settingsPath(),
  icon: SettingsIcon,
}
```

Import the route helper from `@workspace/routes`. Use Lucide React icons.

**WWW**: Update the marketing nav or footer component if the page should be linked.

### 6. Add Supporting Files (If Needed)

If the page has data mutations or complex data needs, create the feature's `data/` folder:

```
apps/<app-name>/features/<feature>/
├── ui/
│   └── <feature>-page-content.tsx
└── data/
    ├── <feature>-actions.ts      # Server actions ('use server')
    ├── <feature>-types.ts        # Zod schemas and TypeScript types
    └── <feature>-queries.ts      # Data fetching functions (optional)
```

Server actions should call domain package repos, not Prisma directly:

```ts
"use server";

import { getCurrentUserAndOrg } from "@workspace/auth";
import { updateOrganization } from "@workspace/crm";

export async function updateOrgAction(data: UpdateOrgInput) {
  const { org } = await getCurrentUserAndOrg("organization.update");
  return updateOrganization(org.id, data);
}
```

### 7. Consider Loading and Error States

For pages with data fetching, add sibling files in the route directory:

- `loading.tsx` — Suspense fallback shown while the page loads.
- `error.tsx` — Error boundary for runtime errors (must be `'use client'`).
- `not-found.tsx` — Custom 404 for dynamic routes that resolve to missing data.

Only add these when the page genuinely needs them. Don't add empty placeholders.

### 8. Handle Layouts and Route Groups

Use route groups `(groupName)/` to share layouts without affecting URLs in some cases. In other cases include the name in the route:

```
apps/dashboard/app/
├── (organization)/[org-slug]          # Sidebar layout for main app pages
│   ├── layout.tsx
│   └── settings/
│       └── page.tsx
│   └── feature-name/
│       └── page.tsx
├── (dashboard)/          # Sidebar layout for main app pages outside of an organization
│   ├── layout.tsx
│   └── settings/
│       └── page.tsx
├── auth/               # Minimal layout for auth pages, put "auth" in the folder
│   ├── layout.tsx
│   └── sign-in/
│       └── page.tsx
```

Place new pages in the appropriate existing route group. Only create a new route group if no existing group fits. Ask before creating new route groups.

## Testing

Focus on high-ROI tests — roughly 2-4 per page:

| Test                        | Tool         | When                            | Catches                                             |
| --------------------------- | ------------ | ------------------------------- | --------------------------------------------------- |
| Server action + auth guards | Vitest       | Always (if page has actions)    | Tenant data leaks, permission bypass, invalid input |
| Smoke render                | Vitest + RTL | Always                          | Broken imports, missing providers, crash on render  |
| Critical user flow E2E      | Playwright   | Key forms/multi-step flows only | Client + server integration failures                |
| Route access/redirect       | Playwright   | Protected pages only            | Auth misconfig, route group bugs                    |

**Always add**: smoke render test for the PageContent, plus action/guard tests for each server action covering permission checks, org scoping, and input validation.

**Add selectively**: one Playwright E2E per critical user journey. Skip E2E for simple read-only pages.

**Skip**: snapshot tests, individual shadcn component tests, CSS/layout assertions, metadata export tests.

## Quick Reference

For a typical new dashboard page, touch these files:

1. `packages/routes/src/index.ts` — add route helper
2. `apps/dashboard/app/<route>/page.tsx` — sparse route file
3. `apps/dashboard/features/<feature>/ui/<name>-page-content.tsx` — page UI
4. Add a navigation entry in one of these areas
   a. `apps/dashboard/nav-items.tsx` — when org is not selected.
   b. `apps/dashboard/(organization)/[org-slug]/nav-items-org.tsx` — navigation menu for when organization is selected
   c. `apps/dashboard/(organization)/[org-slug]/settings/nav-items-org-settings.tsx` — navigation menu for when organization is selected in settings area
5. `apps/dashboard/features/<feature>/data/<name>-actions.ts` — server actions (if needed)
6. `apps/dashboard/features/<feature>/data/<name>-types.ts` — Zod schemas (if needed)

## Naming

Use lowercase kebab-case filenames:

- `settings-page-content.tsx`
- `member-list-page-content.tsx`
- `pricing-page-content.tsx`

Use PascalCase for exports:

- `SettingsPageContent`
- `MemberListPageContent`
- `PricingPageContent`
