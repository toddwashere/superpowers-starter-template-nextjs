import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthContext } from "../lib/context";
import { toolRegistry, hasAccess } from "@workspace/tool-calls";
import { logToolCall } from "../lib/audit";

export function registerTools(server: McpServer, ctx: AuthContext): void {
  for (const tool of toolRegistry) {
    const shape = tool.inputShape ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server.tool(tool.name, tool.description, shape as any, async (args: Record<string, unknown>) => {
      if (!hasAccess(ctx, tool)) {
        void logToolCall({ toolName: tool.name, ctx, success: false, errorCode: "FORBIDDEN" });
        return {
          content: [{ type: "text" as const, text: `Forbidden: missing required permission for ${tool.name}` }],
          isError: true,
        };
      }
      try {
        const result = await tool.run(ctx, args);
        void logToolCall({ toolName: tool.name, ctx, success: true });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        void logToolCall({ toolName: tool.name, ctx, success: false, errorCode: "INTERNAL_ERROR" });
        console.error(`[mcp] Tool ${tool.name} failed:`, err);
        return {
          content: [{ type: "text" as const, text: "Internal error" }],
          isError: true,
        };
      }
    });
  }
}
