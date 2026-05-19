"use client";

import Link from "next/link";
import { useState } from "react";
import { getPathForOrgSettingsMcpTest } from "@workspace/routes";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

const MCP_ENDPOINT = `${process.env.NEXT_PUBLIC_PUBLIC_MCP_URL ?? "http://localhost:4200"}/mcp`;

type Props = {
  orgSlug: string;
};

export function McpSettingsPageContent({ orgSlug }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(MCP_ENDPOINT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">MCP</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect via OAuth in ChatGPT, Claude, Microsoft Copilot, Gemini, or other
          assistants that support MCP connectors. 
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Paste this URL into your AI app&apos;s settings:
      </p>
      <div className="flex gap-2">
        <Input readOnly value={MCP_ENDPOINT} className="font-mono text-sm" />
        <Button type="button" variant="outline" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        <Link
          href={getPathForOrgSettingsMcpTest(orgSlug)}
          className="text-primary hover:underline"
        >
          Open MCP test panel
        </Link>{" "}
        to try tools with your current session.
      </p>
    </div>
  );
}
