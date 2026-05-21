"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactTagsForOrg,
  createContactTag,
  updateContactTag,
  deleteContactTag,
  addTagToContact,
  removeTagFromContact,
  setContactTagsForContact,
} from "@workspace/contacts";
import type { CreateContactTagInput, UpdateContactTagInput } from "@workspace/contacts";
import type { ActionResult } from "@/common/data/action-result";

export async function listContactTagsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listContactTagsForOrg>>>
> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["read"],
    });
    const data = await listContactTagsForOrg(activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load tags" };
  }
}

export async function createContactTagAction(
  data: CreateContactTagInput,
): Promise<ActionResult<Awaited<ReturnType<typeof createContactTag>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["create"],
    });
    const tag = await createContactTag(activeOrganizationId, data);
    return { success: true, data: tag };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create tag" };
  }
}

export async function updateContactTagAction(
  tagId: string,
  data: UpdateContactTagInput,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["update"],
    });
    await updateContactTag(tagId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update tag" };
  }
}

export async function deleteContactTagAction(tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["delete"],
    });
    await deleteContactTag(tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete tag" };
  }
}

export async function addTagToContactAction(contactId: string, tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contact: ["update"],
    });
    await addTagToContact(contactId, tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add tag" };
  }
}

export async function removeTagFromContactAction(
  contactId: string,
  tagId: string,
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contact: ["update"],
    });
    await removeTagFromContact(contactId, tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove tag" };
  }
}

export async function setContactTagsAction(
  contactId: string,
  tagNames: string[],
): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contact: ["update"],
    });
    await setContactTagsForContact(contactId, activeOrganizationId, tagNames);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to set tags" };
  }
}
