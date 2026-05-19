"use client";

import { Page } from "@workspace/ui/components/page";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";

export function BillingPageContent() {
  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="Billing"
        description="Manage your organization's billing and subscription."
      />
    </Page>
  );
}
