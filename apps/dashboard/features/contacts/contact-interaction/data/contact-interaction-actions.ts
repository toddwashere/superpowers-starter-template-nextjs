"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  archiveContactInteraction,
  createContactInteraction,
  listContactInteractions,
  updateContactInteraction,
} from "@workspace/contacts";
import type { UpdateContactInteractionInput } from "@workspace/contacts";
import type { ActionResult } from "@/common/data/action-result";

export async function listContactInteractionsAction(
  contactId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listContactInteractions>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactInteraction: ["read"],
    });
    const data = await listContactInteractions(contactId, activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load interactions" };
  }
}

export async function createContactNoteAction(
  contactId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const { session, activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactInteraction: ["create"],
    });
    await createContactInteraction(contactId, activeOrganizationId, session.user.id, {
      contactId,
      body,
      type: "note",
    });
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create note" };
  }
}

export async function updateContactInteractionAction(
  interactionId: string,
  data: UpdateContactInteractionInput,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactInteraction: ["update"],
    });
    await updateContactInteraction(interactionId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update interaction" };
  }
}

export async function archiveContactInteractionAction(
  interactionId: string,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactInteraction: ["delete"],
    });
    await archiveContactInteraction(interactionId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive interaction" };
  }
}
