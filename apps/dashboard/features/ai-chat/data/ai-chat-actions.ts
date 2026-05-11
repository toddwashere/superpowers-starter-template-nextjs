"use server";

import { requireUser } from "@workspace/auth/guards";
import { headers } from "next/headers";

const PUBLIC_MCP_URL = process.env.PUBLIC_MCP_URL ?? "http://localhost:4200";

async function mcpPost(cookie: string, body: unknown): Promise<Response> {
  return fetch(`${PUBLIC_MCP_URL}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
  });
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
  if (!res.ok) throw new Error(`MCP call failed: ${res.status}`);
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
