"use client";

import { useState, useEffect, useTransition } from "react";
import { Page, PageBody } from "@workspace/ui/components/page";
import { Separator } from "@workspace/ui/components/separator";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";
import { listContactStagesAction } from "../../contact-stage/data/contact-stage-actions";
import { listContactTagsAction } from "../../contact-tag/data/contact-tag-actions";
import { listContactTaskStatusesAction } from "../../contact-task/data/contact-task-actions";
import { ContactStagesSettingsSection } from "../../contact-stage/ui/contact-stages-settings-section";
import { ContactTagsSettingsSection } from "../../contact-tag/ui/contact-tags-settings-section";
import { ContactTaskStatusesSettingsSection } from "../../contact-task/ui/contact-task-statuses-settings-section";

type ContactStage = Extract<
  Awaited<ReturnType<typeof listContactStagesAction>>,
  { success: true }
>["data"][number];

type ContactTag = Extract<
  Awaited<ReturnType<typeof listContactTagsAction>>,
  { success: true }
>["data"][number];

type ContactTaskStatus = Extract<
  Awaited<ReturnType<typeof listContactTaskStatusesAction>>,
  { success: true }
>["data"][number];

export function ContactsSettingsPageContent({ orgSlug: _orgSlug }: { orgSlug: string }) {
  const [stages, setStages] = useState<ContactStage[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [statuses, setStatuses] = useState<ContactTaskStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      await reload();
    });
  }, []);

  async function reload() {
    const [sResult, tResult, tsResult] = await Promise.all([
      listContactStagesAction(),
      listContactTagsAction(),
      listContactTaskStatusesAction(),
    ]);
    if (sResult.success) setStages(sResult.data);
    if (tResult.success) setTags(tResult.data);
    if (tsResult.success) setStatuses(tsResult.data);
  }

  function handleError(message: string) {
    setError(message);
  }

  function clearError() {
    setError(null);
  }

  async function handleReload() {
    clearError();
    await reload();
  }

  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="Contacts Settings"
        description="Configure stages, tags, and task statuses for contacts."
      />
      <PageBody disableScroll className="max-w-2xl space-y-8 p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <ContactStagesSettingsSection
        stages={stages}
        isPending={isPending}
        isMutating={false}
        onError={handleError}
        onReload={handleReload}
      />

      <Separator />

      <ContactTagsSettingsSection
        tags={tags}
        isPending={isPending}
        isMutating={false}
        onError={handleError}
        onReload={handleReload}
      />

      <Separator />

      <ContactTaskStatusesSettingsSection
        statuses={statuses}
        isPending={isPending}
        isMutating={false}
        onError={handleError}
        onReload={handleReload}
      />
      </PageBody>
    </Page>
  );
}
