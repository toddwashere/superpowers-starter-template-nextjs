import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactSegmentInput, UpdateContactSegmentInput } from "../schemas/segment-schemas";
import { CURRENT_FILTER_VERSION } from "../schemas/segment-schemas";

export async function listContactSegmentsForOrg(organizationId: string) {
  return prisma.contactSegment.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function getContactSegmentById(segmentId: string, organizationId: string) {
  return prisma.contactSegment.findFirst({ where: { id: segmentId, organizationId } });
}

export async function createContactSegment(
  organizationId: string,
  createdById: string,
  data: CreateContactSegmentInput,
) {
  const { filters, filterVersion: _fv, ...rest } = data;
  return prisma.contactSegment.create({
    data: {
      id: createId("cseg"),
      organizationId,
      createdById,
      filterVersion: CURRENT_FILTER_VERSION,
      ...rest,
      filters: filters as object,
    },
  });
}

export async function updateContactSegment(
  segmentId: string,
  organizationId: string,
  data: UpdateContactSegmentInput,
) {
  return prisma.contactSegment.update({
    where: { id: segmentId, organizationId },
    data: {
      ...data,
      ...(data.filters ? { filters: data.filters as object } : {}),
    },
  });
}

export async function deleteContactSegment(segmentId: string, organizationId: string) {
  return prisma.contactSegment.delete({ where: { id: segmentId, organizationId } });
}
