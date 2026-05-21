"use server";

import { requireOrgPermissionWithActiveOrg } from "@workspace/auth/guards";
import {
  listContactSegmentsForOrg,
  createContactSegment,
  deleteContactSegment,
  listContactsForSegment,
} from "@workspace/contacts";
import type { CreateContactSegmentInput } from "@workspace/contacts";
import type { ActionResult } from "@/common/data/action-result";

export async function listContactSegmentsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listContactSegmentsForOrg>>>
> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contact: ["read"],
    });
    const data = await listContactSegmentsForOrg(activeOrganizationId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load segments" };
  }
}

export async function createContactSegmentAction(
  data: CreateContactSegmentInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { session, activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["create"],
    });
    const segment = await createContactSegment(
      activeOrganizationId,
      session.user.id,
      data,
    );
    return { success: true, data: { id: segment.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create segment" };
  }
}

export async function deleteContactSegmentAction(segmentId: string): Promise<ActionResult> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contactSettings: ["delete"],
    });
    await deleteContactSegment(segmentId, activeOrganizationId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete segment" };
  }
}

export async function listContactsForSegmentAction(
  segmentId: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<ActionResult<Awaited<ReturnType<typeof listContactsForSegment>>>> {
  try {
    const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
      contact: ["read"],
    });
    const data = await listContactsForSegment(activeOrganizationId, segmentId, options);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load segment contacts" };
  }
}
