import type { Metadata } from "next";
import { McpSettingsPageContent } from "@/features/core/mcp/ui/mcp-settings-page-content";

export const metadata: Metadata = { title: "MCP" };

export default async function McpSettingsPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;
  return <McpSettingsPageContent orgSlug={orgSlug} />;
}
