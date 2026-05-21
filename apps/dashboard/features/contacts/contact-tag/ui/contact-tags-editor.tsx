"use client";

import { useCallback, useEffect, useState } from "react";
import { TagsField, type TagValue } from "@workspace/ui/components/tags-field";
import {
  addTagToContactAction,
  createContactTagAction,
  listContactTagsAction,
  removeTagFromContactAction,
} from "../data/contact-tag-actions";
import {
  assignmentsToTagValues,
  diffAssignmentTagIds,
  findOrgTagByLabel,
  orgTagsToSuggestions,
  type ContactTagAssignment,
  type OrgContactTag,
} from "../lib/contact-tags-editor-utils";

const DEFAULT_TAG_COLOR = "#6366f1";

export function ContactTagsEditor({
  contactId,
  assignments,
  disabled = false,
  onUpdated,
}: {
  contactId: string;
  assignments: ContactTagAssignment[];
  disabled?: boolean;
  onUpdated?: () => void;
}) {
  const [tags, setTags] = useState<TagValue[]>(() => assignmentsToTagValues(assignments));
  const [orgTags, setOrgTags] = useState<OrgContactTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  useEffect(() => {
    setTags(assignmentsToTagValues(assignments));
  }, [assignments]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setIsCatalogLoading(true);
      const result = await listContactTagsAction();

      if (!cancelled) {
        if (result.success) {
          setOrgTags(result.data);
        }
        setIsCatalogLoading(false);
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = orgTagsToSuggestions(orgTags);

  const persistDiff = useCallback(
    async (previous: TagValue[], next: TagValue[]) => {
      const { added, removed } = diffAssignmentTagIds(previous, next);
      const touchedIds = [...added, ...removed].map((tag) => tag.id);

      setPendingIds((current) => {
        const pending = new Set(current);
        for (const id of touchedIds) {
          pending.add(id);
        }
        return pending;
      });

      setError(null);

      try {
        for (const tag of removed) {
          const result = await removeTagFromContactAction(contactId, tag.id);

          if (!result.success) {
            throw new Error(result.error);
          }
        }

        for (const tag of added) {
          const existing = findOrgTagByLabel(orgTags, tag.label);
          let tagId = existing?.id ?? tag.id;

          if (!existing) {
            const created = await createContactTagAction({
              name: tag.label,
              color: tag.color ?? DEFAULT_TAG_COLOR,
            });

            if (!created.success) {
              throw new Error(created.error);
            }

            tagId = created.data.id;
            setOrgTags((current) => {
              if (current.some((entry) => entry.id === created.data.id)) {
                return current;
              }

              return [
                ...current,
                {
                  id: created.data.id,
                  name: created.data.name,
                  color: created.data.color,
                },
              ].sort((a, b) => a.name.localeCompare(b.name));
            });
          }

          const result = await addTagToContactAction(contactId, tagId);

          if (!result.success) {
            throw new Error(result.error);
          }
        }

        onUpdated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update tags");
        setTags(assignmentsToTagValues(assignments));
      } finally {
        setPendingIds((current) => {
          const pending = new Set(current);

          for (const id of touchedIds) {
            pending.delete(id);
          }

          return pending;
        });
      }
    },
    [assignments, contactId, onUpdated, orgTags],
  );

  async function handleTagsChange(nextTags: TagValue[]) {
    const previous = tags;
    setTags(nextTags);
    await persistDiff(previous, nextTags);
  }

  const isSaving = pendingIds.size > 0;

  return (
    <div className="space-y-2">
      <TagsField
        tags={tags}
        suggestions={suggestions}
        onTagsChange={(nextTags) => void handleTagsChange(nextTags)}
        placeholder={isSaving ? "Saving tags…" : "Search or create a tag…"}
        emptyText={isCatalogLoading ? "Loading tags…" : "No matching tags"}
        disabled={disabled || isSaving}
        isLoading={isCatalogLoading || isSaving}
        allowDuplicates={false}
        maxLength={50}
        createOptionLabel={(label) => `Create tag "${label}"`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
