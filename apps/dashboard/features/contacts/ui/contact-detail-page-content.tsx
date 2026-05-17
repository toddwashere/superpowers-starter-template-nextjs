"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { getContactAction } from "../data/contact-actions";
import { listInteractionsAction, createNoteAction } from "../data/interaction-actions";
import { listContactTasksAction } from "../data/task-actions";

type Contact = Extract<
  Awaited<ReturnType<typeof getContactAction>>,
  { success: true }
>["data"];

type Interaction = Extract<
  Awaited<ReturnType<typeof listInteractionsAction>>,
  { success: true }
>["data"][number];

type Task = Extract<
  Awaited<ReturnType<typeof listContactTasksAction>>,
  { success: true }
>["data"][number];

export function ContactDetailPageContent({
  orgSlug,
  contactId,
}: {
  orgSlug: string;
  contactId: string;
}) {
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    // Reset state so old data doesn't show while new fetch is in-flight
    setContact(null);
    setInteractions([]);
    setTasks([]);
    setIsLoaded(false);

    startTransition(async () => {
      const [cResult, iResult, tResult] = await Promise.all([
        getContactAction(contactId),
        listInteractionsAction(contactId),
        listContactTasksAction(contactId),
      ]);
      if (!isCurrent) return; // discard stale response
      if (cResult.success) setContact(cResult.data);
      if (iResult.success) setInteractions(iResult.data);
      if (tResult.success) setTasks(tResult.data);
      setIsLoaded(true);
    });

    return () => { isCurrent = false; };
  }, [contactId]);

  async function handleAddNote() {
    if (!noteBody.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await createNoteAction(contactId, noteBody.trim());
      if (!result.success) {
        setNoteError(result.error);
        return;
      }
      setNoteBody("");
      setNoteError(null);
      // Refresh interactions only
      const iResult = await listInteractionsAction(contactId);
      if (iResult.success) setInteractions(iResult.data);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded && isPending) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (isLoaded && !contact) {
    return <p className="text-muted-foreground">Contact not found.</p>;
  }

  if (!contact) return null;

  const openTasks = tasks.filter((t) => !t.completedAt);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contact.displayName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline">{contact.kind}</Badge>
            {contact.stage && (
              <Badge
                style={{ backgroundColor: contact.stage.color ?? undefined }}
                className="text-white"
              >
                {contact.stage.name}
              </Badge>
            )}
            {contact.tags.map((a) => (
              <Badge key={a.tagId} variant="secondary">
                {a.tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {contact.primaryEmail && (
          <div>
            <span className="text-muted-foreground">Email: </span>
            {contact.primaryEmail}
          </div>
        )}
        {contact.primaryPhone && (
          <div>
            <span className="text-muted-foreground">Phone: </span>
            {contact.primaryPhone}
          </div>
        )}
        {contact.website && (
          <div>
            <span className="text-muted-foreground">Website: </span>
            {contact.website}
          </div>
        )}
        {contact.parent && (
          <div>
            <span className="text-muted-foreground">Parent: </span>
            <button
              className="underline hover:no-underline"
              onClick={() =>
                router.push(`/${orgSlug}/contacts/${contact.parent!.id}`)
              }
            >
              {contact.parent.displayName}
            </button>
          </div>
        )}
      </div>

      {contact.children.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-1">
            Related ({contact.children.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {contact.children.map((child: { id: string; displayName: string; kind: string }) => (
              <Badge
                key={child.id}
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/${orgSlug}/contacts/${child.id}`)
                }
              >
                {child.displayName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <h2 className="font-semibold mb-2">
          Open Tasks ({openTasks.length})
        </h2>
        {openTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open tasks.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {openTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <Badge variant="outline">
                  {task.status?.name ?? "No status"}
                </Badge>
                {task.title}
                {task.dueAt && (
                  <span className="text-muted-foreground ml-auto">
                    Due {new Date(task.dueAt).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold mb-2">Notes &amp; Activity</h2>
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Add a note…"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            rows={3}
          />
          {noteError && (
            <p className="text-sm text-destructive">{noteError}</p>
          )}
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!noteBody.trim() || isPending || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Add Note"}
          </Button>
        </div>

        <div className="space-y-3">
          {interactions.map((i) => (
            <div key={i.id} className="text-sm border rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{i.type}</Badge>
                <span className="text-muted-foreground text-xs">
                  {new Date(i.happenedAt).toLocaleString()}
                </span>
              </div>
              <p>{i.body}</p>
            </div>
          ))}
          {interactions.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
