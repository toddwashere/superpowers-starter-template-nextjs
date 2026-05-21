import type { TagValue } from "@workspace/ui/components/tags-field";

export type ContactTagAssignment = {
  tagId: string;
  tag: { name: string; color?: string };
};

export type OrgContactTag = {
  id: string;
  name: string;
  color: string;
};

export function assignmentsToTagValues(assignments: ContactTagAssignment[]): TagValue[] {
  return assignments.map((assignment) => ({
    id: assignment.tagId,
    label: assignment.tag.name,
    color: assignment.tag.color,
  }));
}

export function orgTagsToSuggestions(orgTags: OrgContactTag[]): TagValue[] {
  return orgTags.map((tag) => ({
    id: tag.id,
    label: tag.name,
    color: tag.color,
  }));
}

export function findOrgTagByLabel(
  orgTags: OrgContactTag[],
  label: string,
): OrgContactTag | undefined {
  const normalized = label.trim().toLowerCase();
  return orgTags.find((tag) => tag.name.trim().toLowerCase() === normalized);
}

export function diffAssignmentTagIds(
  previous: TagValue[],
  next: TagValue[],
): { added: TagValue[]; removed: TagValue[] } {
  const previousIds = new Set(previous.map((tag) => tag.id));
  const nextIds = new Set(next.map((tag) => tag.id));

  return {
    added: next.filter((tag) => !previousIds.has(tag.id)),
    removed: previous.filter((tag) => !nextIds.has(tag.id)),
  };
}
