"use client";

import { useState, useEffect, useTransition } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Page, PageBody } from "@workspace/ui/components/page";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  listContactTasksForOrgAction,
  updateContactTaskAction,
  listContactTaskStatusesAction,
} from "../data/contact-task-actions";

type Task = Extract<
  Awaited<ReturnType<typeof listContactTasksForOrgAction>>,
  { success: true }
>["data"][number];

type Status = Extract<
  Awaited<ReturnType<typeof listContactTaskStatusesAction>>,
  { success: true }
>["data"][number];

export function ContactsTasksPageContent({ orgSlug: _orgSlug }: { orgSlug: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    startTransition(async () => {
      const [tResult, sResult] = await Promise.all([
        listContactTasksForOrgAction(),
        listContactTaskStatusesAction(),
      ]);
      if (!isCurrent) return;
      if (tResult.success) setTasks(tResult.data);
      if (sResult.success) setStatuses(sResult.data);
    });
    return () => { isCurrent = false; };
  }, []);

  async function handleComplete(taskId: string) {
    if (completingId) return; // already completing one
    const terminal = statuses.find((s) => s.isTerminal);
    if (!terminal) {
      setError("No terminal status configured. Please add one in Contacts Settings.");
      return;
    }
    setCompletingId(taskId);
    try {
      const result = await updateContactTaskAction(taskId, {
        statusId: terminal.id,
        completedAt: new Date(),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      startTransition(async () => {
        const tResult = await listContactTasksForOrgAction();
        if (tResult.success) setTasks(tResult.data);
      });
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="Contact Tasks"
        description="View and complete tasks across all contacts."
      />
      <PageBody className="space-y-4 p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No tasks yet.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.contact?.displayName ?? "—"}
                  </TableCell>
                  <TableCell>
                    {task.status ? (
                      <Badge
                        style={{ backgroundColor: task.status.color ?? undefined }}
                        className="text-white"
                      >
                        {task.status.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.priority === "urgent" || task.priority === "high"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {!task.completedAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={completingId === task.id}
                        onClick={() => handleComplete(task.id)}
                      >
                        {completingId === task.id ? "Completing…" : "Complete"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </PageBody>
    </Page>
  );
}
