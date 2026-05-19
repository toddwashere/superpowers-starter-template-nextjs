"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Page, PageBody } from "@workspace/ui/components/page";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";
import { useCurrentOrg } from "./org-provider";

export function GeneralSettingsPageContent({
  orgSlug: _orgSlug,
}: {
  orgSlug: string;
}) {
  const { organization, isLoading } = useCurrentOrg();

  if (isLoading || !organization) {
    return (
      <Page className="flex min-h-0 flex-1 flex-col">
        <PageHeaderInOrg
          title="General Settings"
          description="Manage your organization's general settings."
        />
        <PageBody disableScroll className="space-y-4 p-6">
          <Skeleton className="h-40 w-full" />
        </PageBody>
      </Page>
    );
  }

  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="General Settings"
        description="Manage your organization's general settings."
      />
      <PageBody disableScroll className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Basic information about your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Name
              </span>
              <span className="text-sm">{organization.name}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Slug
              </span>
              <span className="font-mono text-sm">{organization.slug}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Created
              </span>
              <span className="text-sm">
                {new Date(organization.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  );
}
