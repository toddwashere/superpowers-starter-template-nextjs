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
import type { ActionResult } from "@/common/data/action-result";

export async function listContactTaskStatusesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listContactTaskStatusesForOrg>>>
> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["read"],
    });
    const data = await listContactTaskStatusesForOrg(activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load task statuses" };
  }
}

export async function listContactTasksForOrgAction(
  filters: { statusId?: string; assigneeId?: string } = {},
): Promise<ActionResult<Awaited<ReturnType<typeof listContactTasksForOrg>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactTask: ["read"],
    });
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
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactTask: ["read"],
    });
    const data = await listContactTasksForContact(contactId, activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load contact tasks" };
  }
}

export async function createContactTaskAction(data: CreateContactTaskInput): Promise<ActionResult> {
  try {
    const { session, activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactTask: ["create"],
    });
    await createContactTask(activeOrganizationId, session.user.id, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create task" };
  }
}

export async function updateContactTaskAction(
  taskId: string,
  data: UpdateContactTaskInput,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactTask: ["update"],
    });
    await updateContactTask(taskId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update task" };
  }
}

export async function archiveContactTaskAction(taskId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactTask: ["delete"],
    });
    await archiveContactTask(taskId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive task" };
  }
}

export async function createContactTaskStatusAction(
  data: CreateContactTaskStatusInput,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["create"],
    });
    await createContactTaskStatus(activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create task status" };
  }
}

export async function updateContactTaskStatusAction(
  statusId: string,
  data: UpdateContactTaskStatusInput,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["update"],
    });
    await updateContactTaskStatus(statusId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update task status" };
  }
}

export async function deleteContactTaskStatusAction(statusId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["delete"],
    });
    await deleteContactTaskStatus(statusId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete task status" };
  }
}
