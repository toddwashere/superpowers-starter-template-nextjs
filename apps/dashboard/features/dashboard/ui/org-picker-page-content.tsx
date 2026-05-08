"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@workspace/auth/client";
import { orgPath, createOrgPath } from "@workspace/routes";
import {
  Avatar,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { IconForAdd } from "@workspace/ui/components/icon-for";

export function OrgPickerPageContent() {
  const router = useRouter();
  const { data: orgsResult, isPending } = authClient.useListOrganizations();
  const organizations = orgsResult ?? [];

  const handleSelectOrg = async (orgId: string, slug: string) => {
    await authClient.organization.setActive({ organizationId: orgId });
    router.push(orgPath(slug));
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="mt-2 text-muted-foreground">
          Create your first organization to get started.
        </p>
        <Button className="mt-6" onClick={() => router.push(createOrgPath())}>
          <IconForAdd className="mr-2" />
          Create Organization
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Organizations</h1>
        <p className="mt-1 text-muted-foreground">
          Select an organization to continue.
        </p>
      </div>
      <div className="space-y-3">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => handleSelectOrg(org.id, org.slug)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {org.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-muted-foreground">{org.slug}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(createOrgPath())}
      >
        <IconForAdd className="mr-2" />
        Create Organization
      </Button>
    </div>
  );
}
