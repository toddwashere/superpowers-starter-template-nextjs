import type { IncomingMessage } from "node:http";
import { verifyApiKey, ApiKeyError } from "@workspace/auth/api-keys";
import { auth } from "@workspace/auth";
import type { AuthContext } from "../lib/context";
import { McpAuthError } from "../lib/errors";

export { McpAuthError } from "../lib/errors";

function orgRoleToPermissions(_role: string): Record<string, string[]> {
  // All authenticated dashboard sessions get account read for now.
  // Extend here when more resources are added.
  return { account: ["read"] };
}

async function resolveSessionContext(
  headers: Headers,
): Promise<AuthContext | null> {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  return {
    kind: "session",
    userId: session.user.id,
    orgId: session.session.activeOrganizationId ?? null,
    permissions: orgRoleToPermissions("member"),
  };
}

export async function resolveMcpAuthContext(
  req: IncomingMessage,
): Promise<AuthContext> {
  // 1. API key via x-api-key header (external clients)
  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string") {
    try {
      const ctx = await verifyApiKey(apiKey);
      return { kind: "api-key", ...ctx };
    } catch (err) {
      if (err instanceof ApiKeyError) {
        throw new McpAuthError(
          err.code as "UNAUTHORIZED" | "RATE_LIMITED",
          err.message,
        );
      }
      throw new McpAuthError("UNAUTHORIZED", "Invalid API key");
    }
  }

  // 2. Session via Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const ctx = await resolveSessionContext(
      new Headers({ authorization: authHeader }),
    );
    if (!ctx) throw new McpAuthError("UNAUTHORIZED", "Invalid session token");
    return ctx;
  }

  // 3. Session via Cookie header (dashboard server actions forward cookies)
  const cookie = req.headers["cookie"];
  if (typeof cookie === "string") {
    const ctx = await resolveSessionContext(new Headers({ cookie }));
    if (ctx) return ctx;
  }

  throw new McpAuthError("UNAUTHORIZED", "Missing authentication");
}
