import { describe, it, expect } from "vitest";
import { accountInfoHandler } from "./account";
import type { AuthContext } from "../lib/context";

const orgCtx: AuthContext = {
  kind: "api-key",
  keyId: "key_1",
  orgId: "org_1",
  userId: null,
  ownerType: "organization",
  permissions: { account: ["read"] },
};

const userCtx: AuthContext = {
  kind: "session",
  userId: "user_1",
  orgId: "org_2",
  permissions: { account: ["read"] },
};

describe("accountInfoHandler", () => {
  it("returns org identity for api-key context", () => {
    const result = accountInfoHandler(orgCtx);
    expect(result.ownerType).toBe("organization");
    expect(result.orgId).toBe("org_1");
    expect(result.userId).toBeNull();
  });

  it("returns user identity for session context", () => {
    const result = accountInfoHandler(userCtx);
    expect(result.userId).toBe("user_1");
    expect(result.orgId).toBe("org_2");
  });

  it("includes permissions in the result", () => {
    const result = accountInfoHandler(orgCtx);
    expect(result.permissions).toEqual({ account: ["read"] });
  });
});
