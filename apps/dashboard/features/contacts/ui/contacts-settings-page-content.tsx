"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  listStagesAction,
  createStageAction,
  deleteStageAction,
} from "../data/stage-actions";
import {
  listTagsAction,
  createTagAction,
  deleteTagAction,
} from "../data/tag-actions";
import {
  listTaskStatusesAction,
  createTaskStatusAction,
  deleteTaskStatusAction,
} from "../data/task-actions";

type Stage = Extract<
  Awaited<ReturnType<typeof listStagesAction>>,
  { success: true }
>["data"][number];

type Tag = Extract<
  Awaited<ReturnType<typeof listTagsAction>>,
  { success: true }
>["data"][number];

type TaskStatus = Extract<
  Awaited<ReturnType<typeof listTaskStatusesAction>>,
  { success: true }
>["data"][number];

export function ContactsSettingsPageContent({ orgSlug: _orgSlug }: { orgSlug: string }) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [sResult, tResult, tsResult] = await Promise.all([
        listStagesAction(),
        listTagsAction(),
        listTaskStatusesAction(),
      ]);
      if (sResult.success) setStages(sResult.data);
      if (tResult.success) setTags(tResult.data);
      if (tsResult.success) setStatuses(tsResult.data);
    });
  }, []);

  async function reload() {
    const [sResult, tResult, tsResult] = await Promise.all([
      listStagesAction(),
      listTagsAction(),
      listTaskStatusesAction(),
    ]);
    if (sResult.success) setStages(sResult.data);
    if (tResult.success) setTags(tResult.data);
    if (tsResult.success) setStatuses(tsResult.data);
  }

  async function handleAddStage() {
    if (!newStageName.trim()) return;
    const result = await createStageAction({
      name: newStageName.trim(),
      color: "#6366f1",
      sortOrder: stages.length,
      isDefault: false,
    });
    if (!result.success) { setError(result.error); return; }
    setNewStageName("");
    setError(null);
    await reload();
  }

  async function handleDeleteStage(stageId: string) {
    const result = await deleteStageAction(stageId);
    if (!result.success) { setError(result.error); return; }
    setError(null);
    await reload();
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    const result = await createTagAction({ name: newTagName.trim(), color: "#6366f1" });
    if (!result.success) { setError(result.error); return; }
    setNewTagName("");
    setError(null);
    await reload();
  }

  async function handleDeleteTag(tagId: string) {
    const result = await deleteTagAction(tagId);
    if (!result.success) { setError(result.error); return; }
    setError(null);
    await reload();
  }

  async function handleAddStatus() {
    if (!newStatusName.trim()) return;
    const result = await createTaskStatusAction({
      name: newStatusName.trim(),
      color: "#6366f1",
      sortOrder: statuses.length,
      isDefault: false,
      isTerminal: false,
    });
    if (!result.success) { setError(result.error); return; }
    setNewStatusName("");
    setError(null);
    await reload();
  }

  async function handleDeleteStatus(statusId: string) {
    const result = await deleteTaskStatusAction(statusId);
    if (!result.success) { setError(result.error); return; }
    setError(null);
    await reload();
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Contacts Settings</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Contact Stages */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contact Stages</h2>
        <div className="flex flex-wrap gap-2">
          {stages.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <Badge style={{ backgroundColor: s.color ?? undefined }} className="text-white">
                {s.name}
              </Badge>
              {!s.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground"
                  onClick={() => handleDeleteStage(s.id)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New stage name"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => { if (e.key === "Enter") void handleAddStage(); }}
          />
          <Button variant="outline" onClick={handleAddStage} disabled={isPending || !newStageName.trim()}>
            Add Stage
          </Button>
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <div key={t.id} className="flex items-center gap-1">
              <Badge variant="secondary">{t.name}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground"
                onClick={() => handleDeleteTag(t.id)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => { if (e.key === "Enter") void handleAddTag(); }}
          />
          <Button variant="outline" onClick={handleAddTag} disabled={isPending || !newTagName.trim()}>
            Add Tag
          </Button>
        </div>
      </section>

      <Separator />

      {/* Task Statuses */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Task Statuses</h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <Badge style={{ backgroundColor: s.color ?? undefined }} className="text-white">
                {s.name}{s.isTerminal ? " ✓" : ""}
              </Badge>
              {!s.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground"
                  onClick={() => handleDeleteStatus(s.id)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New status name"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => { if (e.key === "Enter") void handleAddStatus(); }}
          />
          <Button variant="outline" onClick={handleAddStatus} disabled={isPending || !newStatusName.trim()}>
            Add Status
          </Button>
        </div>
      </section>
    </div>
  );
}
