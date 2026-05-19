"use server";

import { requireUser } from "@workspace/auth/guards";
import { headers } from "next/headers";
import { getPublicMcpEndpoint } from "@workspace/common/env/public-mcp";

async function mcpPost(cookie: string, body: unknown): Promise<Response> {
  const endpoint = getPublicMcpEndpoint();
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    });
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
  return res.json() as Promise<unknown>;
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
  const data = (await res.json()) as { result?: { tools?: unknown[] } };
  return data.result?.tools ?? [];
}
