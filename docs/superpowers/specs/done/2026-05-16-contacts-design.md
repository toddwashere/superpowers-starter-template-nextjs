# Contacts Feature Set Design

**Date:** 2026-05-16  
**Status:** Ready for review  
**Scope:** `packages/contacts`, `packages/database/prisma/contacts.prisma`, `apps/dashboard`, `apps/public-mcp`, `packages/tool-calls`

## Overview

Add a generic, extensible contacts feature set to the SaaS starter template. This is intentionally not branded as a sales CRM. It should provide a batteries-included relationship/contact-management foundation that many SaaS apps can adapt without inheriting sales-specific assumptions.

The feature should introduce a new `contacts` domain package and a centralized Prisma schema file at `packages/database/prisma/contacts.prisma`. The domain package owns validation, repositories, services, CSV import/export logic, and reusable tool-call handlers. Dashboard routes and MCP tools call the contacts package rather than importing Prisma directly.

## Goals

- Organizations can manage people and companies in one unified contacts table.
- Contacts can be nested through a parent contact for company hierarchies, departments, households, locations, or other simple parent/child structures.
- Organizations can define lifecycle stages for contacts.
- Organizations can create and assign custom tags to contacts.
- Users can save filtered contact lists as segments and export those filtered segments to CSV.
- Users can import and export contacts through CSV.
- Users can record notes and other lightweight interactions on contacts.
- Users can manage contact-specific tasks globally and on individual contact pages.
- MCP clients can list, create, update, tag, inspect, annotate, and manage tasks for contacts through a focused tool surface.
- The schema should be easy to extend later with custom fields, opportunities, richer relationships, and broader work-management features.

## Non-Goals

- Do not add opportunities or sales pipelines in v1.
- Do not add a separate generic task-management domain in v1.
- Do not add contact-to-contact relationship graph modeling beyond `parentContactId` in v1.
- Do not add a full custom field builder in v1.
- Do not use a `metadata Json` escape hatch for contact domain records.
- Do not import or export tasks and interactions through CSV in v1.
- Do not expose broad arbitrary query tools through MCP.

## Existing Context

The project already uses centralized Prisma schemas under `packages/database/prisma/`, with `schema.prisma` holding the generator/datasource and `auth.prisma` holding Better Auth-owned tables. Prisma is configured to load the whole `prisma/` directory.

Domain behavior should live outside `packages/database`. The data-model skill for this project establishes the boundary: schema is centralized, repositories are domain-owned, and apps should not import Prisma directly. For this feature, the new owning domain is `packages/contacts`.

The dashboard already uses organization-scoped routes under `apps/dashboard/app/(organization)/[org-slug]/`. Better Auth owns `Organization`, `Member`, and active organization context. Contacts must be scoped to Better Auth organizations, but external companies should not be called `Organization` in code because that name is already auth-owned.

The public MCP app currently delegates reusable tool definitions to `packages/tool-calls`. Contacts-related tool definitions should be grouped by domain in `packages/tool-calls/src/tools/contact-tools.ts`.

## Domain Naming

Use **Contacts** as the domain name:

- Prisma schema file: `packages/database/prisma/contacts.prisma`
- Domain package: `packages/contacts`
- Dashboard feature folder: `apps/dashboard/features/contacts`
- Product navigation label: `Contacts`

Use `Contact` for the unified person/company record. Use `Contact.kind` to distinguish `person` and `company`.

Avoid `Crm` prefixes in model, package, UI, and route names. The feature should feel generic and adaptable.

## Architecture

The implementation should have four layers:

1. **Database schema** in `packages/database/prisma/contacts.prisma`
   Defines contacts, stages, tags, segments, interactions, and contact-specific tasks.

2. **Domain package** in `packages/contacts`
   Owns Zod schemas, repository functions, services, CSV import/export, segment filter validation, and contact/task/note business rules.

3. **Dashboard feature** in `apps/dashboard/features/contacts`
   Owns route content, forms, tables, dialogs, server actions, and page-specific UI state. Server actions authenticate and authorize the user, then call `@workspace/contacts`.

4. **MCP/tool-call surface** in `packages/tool-calls` and `apps/public-mcp`
   Reuses contacts package services through explicit tool definitions. MCP should be a companion interface, not a parallel implementation.

## Data Model

### Contact

`Contact` is the central entity. A row represents either a person or a company.

Recommended fields:

- `id`
- `organizationId`
- `kind`: `person` or `company`
- `displayName`
- `firstName`
- `lastName`
- `companyName`
- `primaryEmail`
- `primaryPhone`
- `website`
- `parentContactId`
- `stageId`
- `ownerId`
- `source`
- `status`
- `createdAt`
- `updatedAt`
- `archivedAt`

The parent contact relation supports simple nesting. It should not try to model arbitrary relationships in v1.

`Contact` should not have `metadata Json`. Future domain attributes should be added as explicit columns or related tables.

### ContactStage

`ContactStage` stores organization-defined lifecycle stages. A contact has one current stage.

Example stages:

- `New`
- `Active`
- `Nurturing`
- `Customer`
- `Partner`
- `Inactive`

Recommended fields:

- `id`
- `organizationId`
- `name`
- `color`
- `sortOrder`
- `isDefault`
- `createdAt`
- `updatedAt`

Stage names should be unique per organization.

### ContactTag And ContactTagAssignment

`ContactTag` stores the organization-scoped tag vocabulary. Tags can be created on demand while editing a contact or importing contacts.

`ContactTagAssignment` joins tags to contacts.

Recommended `ContactTag` fields:

- `id`
- `organizationId`
- `name`
- `color`
- `createdAt`
- `updatedAt`

Recommended `ContactTagAssignment` fields:

- `contactId`
- `tagId`
- `createdAt`

Tag names should be unique per organization. Add/remove operations should be idempotent.

### ContactSegment

`ContactSegment` stores a reusable filtered list of multiple contacts. The UI should call these **Segments**.

Segments are not snapshots. They store filter configuration and run against current contact data when opened or exported.

Recommended fields:

- `id`
- `organizationId`
- `name`
- `filters Json`
- `filterVersion Int @default(1)`
- `sortKey`
- `sortDirection`
- `createdById`
- `createdAt`
- `updatedAt`

`filters Json` is an intentional exception to the "no metadata JSON" rule. Segment filters are saved query configuration, not contact domain data. The contacts package must validate segment filters with Zod on every read/write and version the shape with `filterVersion`.

### ContactInteraction

`ContactInteraction` stores contact activity history. Notes are the primary v1 interaction type, but the model should support other lightweight interaction types.

Recommended fields:

- `id`
- `organizationId`
- `contactId`
- `type`: `note`, `call`, `email`, `meeting`, `sms`, `other`
- `body`
- `happenedAt`
- `createdById`
- `createdAt`
- `updatedAt`

V1 dashboard UI should focus on note creation. Other types can be supported as a simple type selector without specialized UIs.

### ContactTask And ContactTaskStatus

`ContactTask` is first-class, but intentionally contact-specific. It should not become a generic work-log or project-management system in v1.

Tasks should be visible in two places:

- A global organization-wide contact task board/list.
- The individual contact detail page, scoped to that contact.

Recommended `ContactTask` fields:

- `id`
- `organizationId`
- `contactId`
- `title`
- `description`
- `statusId`
- `assigneeId`
- `priority`
- `dueAt`
- `completedAt`
- `sortOrder`
- `createdById`
- `createdAt`
- `updatedAt`
- `archivedAt`

`ContactTaskStatus` stores organization-defined task columns/statuses. V1 should use one contact-task workflow per organization, not multiple boards.

Recommended `ContactTaskStatus` fields:

- `id`
- `organizationId`
- `name`
- `color`
- `sortOrder`
- `isDefault`
- `isTerminal`
- `createdAt`
- `updatedAt`

Task statuses should be independent from contact stages. Contact stages describe relationship lifecycle; task statuses describe work progress.

## Indexes And Constraints

Recommended constraints and indexes:

- Index `Contact.organizationId + displayName`.
- Index `Contact.organizationId + kind`.
- Index `Contact.organizationId + stageId`.
- Index `Contact.organizationId + ownerId`.
- Index `Contact.organizationId + archivedAt`.
- Index `Contact.parentContactId`.
- Unique `ContactStage.organizationId + name`.
- Unique `ContactTag.organizationId + name`.
- Unique `ContactTagAssignment.contactId + tagId`.
- Unique `ContactTaskStatus.organizationId + name`.
- Index `ContactTask.organizationId + statusId`.
- Index `ContactTask.organizationId + assigneeId`.
- Index `ContactTask.organizationId + dueAt`.
- Index `ContactInteraction.contactId + happenedAt`.

All tenant-owned repository methods should require `organizationId` explicitly.

## Dashboard UX

Add contacts pages under the organization route:

- `/[org-slug]/contacts`
  Contact list with search, filters, segments, CSV import, CSV export, and export of the current filtered view or selected segment.

- `/[org-slug]/contacts/[contact-id]`
  Contact detail page showing contact info, tags, stage, parent, child contacts, notes/interactions, and contact-specific tasks.

- `/[org-slug]/contacts/tasks`
  Global contact task board/list across all contacts, filterable by contact, contact stage, tag, assignee, due date, and task status.

- `/[org-slug]/contacts/settings`
  Contact stages, task statuses, and tag management.

The dashboard app should keep UI and route composition local, but all domain behavior should flow through `@workspace/contacts`.

## CSV Import And Export

CSV v1 supports contacts only.

Import should be dashboard-first:

1. User uploads a CSV.
2. The contacts package parses and validates rows.
3. The dashboard shows a preview with row-level errors and duplicate warnings.
4. User confirms import.
5. The contacts package creates valid contacts and tags inside the active organization.

Export should support:

- All active contacts.
- Current filtered list.
- Selected `ContactSegment`.

Consider using `papaparse` for CSV parsing and generation rather than hand-rolled CSV handling. Adding it is a dependency decision for the implementation plan, but the design should prefer a maintained parser because CSV escaping, quoted fields, newlines, and headers are easy to mishandle.

Tasks and interactions should not be imported/exported in v1.

## MCP And Tool Calls

Contacts MCP tools should be implemented as reusable tool definitions in:

- `packages/tool-calls/src/tools/contact-tools.ts`

The package should group tools by DB/domain file. Contacts-related tools live together in `contact-tools.ts`; account tools remain separate. The registry should import and spread grouped tool arrays.

Existing `packages/tool-calls/src/__tests__/` tests should be cleaned up as part of this work. Tests must live next to their implementation files, such as:

- `packages/tool-calls/src/tools/contact-tools.test.ts`
- `packages/tool-calls/src/registry.test.ts`
- `packages/tool-calls/src/tools/account-info.test.ts`

MCP tools for v1:

- `contacts-list`
- `contacts-get`
- `contacts-create`
- `contacts-update`
- `contacts-add-tag`
- `contacts-remove-tag`
- `contacts-create-note`
- `contacts-tasks-list`
- `contacts-create-task`
- `contacts-update-task`
- `contacts-documentation`

`contacts-get` should return the information an LLM or agent needs to understand one contact: core fields, stage, tags, parent summary, child contact summaries, recent notes/interactions, open tasks, and recently completed tasks. The payload should be complete but bounded so it cannot accidentally dump unbounded history.

`contacts-documentation` should return usage guidance, schemas, permission requirements, examples, filter examples, and common workflows. This is a compatibility-oriented tool. If the MCP server later supports MCP Resources or Prompts, the same documentation can also be exposed as a resource like `contacts://documentation` and as workflow prompts.

Tool permissions should be explicit. Recommended permissions/scopes:

- `contacts:read`
- `contacts:create`
- `contacts:update`
- `contactInteractions:read`
- `contactInteractions:create`
- `contactTasks:read`
- `contactTasks:create`
- `contactTasks:update`

MCP tools must require an active organization context unless a future use case explicitly supports user-owned contacts.

## Validation And Error Handling

- All writes validate with Zod schemas in `@workspace/contacts`.
- Every query requires an organization context.
- Parent contact must belong to the same organization.
- Parent contact validation must prevent self-parenting and cycles.
- Stage, tag, task status, assignee, and contact references must belong to the same organization.
- Segment filters must validate against `filterVersion`.
- CSV import preview must return row-level validation errors before writing data.
- Duplicate detection starts with warnings for matching primary email or same display name within the organization.
- Archive is preferred over hard delete in the UI.
- MCP mutation tools should return structured validation errors suitable for LLM repair.

## Extension Points

This v1 should leave room for:

- Custom fields through explicit related tables or future columns.
- Opportunities or generic workflows as a separate follow-up.
- A richer relationship graph via a future `ContactRelationship` table.
- A broader task-management domain if tasks later need to apply outside contacts.
- Task and interaction CSV import/export.
- MCP Resources and Prompts for richer client guidance.
- More advanced segment filters through `filterVersion` upgrades.

Avoid adding compatibility shims for unbuilt features. Keep v1 focused and leave clear model boundaries for follow-up specs.

## Critical Tests

High-value unit tests should be colocated next to implementation files. Do not create new `__tests__` folders.

- Contact list filtering combines search, kind, stage, tags, archived defaults, and pagination without leaking contacts from another organization.
- Contact create/update validates kind-specific fields and rejects references to stages, parents, owners, or organizations outside the active organization.
- Parent contact validation rejects self-parenting and multi-level cycles.
- Tag add/remove operations are idempotent and scoped per organization.
- Segment filters validate against `filterVersion` and reject unknown or malformed filter shapes.
- CSV import preview reports row-level validation errors and duplicate warnings without writing data.
- CSV export respects current filters or selected segment and escapes CSV values correctly.
- Note creation requires same-organization contact access and creates a `ContactInteraction` with type `note`.
- Contact task listing supports both global organization view and per-contact view without leaking tasks across organizations.
- Contact task updates enforce same-organization task status, assignee, contact, and terminal/completed state transitions.
- `contacts-get` returns bounded detail payloads including contact info, tags, stage, children, notes, and tasks.
- MCP contact tools enforce permissions/scopes and require active organization context.
- `packages/tool-calls` registry includes contact tools once and keeps tests colocated next to implementation files.

## Rollout

1. Add `packages/contacts` with public API, validation schemas, repository/service structure, and colocated tests.
2. Add `packages/database/prisma/contacts.prisma` with the contacts domain models, relations, indexes, and constraints.
3. Add seed/default setup for contact stages and task statuses when an organization first uses contacts.
4. Add contact list/detail/task/settings dashboard pages and server actions.
5. Add CSV contact import preview/commit and export flows, preferring `papaparse`.
6. Add `packages/tool-calls/src/tools/contact-tools.ts`, contact tool tests, and registry wiring.
7. Move existing `packages/tool-calls` tests out of `__tests__` into colocated `.test.ts` files.
8. Add MCP registration for the new contact tools through the existing public MCP server path.
9. Run focused package tests first, then dashboard, tool-calls, public-mcp, and full workspace verification.
