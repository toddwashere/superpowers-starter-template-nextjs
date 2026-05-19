"use client";

import { PageHeader } from "@workspace/ui/components/page-header";
import { CommandMenuTrigger } from "@/features/command-menu/command-menu-trigger";
import type { DashboardPageHeaderNoOrgProps } from "./page-header-types";

export function PageHeaderNoOrg({
  leading,
  ...rest
}: DashboardPageHeaderNoOrgProps) {
  return (
    <PageHeader
      leading={leading}
      trailing={<CommandMenuTrigger />}
      {...rest}
    />
  );
}
