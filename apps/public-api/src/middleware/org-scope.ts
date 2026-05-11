import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../lib/context";
import { errorResponse } from "../lib/errors";

export const orgScope: MiddlewareHandler<AppEnv> = async (c, next) => {
  const ctx = c.get("apiKeyContext");
  if (ctx.ownerType === "organization" && !ctx.orgId) {
    return errorResponse(c, 401, "UNAUTHORIZED", "Invalid API key scope");
  }
  await next();
};
