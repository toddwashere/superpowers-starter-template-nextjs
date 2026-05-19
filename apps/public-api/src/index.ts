import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "@hono/node-server";
import type { AppEnv } from "./lib/context";
import { createV1Router } from "./routes/v1";
import { registerDocs } from "./routes/docs";

const app = new OpenAPIHono<AppEnv>();

app.route("/", createV1Router());
registerDocs(app);

const port = Number(process.env.PUBLIC_API_PORT ?? 4002);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Public API running at http://localhost:${port}`);
  console.log(`Docs: http://localhost:${port}/docs`);
});
