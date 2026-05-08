# Root Org Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar-based root layout with a minimal centered layout showing an org-picker page (list of orgs + create action).

**Architecture:** Rewrite `(dashboard)/layout.tsx` to a simple header + centered content (no sidebar). Rewrite the root page content to an org-picker using `authClient.useListOrganizations()`. Delete the now-unused `nav-items.ts`.

**Tech Stack:** Next.js app router, `@workspace/auth/client` (better-auth), shadcn Card/Button/Avatar/DropdownMenu, ThemeToggle.

---

### Task 1: Rewrite the `(dashboard)` layout

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Replace layout with minimal centered layout**

Replace the entire contents of `apps/dashboard/app/(dashboard)/layout.tsx` with:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/features/auth/data/auth-client";
import { signInPath } from "@workspace/routes";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
import { IconForSignOut } from "@workspace/ui/components/icon-for";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const displayName = user?.name ?? "User";
  const displayImage = user?.image ?? "";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(signInPath());
  };

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-end gap-2 border-b px-6">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarImage src={displayImage} alt={displayName} />
                <AvatarFallback>
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleSignOut}>
              <IconForSignOut className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Verify no import errors**

Run: `cd apps/dashboard && npx tsc --noEmit --pretty 2>&1 | grep -i "layout" | head -5 || echo "No layout errors"`
Expected: No new errors related to the layout file

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/layout.tsx
git commit -m "refactor(dashboard): replace sidebar layout with minimal centered layout"
```

---

### Task 2: Rewrite the root page as org-picker

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/page.tsx`
- Modify: `apps/dashboard/features/dashboard/ui/dashboard-page-content.tsx`

- [ ] **Step 1: Update the page metadata**

Replace `apps/dashboard/app/(dashboard)/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { OrgPickerPageContent } from "@/features/dashboard/ui/org-picker-page-content";

export const metadata: Metadata = {
  title: "Organizations",
};

export default function DashboardPage() {
  return <OrgPickerPageContent />;
}
```

- [ ] **Step 2: Create the org-picker page content**

Create `apps/dashboard/features/dashboard/ui/org-picker-page-content.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@workspace/auth/client";
import { orgPath, createOrgPath } from "@workspace/routes";
import {
  Avatar,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { IconForAdd } from "@workspace/ui/components/icon-for";

export function OrgPickerPageContent() {
  const router = useRouter();
  const { data: orgsResult, isPending } = authClient.useListOrganizations();
  const organizations = orgsResult ?? [];

  const handleSelectOrg = async (orgId: string, slug: string) => {
    await authClient.organization.setActive({ organizationId: orgId });
    router.push(orgPath(slug));
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="mt-2 text-muted-foreground">
          Create your first organization to get started.
        </p>
        <Button className="mt-6" onClick={() => router.push(createOrgPath())}>
          <IconForAdd className="mr-2" />
          Create Organization
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Organizations</h1>
        <p className="mt-1 text-muted-foreground">
          Select an organization to continue.
        </p>
      </div>
      <div className="space-y-3">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => handleSelectOrg(org.id, org.slug)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {org.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-muted-foreground">{org.slug}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(createOrgPath())}
      >
        <IconForAdd className="mr-2" />
        Create Organization
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Delete the old dashboard page content**

Delete `apps/dashboard/features/dashboard/ui/dashboard-page-content.tsx` — it's replaced by the new org-picker component.

- [ ] **Step 4: Verify no import errors**

Run: `cd apps/dashboard && npx tsc --noEmit --pretty 2>&1 | tail -10`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/page.tsx \
  apps/dashboard/features/dashboard/ui/org-picker-page-content.tsx
git rm apps/dashboard/features/dashboard/ui/dashboard-page-content.tsx
git commit -m "feat(dashboard): replace root page with org-picker"
```

---

### Task 3: Delete unused nav-items.ts

**Files:**
- Delete: `apps/dashboard/nav-items.ts`

- [ ] **Step 1: Verify no remaining imports of `rootNavConfig`**

Run: `cd apps/dashboard && grep -r "rootNavConfig\|nav-items" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v ".next"`
Expected: No matches (the layout no longer imports it)

- [ ] **Step 2: Delete the file**

```bash
git rm apps/dashboard/nav-items.ts
```

- [ ] **Step 3: Verify build still passes**

Run: `cd apps/dashboard && npx next build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(dashboard): remove unused root nav config"
```

---

### Task 4: Verification

- [ ] **Step 1: Start dashboard and verify root page**

Run: `cd apps/dashboard && pnpm dev`

Open http://localhost:4000. Verify:
1. No sidebar visible — just a header with theme toggle + user avatar
2. Page shows "Your Organizations" heading (or empty state if no orgs)
3. Clicking an org card navigates to `/{org-slug}`
4. After navigating, the org view has the full sidebar as before
5. "Create Organization" button navigates to `/create-org`
6. `/create-org` still works and uses the minimal centered layout

- [ ] **Step 2: Verify org context unchanged**

Navigate to `/{org-slug}`. Verify:
1. Sidebar is present with org nav (Dashboard, Members, Settings)
2. OrgSwitcher still works in sidebar header
3. NavUser + ThemeToggle still in sidebar footer

- [ ] **Step 3: Final commit if adjustments needed**

```bash
git add -A
git commit -m "fix: adjust org-picker styling after manual testing"
```

Only commit if adjustments were made. Skip if everything works.
