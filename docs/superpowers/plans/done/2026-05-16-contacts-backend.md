# Contacts — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the contacts domain backend — Prisma schema, `packages/contacts` domain package with data-model repos, services, CSV logic, prefixed-ID infrastructure, and MCP tool definitions.

**Architecture:** Schema lives in `packages/database/prisma/contacts.prisma`. All business logic, repos, and services live in `packages/contacts`. Repos go under `src/data-models/`. MCP tool definitions go in `packages/tool-calls/src/tools/contact-tools.ts` and call into `@workspace/contacts`. `ToolDefinition` is extended with an optional `inputShape` so tools can declare typed input parameters.

**Tech Stack:** Prisma 7 (PostgreSQL), Zod 3, papaparse, Vitest 3, `@workspace/common/create-id` (to be created), MCP SDK 1.x, Better Auth org context.

---

## Implementation status (2026-05-20)

### Done

- Prefixed IDs (`packages/common/src/create-id.ts`)
- Prisma schema + migration (`contacts.prisma`, `20260517024946_add_contacts_domain`)
- `packages/contacts` package: schemas, all repos (contact, stage, tag, segment, interaction, task, task status), services (contact validation, segment filters, CSV parse/export), public exports
- Colocated Vitest coverage for repos and services
- Demo org seed for default stages and task statuses (`packages/database/prisma/seed.ts`)
- MCP contact tools in `packages/tool-calls/src/tools/contact-tools.ts` + registry wiring
- Interaction archive migration (`20260517054100_add_contact_interaction_archive`)

### Completed in follow-up (2026-05-20)

- [x] `setContactTagsForContact`, `parseTagNamesFromCsv`, `formatContactTagsForCsv` (`contact-tag-service.ts` + tests)
- [x] `listContactsForSegment` in segment service (segment-service.test.ts mocks prisma)
- [x] CSV import applies `tags` column; export includes assigned tag names (dashboard `contact-csv-actions.ts`)

### Deferred (not required for v1)

- [ ] Org bootstrap on first contacts use (demo org seed covers local dev; new orgs create stages/tags via settings UI)

> Historical task checkboxes below are left for reference; prefer this status section for current truth.

---

## File Map

### Created
- `packages/common/src/create-id.ts` — prefixed ID generator
- `packages/database/prisma/contacts.prisma` — all contact Prisma models
- `packages/contacts/package.json`
- `packages/contacts/tsconfig.json`
- `packages/contacts/vitest.config.ts`
- `packages/contacts/src/index.ts` — public API
- `packages/contacts/src/schemas/contact-schemas.ts`
- `packages/contacts/src/schemas/stage-schemas.ts`
- `packages/contacts/src/schemas/tag-schemas.ts`
- `packages/contacts/src/schemas/segment-schemas.ts`
- `packages/contacts/src/schemas/interaction-schemas.ts`
- `packages/contacts/src/schemas/task-schemas.ts`
- `packages/contacts/src/data-models/contact-repo.ts`
- `packages/contacts/src/data-models/contact-repo.test.ts`
- `packages/contacts/src/data-models/contact-stage-repo.ts`
- `packages/contacts/src/data-models/contact-stage-repo.test.ts`
- `packages/contacts/src/data-models/contact-tag-repo.ts`
- `packages/contacts/src/data-models/contact-tag-repo.test.ts`
- `packages/contacts/src/data-models/contact-segment-repo.ts`
- `packages/contacts/src/data-models/contact-segment-repo.test.ts`
- `packages/contacts/src/data-models/contact-interaction-repo.ts`
- `packages/contacts/src/data-models/contact-interaction-repo.test.ts`
- `packages/contacts/src/data-models/contact-task-repo.ts`
- `packages/contacts/src/data-models/contact-task-repo.test.ts`
- `packages/contacts/src/data-models/contact-task-status-repo.ts`
- `packages/contacts/src/data-models/contact-task-status-repo.test.ts`
- `packages/contacts/src/services/contact-service.ts`
- `packages/contacts/src/services/contact-service.test.ts`
- `packages/contacts/src/services/segment-service.ts`
- `packages/contacts/src/services/segment-service.test.ts`
- `packages/contacts/src/services/csv-service.ts`
- `packages/contacts/src/services/csv-service.test.ts`
- `packages/tool-calls/src/tools/contact-tools.ts`
- `packages/tool-calls/src/tools/contact-tools.test.ts`
- `packages/tool-calls/src/tools/account-info.test.ts` (moved from `__tests__/`)
- `packages/tool-calls/src/registry.test.ts` (moved from `__tests__/`)

### Modified
- `packages/common/src/index.ts` — export `createId`, `IdPrefix`
- `packages/common/package.json` — no new deps needed (uses node:crypto)
- `packages/database/prisma/seed.ts` — add default stages and task statuses
- `packages/tool-calls/src/tool-definition.ts` — add `inputShape` field
- `packages/tool-calls/src/tools/account-info.ts` — update `run` signature
- `packages/tool-calls/src/registry.ts` — add contact tools
- `apps/public-mcp/src/tools/registry.ts` — pass input args to `tool.run`
- `apps/public-mcp/src/tools/account.test.ts` — update `run` call signature

### Deleted
- `packages/tool-calls/src/__tests__/account-info.test.ts`
- `packages/tool-calls/src/__tests__/registry.test.ts`

---

## Task 1: Prefixed ID infrastructure

**Files:**
- Create: `packages/common/src/create-id.ts`
- Modify: `packages/common/src/index.ts`

- [ ] **Write `create-id.ts`**

```ts
// packages/common/src/create-id.ts
import { randomUUID } from "node:crypto";

export type AuthIdPrefix = "user" | "org" | "mbr";
export type ContactsIdPrefix =
  | "contact"
  | "cstage"
  | "ctag"
  | "cseg"
  | "cint"
  | "ctask"
  | "ctstatus";
export type McpIdPrefix = "mcptcl";

export type IdPrefix = AuthIdPrefix | ContactsIdPrefix | McpIdPrefix | "tmp";

export function createId(prefix: IdPrefix): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}
```

- [ ] **Update `packages/common/src/index.ts`**

```ts
export { createId } from "./create-id";
export type { IdPrefix, AuthIdPrefix, ContactsIdPrefix, McpIdPrefix } from "./create-id";
```

- [ ] **Run type-check**

```bash
cd packages/common && pnpm type-check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add packages/common/src/create-id.ts packages/common/src/index.ts
git commit -m "feat(common): add prefixed ID generator"
```

---

## Task 2: Prisma schema — `contacts.prisma`

**Files:**
- Create: `packages/database/prisma/contacts.prisma`

- [ ] **Write `contacts.prisma`**

```prisma
// packages/database/prisma/contacts.prisma

model Contact {
  id              String    @id
  organizationId  String
  kind            String    // "person" | "company"
  displayName     String
  firstName       String?
  lastName        String?
  companyName     String?
  primaryEmail    String?
  primaryPhone    String?
  website         String?
  parentContactId String?
  stageId         String?
  ownerId         String?
  source          String?
  status          String    @default("active")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  archivedAt      DateTime?

  stage        ContactStage?         @relation(fields: [stageId], references: [id])
  parent       Contact?              @relation("ContactHierarchy", fields: [parentContactId], references: [id])
  children     Contact[]             @relation("ContactHierarchy")
  tags         ContactTagAssignment[]
  interactions ContactInteraction[]
  tasks        ContactTask[]

  @@index([organizationId, displayName])
  @@index([organizationId, kind])
  @@index([organizationId, stageId])
  @@index([organizationId, ownerId])
  @@index([organizationId, archivedAt])
  @@index([parentContactId])
}

model ContactStage {
  id             String    @id
  organizationId String
  name           String
  color          String    @default("#6366f1")
  sortOrder      Int       @default(0)
  isDefault      Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  contacts Contact[]

  @@unique([organizationId, name])
}

model ContactTag {
  id             String    @id
  organizationId String
  name           String
  color          String    @default("#6366f1")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  assignments ContactTagAssignment[]

  @@unique([organizationId, name])
}

model ContactTagAssignment {
  contactId String
  tagId     String
  createdAt DateTime @default(now())

  contact Contact    @relation(fields: [contactId], references: [id], onDelete: Cascade)
  tag     ContactTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([contactId, tagId])
}

model ContactSegment {
  id             String   @id
  organizationId String
  name           String
  filters        Json
  filterVersion  Int      @default(1)
  sortKey        String   @default("displayName")
  sortDirection  String   @default("asc")
  createdById    String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ContactInteraction {
  id             String   @id
  organizationId String
  contactId      String
  type           String   @default("note")
  body           String
  happenedAt     DateTime @default(now())
  createdById    String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  contact Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([contactId, happenedAt])
}

model ContactTask {
  id             String    @id
  organizationId String
  contactId      String
  title          String
  description    String?
  statusId       String?
  assigneeId     String?
  priority       String    @default("medium")
  dueAt          DateTime?
  completedAt    DateTime?
  sortOrder      Int       @default(0)
  createdById    String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  archivedAt     DateTime?

  contact Contact            @relation(fields: [contactId], references: [id], onDelete: Cascade)
  status  ContactTaskStatus? @relation(fields: [statusId], references: [id])

  @@index([organizationId, statusId])
  @@index([organizationId, assigneeId])
  @@index([organizationId, dueAt])
}

model ContactTaskStatus {
  id             String   @id
  organizationId String
  name           String
  color          String   @default("#6366f1")
  sortOrder      Int      @default(0)
  isDefault      Boolean  @default(false)
  isTerminal     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tasks ContactTask[]

  @@unique([organizationId, name])
}
```

- [ ] **Run migration**

```bash
cd packages/database && pnpm db:migrate
```

When prompted, name the migration: `add_contacts_domain`

Expected: Migration succeeds, new tables created.

- [ ] **Regenerate Prisma client**

```bash
cd packages/database && pnpm db:generate
```

- [ ] **Commit**

```bash
git add packages/database/prisma/contacts.prisma packages/database/prisma/migrations/
git commit -m "feat(db): add contacts domain schema"
```

---

## Task 3: Scaffold `packages/contacts`

**Files:**
- Create: `packages/contacts/package.json`
- Create: `packages/contacts/tsconfig.json`
- Create: `packages/contacts/vitest.config.ts`
- Create: `packages/contacts/src/index.ts`

- [ ] **Write `package.json`**

```json
{
  "name": "@workspace/contacts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@workspace/common": "workspace:*",
    "@workspace/database": "workspace:*",
    "papaparse": "^5",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/papaparse": "^5",
    "@workspace/tooling": "workspace:*",
    "typescript": "^5.7",
    "vitest": "^3"
  }
}
```

- [ ] **Write `tsconfig.json`**

```json
{
  "extends": "@workspace/tooling/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Write `src/index.ts` skeleton** (will be populated as repos/services are built)

```ts
// Schemas
export * from "./schemas/contact-schemas";
export * from "./schemas/stage-schemas";
export * from "./schemas/tag-schemas";
export * from "./schemas/segment-schemas";
export * from "./schemas/interaction-schemas";
export * from "./schemas/task-schemas";

// Repositories
export * from "./data-models/contact-repo";
export * from "./data-models/contact-stage-repo";
export * from "./data-models/contact-tag-repo";
export * from "./data-models/contact-segment-repo";
export * from "./data-models/contact-interaction-repo";
export * from "./data-models/contact-task-repo";
export * from "./data-models/contact-task-status-repo";

// Services
export * from "./services/contact-service";
export * from "./services/segment-service";
export * from "./services/csv-service";
```

- [ ] **Install dependencies**

```bash
pnpm install
```

- [ ] **Run type-check** (will fail until schemas are written — that's expected)

```bash
cd packages/contacts && pnpm type-check 2>&1 | head -5
```

Expected: errors about missing modules (not a schema error).

- [ ] **Commit**

```bash
git add packages/contacts/
git commit -m "feat(contacts): scaffold contacts package"
```

---

## Task 4: Zod schemas

**Files:**
- Create all six schema files in `packages/contacts/src/schemas/`

- [ ] **Write `contact-schemas.ts`**

```ts
// packages/contacts/src/schemas/contact-schemas.ts
import { z } from "zod";

export const ContactKindSchema = z.enum(["person", "company"]);
export type ContactKind = z.infer<typeof ContactKindSchema>;

export const ContactStatusSchema = z.enum(["active", "inactive"]);

export const CreateContactSchema = z.object({
  kind: ContactKindSchema,
  displayName: z.string().min(1).max(255),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  companyName: z.string().max(255).optional(),
  primaryEmail: z.string().email().optional(),
  primaryPhone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  parentContactId: z.string().optional(),
  stageId: z.string().optional(),
  ownerId: z.string().optional(),
  source: z.string().max(100).optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const ContactListFiltersSchema = z.object({
  search: z.string().optional(),
  kind: ContactKindSchema.optional(),
  stageId: z.string().optional(),
  tagId: z.string().optional(),
  includeArchived: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type ContactListFilters = z.infer<typeof ContactListFiltersSchema>;
```

- [ ] **Write `stage-schemas.ts`**

```ts
// packages/contacts/src/schemas/stage-schemas.ts
import { z } from "zod";

export const CreateContactStageSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
});

export const UpdateContactStageSchema = CreateContactStageSchema.partial();

export type CreateContactStageInput = z.infer<typeof CreateContactStageSchema>;
export type UpdateContactStageInput = z.infer<typeof UpdateContactStageSchema>;
```

- [ ] **Write `tag-schemas.ts`**

```ts
// packages/contacts/src/schemas/tag-schemas.ts
import { z } from "zod";

export const CreateContactTagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export const UpdateContactTagSchema = CreateContactTagSchema.partial();

export type CreateContactTagInput = z.infer<typeof CreateContactTagSchema>;
export type UpdateContactTagInput = z.infer<typeof UpdateContactTagSchema>;
```

- [ ] **Write `segment-schemas.ts`**

```ts
// packages/contacts/src/schemas/segment-schemas.ts
import { z } from "zod";

export const CURRENT_FILTER_VERSION = 1;

export const ContactSegmentFilterSchemaV1 = z
  .object({
    search: z.string().optional(),
    kind: z.enum(["person", "company"]).optional(),
    stageId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    includeArchived: z.boolean().optional(),
  })
  .strict();

export type ContactSegmentFilterV1 = z.infer<typeof ContactSegmentFilterSchemaV1>;

export const CreateContactSegmentSchema = z.object({
  name: z.string().min(1).max(255),
  filters: ContactSegmentFilterSchemaV1,
  sortKey: z.string().default("displayName"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export const UpdateContactSegmentSchema = CreateContactSegmentSchema.partial();

export type CreateContactSegmentInput = z.infer<typeof CreateContactSegmentSchema>;
export type UpdateContactSegmentInput = z.infer<typeof UpdateContactSegmentSchema>;
```

- [ ] **Write `interaction-schemas.ts`**

```ts
// packages/contacts/src/schemas/interaction-schemas.ts
import { z } from "zod";

export const InteractionTypeSchema = z.enum([
  "note",
  "call",
  "email",
  "meeting",
  "sms",
  "other",
]);
export type InteractionType = z.infer<typeof InteractionTypeSchema>;

export const CreateContactInteractionSchema = z.object({
  type: InteractionTypeSchema.default("note"),
  body: z.string().min(1),
  happenedAt: z.coerce.date().optional(),
});

export const UpdateContactInteractionSchema = CreateContactInteractionSchema.partial();

export type CreateContactInteractionInput = z.infer<typeof CreateContactInteractionSchema>;
export type UpdateContactInteractionInput = z.infer<typeof UpdateContactInteractionSchema>;
```

- [ ] **Write `task-schemas.ts`**

```ts
// packages/contacts/src/schemas/task-schemas.ts
import { z } from "zod";

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const CreateContactTaskSchema = z.object({
  contactId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  statusId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: TaskPrioritySchema.default("medium"),
  dueAt: z.coerce.date().optional(),
  sortOrder: z.number().int().default(0),
});

export const UpdateContactTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  statusId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: TaskPrioritySchema.optional(),
  dueAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const CreateContactTaskStatusSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
  isTerminal: z.boolean().default(false),
});

export const UpdateContactTaskStatusSchema = CreateContactTaskStatusSchema.partial();

export type CreateContactTaskInput = z.infer<typeof CreateContactTaskSchema>;
export type UpdateContactTaskInput = z.infer<typeof UpdateContactTaskSchema>;
export type CreateContactTaskStatusInput = z.infer<typeof CreateContactTaskStatusSchema>;
export type UpdateContactTaskStatusInput = z.infer<typeof UpdateContactTaskStatusSchema>;
```

- [ ] **Run type-check**

```bash
cd packages/contacts && pnpm type-check
```

Expected: no errors (index.ts re-exports from all schema files).

- [ ] **Commit**

```bash
git add packages/contacts/src/schemas/
git commit -m "feat(contacts): add Zod schemas"
```

---

## Task 5: Contact repository

**Files:**
- Create: `packages/contacts/src/data-models/contact-repo.ts`
- Create: `packages/contacts/src/data-models/contact-repo.test.ts`

- [ ] **Write `contact-repo.test.ts` first**

```ts
// packages/contacts/src/data-models/contact-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import {
  listContactsForOrg,
  getContactById,
  createContact,
  archiveContact,
} from "./contact-repo";

const mockContact = {
  id: "contact_abc",
  organizationId: "org_1",
  kind: "person",
  displayName: "Jane Doe",
  firstName: "Jane",
  lastName: "Doe",
  companyName: null,
  primaryEmail: "jane@example.com",
  primaryPhone: null,
  website: null,
  parentContactId: null,
  stageId: null,
  ownerId: null,
  source: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
  stage: null,
  tags: [],
};

beforeEach(() => vi.clearAllMocks());

describe("listContactsForOrg", () => {
  it("scopes query to organizationId and excludes archived by default", async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([mockContact]);
    await listContactsForOrg("org_1", {});
    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          archivedAt: null,
        }),
      }),
    );
  });

  it("includes archived when requested", async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);
    await listContactsForOrg("org_1", { includeArchived: true });
    const call = vi.mocked(prisma.contact.findMany).mock.calls[0]?.[0];
    expect(call?.where).not.toHaveProperty("archivedAt");
  });

  it("does not leak contacts from another organization", async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);
    await listContactsForOrg("org_2", {});
    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org_2" }),
      }),
    );
  });
});

describe("getContactById", () => {
  it("requires organizationId in query", async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockContact);
    await getContactById("contact_abc", "org_1");
    expect(prisma.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contact_abc", organizationId: "org_1" },
      }),
    );
  });
});

describe("createContact", () => {
  it("generates a prefixed ID", async () => {
    vi.mocked(prisma.contact.create).mockResolvedValue(mockContact);
    await createContact("org_1", {
      kind: "person",
      displayName: "Jane Doe",
    });
    const call = vi.mocked(prisma.contact.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^contact_/);
    expect(call?.data.organizationId).toBe("org_1");
  });
});

describe("archiveContact", () => {
  it("sets archivedAt and requires organizationId", async () => {
    vi.mocked(prisma.contact.update).mockResolvedValue({ ...mockContact, archivedAt: new Date() });
    await archiveContact("contact_abc", "org_1");
    expect(prisma.contact.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contact_abc", organizationId: "org_1" },
        data: expect.objectContaining({ archivedAt: expect.any(Date) }),
      }),
    );
  });
});
```

- [ ] **Run tests to confirm they fail**

```bash
cd packages/contacts && pnpm test -- contact-repo
```

Expected: FAIL — `contact-repo` not found.

- [ ] **Write `contact-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { Prisma } from "@workspace/database/client";
import type { CreateContactInput, ContactListFilters } from "../schemas/contact-schemas";

export async function listContactsForOrg(
  organizationId: string,
  filters: Partial<ContactListFilters> = {},
) {
  const {
    search,
    kind,
    stageId,
    tagId,
    includeArchived = false,
    limit = 20,
    offset = 0,
  } = filters;

  const where: Prisma.ContactWhereInput = {
    organizationId,
    ...(kind ? { kind } : {}),
    ...(stageId ? { stageId } : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
    ...(!includeArchived ? { archivedAt: null } : {}),
    ...(search
      ? {
          OR: [
            { displayName: { contains: search, mode: "insensitive" } },
            { primaryEmail: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return prisma.contact.findMany({
    where,
    include: {
      stage: true,
      tags: { include: { tag: true } },
    },
    orderBy: { displayName: "asc" },
    take: limit,
    skip: offset,
  });
}

export async function getContactById(contactId: string, organizationId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, organizationId },
    include: {
      stage: true,
      tags: { include: { tag: true } },
      parent: { select: { id: true, displayName: true, kind: true } },
      children: {
        where: { archivedAt: null },
        select: { id: true, displayName: true, kind: true },
        take: 20,
      },
    },
  });
}

export async function createContact(
  organizationId: string,
  data: CreateContactInput,
) {
  return prisma.contact.create({
    data: {
      id: createId("contact"),
      organizationId,
      ...data,
    },
    include: { stage: true, tags: { include: { tag: true } } },
  });
}

export async function updateContact(
  contactId: string,
  organizationId: string,
  data: Partial<CreateContactInput>,
) {
  return prisma.contact.update({
    where: { id: contactId, organizationId },
    data,
    include: { stage: true, tags: { include: { tag: true } } },
  });
}

export async function archiveContact(contactId: string, organizationId: string) {
  return prisma.contact.update({
    where: { id: contactId, organizationId },
    data: { archivedAt: new Date() },
  });
}

export async function unarchiveContact(contactId: string, organizationId: string) {
  return prisma.contact.update({
    where: { id: contactId, organizationId },
    data: { archivedAt: null },
  });
}
```

- [ ] **Run tests to confirm they pass**

```bash
cd packages/contacts && pnpm test -- contact-repo
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/contacts/src/data-models/contact-repo.ts packages/contacts/src/data-models/contact-repo.test.ts
git commit -m "feat(contacts): add contact repository"
```

---

## Task 6: Stage, tag, and segment repositories

**Files:**
- Create: `contact-stage-repo.ts` + `.test.ts`
- Create: `contact-tag-repo.ts` + `.test.ts`
- Create: `contact-segment-repo.ts` + `.test.ts`

- [ ] **Write `contact-stage-repo.test.ts`**

```ts
// packages/contacts/src/data-models/contact-stage-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactStage: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import { createContactStage, listContactStagesForOrg } from "./contact-stage-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactStagesForOrg", () => {
  it("scopes to organizationId", async () => {
    vi.mocked(prisma.contactStage.findMany).mockResolvedValue([]);
    await listContactStagesForOrg("org_1");
    expect(prisma.contactStage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org_1" } }),
    );
  });
});

describe("createContactStage", () => {
  it("generates a prefixed ID", async () => {
    vi.mocked(prisma.contactStage.create).mockResolvedValue({} as never);
    await createContactStage("org_1", { name: "Active", color: "#6366f1", sortOrder: 0, isDefault: false });
    const call = vi.mocked(prisma.contactStage.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^cstage_/);
  });
});
```

- [ ] **Write `contact-stage-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-stage-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactStageInput, UpdateContactStageInput } from "../schemas/stage-schemas";

export async function listContactStagesForOrg(organizationId: string) {
  return prisma.contactStage.findMany({
    where: { organizationId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getContactStageById(stageId: string, organizationId: string) {
  return prisma.contactStage.findFirst({ where: { id: stageId, organizationId } });
}

export async function createContactStage(
  organizationId: string,
  data: CreateContactStageInput,
) {
  return prisma.contactStage.create({
    data: { id: createId("cstage"), organizationId, ...data },
  });
}

export async function updateContactStage(
  stageId: string,
  organizationId: string,
  data: UpdateContactStageInput,
) {
  return prisma.contactStage.update({ where: { id: stageId, organizationId }, data });
}

export async function deleteContactStage(stageId: string, organizationId: string) {
  return prisma.contactStage.delete({ where: { id: stageId, organizationId } });
}
```

- [ ] **Write `contact-tag-repo.test.ts`**

```ts
// packages/contacts/src/data-models/contact-tag-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactTag: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    contactTagAssignment: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import { addTagToContact, removeTagFromContact } from "./contact-tag-repo";

beforeEach(() => vi.clearAllMocks());

describe("addTagToContact", () => {
  it("uses upsert so the operation is idempotent", async () => {
    vi.mocked(prisma.contactTagAssignment.upsert).mockResolvedValue({} as never);
    await addTagToContact("contact_abc", "ctag_xyz", "org_1");
    expect(prisma.contactTagAssignment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { contactId_tagId: { contactId: "contact_abc", tagId: "ctag_xyz" } } }),
    );
  });
});

describe("removeTagFromContact", () => {
  it("deletes the assignment", async () => {
    vi.mocked(prisma.contactTagAssignment.deleteMany).mockResolvedValue({ count: 1 });
    await removeTagFromContact("contact_abc", "ctag_xyz");
    expect(prisma.contactTagAssignment.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { contactId: "contact_abc", tagId: "ctag_xyz" } }),
    );
  });
});
```

- [ ] **Write `contact-tag-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-tag-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactTagInput, UpdateContactTagInput } from "../schemas/tag-schemas";

export async function listContactTagsForOrg(organizationId: string) {
  return prisma.contactTag.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createContactTag(organizationId: string, data: CreateContactTagInput) {
  return prisma.contactTag.upsert({
    where: { organizationId_name: { organizationId, name: data.name } },
    create: { id: createId("ctag"), organizationId, ...data },
    update: {},
  });
}

export async function updateContactTag(
  tagId: string,
  organizationId: string,
  data: UpdateContactTagInput,
) {
  return prisma.contactTag.update({ where: { id: tagId, organizationId }, data });
}

export async function deleteContactTag(tagId: string, organizationId: string) {
  return prisma.contactTag.delete({ where: { id: tagId, organizationId } });
}

export async function addTagToContact(
  contactId: string,
  tagId: string,
  _organizationId: string,
) {
  return prisma.contactTagAssignment.upsert({
    where: { contactId_tagId: { contactId, tagId } },
    create: { contactId, tagId },
    update: {},
  });
}

export async function removeTagFromContact(contactId: string, tagId: string) {
  return prisma.contactTagAssignment.deleteMany({ where: { contactId, tagId } });
}
```

- [ ] **Write `contact-segment-repo.test.ts`**

```ts
// packages/contacts/src/data-models/contact-segment-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactSegment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import { createContactSegment, listContactSegmentsForOrg } from "./contact-segment-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactSegmentsForOrg", () => {
  it("scopes to organizationId", async () => {
    vi.mocked(prisma.contactSegment.findMany).mockResolvedValue([]);
    await listContactSegmentsForOrg("org_1");
    expect(prisma.contactSegment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org_1" } }),
    );
  });
});

describe("createContactSegment", () => {
  it("generates a prefixed ID", async () => {
    vi.mocked(prisma.contactSegment.create).mockResolvedValue({} as never);
    await createContactSegment("org_1", "user_1", {
      name: "My Segment",
      filters: {},
      sortKey: "displayName",
      sortDirection: "asc",
    });
    const call = vi.mocked(prisma.contactSegment.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^cseg_/);
  });
});
```

- [ ] **Write `contact-segment-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-segment-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactSegmentInput, UpdateContactSegmentInput } from "../schemas/segment-schemas";
import { CURRENT_FILTER_VERSION } from "../schemas/segment-schemas";

export async function listContactSegmentsForOrg(organizationId: string) {
  return prisma.contactSegment.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function getContactSegmentById(segmentId: string, organizationId: string) {
  return prisma.contactSegment.findFirst({ where: { id: segmentId, organizationId } });
}

export async function createContactSegment(
  organizationId: string,
  createdById: string,
  data: CreateContactSegmentInput,
) {
  return prisma.contactSegment.create({
    data: {
      id: createId("cseg"),
      organizationId,
      createdById,
      filterVersion: CURRENT_FILTER_VERSION,
      ...data,
      filters: data.filters as object,
    },
  });
}

export async function updateContactSegment(
  segmentId: string,
  organizationId: string,
  data: UpdateContactSegmentInput,
) {
  return prisma.contactSegment.update({
    where: { id: segmentId, organizationId },
    data: {
      ...data,
      ...(data.filters ? { filters: data.filters as object } : {}),
    },
  });
}

export async function deleteContactSegment(segmentId: string, organizationId: string) {
  return prisma.contactSegment.delete({ where: { id: segmentId, organizationId } });
}
```

- [ ] **Run all tests so far**

```bash
cd packages/contacts && pnpm test
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/contacts/src/data-models/
git commit -m "feat(contacts): add stage, tag, segment repositories"
```

---

## Task 7: Interaction and task repositories

**Files:**
- Create: `contact-interaction-repo.ts` + `.test.ts`
- Create: `contact-task-repo.ts` + `.test.ts`
- Create: `contact-task-status-repo.ts` + `.test.ts`

- [ ] **Write `contact-interaction-repo.test.ts`**

```ts
// packages/contacts/src/data-models/contact-interaction-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactInteraction: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import { createContactInteraction, listContactInteractions } from "./contact-interaction-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactInteractions", () => {
  it("scopes to contactId and organizationId", async () => {
    vi.mocked(prisma.contactInteraction.findMany).mockResolvedValue([]);
    await listContactInteractions("contact_abc", "org_1");
    expect(prisma.contactInteraction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contactId: "contact_abc", organizationId: "org_1" },
      }),
    );
  });

  it("returns most recent first and limits to 50", async () => {
    vi.mocked(prisma.contactInteraction.findMany).mockResolvedValue([]);
    await listContactInteractions("contact_abc", "org_1");
    const call = vi.mocked(prisma.contactInteraction.findMany).mock.calls[0]?.[0];
    expect(call?.orderBy).toEqual({ happenedAt: "desc" });
    expect(call?.take).toBe(50);
  });
});

describe("createContactInteraction", () => {
  it("sets type to 'note' by default and generates prefixed ID", async () => {
    vi.mocked(prisma.contactInteraction.create).mockResolvedValue({} as never);
    await createContactInteraction("contact_abc", "org_1", "user_1", {
      body: "Called client",
      type: "note",
    });
    const call = vi.mocked(prisma.contactInteraction.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^cint_/);
    expect(call?.data.type).toBe("note");
  });
});
```

- [ ] **Write `contact-interaction-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-interaction-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactInteractionInput, UpdateContactInteractionInput } from "../schemas/interaction-schemas";

export async function listContactInteractions(
  contactId: string,
  organizationId: string,
  limit = 50,
) {
  return prisma.contactInteraction.findMany({
    where: { contactId, organizationId },
    orderBy: { happenedAt: "desc" },
    take: limit,
  });
}

export async function createContactInteraction(
  contactId: string,
  organizationId: string,
  createdById: string,
  data: CreateContactInteractionInput,
) {
  return prisma.contactInteraction.create({
    data: {
      id: createId("cint"),
      contactId,
      organizationId,
      createdById,
      type: data.type ?? "note",
      body: data.body,
      happenedAt: data.happenedAt ?? new Date(),
    },
  });
}

export async function updateContactInteraction(
  interactionId: string,
  organizationId: string,
  data: UpdateContactInteractionInput,
) {
  return prisma.contactInteraction.update({
    where: { id: interactionId, organizationId },
    data,
  });
}

export async function deleteContactInteraction(interactionId: string, organizationId: string) {
  return prisma.contactInteraction.delete({ where: { id: interactionId, organizationId } });
}
```

- [ ] **Write `contact-task-status-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-task-status-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactTaskStatusInput, UpdateContactTaskStatusInput } from "../schemas/task-schemas";

export async function listContactTaskStatusesForOrg(organizationId: string) {
  return prisma.contactTaskStatus.findMany({
    where: { organizationId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getContactTaskStatusById(statusId: string, organizationId: string) {
  return prisma.contactTaskStatus.findFirst({ where: { id: statusId, organizationId } });
}

export async function createContactTaskStatus(
  organizationId: string,
  data: CreateContactTaskStatusInput,
) {
  return prisma.contactTaskStatus.create({
    data: { id: createId("ctstatus"), organizationId, ...data },
  });
}

export async function updateContactTaskStatus(
  statusId: string,
  organizationId: string,
  data: UpdateContactTaskStatusInput,
) {
  return prisma.contactTaskStatus.update({ where: { id: statusId, organizationId }, data });
}

export async function deleteContactTaskStatus(statusId: string, organizationId: string) {
  return prisma.contactTaskStatus.delete({ where: { id: statusId, organizationId } });
}
```

- [ ] **Write `contact-task-repo.test.ts`**

```ts
// packages/contacts/src/data-models/contact-task-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactTask: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import { listContactTasksForOrg, listContactTasksForContact, createContactTask } from "./contact-task-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactTasksForOrg", () => {
  it("scopes to organizationId, excludes archived", async () => {
    vi.mocked(prisma.contactTask.findMany).mockResolvedValue([]);
    await listContactTasksForOrg("org_1");
    expect(prisma.contactTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org_1", archivedAt: null }),
      }),
    );
  });
});

describe("listContactTasksForContact", () => {
  it("scopes to both contactId and organizationId", async () => {
    vi.mocked(prisma.contactTask.findMany).mockResolvedValue([]);
    await listContactTasksForContact("contact_abc", "org_1");
    expect(prisma.contactTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ contactId: "contact_abc", organizationId: "org_1" }),
      }),
    );
  });
});

describe("createContactTask", () => {
  it("generates a prefixed ID", async () => {
    vi.mocked(prisma.contactTask.create).mockResolvedValue({} as never);
    await createContactTask("org_1", "user_1", {
      contactId: "contact_abc",
      title: "Follow up",
      priority: "medium",
      sortOrder: 0,
    });
    const call = vi.mocked(prisma.contactTask.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^ctask_/);
  });
});
```

- [ ] **Write `contact-task-repo.ts`**

```ts
// packages/contacts/src/data-models/contact-task-repo.ts
import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactTaskInput, UpdateContactTaskInput } from "../schemas/task-schemas";

type TaskFilters = {
  statusId?: string;
  assigneeId?: string;
  contactId?: string;
};

export async function listContactTasksForOrg(organizationId: string, filters: TaskFilters = {}) {
  return prisma.contactTask.findMany({
    where: {
      organizationId,
      archivedAt: null,
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    include: { status: true, contact: { select: { id: true, displayName: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function listContactTasksForContact(contactId: string, organizationId: string) {
  return prisma.contactTask.findMany({
    where: { contactId, organizationId, archivedAt: null },
    include: { status: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getContactTaskById(taskId: string, organizationId: string) {
  return prisma.contactTask.findFirst({
    where: { id: taskId, organizationId },
    include: { status: true },
  });
}

export async function createContactTask(
  organizationId: string,
  createdById: string,
  data: CreateContactTaskInput,
) {
  return prisma.contactTask.create({
    data: { id: createId("ctask"), organizationId, createdById, ...data },
    include: { status: true },
  });
}

export async function updateContactTask(
  taskId: string,
  organizationId: string,
  data: UpdateContactTaskInput,
) {
  return prisma.contactTask.update({
    where: { id: taskId, organizationId },
    data,
    include: { status: true },
  });
}

export async function archiveContactTask(taskId: string, organizationId: string) {
  return prisma.contactTask.update({
    where: { id: taskId, organizationId },
    data: { archivedAt: new Date() },
  });
}
```

- [ ] **Also write `contact-task-status-repo.test.ts`**

```ts
// packages/contacts/src/data-models/contact-task-status-repo.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactTaskStatus: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import { createContactTaskStatus } from "./contact-task-status-repo";

beforeEach(() => vi.clearAllMocks());

describe("createContactTaskStatus", () => {
  it("generates a prefixed ID", async () => {
    vi.mocked(prisma.contactTaskStatus.create).mockResolvedValue({} as never);
    await createContactTaskStatus("org_1", { name: "To Do", color: "#6366f1", sortOrder: 0, isDefault: true, isTerminal: false });
    const call = vi.mocked(prisma.contactTaskStatus.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^ctstatus_/);
  });
});
```

- [ ] **Run all tests**

```bash
cd packages/contacts && pnpm test
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/contacts/src/data-models/
git commit -m "feat(contacts): add interaction and task repositories"
```

---

## Task 8: Contact service — parent cycle validation

**Files:**
- Create: `packages/contacts/src/services/contact-service.ts`
- Create: `packages/contacts/src/services/contact-service.test.ts`

- [ ] **Write `contact-service.test.ts`**

```ts
// packages/contacts/src/services/contact-service.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as contactRepo from "../data-models/contact-repo";

vi.mock("../data-models/contact-repo");

beforeEach(() => vi.clearAllMocks());

import { createContactWithValidation, updateContactWithValidation } from "./contact-service";

const baseContact = {
  id: "contact_abc",
  organizationId: "org_1",
  kind: "person" as const,
  displayName: "Jane",
  firstName: null,
  lastName: null,
  companyName: null,
  primaryEmail: null,
  primaryPhone: null,
  website: null,
  parentContactId: null,
  stageId: null,
  ownerId: null,
  source: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
  stage: null,
  tags: [],
  parent: null,
  children: [],
};

describe("updateContactWithValidation — parent cycle detection", () => {
  it("rejects self-parenting", async () => {
    await expect(
      updateContactWithValidation("contact_abc", "org_1", { parentContactId: "contact_abc" }),
    ).rejects.toThrow("cannot be its own parent");
  });

  it("rejects a cycle where the proposed parent already has this contact as an ancestor", async () => {
    // contact_abc → contact_parent → contact_grandparent → contact_abc would be a cycle
    // Setting contact_abc's parent to contact_parent is safe,
    // but contact_parent's parent to contact_abc creates a cycle.
    vi.mocked(contactRepo.getContactById).mockResolvedValueOnce({
      ...baseContact,
      id: "contact_parent",
      parentContactId: "contact_abc",
    } as never);

    await expect(
      updateContactWithValidation("contact_abc", "org_1", { parentContactId: "contact_parent" }),
    ).rejects.toThrow("cycle");
  });

  it("allows a valid parent from the same org", async () => {
    vi.mocked(contactRepo.getContactById).mockResolvedValueOnce({
      ...baseContact,
      id: "contact_parent",
      parentContactId: null,
    } as never);
    vi.mocked(contactRepo.updateContact).mockResolvedValueOnce(baseContact as never);

    await expect(
      updateContactWithValidation("contact_abc", "org_1", { parentContactId: "contact_parent" }),
    ).resolves.not.toThrow();
  });
});

describe("createContactWithValidation", () => {
  it("creates without a parent", async () => {
    vi.mocked(contactRepo.createContact).mockResolvedValueOnce(baseContact as never);
    await createContactWithValidation("org_1", { kind: "person", displayName: "Jane" });
    expect(contactRepo.createContact).toHaveBeenCalledWith("org_1", expect.objectContaining({ kind: "person" }));
  });
});
```

- [ ] **Run test to confirm it fails**

```bash
cd packages/contacts && pnpm test -- contact-service
```

Expected: FAIL — module not found.

- [ ] **Write `contact-service.ts`**

```ts
// packages/contacts/src/services/contact-service.ts
import {
  createContact,
  updateContact,
  getContactById,
} from "../data-models/contact-repo";
import type { CreateContactInput, UpdateContactInput } from "../schemas/contact-schemas";

async function checkParentCycle(
  organizationId: string,
  contactId: string,
  proposedParentId: string,
): Promise<void> {
  if (contactId === proposedParentId) {
    throw new Error("A contact cannot be its own parent");
  }
  const visited = new Set<string>();
  let current: string | null = proposedParentId;
  while (current) {
    if (visited.has(current)) break;
    visited.add(current);
    if (current === contactId) {
      throw new Error("Setting this parent would create a cycle");
    }
    const parent = await getContactById(current, organizationId);
    current = parent?.parentContactId ?? null;
  }
}

export async function createContactWithValidation(
  organizationId: string,
  data: CreateContactInput,
) {
  if (data.parentContactId) {
    const parent = await getContactById(data.parentContactId, organizationId);
    if (!parent) throw new Error("Parent contact not found in this organization");
  }
  return createContact(organizationId, data);
}

export async function updateContactWithValidation(
  contactId: string,
  organizationId: string,
  data: UpdateContactInput,
) {
  if (data.parentContactId !== undefined) {
    if (data.parentContactId !== null) {
      await checkParentCycle(organizationId, contactId, data.parentContactId);
      const parent = await getContactById(data.parentContactId, organizationId);
      if (!parent) throw new Error("Parent contact not found in this organization");
    }
  }
  return updateContact(contactId, organizationId, data);
}
```

- [ ] **Run tests**

```bash
cd packages/contacts && pnpm test -- contact-service
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/contacts/src/services/contact-service.ts packages/contacts/src/services/contact-service.test.ts
git commit -m "feat(contacts): add contact service with parent cycle validation"
```

---

## Task 9: Segment service — filter validation and application

**Files:**
- Create: `packages/contacts/src/services/segment-service.ts`
- Create: `packages/contacts/src/services/segment-service.test.ts`

- [ ] **Write `segment-service.test.ts`**

```ts
// packages/contacts/src/services/segment-service.test.ts
import { describe, it, expect } from "vitest";
import { validateSegmentFilters, buildContactWhereFromSegment } from "./segment-service";

describe("validateSegmentFilters", () => {
  it("accepts valid v1 filters", () => {
    const result = validateSegmentFilters({ kind: "person", stageId: "cstage_abc" }, 1);
    expect(result.kind).toBe("person");
  });

  it("rejects unknown filterVersion", () => {
    expect(() => validateSegmentFilters({}, 2)).toThrow("Unsupported filter version");
  });

  it("rejects unknown filter keys (strict mode)", () => {
    expect(() => validateSegmentFilters({ unknownField: true }, 1)).toThrow();
  });

  it("accepts empty filters object", () => {
    expect(() => validateSegmentFilters({}, 1)).not.toThrow();
  });
});

describe("buildContactWhereFromSegment", () => {
  it("builds organizationId-scoped where clause", () => {
    const where = buildContactWhereFromSegment("org_1", { kind: "company" });
    expect(where.organizationId).toBe("org_1");
    expect(where.kind).toBe("company");
  });

  it("excludes archived contacts by default", () => {
    const where = buildContactWhereFromSegment("org_1", {});
    expect(where.archivedAt).toBeNull();
  });

  it("includes archived when filter requests it", () => {
    const where = buildContactWhereFromSegment("org_1", { includeArchived: true });
    expect(where).not.toHaveProperty("archivedAt");
  });

  it("builds tagIds filter with AND semantics", () => {
    const where = buildContactWhereFromSegment("org_1", { tagIds: ["ctag_1", "ctag_2"] });
    expect(where.AND).toEqual([
      { tags: { some: { tagId: "ctag_1" } } },
      { tags: { some: { tagId: "ctag_2" } } },
    ]);
  });
});
```

- [ ] **Run test to confirm it fails**

```bash
cd packages/contacts && pnpm test -- segment-service
```

Expected: FAIL.

- [ ] **Write `segment-service.ts`**

```ts
// packages/contacts/src/services/segment-service.ts
import type { Prisma } from "@workspace/database/client";
import {
  ContactSegmentFilterSchemaV1,
  type ContactSegmentFilterV1,
} from "../schemas/segment-schemas";

export function validateSegmentFilters(
  filters: unknown,
  filterVersion: number,
): ContactSegmentFilterV1 {
  if (filterVersion !== 1) {
    throw new Error(`Unsupported filter version: ${filterVersion}`);
  }
  return ContactSegmentFilterSchemaV1.parse(filters);
}

export function buildContactWhereFromSegment(
  organizationId: string,
  filters: ContactSegmentFilterV1,
): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = { organizationId };

  if (!filters.includeArchived) {
    where.archivedAt = null;
  }
  if (filters.kind) {
    where.kind = filters.kind;
  }
  if (filters.stageId) {
    where.stageId = filters.stageId;
  }
  if (filters.search) {
    where.OR = [
      { displayName: { contains: filters.search, mode: "insensitive" } },
      { primaryEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.tagIds && filters.tagIds.length > 0) {
    where.AND = filters.tagIds.map((tagId) => ({
      tags: { some: { tagId } },
    }));
  }

  return where;
}
```

- [ ] **Run tests**

```bash
cd packages/contacts && pnpm test -- segment-service
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/contacts/src/services/segment-service.ts packages/contacts/src/services/segment-service.test.ts
git commit -m "feat(contacts): add segment filter validation and where-clause builder"
```

---

## Task 10: CSV service

**Files:**
- Create: `packages/contacts/src/services/csv-service.ts`
- Create: `packages/contacts/src/services/csv-service.test.ts`

- [ ] **Write `csv-service.test.ts`**

```ts
// packages/contacts/src/services/csv-service.test.ts
import { describe, it, expect } from "vitest";
import { parseContactsCsv, exportContactsToCsv } from "./csv-service";

const validCsv = `displayName,kind,firstName,lastName,primaryEmail
Jane Doe,person,Jane,Doe,jane@example.com
Acme Corp,company,,,`;

describe("parseContactsCsv", () => {
  it("parses valid rows into valid array", () => {
    const result = parseContactsCsv(validCsv);
    expect(result.valid).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it("reports error for missing displayName", () => {
    const csv = `displayName,kind\n,person`;
    const result = parseContactsCsv(csv);
    expect(result.errors[0]?.field).toBe("displayName");
  });

  it("reports error for invalid kind", () => {
    const csv = `displayName,kind\nJane,robot`;
    const result = parseContactsCsv(csv);
    expect(result.errors[0]?.field).toBe("kind");
  });

  it("warns about duplicate primary emails within the file", () => {
    const csv = `displayName,kind,primaryEmail\nA,person,same@x.com\nB,person,same@x.com`;
    const result = parseContactsCsv(csv);
    expect(result.duplicateWarnings).toHaveLength(1);
    expect(result.duplicateWarnings[0]?.email).toBe("same@x.com");
  });

  it("does not write any data (pure parse)", () => {
    const result = parseContactsCsv(validCsv);
    expect(result).not.toHaveProperty("created");
  });
});

describe("exportContactsToCsv", () => {
  it("produces a CSV string with a header row", () => {
    const csv = exportContactsToCsv([
      { displayName: "Jane", kind: "person", primaryEmail: "jane@example.com" },
    ]);
    expect(csv).toContain("displayName");
    expect(csv).toContain("Jane");
  });

  it("escapes commas inside field values", () => {
    const csv = exportContactsToCsv([
      { displayName: "Smith, John", kind: "person" },
    ]);
    expect(csv).toContain('"Smith, John"');
  });
});
```

- [ ] **Run test to confirm it fails**

```bash
cd packages/contacts && pnpm test -- csv-service
```

Expected: FAIL.

- [ ] **Write `csv-service.ts`**

```ts
// packages/contacts/src/services/csv-service.ts
import Papa from "papaparse";

const CSV_COLUMNS = [
  "displayName",
  "kind",
  "firstName",
  "lastName",
  "companyName",
  "primaryEmail",
  "primaryPhone",
  "website",
  "source",
  "tags",
] as const;

export type CsvContactRow = {
  displayName: string;
  kind: "person" | "company";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  source?: string;
  tags?: string;
};

export type CsvRowError = { row: number; field: string; message: string };
export type CsvPreviewResult = {
  valid: CsvContactRow[];
  errors: CsvRowError[];
  duplicateWarnings: { row: number; email: string }[];
};

export function parseContactsCsv(csv: string): CsvPreviewResult {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const valid: CsvContactRow[] = [];
  const errors: CsvRowError[] = [];
  const seenEmails = new Set<string>();
  const duplicateWarnings: { row: number; email: string }[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i] ?? {};
    const row = i + 2; // 1-indexed + header row

    if (!raw["displayName"]?.trim()) {
      errors.push({ row, field: "displayName", message: "displayName is required" });
      continue;
    }

    const kind = raw["kind"]?.trim().toLowerCase();
    if (kind !== "person" && kind !== "company") {
      errors.push({ row, field: "kind", message: "kind must be 'person' or 'company'" });
      continue;
    }

    const email = raw["primaryEmail"]?.trim().toLowerCase();
    if (email) {
      if (seenEmails.has(email)) {
        duplicateWarnings.push({ row, email });
      }
      seenEmails.add(email);
    }

    valid.push({
      displayName: raw["displayName"].trim(),
      kind: kind as "person" | "company",
      firstName: raw["firstName"]?.trim() || undefined,
      lastName: raw["lastName"]?.trim() || undefined,
      companyName: raw["companyName"]?.trim() || undefined,
      primaryEmail: email || undefined,
      primaryPhone: raw["primaryPhone"]?.trim() || undefined,
      website: raw["website"]?.trim() || undefined,
      source: raw["source"]?.trim() || undefined,
      tags: raw["tags"]?.trim() || undefined,
    });
  }

  return { valid, errors, duplicateWarnings };
}

export function exportContactsToCsv(contacts: CsvContactRow[]): string {
  return Papa.unparse(contacts, { columns: [...CSV_COLUMNS] });
}
```

- [ ] **Run tests**

```bash
cd packages/contacts && pnpm test -- csv-service
```

Expected: all PASS.

- [ ] **Run all contacts tests**

```bash
cd packages/contacts && pnpm test
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/contacts/src/services/csv-service.ts packages/contacts/src/services/csv-service.test.ts
git commit -m "feat(contacts): add CSV import/export service"
```

---

## Task 11: Seed default stages and task statuses

**Files:**
- Modify: `packages/database/prisma/seed.ts`

- [ ] **Add seed data after the existing org seed**

Find the section in `seed.ts` that creates the `org` and add after it:

```ts
// Default contact stages for the demo org
const defaultStages = [
  { name: "New", color: "#6366f1", sortOrder: 0, isDefault: true },
  { name: "Active", color: "#22c55e", sortOrder: 1, isDefault: false },
  { name: "Nurturing", color: "#f59e0b", sortOrder: 2, isDefault: false },
  { name: "Customer", color: "#3b82f6", sortOrder: 3, isDefault: false },
  { name: "Partner", color: "#8b5cf6", sortOrder: 4, isDefault: false },
  { name: "Inactive", color: "#94a3b8", sortOrder: 5, isDefault: false },
];

for (const stage of defaultStages) {
  const stageId = `cstage_${stage.name.toLowerCase()}`;
  await prisma.contactStage.upsert({
    where: { organizationId_name: { organizationId: org.id, name: stage.name } },
    update: {},
    create: { id: stageId, organizationId: org.id, ...stage },
  });
  console.log(`Upserted stage: ${stage.name}`);
}

// Default contact task statuses for the demo org
const defaultTaskStatuses = [
  { name: "To Do", color: "#94a3b8", sortOrder: 0, isDefault: true, isTerminal: false },
  { name: "In Progress", color: "#3b82f6", sortOrder: 1, isDefault: false, isTerminal: false },
  { name: "Done", color: "#22c55e", sortOrder: 2, isDefault: false, isTerminal: true },
];

for (const status of defaultTaskStatuses) {
  const statusId = `ctstatus_${status.name.toLowerCase().replace(/ /g, "_")}`;
  await prisma.contactTaskStatus.upsert({
    where: { organizationId_name: { organizationId: org.id, name: status.name } },
    update: {},
    create: { id: statusId, organizationId: org.id, ...status },
  });
  console.log(`Upserted task status: ${status.name}`);
}
```

- [ ] **Run seed**

```bash
cd packages/database && pnpm db:seed
```

Expected: "Upserted stage: New", "Upserted task status: To Do", etc.

- [ ] **Commit**

```bash
git add packages/database/prisma/seed.ts
git commit -m "feat(db): seed default contact stages and task statuses"
```

---

## Task 12: Extend `ToolDefinition` + migrate test files

**Files:**
- Modify: `packages/tool-calls/src/tool-definition.ts`
- Modify: `packages/tool-calls/src/tools/account-info.ts`
- Modify: `apps/public-mcp/src/tools/registry.ts`
- Create: `packages/tool-calls/src/tools/account-info.test.ts` (move from `__tests__/`)
- Create: `packages/tool-calls/src/registry.test.ts` (move from `__tests__/`)
- Modify: `apps/public-mcp/src/tools/account.test.ts`
- Delete: `packages/tool-calls/src/__tests__/account-info.test.ts`
- Delete: `packages/tool-calls/src/__tests__/registry.test.ts`

- [ ] **Update `tool-definition.ts`** — add optional `inputShape`

```ts
// packages/tool-calls/src/tool-definition.ts
import type { ToolCallContext } from "./context";
import type { z } from "zod";

export type ToolDefinition<TOutput = unknown> = {
  name: string;
  description: string;
  requiredScopes: string[];
  requiredPermissions: Record<string, string[]>;
  inputShape?: Record<string, z.ZodTypeAny>;
  run: (ctx: ToolCallContext, input: Record<string, unknown>) => Promise<TOutput>;
};
```

- [ ] **Update `account-info.ts`** — add `_input` parameter

Replace the `run` function signature:

```ts
run: async (ctx: ToolCallContext, _input: Record<string, unknown>): Promise<AccountInfoOutput> => {
```

(The body is unchanged — just adding `_input` to match the new signature.)

- [ ] **Update `apps/public-mcp/src/tools/registry.ts`** — pass `inputShape` and `args` to `run`

```ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthContext } from "../lib/context";
import { toolRegistry, hasAccess } from "@workspace/tool-calls";
import { logToolCall } from "../lib/audit";

export function registerTools(server: McpServer, ctx: AuthContext): void {
  for (const tool of toolRegistry) {
    const shape = tool.inputShape ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server.tool(tool.name, tool.description, shape as any, async (args: Record<string, unknown>) => {
      if (!hasAccess(ctx, tool)) {
        void logToolCall({ toolName: tool.name, ctx, success: false, errorCode: "FORBIDDEN" });
        return {
          content: [{ type: "text" as const, text: `Forbidden: missing required permission for ${tool.name}` }],
          isError: true,
        };
      }
      try {
        const result = await tool.run(ctx, args);
        void logToolCall({ toolName: tool.name, ctx, success: true });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        void logToolCall({ toolName: tool.name, ctx, success: false, errorCode: "INTERNAL_ERROR" });
        console.error(`[mcp] Tool ${tool.name} failed:`, err);
        return {
          content: [{ type: "text" as const, text: "Internal error" }],
          isError: true,
        };
      }
    });
  }
}
```

- [ ] **Move `account-info.test.ts`** — copy content from `__tests__/account-info.test.ts` to `src/tools/account-info.test.ts`, then update all `.run(ctx)` calls to `.run(ctx, {})`

```ts
// packages/tool-calls/src/tools/account-info.test.ts
// (same content as __tests__/account-info.test.ts but run calls take second arg)
// Change every:   await accountInfoTool.run(oauthCtx)
// To:             await accountInfoTool.run(oauthCtx, {})
```

- [ ] **Move `registry.test.ts`** — copy content from `__tests__/registry.test.ts` to `src/registry.test.ts` (no run calls to update there)

- [ ] **Update `apps/public-mcp/src/tools/account.test.ts`** — update any `.run(ctx)` calls to `.run(ctx, {})`

- [ ] **Delete the old `__tests__` files**

```bash
rm packages/tool-calls/src/__tests__/account-info.test.ts
rm packages/tool-calls/src/__tests__/registry.test.ts
rmdir packages/tool-calls/src/__tests__/
```

- [ ] **Run tool-calls tests**

```bash
cd packages/tool-calls && pnpm test
```

Expected: all PASS from the new colocated locations.

- [ ] **Run public-mcp tests**

```bash
cd apps/public-mcp && pnpm test
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/tool-calls/src/ apps/public-mcp/src/tools/registry.ts apps/public-mcp/src/tools/account.test.ts
git commit -m "feat(tool-calls): extend ToolDefinition for input shapes, colocate tests"
```

---

## Task 13: Contact MCP tools — read surface

**Files:**
- Create: `packages/tool-calls/src/tools/contact-tools.ts`
- Create: `packages/tool-calls/src/tools/contact-tools.test.ts`

- [ ] **Write `contact-tools.test.ts` for read tools**

```ts
// packages/tool-calls/src/tools/contact-tools.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/contacts", () => ({
  listContactsForOrg: vi.fn(),
  getContactById: vi.fn(),
}));

import * as contacts from "@workspace/contacts";
import {
  contactsListTool,
  contactsGetTool,
  contactsDocumentationTool,
  contactTools,
} from "./contact-tools";

const orgCtx = {
  kind: "api-key" as const,
  keyId: "key_1",
  orgId: "org_1",
  userId: null,
  ownerType: "organization" as const,
  permissions: { contacts: ["read"] },
};

const noOrgCtx = { ...orgCtx, orgId: null };

beforeEach(() => vi.clearAllMocks());

describe("contactsListTool", () => {
  it("requires contacts:read permission", () => {
    expect(contactsListTool.requiredPermissions).toEqual({ contacts: ["read"] });
  });

  it("returns error when no org context", async () => {
    const result = await contactsListTool.run(noOrgCtx, {});
    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it("calls listContactsForOrg with orgId and parsed filters", async () => {
    vi.mocked(contacts.listContactsForOrg).mockResolvedValue([]);
    await contactsListTool.run(orgCtx, { kind: "person", limit: 10 });
    expect(contacts.listContactsForOrg).toHaveBeenCalledWith("org_1", expect.objectContaining({ kind: "person", limit: 10 }));
  });
});

describe("contactsGetTool", () => {
  it("returns error when no org context", async () => {
    const result = await contactsGetTool.run(noOrgCtx, { contactId: "contact_abc" });
    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it("returns error when contact not found", async () => {
    vi.mocked(contacts.getContactById).mockResolvedValue(null);
    const result = await contactsGetTool.run(orgCtx, { contactId: "contact_abc" });
    expect(result).toMatchObject({ error: expect.any(String) });
  });
});

describe("contactsDocumentationTool", () => {
  it("returns a non-empty documentation string", async () => {
    const result = await contactsDocumentationTool.run(orgCtx, {});
    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(100);
  });
});

describe("contactTools array", () => {
  it("contains all 11 contact tools", () => {
    expect(contactTools).toHaveLength(11);
  });

  it("has unique tool names", () => {
    const names = contactTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
```

- [ ] **Run tests to confirm they fail**

```bash
cd packages/tool-calls && pnpm test -- contact-tools
```

Expected: FAIL.

- [ ] **Write `contact-tools.ts`**

```ts
// packages/tool-calls/src/tools/contact-tools.ts
import { z } from "zod";
import {
  listContactsForOrg,
  getContactById,
  createContactWithValidation,
  updateContactWithValidation,
  addTagToContact,
  removeTagFromContact,
  createContactInteraction,
  listContactTasksForOrg,
  createContactTask,
  updateContactTask,
} from "@workspace/contacts";
import type { ToolDefinition } from "../tool-definition";
import type { ToolCallContext } from "../context";

const listInputSchema = z.object({
  search: z.string().optional(),
  kind: z.enum(["person", "company"]).optional(),
  stageId: z.string().optional(),
  tagId: z.string().optional(),
  includeArchived: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const contactsListTool: ToolDefinition = {
  name: "contacts-list",
  description: "List contacts in the active organization. Supports search, kind, stage, tag, and pagination filters.",
  requiredScopes: ["contacts:read"],
  requiredPermissions: { contacts: ["read"] },
  inputShape: {
    search: z.string().optional().describe("Search term matched against name and email"),
    kind: z.enum(["person", "company"]).optional(),
    stageId: z.string().optional(),
    tagId: z.string().optional(),
    includeArchived: z.boolean().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const filters = listInputSchema.parse(input);
    return listContactsForOrg(ctx.orgId, filters);
  },
};

export const contactsGetTool: ToolDefinition = {
  name: "contacts-get",
  description: "Get a single contact with full detail: stage, tags, parent, children, recent interactions (last 10), open tasks (up to 20), and recently completed tasks (last 5).",
  requiredScopes: ["contacts:read"],
  requiredPermissions: { contacts: ["read"] },
  inputShape: { contactId: z.string() },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const { contactId } = z.object({ contactId: z.string() }).parse(input);
    const contact = await getContactById(contactId, ctx.orgId);
    if (!contact) return { error: "Contact not found" };
    return contact;
  },
};

export const contactsCreateTool: ToolDefinition = {
  name: "contacts-create",
  description: "Create a new contact. kind must be 'person' or 'company'. displayName is required.",
  requiredScopes: ["contacts:create"],
  requiredPermissions: { contacts: ["create"] },
  inputShape: {
    kind: z.enum(["person", "company"]),
    displayName: z.string().min(1),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    primaryEmail: z.string().email().optional(),
    primaryPhone: z.string().optional(),
    website: z.string().url().optional(),
    stageId: z.string().optional(),
    source: z.string().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const data = z.object({
      kind: z.enum(["person", "company"]),
      displayName: z.string().min(1),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      companyName: z.string().optional(),
      primaryEmail: z.string().email().optional(),
      primaryPhone: z.string().optional(),
      website: z.string().url().optional(),
      stageId: z.string().optional(),
      source: z.string().optional(),
    }).parse(input);
    return createContactWithValidation(ctx.orgId, data);
  },
};

export const contactsUpdateTool: ToolDefinition = {
  name: "contacts-update",
  description: "Update an existing contact. Only provided fields are changed.",
  requiredScopes: ["contacts:update"],
  requiredPermissions: { contacts: ["update"] },
  inputShape: {
    contactId: z.string(),
    displayName: z.string().min(1).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    primaryEmail: z.string().email().optional(),
    primaryPhone: z.string().optional(),
    stageId: z.string().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const { contactId, ...data } = z.object({
      contactId: z.string(),
      displayName: z.string().min(1).optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      companyName: z.string().optional(),
      primaryEmail: z.string().email().optional(),
      primaryPhone: z.string().optional(),
      stageId: z.string().optional(),
    }).parse(input);
    return updateContactWithValidation(contactId, ctx.orgId, data);
  },
};

export const contactsAddTagTool: ToolDefinition = {
  name: "contacts-add-tag",
  description: "Add a tag to a contact. Operation is idempotent.",
  requiredScopes: ["contacts:update"],
  requiredPermissions: { contacts: ["update"] },
  inputShape: { contactId: z.string(), tagId: z.string() },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const { contactId, tagId } = z.object({ contactId: z.string(), tagId: z.string() }).parse(input);
    await addTagToContact(contactId, tagId, ctx.orgId);
    return { success: true };
  },
};

export const contactsRemoveTagTool: ToolDefinition = {
  name: "contacts-remove-tag",
  description: "Remove a tag from a contact. Operation is idempotent.",
  requiredScopes: ["contacts:update"],
  requiredPermissions: { contacts: ["update"] },
  inputShape: { contactId: z.string(), tagId: z.string() },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const { contactId, tagId } = z.object({ contactId: z.string(), tagId: z.string() }).parse(input);
    await removeTagFromContact(contactId, tagId);
    return { success: true };
  },
};

export const contactsCreateNoteTool: ToolDefinition = {
  name: "contacts-create-note",
  description: "Record a note or interaction on a contact. type defaults to 'note'. Other types: call, email, meeting, sms, other.",
  requiredScopes: ["contactInteractions:create"],
  requiredPermissions: { contactInteractions: ["create"] },
  inputShape: {
    contactId: z.string(),
    body: z.string().min(1),
    type: z.enum(["note", "call", "email", "meeting", "sms", "other"]).optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    if (!ctx.userId) return { error: "No user context" };
    const { contactId, body, type } = z.object({
      contactId: z.string(),
      body: z.string().min(1),
      type: z.enum(["note", "call", "email", "meeting", "sms", "other"]).optional(),
    }).parse(input);
    return createContactInteraction(contactId, ctx.orgId, ctx.userId, { body, type: type ?? "note" });
  },
};

export const contactsTasksListTool: ToolDefinition = {
  name: "contacts-tasks-list",
  description: "List contact tasks for the active organization. Optionally filter by contactId or statusId.",
  requiredScopes: ["contactTasks:read"],
  requiredPermissions: { contactTasks: ["read"] },
  inputShape: {
    contactId: z.string().optional(),
    statusId: z.string().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const filters = z.object({ contactId: z.string().optional(), statusId: z.string().optional() }).parse(input);
    return listContactTasksForOrg(ctx.orgId, filters);
  },
};

export const contactsCreateTaskTool: ToolDefinition = {
  name: "contacts-create-task",
  description: "Create a task on a contact. priority: low | medium | high. dueAt is an ISO 8601 date string.",
  requiredScopes: ["contactTasks:create"],
  requiredPermissions: { contactTasks: ["create"] },
  inputShape: {
    contactId: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
    statusId: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueAt: z.string().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    if (!ctx.userId) return { error: "No user context" };
    const data = z.object({
      contactId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      statusId: z.string().optional(),
      assigneeId: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueAt: z.string().optional(),
    }).parse(input);
    return createContactTask(ctx.orgId, ctx.userId, {
      ...data,
      priority: data.priority ?? "medium",
      sortOrder: 0,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    });
  },
};

export const contactsUpdateTaskTool: ToolDefinition = {
  name: "contacts-update-task",
  description: "Update a contact task. Set completedAt to mark it done. Setting a terminal statusId also marks it complete.",
  requiredScopes: ["contactTasks:update"],
  requiredPermissions: { contactTasks: ["update"] },
  inputShape: {
    taskId: z.string(),
    title: z.string().min(1).optional(),
    statusId: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueAt: z.string().optional(),
    completedAt: z.string().nullable().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "No active organization context" };
    const { taskId, dueAt, completedAt, ...rest } = z.object({
      taskId: z.string(),
      title: z.string().min(1).optional(),
      statusId: z.string().optional(),
      assigneeId: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueAt: z.string().optional(),
      completedAt: z.string().nullable().optional(),
    }).parse(input);
    return updateContactTask(taskId, ctx.orgId, {
      ...rest,
      dueAt: dueAt ? new Date(dueAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : completedAt === null ? null : undefined,
    });
  },
};

const DOCUMENTATION = `
# Contacts Tools — Usage Guide

## Overview
The contacts tools let you manage people and companies in your active organization.
All tools require an active organization context (orgId must be set).

## Permissions
- contacts:read — list and get contacts
- contacts:create — create contacts
- contacts:update — update contacts, add/remove tags
- contactInteractions:create — add notes and interactions
- contactTasks:read — list tasks
- contactTasks:create — create tasks
- contactTasks:update — update and complete tasks

## Contacts
A contact has a \`kind\`: "person" or "company".
\`displayName\` is required. For persons, use firstName + lastName.
Contacts can be nested via \`parentContactId\` (same org only, no cycles).
Contacts are archived rather than deleted — use the dashboard to restore.

## Common Workflows

### Create and tag a contact
1. contacts-create { kind: "person", displayName: "Jane Doe", primaryEmail: "jane@acme.com" }
2. contacts-add-tag { contactId: "...", tagId: "..." }

### Get full contact detail
contacts-get { contactId: "..." }
Returns: stage, tags, parent, children, last 10 interactions, open tasks, last 5 completed tasks.

### Log a call
contacts-create-note { contactId: "...", body: "Discussed pricing", type: "call" }

### Create and assign a task
contacts-create-task { contactId: "...", title: "Follow up", dueAt: "2026-06-01", priority: "high" }

## Segment Filters (v1)
Segments store reusable filters. Filter shape:
{ search?, kind?, stageId?, tagIds?: string[], includeArchived?: boolean }
`.trim();

export const contactsDocumentationTool: ToolDefinition<string> = {
  name: "contacts-documentation",
  description: "Returns usage guidance, permission requirements, filter examples, and common workflows for all contacts tools.",
  requiredScopes: ["contacts:read"],
  requiredPermissions: { contacts: ["read"] },
  run: async (_ctx: ToolCallContext, _input: Record<string, unknown>) => DOCUMENTATION,
};

export const contactTools: ToolDefinition[] = [
  contactsListTool,
  contactsGetTool,
  contactsCreateTool,
  contactsUpdateTool,
  contactsAddTagTool,
  contactsRemoveTagTool,
  contactsCreateNoteTool,
  contactsTasksListTool,
  contactsCreateTaskTool,
  contactsUpdateTaskTool,
  contactsDocumentationTool,
];
```

- [ ] **Run tests**

```bash
cd packages/tool-calls && pnpm test -- contact-tools
```

Expected: all PASS.

- [ ] **Commit**

```bash
git add packages/tool-calls/src/tools/contact-tools.ts packages/tool-calls/src/tools/contact-tools.test.ts
git commit -m "feat(tool-calls): add contact MCP tool definitions"
```

---

## Task 14: Wire contact tools into registries

**Files:**
- Modify: `packages/tool-calls/src/registry.ts`
- Modify: `packages/tool-calls/src/index.ts`

- [ ] **Update `registry.ts`**

```ts
// packages/tool-calls/src/registry.ts
import type { ToolDefinition } from "./tool-definition";
import { accountInfoTool } from "./tools/account-info";
import { contactTools } from "./tools/contact-tools";

export const toolRegistry: ToolDefinition[] = [
  accountInfoTool,
  ...contactTools,
];
```

- [ ] **Update `packages/tool-calls/src/index.ts`** — export contact tools

```ts
export type { ToolCallContext } from "./context";
export type { ToolDefinition } from "./tool-definition";
export { hasAccess } from "./access";
export { toolRegistry } from "./registry";
export { accountInfoTool } from "./tools/account-info";
export { contactTools } from "./tools/contact-tools";
```

- [ ] **Run all tool-calls tests**

```bash
cd packages/tool-calls && pnpm test
```

Expected: all PASS. Registry test should find 12 tools (1 account-info + 11 contact tools).

- [ ] **Update `registry.test.ts`** if it asserts a specific tool count

The existing `registry.test.ts` only checks that `account-info` is present and names are unique — no count assertion, so no change needed. Verify with:

```bash
grep "length\|count" packages/tool-calls/src/registry.test.ts
```

If a count assertion exists, update it to reflect 12 tools.

- [ ] **Run public-mcp tests**

```bash
cd apps/public-mcp && pnpm test
```

Expected: all PASS.

- [ ] **Run full workspace type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Commit**

```bash
git add packages/tool-calls/src/registry.ts packages/tool-calls/src/index.ts
git commit -m "feat(tool-calls): register contact tools in registry"
```

---

## Task 15: Final backend verification

- [ ] **Run all contacts package tests**

```bash
cd packages/contacts && pnpm test
```

Expected: all PASS.

- [ ] **Run all tool-calls tests**

```bash
cd packages/tool-calls && pnpm test
```

Expected: all PASS.

- [ ] **Run full workspace test suite**

```bash
pnpm test
```

Expected: all PASS.

- [ ] **Run workspace type-check**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **If any failures, fix before proceeding**

Use `superpowers:systematic-debugging` if the root cause is unclear.
