"use server";

import { requireUser } from "@workspace/auth/guards";
import {
  mcpStreamableHttpPost,
  readMcpJsonRpcResponse,
} from "@workspace/common/mcp/http-client";
import { getPublicMcpEndpoint } from "@workspace/common/env/public-mcp";
import { headers } from "next/headers";

async function mcpPost(cookie: string, body: unknown): Promise<Response> {
  const endpoint = getPublicMcpEndpoint();
  try {
    return await mcpStreamableHttpPost(endpoint, body, { Cookie: cookie });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Cannot reach MCP server at ${endpoint}. Is public-mcp running? (${message})`,
    );
  }
}

export async function callMcpToolAction(toolName: string, args: Record<string, unknown>) {
  await requireUser();
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await mcpPost(cookie, {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: { name: toolName, arguments: args },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `MCP call failed (${res.status}) at ${getPublicMcpEndpoint()}${text ? `: ${text.slice(0, 200)}` : ""}`,
    );
  }
  return readMcpJsonRpcResponse(res);
}

export async function listMcpToolsAction() {
  await requireUser();
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await mcpPost(cookie, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {},
  });
  if (!res.ok) return [];
  const data = (await readMcpJsonRpcResponse(res)) as { result?: { tools?: unknown[] } };
  return data.result?.tools ?? [];
}
