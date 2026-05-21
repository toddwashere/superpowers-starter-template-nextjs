"use client";

import { useCallback, useEffect, useState } from "react";
import { TagInput, type TagType } from "@workspace/ui/components/tag-input";
import { setContactTagsAction } from "../data/contact-tag-actions";

type ContactTagAssignment = {
  tagId: string;
  tag: { name: string };
};

function assignmentsToTagTypes(assignments: ContactTagAssignment[]): TagType[] {
  return assignments.map((a) => ({ id: a.tagId, text: a.tag.name }));
}

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
  const [tags, setTags] = useState<TagType[]>(() => assignmentsToTagTypes(assignments));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTags(assignmentsToTagTypes(assignments));
  }, [assignments]);

  const persistTags = useCallback(
    async (nextTags: TagType[]) => {
      setIsSaving(true);
      setError(null);
      try {
        const result = await setContactTagsAction(
          contactId,
          nextTags.map((tag) => tag.text),
        );
        if (!result.success) {
          setError(result.error);
          setTags(assignmentsToTagTypes(assignments));
          return;
        }
        onUpdated?.();
      } finally {
        setIsSaving(false);
      }
    },
    [assignments, contactId, onUpdated],
  );

  async function handleTagsChange(nextTags: TagType[]) {
    setTags(nextTags);
    await persistTags(nextTags);
  }

  return (
    <div className="space-y-2">
      <TagInput
        tags={tags}
        onTagsChange={(nextTags) => void handleTagsChange(nextTags)}
        placeholder={isSaving ? "Saving tags…" : "Add a tag and press Enter"}
        disabled={disabled || isSaving}
        allowDuplicates={false}
        maxLength={50}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
