import { prisma } from "@workspace/database";
import { createId } from "@workspace/common";
import type { CreateContactTagInput, UpdateContactTagInput } from "../schemas/tag-schemas";

export async function listContactTagsForOrg(organizationId: string) {
  return prisma.contactTag.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createContactTag(organizationId: string, data: CreateContactTagInput) {
  return prisma.contactTag.upsert({
    where: { organizationId_name: { organizationId, name: data.name } },
    create: { id: createId("ctag"), organizationId, ...data },
    update: {},
  });
}

export async function updateContactTag(
  tagId: string,
  organizationId: string,
  data: UpdateContactTagInput,
) {
  return prisma.contactTag.update({ where: { id: tagId, organizationId }, data });
}

export async function deleteContactTag(tagId: string, organizationId: string) {
  return prisma.contactTag.delete({ where: { id: tagId, organizationId } });
}

export async function addTagToContact(
  contactId: string,
  tagId: string,
  organizationId: string,
) {
  const tag = await prisma.contactTag.findFirst({
    where: { id: tagId, organizationId },
    select: { id: true },
  });
  if (!tag) {
    throw new Error(`Tag ${tagId} not found in organization ${organizationId}`);
  }
  return prisma.contactTagAssignment.upsert({
    where: { contactId_tagId: { contactId, tagId } },
    create: { contactId, tagId },
    update: {},
  });
}

export async function removeTagFromContact(contactId: string, tagId: string): Promise<{ count: number }> {
  return prisma.contactTagAssignment.deleteMany({ where: { contactId, tagId } });
}
