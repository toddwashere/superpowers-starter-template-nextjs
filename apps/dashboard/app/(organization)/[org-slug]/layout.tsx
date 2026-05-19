"use client";

import { use } from "react";
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/common/ui/app-sidebar";
import { OrgProvider } from "@/features/organization/ui/org-provider";
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
        <SidebarInset className="flex min-h-0 flex-col">
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </OrgProvider>
  );
}
