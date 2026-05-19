/** Headers required by the MCP Streamable HTTP transport. */
export const MCP_STREAMABLE_HTTP_HEADERS = {
  Accept: "application/json, text/event-stream",
  "Content-Type": "application/json",
} as const;

export async function mcpStreamableHttpPost(
  endpoint: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: { ...MCP_STREAMABLE_HTTP_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  });
}

/** Parse a JSON or SSE JSON-RPC response from the MCP server. */
export async function readMcpJsonRpcResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();

  if (contentType.includes("text/event-stream")) {
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) {
        const data = trimmed.slice(5).trim();
        if (data) {
          return JSON.parse(data) as unknown;
        }
      }
    }
    throw new Error("No JSON-RPC message in MCP SSE response");
  }

  if (!body) {
    throw new Error("Empty MCP response body");
  }

  return JSON.parse(body) as unknown;
}
