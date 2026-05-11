import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../auth", () => ({
  auth: {
    api: {
      verifyApiKey: vi.fn(),
    },
  },
}));

import { auth } from "../auth";
import { verifyApiKey, ApiKeyError } from "./verify";

const mockOrgKeyResult = {
  valid: true,
  key: {
    id: "key_123",
    configId: "org-keys",
    referenceId: "org_456",
    permissions: JSON.stringify({ account: ["read"] }),
    enabled: true,
    expiresAt: null,
  },
};

const mockUserKeyResult = {
  valid: true,
  key: {
    id: "key_789",
    configId: "user-keys",
    referenceId: "user_111",
    permissions: JSON.stringify({ account: ["read"] }),
    enabled: true,
    expiresAt: null,
  },
};

describe("verifyApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns org context for a valid org-owned key", async () => {
    vi.mocked(auth.api.verifyApiKey).mockResolvedValue(mockOrgKeyResult as never);
    const ctx = await verifyApiKey("sk_org_test");
    expect(ctx.ownerType).toBe("organization");
    expect(ctx.orgId).toBe("org_456");
    expect(ctx.userId).toBeNull();
    expect(ctx.permissions).toEqual({ account: ["read"] });
    expect(ctx.keyId).toBe("key_123");
  });

  it("returns user context for a valid user-owned key", async () => {
    vi.mocked(auth.api.verifyApiKey).mockResolvedValue(mockUserKeyResult as never);
    const ctx = await verifyApiKey("sk_user_test");
    expect(ctx.ownerType).toBe("user");
    expect(ctx.userId).toBe("user_111");
    expect(ctx.orgId).toBeNull();
  });

  it("throws ApiKeyError when key is invalid", async () => {
    vi.mocked(auth.api.verifyApiKey).mockResolvedValue({ valid: false, key: null } as never);
    await expect(verifyApiKey("bad_key")).rejects.toBeInstanceOf(ApiKeyError);
  });

  it("thrown ApiKeyError has UNAUTHORIZED code for invalid key", async () => {
    vi.mocked(auth.api.verifyApiKey).mockResolvedValue({ valid: false, key: null } as never);
    await expect(verifyApiKey("bad_key")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("handles null permissions field gracefully", async () => {
    vi.mocked(auth.api.verifyApiKey).mockResolvedValue({
      ...mockOrgKeyResult,
      key: { ...mockOrgKeyResult.key, permissions: null },
    } as never);
    const ctx = await verifyApiKey("sk_org_noperms");
    expect(ctx.permissions).toEqual({});
  });
});
