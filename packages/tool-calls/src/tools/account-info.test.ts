import { describe, it, expect } from "vitest";
import { accountInfoTool } from "./account-info";

const oauthCtx = {
  kind: "oauth" as const,
  userId: "user_1",
  orgId: "org_1",
  scopes: ["account:read"],
  clientId: "client_1",
};

const apiKeyCtx = {
  kind: "api-key" as const,
  keyId: "key_1",
  userId: null,
  orgId: "org_1",
  ownerType: "organization" as const,
  permissions: { account: ["read"] },
};

const sessionCtx = {
  kind: "session" as const,
  userId: "user_2",
  orgId: null,
  permissions: { account: ["read"] },
};

describe("accountInfoTool", () => {
  it("has the correct name", () => {
    expect(accountInfoTool.name).toBe("account-info");
  });

  it("requires account:read scope", () => {
    expect(accountInfoTool.requiredScopes).toContain("account:read");
  });

  it("requires account:read permission", () => {
    expect(accountInfoTool.requiredPermissions).toEqual({ account: ["read"] });
  });

  it("returns oauth identity fields", async () => {
    const result = await accountInfoTool.run(oauthCtx, {});
    expect(result.authKind).toBe("oauth");
    expect(result.userId).toBe("user_1");
    expect(result.orgId).toBe("org_1");
    expect(result.clientId).toBe("client_1");
    expect(result.scopes).toEqual(["account:read"]);
    expect(result.permissions).toBeNull();
  });

  it("returns api-key identity fields", async () => {
    const result = await accountInfoTool.run(apiKeyCtx, {});
    expect(result.authKind).toBe("api-key");
    expect(result.ownerType).toBe("organization");
    expect(result.orgId).toBe("org_1");
    expect(result.userId).toBeNull();
    expect(result.clientId).toBeNull();
    expect(result.scopes).toBeNull();
  });

  it("returns session identity fields", async () => {
    const result = await accountInfoTool.run(sessionCtx, {});
    expect(result.authKind).toBe("session");
    expect(result.userId).toBe("user_2");
    expect(result.orgId).toBeNull();
    expect(result.clientId).toBeNull();
    expect(result.scopes).toBeNull();
  });

  it("does not return clientId for non-oauth contexts", async () => {
    const apiResult = await accountInfoTool.run(apiKeyCtx, {});
    const sessionResult = await accountInfoTool.run(sessionCtx, {});
    expect(apiResult.clientId).toBeNull();
    expect(sessionResult.clientId).toBeNull();
  });
});
