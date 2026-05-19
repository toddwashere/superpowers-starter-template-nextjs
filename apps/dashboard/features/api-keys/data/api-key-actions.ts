"use server";

import { auth } from "@workspace/auth";
import {
  requireOrgPermission,
  requireOrgPermissionWithActiveOrg,
  requireUser,
} from "@workspace/auth/guards";
import { headers } from "next/headers";
import { getPublicMcpEndpoint } from "@workspace/common/env/public-mcp";
import {
  mcpStreamableHttpPost,
  readMcpJsonRpcResponse,
} from "@workspace/common/mcp/http-client";
import type { CreateApiKeyInput } from "./api-key-types";

export async function createOrgApiKeyAction(data: CreateApiKeyInput) {
  const { session: authSession, activeOrganizationId } =
    await requireOrgPermissionWithActiveOrg({ apiKey: ["create"] });

  return auth.api.createApiKey({
    body: {
      configId: data.configId,
      name: data.name ?? undefined,
      permissions: data.permissions,
      expiresIn: data.expiresIn ?? undefined,
      organizationId: activeOrganizationId,
      userId: authSession.user.id,
    },
  });
}

export async function listOrgApiKeysAction() {
  const { activeOrganizationId } = await requireOrgPermissionWithActiveOrg({
    apiKey: ["read"],
  });
  const requestHeaders = await headers();
  return auth.api.listApiKeys({
    query: { configId: "org-keys", organizationId: activeOrganizationId },
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
  const authSession = await requireUser();

  return auth.api.createApiKey({
    body: {
      configId: "user-keys",
      name: data.name,
      permissions: data.permissions,
      expiresIn: data.expiresIn ?? undefined,
      userId: authSession.user.id,
    },
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

  const res = await mcpStreamableHttpPost(
    getPublicMcpEndpoint(),
    {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    },
    { Cookie: cookie },
  );

  if (!res.ok) throw new Error(`MCP call failed: ${res.status}`);
  return readMcpJsonRpcResponse(res);
}
