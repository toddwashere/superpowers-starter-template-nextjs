"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactTagsForOrg,
  createContactTag,
  updateContactTag,
  deleteContactTag,
  addTagToContact,
  removeTagFromContact,
} from "@workspace/contacts";
import type { CreateContactTagInput, UpdateContactTagInput } from "@workspace/contacts";
import type { ActionResult } from "./contact-types";

export async function listTagsAction(): Promise<ActionResult<Awaited<ReturnType<typeof listContactTagsForOrg>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    const data = await listContactTagsForOrg(activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load tags" };
  }
}

export async function createTagAction(data: CreateContactTagInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await createContactTag(activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create tag" };
  }
}

export async function updateTagAction(tagId: string, data: UpdateContactTagInput): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await updateContactTag(tagId, activeOrganizationId, data);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update tag" };
  }
}

export async function deleteTagAction(tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await deleteContactTag(tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete tag" };
  }
}

export async function addTagToContactAction(contactId: string, tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await addTagToContact(contactId, tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add tag" };
  }
}

export async function removeTagFromContactAction(contactId: string, tagId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({});
    await removeTagFromContact(contactId, tagId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove tag" };
  }
}
