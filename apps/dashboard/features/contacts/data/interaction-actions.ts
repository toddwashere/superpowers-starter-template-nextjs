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
      contactId,
      body,
      type: "note",
    });
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create note" };
  }
}
