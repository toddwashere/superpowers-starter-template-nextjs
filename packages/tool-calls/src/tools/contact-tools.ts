import { z } from "zod";
import type { ToolDefinition } from "../tool-definition";
import type { ToolCallContext } from "../context";
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

// ─── contacts-list ────────────────────────────────────────────────────────────

export const contactsListTool: ToolDefinition = {
  name: "contacts-list",
  description:
    "List contacts in the organization. Supports filtering by kind, stageId, tagIds, search, and pagination via page/pageSize.",
  requiredScopes: ["contacts:read"],
  requiredPermissions: { contacts: ["read"] },
  inputShape: {
    search: z.string().optional(),
    kind: z.enum(["person", "company"]).optional(),
    stageId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    includeArchived: z.boolean().optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const filters = {
      search: input.search as string | undefined,
      kind: input.kind as "person" | "company" | undefined,
      stageId: input.stageId as string | undefined,
      tagIds: input.tagIds as string[] | undefined,
      includeArchived: input.includeArchived as boolean | undefined,
      page: input.page as number | undefined,
      pageSize: input.pageSize as number | undefined,
    };
    return listContactsForOrg(ctx.orgId, filters);
  },
};

// ─── contacts-get ─────────────────────────────────────────────────────────────

export const contactsGetTool: ToolDefinition = {
  name: "contacts-get",
  description: "Retrieve a single contact by ID.",
  requiredScopes: ["contacts:read"],
  requiredPermissions: { contacts: ["read"] },
  inputShape: {
    contactId: z.string(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const contactId = input.contactId as string;
    const contact = await getContactById(contactId, ctx.orgId);
    if (!contact) return { error: `Contact not found: ${contactId}` };
    return contact;
  },
};

// ─── contacts-create ──────────────────────────────────────────────────────────

export const contactsCreateTool: ToolDefinition = {
  name: "contacts-create",
  description: "Create a new contact in the organization.",
  requiredScopes: ["contacts:create"],
  requiredPermissions: { contacts: ["create"] },
  inputShape: {
    kind: z.enum(["person", "company"]),
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
    status: z.enum(["active", "inactive"]).optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    try {
      return await createContactWithValidation(ctx.orgId, input as Parameters<typeof createContactWithValidation>[1]);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to create contact" };
    }
  },
};

// ─── contacts-update ──────────────────────────────────────────────────────────

export const contactsUpdateTool: ToolDefinition = {
  name: "contacts-update",
  description: "Update an existing contact.",
  requiredScopes: ["contacts:update"],
  requiredPermissions: { contacts: ["update"] },
  inputShape: {
    contactId: z.string(),
    kind: z.enum(["person", "company"]).optional(),
    displayName: z.string().min(1).max(255).optional(),
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
    status: z.enum(["active", "inactive"]).optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const { contactId, ...data } = input;
    if (!contactId) return { error: "contactId is required" };
    try {
      return await updateContactWithValidation(
        contactId as string,
        ctx.orgId,
        data as Parameters<typeof updateContactWithValidation>[2],
      );
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to update contact" };
    }
  },
};

// ─── contacts-add-tag ─────────────────────────────────────────────────────────

export const contactsAddTagTool: ToolDefinition = {
  name: "contacts-add-tag",
  description: "Add a tag to a contact.",
  requiredScopes: ["contacts:update"],
  requiredPermissions: { contacts: ["update"] },
  inputShape: {
    contactId: z.string(),
    tagId: z.string(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const contactId = input.contactId as string;
    const tagId = input.tagId as string;
    if (!contactId) return { error: "contactId is required" };
    if (!tagId) return { error: "tagId is required" };
    try {
      return await addTagToContact(contactId, tagId, ctx.orgId);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to add tag" };
    }
  },
};

// ─── contacts-remove-tag ──────────────────────────────────────────────────────

export const contactsRemoveTagTool: ToolDefinition = {
  name: "contacts-remove-tag",
  description: "Remove a tag from a contact.",
  requiredScopes: ["contacts:update"],
  requiredPermissions: { contacts: ["update"] },
  inputShape: {
    contactId: z.string(),
    tagId: z.string(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const contactId = input.contactId as string;
    const tagId = input.tagId as string;
    if (!contactId) return { error: "contactId is required" };
    if (!tagId) return { error: "tagId is required" };
    try {
      return await removeTagFromContact(contactId, tagId);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to remove tag" };
    }
  },
};

// ─── contacts-create-note ─────────────────────────────────────────────────────

export const contactsCreateNoteTool: ToolDefinition = {
  name: "contacts-create-note",
  description:
    "Create an interaction (note, call, email, meeting, sms, or other) on a contact.",
  requiredScopes: ["contactInteractions:create"],
  requiredPermissions: { contactInteractions: ["create"] },
  inputShape: {
    contactId: z.string(),
    body: z.string().min(1),
    type: z.enum(["note", "call", "email", "meeting", "sms", "other"]).optional(),
    happenedAt: z.string().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const contactId = input.contactId as string;
    const body = input.body as string;
    const type = (input.type as "note" | "call" | "email" | "meeting" | "sms" | "other") ?? "note";
    if (!contactId) return { error: "contactId is required" };
    if (!body) return { error: "body is required" };
    const userId = ctx.kind === "oauth" ? ctx.userId : (ctx.userId ?? "");
    try {
      return await createContactInteraction(contactId, ctx.orgId, userId, {
        contactId,
        body,
        type,
        happenedAt: input.happenedAt ? new Date(input.happenedAt as string) : undefined,
      });
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to create interaction" };
    }
  },
};

// ─── contacts-tasks-list ──────────────────────────────────────────────────────

export const contactsTasksListTool: ToolDefinition = {
  name: "contacts-tasks-list",
  description: "List contact tasks for the organization, optionally filtered by statusId or assigneeId.",
  requiredScopes: ["contactTasks:read"],
  requiredPermissions: { contactTasks: ["read"] },
  inputShape: {
    statusId: z.string().optional(),
    assigneeId: z.string().optional(),
    limit: z.number().int().positive().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const filters = {
      statusId: input.statusId as string | undefined,
      assigneeId: input.assigneeId as string | undefined,
    };
    const limit = input.limit as number | undefined;
    return listContactTasksForOrg(ctx.orgId, filters, limit);
  },
};

// ─── contacts-create-task ─────────────────────────────────────────────────────

export const contactsCreateTaskTool: ToolDefinition = {
  name: "contacts-create-task",
  description: "Create a task associated with a contact.",
  requiredScopes: ["contactTasks:create"],
  requiredPermissions: { contactTasks: ["create"] },
  inputShape: {
    contactId: z.string(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    statusId: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    dueAt: z.string().optional(),
    sortOrder: z.number().int().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const userId = ctx.kind === "oauth" ? ctx.userId : (ctx.userId ?? "");
    const { dueAt, sortOrder, ...rest } = input;
    const data: Parameters<typeof createContactTask>[2] = {
      contactId: rest.contactId as string,
      title: rest.title as string,
      description: rest.description as string | undefined,
      statusId: rest.statusId as string | undefined,
      assigneeId: rest.assigneeId as string | undefined,
      priority: (rest.priority as "low" | "normal" | "high" | "urgent") ?? "normal",
      dueAt: dueAt ? new Date(dueAt as string) : undefined,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    };
    try {
      return await createContactTask(ctx.orgId, userId, data);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to create task" };
    }
  },
};

// ─── contacts-update-task ─────────────────────────────────────────────────────

export const contactsUpdateTaskTool: ToolDefinition = {
  name: "contacts-update-task",
  description: "Update an existing contact task.",
  requiredScopes: ["contactTasks:update"],
  requiredPermissions: { contactTasks: ["update"] },
  inputShape: {
    taskId: z.string(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    statusId: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    dueAt: z.string().optional(),
    completedAt: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
  },
  run: async (ctx: ToolCallContext, input: Record<string, unknown>) => {
    if (!ctx.orgId) return { error: "Organization context required" };
    const { taskId, dueAt, completedAt, ...rest } = input;
    if (!taskId) return { error: "taskId is required" };
    const data: Parameters<typeof updateContactTask>[2] = {
      title: rest.title as string | undefined,
      description: rest.description as string | undefined,
      statusId: rest.statusId as string | undefined,
      assigneeId: rest.assigneeId as string | undefined,
      priority: rest.priority as "low" | "normal" | "high" | "urgent" | undefined,
      dueAt: dueAt ? new Date(dueAt as string) : undefined,
      completedAt: completedAt === null ? null : completedAt ? new Date(completedAt as string) : undefined,
      sortOrder: typeof rest.sortOrder === "number" ? rest.sortOrder : undefined,
    };
    try {
      return await updateContactTask(taskId as string, ctx.orgId, data);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to update task" };
    }
  },
};

// ─── contacts-documentation ───────────────────────────────────────────────────

export const contactsDocumentationTool: ToolDefinition = {
  name: "contacts-documentation",
  description: "Returns documentation about the contacts module — available tools, data model fields, and usage guidance.",
  requiredScopes: ["contacts:read"],
  requiredPermissions: { contacts: ["read"] },
  inputShape: {},
  run: async (_ctx: ToolCallContext, _input: Record<string, unknown>) => {
    return `
# Contacts Module — Documentation

## Overview
The contacts module manages people and companies (contacts), along with their interactions
(notes, calls, emails) and tasks.

## Contact Fields
- **id** — unique identifier (prefixed: \`cont_...\`)
- **kind** — \`"person"\` or \`"company"\`
- **displayName** — required display name (max 255 chars)
- **firstName**, **lastName** — optional for person contacts
- **companyName** — optional for company contacts
- **primaryEmail**, **primaryPhone**, **website** — optional contact details
- **parentContactId** — optional parent contact (supports org hierarchy)
- **stageId** — optional CRM stage
- **ownerId** — optional owner/assignee
- **source** — optional acquisition source (max 100 chars)
- **status** — \`"active"\` (default) or \`"inactive"\`

## Available Tools

### contacts-list
List contacts with optional filters: \`search\`, \`kind\`, \`stageId\`, \`tagIds\` (array),
\`includeArchived\`, \`page\` (default 1), \`pageSize\` (default 20, max 100).

### contacts-get
Retrieve a single contact by \`contactId\`.

### contacts-create
Create a new contact. Required: \`kind\`, \`displayName\`.

### contacts-update
Update a contact by \`contactId\`. All fields optional except \`contactId\`.

### contacts-add-tag / contacts-remove-tag
Add or remove a tag from a contact using \`contactId\` and \`tagId\`.

### contacts-create-note
Log an interaction on a contact. Required: \`contactId\`, \`body\`.
Optional: \`type\` (\`note\`, \`call\`, \`email\`, \`meeting\`, \`sms\`, \`other\`), \`happenedAt\`.

### contacts-tasks-list
List tasks for the organization. Optional filters: \`statusId\`, \`assigneeId\`, \`limit\`.

### contacts-create-task
Create a task linked to a contact. Required: \`contactId\`, \`title\`.
Optional: \`description\`, \`statusId\`, \`assigneeId\`, \`priority\` (\`low\`/\`normal\`/\`high\`/\`urgent\`),
\`dueAt\` (ISO date string), \`sortOrder\`.

### contacts-update-task
Update a task by \`taskId\`. All fields optional except \`taskId\`.
Set \`completedAt\` to null to reopen, or an ISO date string to mark complete.

### contacts-documentation
Returns this documentation string.

## Permissions Required
- contacts:read — list and get contacts
- contacts:create — create contacts
- contacts:update — update contacts, add/remove tags
- contactInteractions:create — create notes/interactions
- contactTasks:read — list tasks
- contactTasks:create — create tasks
- contactTasks:update — update tasks
`.trim();
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────

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
