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
  requireOrgPermission: vi.fn().mockResolvedValue({ user: { id: "user_1" }, session: { activeOrganizationId: "org_1" } }),
  requireOrgPermissionWithActiveOrg: vi.fn().mockResolvedValue({
    session: { user: { id: "user_1" }, session: { activeOrganizationId: "org_1" } },
    activeOrganizationId: "org_1",
  }),
  requireUser: vi.fn().mockResolvedValue({ user: { id: "user_1" }, session: { activeOrganizationId: "org_1" } }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { auth } from "@workspace/auth";
import { createOrgApiKeyAction, listOrgApiKeysAction, revokeApiKeyAction, createPersonalApiKeyAction, revokePersonalApiKeyAction } from "../api-key-actions";

describe("createOrgApiKeyAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates org keys from the server auth instance with owner context", async () => {
    vi.mocked(auth.api.createApiKey).mockResolvedValue({ key: "sk_org_abc123" } as unknown as Awaited<ReturnType<typeof auth.api.createApiKey>>);
    const result = await createOrgApiKeyAction({
      name: "My Integration",
      configId: "org-keys",
      permissions: { account: ["read"] },
      expiresIn: null,
    });
    expect(auth.api.createApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          configId: "org-keys",
          organizationId: "org_1",
          userId: "user_1",
          permissions: { account: ["read"] },
        }),
      }),
    );
    expect(auth.api.createApiKey).toHaveBeenCalledWith(
      expect.not.objectContaining({ headers: expect.anything() }),
    );
    expect(result).toHaveProperty("key");
  });
});

describe("listOrgApiKeysAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists keys for the active organization", async () => {
    vi.mocked(auth.api.listApiKeys).mockResolvedValue([{ id: "key_1", name: "Test" }] as unknown as Awaited<ReturnType<typeof auth.api.listApiKeys>>);
    const keys = await listOrgApiKeysAction();
    expect(auth.api.listApiKeys).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          configId: "org-keys",
          organizationId: "org_1",
        }),
      }),
    );
    expect(Array.isArray(keys)).toBe(true);
  });
});

describe("revokeApiKeyAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls auth.api.deleteApiKey with the key id", async () => {
    vi.mocked(auth.api.deleteApiKey).mockResolvedValue(undefined as unknown as Awaited<ReturnType<typeof auth.api.deleteApiKey>>);
    await revokeApiKeyAction("key_123");
    expect(auth.api.deleteApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ keyId: "key_123" }),
      }),
    );
  });
});

describe("createPersonalApiKeyAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates personal keys from the server auth instance with owner context", async () => {
    vi.mocked(auth.api.createApiKey).mockResolvedValue({ key: "sk_user_xyz" } as unknown as Awaited<ReturnType<typeof auth.api.createApiKey>>);
    const result = await createPersonalApiKeyAction({
      name: "My Personal Key",
      permissions: { account: ["read"] },
      expiresIn: null,
    });
    expect(auth.api.createApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          configId: "user-keys",
          userId: "user_1",
          permissions: { account: ["read"] },
        }),
      }),
    );
    expect(auth.api.createApiKey).toHaveBeenCalledWith(
      expect.not.objectContaining({ headers: expect.anything() }),
    );
    expect(result).toHaveProperty("key");
  });
});

describe("revokePersonalApiKeyAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls auth.api.deleteApiKey with the key id", async () => {
    vi.mocked(auth.api.deleteApiKey).mockResolvedValue(undefined as unknown as Awaited<ReturnType<typeof auth.api.deleteApiKey>>);
    await revokePersonalApiKeyAction("key_456");
    expect(auth.api.deleteApiKey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ keyId: "key_456" }),
      }),
    );
  });
});
