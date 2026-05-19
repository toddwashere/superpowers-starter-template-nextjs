"use client";

import { Page } from "@workspace/ui/components/page";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";

export function OrgDashboardPageContent() {
  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="Organization Dashboard"
        description="Welcome to your organization. Select a section from the sidebar."
      />
    </Page>
  );
}
