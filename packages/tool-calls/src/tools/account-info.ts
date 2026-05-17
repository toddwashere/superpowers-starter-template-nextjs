import type { ToolDefinition } from "../tool-definition";
import type { ToolCallContext } from "../context";

type AccountInfoOutput = {
  authKind: string;
  userId: string | null;
  orgId: string | null;
  ownerType: "organization" | "user" | null;
  clientId: string | null;
  scopes: string[] | null;
  permissions: Record<string, string[]> | null;
};

export const accountInfoTool: ToolDefinition<AccountInfoOutput> = {
  name: "account-info",
  description: "Returns the authenticated identity and authorization context",
  requiredScopes: ["account:read"],
  requiredPermissions: { account: ["read"] },
  run: async (ctx: ToolCallContext, _input: Record<string, unknown>): Promise<AccountInfoOutput> => {
    if (ctx.kind === "oauth") {
      return {
        authKind: "oauth",
        userId: ctx.userId,
        orgId: ctx.orgId,
        ownerType: null,
        clientId: ctx.clientId,
        scopes: ctx.scopes,
        permissions: null,
      };
    }
    if (ctx.kind === "api-key") {
      return {
        authKind: "api-key",
        userId: ctx.userId,
        orgId: ctx.orgId,
        ownerType: ctx.ownerType,
        clientId: null,
        scopes: null,
        permissions: ctx.permissions,
      };
    }
    return {
      authKind: "session",
      userId: ctx.userId,
      orgId: ctx.orgId,
      ownerType: null,
      clientId: null,
      scopes: null,
      permissions: ctx.permissions,
    };
  },
};
