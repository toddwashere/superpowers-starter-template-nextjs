import { describe, it, expect } from "vitest";
import { toolRegistry } from "../registry";
import { hasAccess } from "../access";

const oauthWithScope = {
  kind: "oauth" as const,
  userId: "u1",
  orgId: null,
  scopes: ["account:read"],
  clientId: null,
};

const oauthMissingScope = {
  kind: "oauth" as const,
  userId: "u1",
  orgId: null,
  scopes: [],
  clientId: null,
};

const apiKeyCtx = {
  kind: "api-key" as const,
  keyId: "k1",
  userId: null,
  orgId: null,
  ownerType: "user" as const,
  permissions: { account: ["read"] },
};

const apiKeyMissingPerm = {
  kind: "api-key" as const,
  keyId: "k1",
  userId: null,
  orgId: null,
  ownerType: "user" as const,
  permissions: {},
};

describe("toolRegistry", () => {
  it("contains account-info tool", () => {
    const found = toolRegistry.find((t) => t.name === "account-info");
    expect(found).toBeDefined();
  });

  it("tool names are unique", () => {
    const names = toolRegistry.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("hasAccess", () => {
  const [accountInfoTool] = toolRegistry;

  it("grants access to oauth with correct scopes", () => {
    expect(accountInfoTool && hasAccess(oauthWithScope, accountInfoTool)).toBe(true);
  });

  it("denies access to oauth missing required scope", () => {
    expect(accountInfoTool && hasAccess(oauthMissingScope, accountInfoTool)).toBe(false);
  });

  it("grants access to api-key with correct permissions", () => {
    expect(accountInfoTool && hasAccess(apiKeyCtx, accountInfoTool)).toBe(true);
  });

  it("denies access to api-key missing required permissions", () => {
    expect(accountInfoTool && hasAccess(apiKeyMissingPerm, accountInfoTool)).toBe(false);
  });
});
