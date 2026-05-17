import { prisma } from "@workspace/database/client";
import type { AuthContext } from "../lib/context";

type AuditInput = {
  toolName: string;
  ctx: AuthContext;
  success: boolean;
  errorCode?: string;
};

export async function logToolCall({
  toolName,
  ctx,
  success,
  errorCode,
}: AuditInput): Promise<void> {
  try {
    await prisma.mcpToolCallLog.create({
      data: {
        toolName,
        authKind: ctx.kind,
        userId: ctx.kind === "api-key" ? (ctx.userId ?? null) : ctx.userId,
        orgId: ctx.orgId ?? null,
        clientId: ctx.kind === "oauth" ? ctx.clientId : null,
        keyId: ctx.kind === "api-key" ? ctx.keyId : null,
        success,
        errorCode: errorCode ?? null,
      },
    });
  } catch (err) {
    // Audit failures must not block tool responses
    console.error("[audit] Failed to log tool call:", err);
  }
}
