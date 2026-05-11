import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@workspace/auth", () => ({
  auth: {
    api: {
      createApiKey: vi.fn(),
      listApiKeys: vi.fn(),
      deleteApiKey: vi.fn(),
    },
  },
}));

vi.mock("@workspace/auth/guards", () => ({
  requireOrgPermission: vi.fn().mockResolvedValue({ session: { activeOrganizationId: "org_1" } }),
  requireUser: vi.fn().mockResolvedValue({ user: { id: "user_1" }, session: { activeOrganizationId: "org_1" } }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { auth } from "@workspace/auth";
import { createOrgApiKeyAction, listOrgApiKeysAction, revokeApiKeyAction } from "./api-key-actions";

describe("createOrgApiKeyAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls auth.api.createApiKey with org-keys configId", async () => {
    vi.mocked(auth.api.createApiKey).mockResolvedValue({ key: "sk_org_abc123" } as never);
    const result = await createOrgApiKeyAction({
      name: "My Integration",
      configId: "org-keys",
      permissions: { account: ["read"] },
      expiresIn: null,
    });
    expect(auth.api.createApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ configId: "org-keys" }),
      }),
    );
    expect(result).toHaveProperty("key");
  });
});

describe("listOrgApiKeysAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns list of keys", async () => {
    vi.mocked(auth.api.listApiKeys).mockResolvedValue([{ id: "key_1", name: "Test" }] as never);
    const keys = await listOrgApiKeysAction();
    expect(Array.isArray(keys)).toBe(true);
  });
});

describe("revokeApiKeyAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls auth.api.deleteApiKey with the key id", async () => {
    vi.mocked(auth.api.deleteApiKey).mockResolvedValue(undefined as never);
    await revokeApiKeyAction("key_123");
    expect(auth.api.deleteApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ keyId: "key_123" }),
      }),
    );
  });
});
