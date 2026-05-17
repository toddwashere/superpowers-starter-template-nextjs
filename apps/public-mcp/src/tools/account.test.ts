import { vi, describe, it, expect } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {},
  Prisma: {},
}));

vi.mock("@workspace/contacts", () => ({
  listContactsForOrg: vi.fn(),
  getContactById: vi.fn(),
  createContactWithValidation: vi.fn(),
  updateContactWithValidation: vi.fn(),
  addTagToContact: vi.fn(),
  removeTagFromContact: vi.fn(),
  createContactInteraction: vi.fn(),
  listContactTasksForOrg: vi.fn(),
  createContactTask: vi.fn(),
  updateContactTask: vi.fn(),
}));

import { accountInfoTool } from "@workspace/tool-calls";
import type { ToolCallContext } from "@workspace/tool-calls";

const orgCtx: ToolCallContext = {
  kind: "api-key",
  keyId: "key_1",
  orgId: "org_1",
  userId: null,
  ownerType: "organization",
  permissions: { account: ["read"] },
};

const userCtx: ToolCallContext = {
  kind: "session",
  userId: "user_1",
  orgId: "org_2",
  permissions: { account: ["read"] },
};

const oauthCtx: ToolCallContext = {
  kind: "oauth",
  userId: "user_3",
  orgId: "org_3",
  scopes: ["account:read"],
  clientId: "client_1",
};

describe("accountInfoTool (via @workspace/tool-calls)", () => {
  it("returns org identity for api-key context", async () => {
    const result = await accountInfoTool.run(orgCtx, {});
    expect(result.authKind).toBe("api-key");
    expect(result.ownerType).toBe("organization");
    expect(result.orgId).toBe("org_1");
    expect(result.userId).toBeNull();
  });

  it("returns user identity for session context", async () => {
    const result = await accountInfoTool.run(userCtx, {});
    expect(result.authKind).toBe("session");
    expect(result.userId).toBe("user_1");
    expect(result.orgId).toBe("org_2");
    expect(result.ownerType).toBeNull();
  });

  it("returns oauth identity for oauth context", async () => {
    const result = await accountInfoTool.run(oauthCtx, {});
    expect(result.authKind).toBe("oauth");
    expect(result.userId).toBe("user_3");
    expect(result.orgId).toBe("org_3");
    expect(result.clientId).toBe("client_1");
    expect(result.scopes).toEqual(["account:read"]);
  });

  it("does not return clientId for non-oauth contexts", async () => {
    const apiResult = await accountInfoTool.run(orgCtx, {});
    const sessionResult = await accountInfoTool.run(userCtx, {});
    expect(apiResult.clientId).toBeNull();
    expect(sessionResult.clientId).toBeNull();
  });
});
