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
import type {
  CreateContactTaskInput,
  UpdateContactTaskInput,
  CreateContactTaskStatusInput,
  UpdateContactTaskStatusInput,
} from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listTaskStatusesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listContactTaskStatusesForOrg>>>
> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const data = await listContactTaskStatusesForOrg(activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load task statuses" };
  }
}

export async function listOrgTasksAction(
  filters: { statusId?: string; assigneeId?: string } = {},
): Promise<ActionResult<Awaited<ReturnType<typeof listContactTasksForOrg>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const data = await listContactTasksForOrg(activeOrganizationId, filters);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load tasks" };
  }
}

export async function listContactTasksAction(
  contactId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listContactTasksForContact>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const data = await listContactTasksForContact(contactId, activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load contact tasks" };
  }
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

export async function updateTaskStatusAction(
  statusId: string,
  data: UpdateContactTaskStatusInput,
): Promise<ActionResult> {
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
