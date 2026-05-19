import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { resolveMcpAuthContext, McpAuthError } from "./middleware/mcp-auth";
import { writeJsonError } from "./lib/errors";
import { writeProtectedResourceMetadata, getWwwAuthenticateHeader } from "./lib/metadata";
import { registerTools } from "./tools/registry";
import { getMcpListenPort } from "./lib/mcp-url";

async function readBody(req: IncomingMessage): Promise<unknown> {
  if (req.method !== "POST") return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString();
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? "";

  // OAuth protected-resource metadata — required for MCP client OAuth discovery
  if (url === "/.well-known/oauth-protected-resource") {
    writeProtectedResourceMetadata(res);
    return;
  }

  if (!url.startsWith("/mcp")) {
    writeJsonError(res, 404, "NOT_FOUND", "Not found");
    return;
  }

  let authContext;
  try {
    authContext = await resolveMcpAuthContext(req);
  } catch (err) {
    if (err instanceof McpAuthError) {
      const status = err.code === "RATE_LIMITED" ? 429 : 401;
      if (status === 401) {
        res.setHeader("WWW-Authenticate", getWwwAuthenticateHeader());
      }
      writeJsonError(res, status, err.code, err.message);
    } else {
      writeJsonError(res, 500, "INTERNAL_ERROR", "Internal server error");
    }
    return;
  }

  const body = await readBody(req);
  const mcpServer = new McpServer({ name: "public-mcp", version: "1.0.0" });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  registerTools(mcpServer, authContext);
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, body);
});

const port = getMcpListenPort();
server.listen(port, () => {
  console.log(`Public MCP server running at http://localhost:${port}/mcp`);
});
