import type { Prisma } from "@workspace/database";
import {
  ContactSegmentFilterSchemaV1,
  type ContactSegmentFilterV1,
} from "../schemas/segment-schemas";

export function validateSegmentFilters(
  filters: unknown,
  filterVersion: number,
): ContactSegmentFilterV1 {
  if (filterVersion !== 1) {
    throw new Error(`Unsupported filter version: ${filterVersion}`);
  }
  return ContactSegmentFilterSchemaV1.parse(filters);
}

export function buildContactWhereFromSegment(
  organizationId: string,
  filters: ContactSegmentFilterV1,
): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = { organizationId };

  if (!filters.includeArchived) {
    where.archivedAt = null;
  }
  if (filters.kind) {
    where.kind = filters.kind;
  }
  if (filters.stageId) {
    where.stageId = filters.stageId;
  }
  if (filters.search) {
    where.OR = [
      { displayName: { contains: filters.search, mode: "insensitive" } },
      { primaryEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  // AND semantics: contact must have ALL listed tags.
  // Note: listContactsForOrg uses OR (any tag) — this deliberate difference makes
  // segment filters more precise than the general list filter.
  if (filters.tagIds && filters.tagIds.length > 0) {
    where.AND = filters.tagIds.map((tagId) => ({
      tags: { some: { tagId } },
    }));
  }

  return where;
}
