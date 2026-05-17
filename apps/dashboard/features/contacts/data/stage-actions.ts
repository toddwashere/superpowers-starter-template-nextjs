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

export async function listStagesAction(): Promise<ActionResult<Awaited<ReturnType<typeof listContactStagesForOrg>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["read"],
    });
    const data = await listContactStagesForOrg(activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load stages" };
  }
}

export async function createStageAction(data: CreateContactStageInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["create"],
    });
    await createContactStage(activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create stage" };
  }
}

export async function updateStageAction(stageId: string, data: UpdateContactStageInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["update"],
    });
    await updateContactStage(stageId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update stage" };
  }
}

export async function deleteStageAction(stageId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["delete"],
    });
    await deleteContactStage(stageId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete stage" };
  }
}
