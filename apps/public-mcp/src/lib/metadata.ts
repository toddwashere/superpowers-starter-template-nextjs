import type { ServerResponse } from "node:http";
import { getPublicMcpUrl } from "@workspace/common/env/public-mcp";

const AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";

export function writeProtectedResourceMetadata(res: ServerResponse): void {
  const metadata = {
    resource: getPublicMcpUrl(),
    authorization_servers: [AUTH_URL],
    scopes_supported: ["account:read", "offline_access"],
  };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(metadata));
}

export function getWwwAuthenticateHeader(): string {
  const metadataUrl = `${getPublicMcpUrl()}/.well-known/oauth-protected-resource`;
  return `Bearer realm="MCP", resource_metadata="${metadataUrl}"`;
}
