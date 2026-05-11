import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthContext } from "../lib/context";
import { hasPermission } from "@workspace/auth/api-keys";
import { accountInfoHandler } from "./account";

export const toolPermissions: Record<string, Record<string, string[]>> = {
  "account-info": { account: ["read"] },
};

export function registerTools(server: McpServer, ctx: AuthContext): void {
  server.tool("account-info", "Returns the authenticated identity", {}, () => {
    const required = toolPermissions["account-info"];
    if (!required || !hasPermission(ctx.permissions, required)) {
      return {
        content: [{ type: "text", text: "Forbidden: missing account:read permission" }],
        isError: true,
      };
    }
    const result = accountInfoHandler(ctx);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  });
}
