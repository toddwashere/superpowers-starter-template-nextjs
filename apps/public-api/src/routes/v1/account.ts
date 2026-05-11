import { createRoute, z, OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../lib/context";
import { getApiKeyContext } from "../../lib/context";
import { errorResponse } from "../../lib/errors";
import { hasPermission } from "@workspace/auth/api-keys";

const AccountResponseSchema = z.object({
  keyId: z.string(),
  ownerType: z.enum(["organization", "user"]),
  orgId: z.string().nullable(),
  userId: z.string().nullable(),
  permissions: z.record(z.array(z.string())),
});

const accountRoute = createRoute({
  method: "get",
  path: "/v1/account",
  security: [{ apiKey: [] }],
  responses: {
    200: {
      content: { "application/json": { schema: AccountResponseSchema } },
      description: "Returns the authenticated identity for this API key",
    },
  },
});

export function registerAccountRoute(app: OpenAPIHono<AppEnv>): void {
  app.openapi(accountRoute, (c) => {
    const ctx = getApiKeyContext(c);
    if (!hasPermission(ctx.permissions, { account: ["read"] })) {
      return errorResponse(c, 403, "FORBIDDEN", "Missing account:read permission") as never;
    }
    return c.json({
      keyId: ctx.keyId,
      ownerType: ctx.ownerType,
      orgId: ctx.orgId ?? null,
      userId: ctx.userId ?? null,
      permissions: ctx.permissions,
    });
  });
}
