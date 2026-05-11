import type { MiddlewareHandler } from "hono";
import { verifyApiKey, ApiKeyError } from "@workspace/auth/api-keys";
import type { AppEnv } from "../lib/context";
import { errorResponse } from "../lib/errors";

export const apiKeyAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const key = c.req.header("x-api-key");
  if (!key) {
    return errorResponse(c, 401, "UNAUTHORIZED", "Missing x-api-key header");
  }
  try {
    const ctx = await verifyApiKey(key);
    c.set("apiKeyContext", ctx);
    await next();
  } catch (err) {
    if (err instanceof ApiKeyError) {
      const status = err.code === "RATE_LIMITED" ? 429 : 401;
      return errorResponse(c, status, err.code, err.message);
    }
    return errorResponse(c, 500, "INTERNAL_ERROR", "Internal server error");
  }
};
