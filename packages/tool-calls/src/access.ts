import type { ToolCallContext } from "./context";
import type { ToolDefinition } from "./tool-definition";

function hasPermission(
  permissions: Record<string, string[]>,
  required: Record<string, string[]>,
): boolean {
  return Object.entries(required).every(([resource, actions]) => {
    const granted = permissions[resource] ?? [];
    return actions.every((action) => granted.includes(action));
  });
}

export function hasAccess(ctx: ToolCallContext, tool: ToolDefinition): boolean {
  if (ctx.kind === "oauth") {
    return tool.requiredScopes.every((scope) => ctx.scopes.includes(scope));
  }
  if (ctx.kind === "api-key" || ctx.kind === "session") {
    return hasPermission(ctx.permissions, tool.requiredPermissions);
  }
  return false;
}
