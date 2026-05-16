"use client";

import { use } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import { AppSidebar } from "@/common/ui/app-sidebar";
import { OrgProvider } from "@/features/organization/ui/org-provider";
import { CommandMenuTrigger } from "@/features/command-menu/command-menu-trigger";
import { orgNavConfig } from "./nav-items-org";

export default function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = use(params);

  return (
    <OrgProvider orgSlug={orgSlug}>
      <SidebarProvider>
        <AppSidebar navConfig={orgNavConfig} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <CommandMenuTrigger />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </OrgProvider>
  );
}
