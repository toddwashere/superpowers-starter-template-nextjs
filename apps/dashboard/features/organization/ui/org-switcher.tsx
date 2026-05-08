"use client";

import { useRouter, useParams } from "next/navigation";
import { IconForExpand, IconForAdd } from "@workspace/ui/components/icon-for";
import { authClient } from "@workspace/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { createOrgPath, orgPath } from "@workspace/routes";

export function OrgSwitcher() {
  const router = useRouter();
  const params = useParams<{ "org-slug"?: string }>();
  const { isMobile } = useSidebar();

  const { data: orgsResult, isPending } =
    authClient.useListOrganizations();

  const organizations = orgsResult ?? [];
  const currentSlug = params["org-slug"];
  const activeOrg = organizations.find((o) => o.slug === currentSlug);

  const handleSwitchOrg = async (orgId: string, slug: string) => {
    await authClient.organization.setActive({
      organizationId: orgId,
    });
    router.push(orgPath(slug));
  };

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeOrg ? activeOrg.name.slice(0, 1) : "?"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrg?.name ?? "Select Organization"}
                </span>
              </div>
              <IconForExpand className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="gap-2 p-2"
                onSelect={() => handleSwitchOrg(org.id, org.slug)}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {org.name.slice(0, 1)}
                </div>
                <span className={org.slug === currentSlug ? "font-semibold" : ""}>
                  {org.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={() => router.push(createOrgPath())}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <IconForAdd />
              </div>
              <span className="font-medium text-muted-foreground">
                Create Organization
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={() => router.push("/")}
            >
              <span className="text-sm text-muted-foreground">
                All Organizations
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
