const ENV_KEY = "NEXT_PUBLIC_MCP_URL";

/** Base URL for the public MCP server (no trailing slash). */
export function getPublicMcpUrl(): string {
  const url = process.env[ENV_KEY]?.trim();
  if (!url) {
    throw new Error(
      `${ENV_KEY} is not set. Add it to your .env (see .env.example).`,
    );
  }
  return url.replace(/\/$/, "");
}

export function getPublicMcpEndpoint(): string {
  return `${getPublicMcpUrl()}/mcp`;
}
