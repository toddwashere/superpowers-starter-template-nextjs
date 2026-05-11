import type { Metadata } from "next";
import { McpTestPageContent } from "@/features/api-keys/ui/mcp-test-page-content";

export const metadata: Metadata = { title: "MCP Test Panel" };

export default function McpTestPage() {
  return <McpTestPageContent />;
}
