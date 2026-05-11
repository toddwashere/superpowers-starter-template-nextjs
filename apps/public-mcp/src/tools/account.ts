import type { AuthContext } from "../lib/context";

type AccountInfo = {
  kind: AuthContext["kind"];
  ownerType: "organization" | "user" | null;
  orgId: string | null;
  userId: string | null;
  permissions: Record<string, string[]>;
};

export function accountInfoHandler(ctx: AuthContext): AccountInfo {
  if (ctx.kind === "api-key") {
    return {
      kind: ctx.kind,
      ownerType: ctx.ownerType,
      orgId: ctx.orgId,
      userId: ctx.userId,
      permissions: ctx.permissions,
    };
  }
  return {
    kind: ctx.kind,
    ownerType: null,
    orgId: ctx.orgId,
    userId: ctx.userId,
    permissions: ctx.permissions,
  };
}
