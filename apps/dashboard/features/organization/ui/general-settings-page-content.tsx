"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useCurrentOrg } from "./org-provider";

export function GeneralSettingsPageContent({
  orgSlug,
}: {
  orgSlug: string;
}) {
  const { organization, isLoading } = useCurrentOrg();

  if (isLoading || !organization) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
        <p className="text-muted-foreground">
          Manage your organization's general settings.
        </p>
      </div>

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
    </div>
  );
}
