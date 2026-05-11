import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../lib/context";
import { apiKeyAuth } from "../../middleware/api-key-auth";
import { orgScope } from "../../middleware/org-scope";
import { registerAccountRoute } from "./account";

export function createV1Router(): OpenAPIHono<AppEnv> {
  const v1 = new OpenAPIHono<AppEnv>();
  v1.use("/*", apiKeyAuth, orgScope);
  registerAccountRoute(v1);
  return v1;
}
