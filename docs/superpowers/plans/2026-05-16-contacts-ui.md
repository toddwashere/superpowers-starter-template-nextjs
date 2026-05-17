# Contacts — Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** The backend plan (`2026-05-16-contacts-backend.md`) must be complete — `@workspace/contacts` must be published and the Prisma migration run before this plan starts.

**Goal:** Add the contacts dashboard — list, detail, tasks, and settings pages with server actions, nav integration, CSV import/export UI, and colocated server action types.

**Architecture:** Dashboard feature lives in `apps/dashboard/features/contacts/`. Server actions in `data/` call `@workspace/contacts` — no direct Prisma imports in the app. UI components in `ui/` are client or server components as needed. Four route segments under `/[org-slug]/contacts/`.

**Tech Stack:** Next.js 15 App Router, React 19, shadcn/ui, `@workspace/contacts`, Better Auth org guards, `requireOrgPermissionWithActiveOrg`.

---

## File Map

### Created
- `apps/dashboard/features/contacts/data/contact-types.ts`
- `apps/dashboard/features/contacts/data/contact-actions.ts`
- `apps/dashboard/features/contacts/data/stage-actions.ts`
- `apps/dashboard/features/contacts/data/tag-actions.ts`
- `apps/dashboard/features/contacts/data/segment-actions.ts`
- `apps/dashboard/features/contacts/data/interaction-actions.ts`
- `apps/dashboard/features/contacts/data/task-actions.ts`
- `apps/dashboard/features/contacts/data/csv-actions.ts`
- `apps/dashboard/features/contacts/ui/contacts-page-content.tsx`
- `apps/dashboard/features/contacts/ui/contact-detail-page-content.tsx`
- `apps/dashboard/features/contacts/ui/contacts-tasks-page-content.tsx`
- `apps/dashboard/features/contacts/ui/contacts-settings-page-content.tsx`
- `apps/dashboard/features/contacts/ui/contact-form.tsx`
- `apps/dashboard/features/contacts/ui/csv-import-dialog.tsx`
- `apps/dashboard/app/(organization)/[org-slug]/contacts/page.tsx`
- `apps/dashboard/app/(organization)/[org-slug]/contacts/[contact-id]/page.tsx`
- `apps/dashboard/app/(organization)/[org-slug]/contacts/tasks/page.tsx`
- `apps/dashboard/app/(organization)/[org-slug]/contacts/settings/page.tsx`

### Modified
- `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`

---

## Task 1: Nav item + route stubs

**Files:**
- Modify: `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`
- Create all four `page.tsx` stubs

- [ ] **Add Contacts icon** — check the icon registry first

```bash
grep -r "Contact\|Users\|People" apps/dashboard/src/components/icon-for.tsx \
  packages/ui/src/components/icon-for.tsx 2>/dev/null | head -10
```

If `IconForContacts` does not exist, use the `add-icon` skill to add it (Lucide `Users` icon is a good default). If it does exist, skip to the nav update.

- [ ] **Update `nav-items-org.ts`** — add Contacts between Dashboard and AI Assistant

```ts
import {
  IconForDashboard,
  IconForSettings,
  IconForAi,
  IconForContacts,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const orgNavConfig: NavConfig = {
  label: "Organization",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: IconForDashboard,
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: IconForContacts,
    },
    {
      title: "AI Assistant",
      href: "/ai",
      icon: IconForAi,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Members", href: "/settings/members" },
        { title: "Billing", href: "/settings/billing" },
        { title: "API Keys", href: "/settings/api-keys" },
      ],
    },
  ],
};
```

- [ ] **Create `contacts/page.tsx` stub**

```ts
// apps/dashboard/app/(organization)/[org-slug]/contacts/page.tsx
import type { Metadata } from "next";
import { ContactsPageContent } from "@/features/contacts/ui/contacts-page-content";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <ContactsPageContent orgSlug={orgSlug} />;
}
```

- [ ] **Create `contacts/[contact-id]/page.tsx` stub**

```ts
// apps/dashboard/app/(organization)/[org-slug]/contacts/[contact-id]/page.tsx
import type { Metadata } from "next";
import { ContactDetailPageContent } from "@/features/contacts/ui/contact-detail-page-content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ "org-slug": string; "contact-id": string }>;
}) {
  const { "org-slug": orgSlug, "contact-id": contactId } = await params;
  return <ContactDetailPageContent orgSlug={orgSlug} contactId={contactId} />;
}
```

- [ ] **Create `contacts/tasks/page.tsx` stub**

```ts
// apps/dashboard/app/(organization)/[org-slug]/contacts/tasks/page.tsx
import type { Metadata } from "next";
import { ContactsTasksPageContent } from "@/features/contacts/ui/contacts-tasks-page-content";

export const metadata: Metadata = { title: "Contact Tasks" };

export default async function ContactsTasksPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <ContactsTasksPageContent orgSlug={orgSlug} />;
}
```

- [ ] **Create `contacts/settings/page.tsx` stub**

```ts
// apps/dashboard/app/(organization)/[org-slug]/contacts/settings/page.tsx
import type { Metadata } from "next";
import { ContactsSettingsPageContent } from "@/features/contacts/ui/contacts-settings-page-content";

export const metadata: Metadata = { title: "Contacts Settings" };

export default async function ContactsSettingsPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <ContactsSettingsPageContent orgSlug={orgSlug} />;
}
```

- [ ] **Create placeholder UI files** — one line each, enough to satisfy the imports

```ts
// apps/dashboard/features/contacts/ui/contacts-page-content.tsx
"use client";
export function ContactsPageContent({ orgSlug }: { orgSlug: string }) {
  return <div>Contacts — {orgSlug}</div>;
}
```

Repeat for the other three content components with matching function names.

- [ ] **Start dev server and verify routes load**

```bash
pnpm dev
```

Open:
- `http://localhost:3000/acme-inc/contacts` → "Contacts — acme-inc"
- `http://localhost:3000/acme-inc/contacts/tasks` → "Contact Tasks — acme-inc"
- `http://localhost:3000/acme-inc/contacts/settings` → "Contacts Settings — acme-inc"
- Verify Contacts appears in the sidebar nav

- [ ] **Commit**

```bash
git add apps/dashboard/app/(organization)/[org-slug]/contacts/ \
        apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts \
        apps/dashboard/features/contacts/
git commit -m "feat(dashboard): add contacts routes and nav item"
```

---

## Task 2: Shared types and server action foundations

**Files:**
- Create: `apps/dashboard/features/contacts/data/contact-types.ts`
- Create: `apps/dashboard/features/contacts/data/contact-actions.ts`

- [ ] **Write `contact-types.ts`**

```ts
// apps/dashboard/features/contacts/data/contact-types.ts
import { z } from "zod";

export const ContactFormSchema = z.object({
  kind: z.enum(["person", "company"]),
  displayName: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  primaryEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  primaryPhone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  parentContactId: z.string().optional(),
  stageId: z.string().optional(),
  source: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- [ ] **Write `contact-actions.ts`**

```ts
// apps/dashboard/features/contacts/data/contact-actions.ts
"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactsForOrg,
  getContactById,
  createContactWithValidation,
  updateContactWithValidation,
  archiveContact,
} from "@workspace/contacts";
import type { ContactListFilters, CreateContactInput, UpdateContactInput } from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listContactsAction(filters: Partial<ContactListFilters> = {}) {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactsForOrg(activeOrganizationId, filters);
}

export async function getContactAction(contactId: string) {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return getContactById(contactId, activeOrganizationId);
}

export async function createContactAction(
  data: CreateContactInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const contact = await createContactWithValidation(activeOrganizationId, data);
    return { success: true, data: { id: contact.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create contact" };
  }
}

export async function updateContactAction(
  contactId: string,
  data: UpdateContactInput,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await updateContactWithValidation(contactId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update contact" };
  }
}

export async function archiveContactAction(contactId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await archiveContact(contactId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive contact" };
  }
}
```

- [ ] **Write remaining server action files**

`stage-actions.ts`:
```ts
// apps/dashboard/features/contacts/data/stage-actions.ts
"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactStagesForOrg,
  createContactStage,
  updateContactStage,
  deleteContactStage,
} from "@workspace/contacts";
import type { CreateContactStageInput, UpdateContactStageInput } from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listStagesAction() {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactStagesForOrg(activeOrganizationId);
}

export async function createStageAction(data: CreateContactStageInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await createContactStage(activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create stage" };
  }
}

export async function updateStageAction(stageId: string, data: UpdateContactStageInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await updateContactStage(stageId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update stage" };
  }
}

export async function deleteStageAction(stageId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await deleteContactStage(stageId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete stage" };
  }
}
```

`tag-actions.ts`:
```ts
// apps/dashboard/features/contacts/data/tag-actions.ts
"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactTagsForOrg,
  createContactTag,
  updateContactTag,
  deleteContactTag,
  addTagToContact,
  removeTagFromContact,
} from "@workspace/contacts";
import type { CreateContactTagInput } from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listTagsAction() {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactTagsForOrg(activeOrganizationId);
}

export async function createTagAction(data: CreateContactTagInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await createContactTag(activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create tag" };
  }
}

export async function deleteTagAction(tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await deleteContactTag(tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete tag" };
  }
}

export async function addTagToContactAction(contactId: string, tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await addTagToContact(contactId, tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add tag" };
  }
}

export async function removeTagFromContactAction(contactId: string, tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await removeTagFromContact(contactId, tagId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove tag" };
  }
}
```

`interaction-actions.ts`:
```ts
// apps/dashboard/features/contacts/data/interaction-actions.ts
"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import { createContactInteraction, listContactInteractions } from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listInteractionsAction(contactId: string) {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactInteractions(contactId, activeOrganizationId);
}

export async function createNoteAction(
  contactId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const { session, activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await createContactInteraction(contactId, activeOrganizationId, session.user.id, {
      body,
      type: "note",
    });
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create note" };
  }
}
```

`task-actions.ts`:
```ts
// apps/dashboard/features/contacts/data/task-actions.ts
"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactTasksForOrg,
  listContactTasksForContact,
  createContactTask,
  updateContactTask,
  archiveContactTask,
  listContactTaskStatusesForOrg,
  createContactTaskStatus,
  updateContactTaskStatus,
  deleteContactTaskStatus,
} from "@workspace/contacts";
import type { CreateContactTaskInput, UpdateContactTaskInput, CreateContactTaskStatusInput } from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listTaskStatusesAction() {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactTaskStatusesForOrg(activeOrganizationId);
}

export async function listOrgTasksAction(filters: { statusId?: string; assigneeId?: string } = {}) {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactTasksForOrg(activeOrganizationId, filters);
}

export async function listContactTasksAction(contactId: string) {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
  return listContactTasksForContact(contactId, activeOrganizationId);
}

export async function createTaskAction(data: CreateContactTaskInput): Promise<ActionResult> {
  try {
    const { session, activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await createContactTask(activeOrganizationId, session.user.id, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create task" };
  }
}

export async function updateTaskAction(taskId: string, data: UpdateContactTaskInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await updateContactTask(taskId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update task" };
  }
}

export async function archiveTaskAction(taskId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await archiveContactTask(taskId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive task" };
  }
}

export async function createTaskStatusAction(data: CreateContactTaskStatusInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await createContactTaskStatus(activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create task status" };
  }
}

export async function updateTaskStatusAction(statusId: string, data: CreateContactTaskStatusInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await updateContactTaskStatus(statusId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update task status" };
  }
}

export async function deleteTaskStatusAction(statusId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await deleteContactTaskStatus(statusId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete task status" };
  }
}
```

`csv-actions.ts`:
```ts
// apps/dashboard/features/contacts/data/csv-actions.ts
"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  parseContactsCsv,
  exportContactsToCsv,
  createContactWithValidation,
  listContactsForOrg,
} from "@workspace/contacts";
import type { ActionResult, CsvPreviewResult } from "@workspace/contacts";

export async function previewCsvImportAction(
  csvText: string,
): Promise<ActionResult<CsvPreviewResult>> {
  try {
    await requireOrgPermissionWithActiveOrg({});
    const result = parseContactsCsv(csvText);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to parse CSV" };
  }
}

export async function commitCsvImportAction(csvText: string): Promise<ActionResult<{ imported: number }>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const { valid } = parseContactsCsv(csvText);
    let imported = 0;
    for (const row of valid) {
      await createContactWithValidation(activeOrganizationId, {
        kind: row.kind,
        displayName: row.displayName,
        firstName: row.firstName,
        lastName: row.lastName,
        companyName: row.companyName,
        primaryEmail: row.primaryEmail,
        primaryPhone: row.primaryPhone,
        website: row.website,
        source: row.source,
      });
      imported++;
    }
    return { success: true, data: { imported } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Import failed" };
  }
}

export async function exportContactsCsvAction(): Promise<ActionResult<string>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const contacts = await listContactsForOrg(activeOrganizationId, { limit: 5000 });
    const csv = exportContactsToCsv(
      contacts.map((c) => ({
        displayName: c.displayName,
        kind: c.kind as "person" | "company",
        firstName: c.firstName ?? undefined,
        lastName: c.lastName ?? undefined,
        companyName: c.companyName ?? undefined,
        primaryEmail: c.primaryEmail ?? undefined,
        primaryPhone: c.primaryPhone ?? undefined,
        website: c.website ?? undefined,
        source: c.source ?? undefined,
      })),
    );
    return { success: true, data: csv };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Export failed" };
  }
}
```

- [ ] **Run type-check to verify all actions compile**

```bash
cd apps/dashboard && pnpm type-check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add apps/dashboard/features/contacts/data/
git commit -m "feat(dashboard): add contacts server actions"
```

---

## Task 3: Contacts list page

**Files:**
- Modify: `apps/dashboard/features/contacts/ui/contacts-page-content.tsx`

- [ ] **Replace placeholder with the full contacts list component**

```tsx
// apps/dashboard/features/contacts/ui/contacts-page-content.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { IconForMore, IconForAdd } from "@workspace/ui/components/icon-for";
import { listContactsAction, archiveContactAction } from "../data/contact-actions";
import { exportContactsCsvAction } from "../data/csv-actions";
import { CsvImportDialog } from "./csv-import-dialog";

type Contact = Awaited<ReturnType<typeof listContactsAction>>[number];

export function ContactsPageContent({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  function load(q: string) {
    startTransition(async () => {
      const result = await listContactsAction({ search: q || undefined });
      setContacts(result);
    });
  }

  useEffect(() => { load(""); }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    load(e.target.value);
  }

  async function handleArchive(id: string) {
    await archiveContactAction(id);
    load(search);
  }

  async function handleExport() {
    const result = await exportContactsCsvAction();
    if (!result.success) return;
    const blob = new Blob([result.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="flex gap-2">
          <CsvImportDialog onImported={() => load(search)} />
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Button onClick={() => router.push(`/${orgSlug}/contacts/new`)}>
            <IconForAdd className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search contacts…"
        value={search}
        onChange={handleSearchChange}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No contacts yet.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/${orgSlug}/contacts/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.displayName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.kind}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.primaryEmail ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.stage ? (
                      <Badge style={{ backgroundColor: c.stage.color }} className="text-white">
                        {c.stage.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <IconForMore className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/${orgSlug}/contacts/${c.id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleArchive(c.id)}
                        >
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Write the `CsvImportDialog` component**

```tsx
// apps/dashboard/features/contacts/ui/csv-import-dialog.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { previewCsvImportAction, commitCsvImportAction } from "../data/csv-actions";

type Preview = Awaited<ReturnType<typeof previewCsvImportAction>>;

export function CsvImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      startTransition(async () => {
        const result = await previewCsvImportAction(text);
        setPreview(result);
      });
    };
    reader.readAsText(file);
  }

  function handleCommit() {
    startTransition(async () => {
      const result = await commitCsvImportAction(csvText);
      if (result.success) {
        setOpen(false);
        setCsvText("");
        setPreview(null);
        onImported();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} />

          {preview && preview.success && (
            <div className="space-y-2 text-sm">
              <p className="text-green-600">{preview.data.valid.length} valid row(s) ready to import.</p>
              {preview.data.errors.length > 0 && (
                <div>
                  <p className="font-medium text-destructive">Errors ({preview.data.errors.length}):</p>
                  <ul className="list-disc pl-4 text-destructive">
                    {preview.data.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>Row {e.row}: {e.field} — {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {preview.data.duplicateWarnings.length > 0 && (
                <p className="text-yellow-600">
                  {preview.data.duplicateWarnings.length} duplicate email(s) detected.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!preview?.success || (preview?.data?.valid.length ?? 0) === 0 || isPending}
            onClick={handleCommit}
          >
            {isPending ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Verify in browser**

Navigate to `/acme-inc/contacts`. Confirm:
- Table renders with header row
- Search input appears
- New Contact, Export CSV, Import CSV buttons visible
- Import CSV dialog opens

- [ ] **Commit**

```bash
git add apps/dashboard/features/contacts/ui/
git commit -m "feat(dashboard): contacts list page with search, CSV import/export"
```

---

## Task 4: Contact detail page

**Files:**
- Modify: `apps/dashboard/features/contacts/ui/contact-detail-page-content.tsx`

- [ ] **Replace placeholder with full detail component**

```tsx
// apps/dashboard/features/contacts/ui/contact-detail-page-content.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { getContactAction } from "../data/contact-actions";
import { listInteractionsAction, createNoteAction } from "../data/interaction-actions";
import { listContactTasksAction } from "../data/task-actions";

type Contact = Awaited<ReturnType<typeof getContactAction>>;
type Interactions = Awaited<ReturnType<typeof listInteractionsAction>>;
type Tasks = Awaited<ReturnType<typeof listContactTasksAction>>;

export function ContactDetailPageContent({
  orgSlug,
  contactId,
}: {
  orgSlug: string;
  contactId: string;
}) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact>(null);
  const [interactions, setInteractions] = useState<Interactions>([]);
  const [tasks, setTasks] = useState<Tasks>([]);
  const [noteBody, setNoteBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const [c, i, t] = await Promise.all([
        getContactAction(contactId),
        listInteractionsAction(contactId),
        listContactTasksAction(contactId),
      ]);
      setContact(c);
      setInteractions(i);
      setTasks(t);
    });
  }

  useEffect(() => { load(); }, [contactId]);

  async function handleAddNote() {
    if (!noteBody.trim()) return;
    await createNoteAction(contactId, noteBody.trim());
    setNoteBody("");
    load();
  }

  if (!contact && !isPending) {
    return <p className="text-muted-foreground">Contact not found.</p>;
  }

  if (!contact) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contact.displayName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{contact.kind}</Badge>
            {contact.stage && (
              <Badge style={{ backgroundColor: contact.stage.color }} className="text-white">
                {contact.stage.name}
              </Badge>
            )}
            {contact.tags.map((a) => (
              <Badge key={a.tagId} variant="secondary">{a.tag.name}</Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {contact.primaryEmail && (
          <div><span className="text-muted-foreground">Email: </span>{contact.primaryEmail}</div>
        )}
        {contact.primaryPhone && (
          <div><span className="text-muted-foreground">Phone: </span>{contact.primaryPhone}</div>
        )}
        {contact.website && (
          <div><span className="text-muted-foreground">Website: </span>{contact.website}</div>
        )}
        {contact.parent && (
          <div>
            <span className="text-muted-foreground">Parent: </span>
            <button
              className="underline"
              onClick={() => router.push(`/${orgSlug}/contacts/${contact.parent!.id}`)}
            >
              {contact.parent.displayName}
            </button>
          </div>
        )}
      </div>

      {contact.children.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-1">Related ({contact.children.length})</h2>
          <div className="flex flex-wrap gap-2">
            {contact.children.map((child) => (
              <Badge
                key={child.id}
                variant="outline"
                className="cursor-pointer"
                onClick={() => router.push(`/${orgSlug}/contacts/${child.id}`)}
              >
                {child.displayName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <h2 className="font-semibold mb-2">Open Tasks ({tasks.filter((t) => !t.completedAt).length})</h2>
        {tasks.filter((t) => !t.completedAt).length === 0 ? (
          <p className="text-sm text-muted-foreground">No open tasks.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {tasks.filter((t) => !t.completedAt).map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <Badge variant="outline">{task.status?.name ?? "No status"}</Badge>
                {task.title}
                {task.dueAt && (
                  <span className="text-muted-foreground ml-auto">
                    Due {new Date(task.dueAt).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold mb-2">Notes & Activity</h2>
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Add a note…"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={handleAddNote} disabled={!noteBody.trim() || isPending}>
            Add Note
          </Button>
        </div>

        <div className="space-y-3">
          {interactions.map((i) => (
            <div key={i.id} className="text-sm border rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{i.type}</Badge>
                <span className="text-muted-foreground text-xs">
                  {new Date(i.happenedAt).toLocaleString()}
                </span>
              </div>
              <p>{i.body}</p>
            </div>
          ))}
          {interactions.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Verify in browser**

Navigate to a contact detail page. Confirm:
- Contact name, kind, stage badge, tags visible
- Notes section with textarea + Add Note button
- Add a note and verify it appears after reload

- [ ] **Commit**

```bash
git add apps/dashboard/features/contacts/ui/contact-detail-page-content.tsx
git commit -m "feat(dashboard): contact detail page with notes and tasks"
```

---

## Task 5: Contact tasks page

**Files:**
- Modify: `apps/dashboard/features/contacts/ui/contacts-tasks-page-content.tsx`

- [ ] **Replace placeholder with task board component**

```tsx
// apps/dashboard/features/contacts/ui/contacts-tasks-page-content.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { listOrgTasksAction, updateTaskAction } from "../data/task-actions";
import { listTaskStatusesAction } from "../data/task-actions";

type Task = Awaited<ReturnType<typeof listOrgTasksAction>>[number];
type Status = Awaited<ReturnType<typeof listTaskStatusesAction>>[number];

export function ContactsTasksPageContent({ orgSlug: _orgSlug }: { orgSlug: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isPending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const [t, s] = await Promise.all([listOrgTasksAction(), listTaskStatusesAction()]);
      setTasks(t);
      setStatuses(s);
    });
  }

  useEffect(() => { load(); }, []);

  async function handleComplete(taskId: string) {
    const terminal = statuses.find((s) => s.isTerminal);
    await updateTaskAction(taskId, {
      statusId: terminal?.id,
      completedAt: new Date(),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contact Tasks</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading…</TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No tasks yet.</TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.contact?.displayName ?? "—"}
                  </TableCell>
                  <TableCell>
                    {task.status ? (
                      <Badge style={{ backgroundColor: task.status.color }} className="text-white">
                        {task.status.name}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.priority === "high" ? "destructive" : "outline"}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {!task.completedAt && (
                      <Button size="sm" variant="outline" onClick={() => handleComplete(task.id)}>
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Verify in browser**

Navigate to `/acme-inc/contacts/tasks`. Confirm table renders. Complete a task and verify it disappears from the open list.

- [ ] **Commit**

```bash
git add apps/dashboard/features/contacts/ui/contacts-tasks-page-content.tsx
git commit -m "feat(dashboard): contact tasks list page"
```

---

## Task 6: Contacts settings page

**Files:**
- Modify: `apps/dashboard/features/contacts/ui/contacts-settings-page-content.tsx`

- [ ] **Replace placeholder with settings component**

```tsx
// apps/dashboard/features/contacts/ui/contacts-settings-page-content.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  listStagesAction,
  createStageAction,
  deleteStageAction,
} from "../data/stage-actions";
import {
  listTagsAction,
  createTagAction,
  deleteTagAction,
} from "../data/tag-actions";
import {
  listTaskStatusesAction,
  createTaskStatusAction,
  deleteTaskStatusAction,
} from "../data/task-actions";

type Stage = Awaited<ReturnType<typeof listStagesAction>>[number];
type Tag = Awaited<ReturnType<typeof listTagsAction>>[number];
type Status = Awaited<ReturnType<typeof listTaskStatusesAction>>[number];

export function ContactsSettingsPageContent({ orgSlug: _orgSlug }: { orgSlug: string }) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [isPending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const [s, t, ts] = await Promise.all([
        listStagesAction(),
        listTagsAction(),
        listTaskStatusesAction(),
      ]);
      setStages(s);
      setTags(t);
      setStatuses(ts);
    });
  }

  useEffect(() => { load(); }, []);

  async function handleAddStage() {
    if (!newStageName.trim()) return;
    await createStageAction({ name: newStageName.trim(), color: "#6366f1", sortOrder: stages.length, isDefault: false });
    setNewStageName("");
    load();
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    await createTagAction({ name: newTagName.trim(), color: "#6366f1" });
    setNewTagName("");
    load();
  }

  async function handleAddStatus() {
    if (!newStatusName.trim()) return;
    await createTaskStatusAction({ name: newStatusName.trim(), color: "#6366f1", sortOrder: statuses.length, isDefault: false, isTerminal: false });
    setNewStatusName("");
    load();
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Contacts Settings</h1>

      {/* Stages */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contact Stages</h2>
        <div className="flex flex-wrap gap-2">
          {stages.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <Badge style={{ backgroundColor: s.color }} className="text-white">{s.name}</Badge>
              {!s.isDefault && (
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground"
                  onClick={() => { void deleteStageAction(s.id).then(() => load()); }}>
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New stage name"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={handleAddStage} disabled={isPending}>Add Stage</Button>
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <div key={t.id} className="flex items-center gap-1">
              <Badge variant="secondary">{t.name}</Badge>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground"
                onClick={() => { void deleteTagAction(t.id).then(() => load()); }}>
                ×
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={handleAddTag} disabled={isPending}>Add Tag</Button>
        </div>
      </section>

      <Separator />

      {/* Task Statuses */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Task Statuses</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <Badge style={{ backgroundColor: s.color }} className="text-white">
                {s.name}{s.isTerminal ? " ✓" : ""}
              </Badge>
              {!s.isDefault && (
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground"
                  onClick={() => { void deleteTaskStatusAction(s.id).then(() => load()); }}>
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New status name"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={handleAddStatus} disabled={isPending}>Add Status</Button>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Verify in browser**

Navigate to `/acme-inc/contacts/settings`. Confirm:
- Seeded stages (New, Active, Nurturing, Customer, Partner, Inactive) appear
- Seeded task statuses (To Do, In Progress, Done) appear
- Add a new stage and verify it appears
- Add a new tag and verify it appears

- [ ] **Commit**

```bash
git add apps/dashboard/features/contacts/ui/contacts-settings-page-content.tsx
git commit -m "feat(dashboard): contacts settings page for stages, tags, task statuses"
```

---

## Task 7: Final type-check and verification

- [ ] **Run dashboard type-check**

```bash
cd apps/dashboard && pnpm type-check
```

Expected: no errors. Fix any type errors before continuing.

- [ ] **Run full workspace type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Smoke test all four routes in browser**

| Route | What to verify |
|-------|---------------|
| `/acme-inc/contacts` | Table loads, search works, Export CSV downloads a file |
| `/acme-inc/contacts/<id>` | Contact fields, tags, notes section, add-note flow |
| `/acme-inc/contacts/tasks` | Table loads, Complete button marks a task done |
| `/acme-inc/contacts/settings` | Stages, tags, task statuses listed; can add new ones |

- [ ] **Verify nav item appears and is active on contacts routes**

- [ ] **Commit any remaining changes**

```bash
git add -p
git commit -m "feat(dashboard): contacts UI complete"
```

---

## After both plans complete

When the backend and UI plans are both done:

1. Invoke `superpowers:verification-before-completion` before claiming completion.
2. Run `pnpm test` and `pnpm type-check` across the full workspace.
3. Invoke `superpowers:requesting-code-review` for a final review pass.
4. Invoke `superpowers:finishing-a-development-branch` to merge or create a PR.
