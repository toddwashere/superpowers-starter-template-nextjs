"use client";

import Link from "next/link";
import { getPathForOrgSettingsMcpTest } from "@workspace/routes";
import { Page, PageBody } from "@workspace/ui/components/page";
import { CopyToClipboardField } from "@workspace/ui/components/copy-to-clipboard-button";
import { getPublicMcpEndpoint } from "@workspace/common/env/public-mcp";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";

type Props = {
  orgSlug: string;
};

export function McpSettingsPageContent({ orgSlug }: Props) {
  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="MCP"
        description="Connect via OAuth in ChatGPT, Claude, Microsoft Copilot, Gemini, or other assistants that support MCP connectors."
      />
      <PageBody disableScroll className="max-w-xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          Paste this URL into your AI app&apos;s settings:
        </p>
        <CopyToClipboardField text={getPublicMcpEndpoint()} />

        <p className="text-sm text-muted-foreground">
          <Link
            href={getPathForOrgSettingsMcpTest(orgSlug)}
            className="text-primary hover:underline"
          >
            Open MCP test panel
          </Link>{" "}
          to try tools with your current session.
        </p>
      </PageBody>
    </Page>
  );
}
