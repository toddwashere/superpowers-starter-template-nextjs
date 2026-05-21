import {
  createContactTag,
  addTagToContact,
  removeTagFromContact,
} from "../data-models/contact-tag-repo";
import { prisma } from "@workspace/database";

function normalizeTagNames(tagNames: string[]): string[] {
  return [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];
}

export async function setContactTagsForContact(
  contactId: string,
  organizationId: string,
  tagNames: string[],
) {
  const normalized = normalizeTagNames(tagNames);
  const assignments = await prisma.contactTagAssignment.findMany({
    where: { contactId, tag: { organizationId } },
    include: { tag: true },
  });

  const desiredNames = new Set(normalized);

  for (const name of normalized) {
    const existing = assignments.find((a) => a.tag.name === name);
    if (existing) continue;
    const tag = await createContactTag(organizationId, { name, color: "#6366f1" });
    await addTagToContact(contactId, tag.id, organizationId);
  }

  for (const assignment of assignments) {
    if (!desiredNames.has(assignment.tag.name)) {
      await removeTagFromContact(contactId, assignment.tagId, organizationId);
    }
  }
}

export function parseTagNamesFromCsv(tags?: string): string[] {
  if (!tags?.trim()) return [];
  return normalizeTagNames(tags.split(","));
}

export function formatContactTagsForCsv(
  tags: { tag: { name: string } }[],
): string {
  return tags.map((assignment) => assignment.tag.name).join(", ");
}
