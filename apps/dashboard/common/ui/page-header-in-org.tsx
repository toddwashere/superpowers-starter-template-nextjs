"use client";

import { PageHeader } from "@workspace/ui/components/page-header";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { CommandMenuTrigger } from "@/features/command-menu/command-menu-trigger";
import type { DashboardPageHeaderInOrgProps } from "./page-header-types";

export function PageHeaderInOrg(props: DashboardPageHeaderInOrgProps) {
  return (
    <PageHeader
      leading={
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </>
      }
      trailing={<CommandMenuTrigger />}
      {...props}
    />
  );
}
