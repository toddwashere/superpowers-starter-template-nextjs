"use server";

import { auth } from "@workspace/auth";
import { requireOrgPermission, requireUser } from "@workspace/auth/guards";
import { headers } from "next/headers";
import type { CreateApiKeyInput } from "./api-key-types";

export async function createOrgApiKeyAction(data: CreateApiKeyInput) {
  await requireOrgPermission({ apiKey: ["create"] });
  const requestHeaders = await headers();
  return auth.api.createApiKey({
    body: {
      configId: data.configId,
      name: data.name ?? undefined,
      permissions: data.permissions,
      expiresIn: data.expiresIn ?? undefined,
    },
    headers: requestHeaders,
  });
}

export async function listOrgApiKeysAction() {
  await requireOrgPermission({ apiKey: ["read"] });
  const requestHeaders = await headers();
  return auth.api.listApiKeys({
    query: { configId: "org-keys" },
    headers: requestHeaders,
  });
}

export async function listPersonalApiKeysAction() {
  await requireUser();
  const requestHeaders = await headers();
  return auth.api.listApiKeys({
    query: { configId: "user-keys" },
    headers: requestHeaders,
  });
}

export async function createPersonalApiKeyAction(data: Omit<CreateApiKeyInput, "configId">) {
  await requireUser();
  const requestHeaders = await headers();
  return auth.api.createApiKey({
    body: {
      configId: "user-keys",
      name: data.name,
      permissions: data.permissions,
      expiresIn: data.expiresIn ?? undefined,
    },
    headers: requestHeaders,
  });
}

export async function revokeApiKeyAction(keyId: string) {
  await requireOrgPermission({ apiKey: ["delete"] });
  const requestHeaders = await headers();
  return auth.api.deleteApiKey({
    body: { keyId },
    headers: requestHeaders,
  });
}

export async function revokePersonalApiKeyAction(keyId: string) {
  await requireUser();
  const requestHeaders = await headers();
  return auth.api.deleteApiKey({
    body: { keyId },
    headers: requestHeaders,
  });
}

export async function callMcpToolAsSessionAction(
  toolName: string,
  args: Record<string, unknown>,
) {
  await requireUser();
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";

  const PUBLIC_MCP_URL = process.env.PUBLIC_MCP_URL ?? "http://localhost:4200";
  const res = await fetch(`${PUBLIC_MCP_URL}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    }),
  });

  if (!res.ok) throw new Error(`MCP call failed: ${res.status}`);
  return res.json() as Promise<unknown>;
}
