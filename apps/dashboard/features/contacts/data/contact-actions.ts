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
