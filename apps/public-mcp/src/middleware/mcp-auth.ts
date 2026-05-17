import type { IncomingMessage } from "node:http";
import { verifyApiKey, ApiKeyError } from "@workspace/auth/api-keys";
import { auth } from "@workspace/auth";
import type { AuthContext } from "../lib/context";
import { McpAuthError } from "../lib/errors";

export { McpAuthError } from "../lib/errors";

function orgRoleToPermissions(_role: string): Record<string, string[]> {
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

async function resolveOAuthContext(
  token: string,
): Promise<AuthContext | null> {
  try {
    // oauthProviderResourceClient wraps verifyAccessToken with auto-populated
    // issuer and JWKS URL derived from the auth config (BETTER_AUTH_URL).
    // This verifies JWT access tokens issued by Better Auth's OAuth Provider
    // when clients pass a `resource` parameter during token issuance.
    const { oauthProviderResourceClient } = await import(
      "@better-auth/oauth-provider/resource-client"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = oauthProviderResourceClient(auth as any);
    // Cast to the with-auth overload: verifyAccessToken(token) with no required opts
    const verifyFn = client.getActions().verifyAccessToken as (
      token: string,
    ) => Promise<Record<string, unknown>>;
    const payload = await verifyFn(token);
    if (!payload) return null;
    const sub = payload["sub"];
    const scope = payload["scope"];
    const clientId = payload["client_id"] ?? payload["azp"] ?? null;
    const orgId = payload["orgId"] ?? null;
    if (typeof sub !== "string") return null;
    return {
      kind: "oauth",
      userId: sub,
      orgId: typeof orgId === "string" ? orgId : null,
      scopes: typeof scope === "string" ? scope.split(" ") : [],
      clientId: typeof clientId === "string" ? clientId : null,
    };
  } catch {
    return null;
  }
}

export async function resolveMcpAuthContext(
  req: IncomingMessage,
): Promise<AuthContext> {
  // 1. API key via x-api-key header (external clients, backward compat)
  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string") {
    try {
      const ctx = await verifyApiKey(apiKey);
      return { kind: "api-key", ...ctx };
    } catch (err) {
      if (err instanceof ApiKeyError) {
        throw new McpAuthError(err.code, err.message);
      }
      throw new McpAuthError("UNAUTHORIZED", "Invalid API key");
    }
  }

  // 2. Bearer token — try OAuth JWT first, then fall back to session bearer
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    const oauthCtx = await resolveOAuthContext(token);
    if (oauthCtx) return oauthCtx;

    // Fallback: session token (dashboard test panel compatibility)
    const sessionCtx = await resolveSessionContext(
      new Headers({ authorization: authHeader }),
    );
    if (sessionCtx) return sessionCtx;

    throw new McpAuthError("UNAUTHORIZED", "Invalid token");
  }

  // 3. Session via Cookie (dashboard server actions forward cookies)
  const cookie = req.headers["cookie"];
  if (typeof cookie === "string") {
    const ctx = await resolveSessionContext(new Headers({ cookie }));
    if (ctx) return ctx;
  }

  throw new McpAuthError("UNAUTHORIZED", "Missing authentication");
}
