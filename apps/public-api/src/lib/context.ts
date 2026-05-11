import type { Context } from "hono";
import type { ApiKeyContext } from "@workspace/auth/api-keys";

export type AppEnv = {
  Variables: {
    apiKeyContext: ApiKeyContext;
  };
};

export function getApiKeyContext(c: Context<AppEnv>): ApiKeyContext {
  return c.get("apiKeyContext");
}
