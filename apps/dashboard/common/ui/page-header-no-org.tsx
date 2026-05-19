"use client";

import { PageHeader } from "@workspace/ui/components/page-header";
import { CommandMenuTrigger } from "@/features/command-menu/command-menu-trigger";
import type { DashboardPageHeaderProps } from "./page-header-types";

export function PageHeaderNoOrg(props: DashboardPageHeaderProps) {
  return <PageHeader trailing={<CommandMenuTrigger />} {...props} />;
}
