import { describe, it, expect } from "vitest";
import { publicApiPermissions, hasPermission } from "./permissions";

describe("publicApiPermissions", () => {
  it("defines account resource with read action", () => {
    expect(publicApiPermissions.account).toContain("read");
  });

  it("defines contact tool resources with supported actions", () => {
    expect(publicApiPermissions.contact).toEqual(["read", "create", "update"]);
    expect(publicApiPermissions.contactInteraction).toEqual(["create"]);
    expect(publicApiPermissions.contactTask).toEqual(["read", "create", "update"]);
  });
});

describe("hasPermission", () => {
  it("returns true when key has the required permission", () => {
    expect(hasPermission({ account: ["read"] }, { account: ["read"] })).toBe(true);
  });

  it("returns false when key lacks a required action", () => {
    expect(hasPermission({ account: ["read"] }, { account: ["write"] })).toBe(false);
  });

  it("returns false when key has no permissions at all", () => {
    expect(hasPermission({}, { account: ["read"] })).toBe(false);
  });

  it("returns true when required is empty object", () => {
    expect(hasPermission({}, {})).toBe(true);
  });

  it("returns true when key has superset of required actions", () => {
    expect(hasPermission({ account: ["read", "write"] }, { account: ["read"] })).toBe(true);
  });
});
