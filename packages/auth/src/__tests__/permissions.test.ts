import { describe, it, expect } from "vitest";
import { ac, permissions } from "../permissions";

describe("permissions", () => {
  it("exports all three org roles", () => {
    expect(permissions).toHaveProperty("owner");
    expect(permissions).toHaveProperty("admin");
    expect(permissions).toHaveProperty("member");
  });

  describe("owner role", () => {
    const role = permissions.owner;

    it("has all organization permissions", () => {
      expect(role.authorize({ organization: ["update"] }).success).toBe(true);
      expect(role.authorize({ organization: ["delete"] }).success).toBe(true);
    });

    it("has all member permissions", () => {
      expect(role.authorize({ member: ["create"] }).success).toBe(true);
      expect(role.authorize({ member: ["update"] }).success).toBe(true);
      expect(role.authorize({ member: ["delete"] }).success).toBe(true);
    });

    it("has all invitation permissions", () => {
      expect(role.authorize({ invitation: ["create"] }).success).toBe(true);
      expect(role.authorize({ invitation: ["cancel"] }).success).toBe(true);
    });

    it("has billing manage permission", () => {
      expect(role.authorize({ billing: ["manage"] }).success).toBe(true);
    });

    it("has all apiKey permissions", () => {
      expect(role.authorize({ apiKey: ["create"] }).success).toBe(true);
      expect(role.authorize({ apiKey: ["revoke"] }).success).toBe(true);
    });
  });

  describe("admin role", () => {
    const role = permissions.admin;

    it("can update organization but NOT delete", () => {
      expect(role.authorize({ organization: ["update"] }).success).toBe(true);
      expect(role.authorize({ organization: ["delete"] }).success).toBe(false);
    });

    it("has all member permissions", () => {
      expect(role.authorize({ member: ["create"] }).success).toBe(true);
      expect(role.authorize({ member: ["update"] }).success).toBe(true);
      expect(role.authorize({ member: ["delete"] }).success).toBe(true);
    });

    it("has all invitation permissions", () => {
      expect(role.authorize({ invitation: ["create"] }).success).toBe(true);
      expect(role.authorize({ invitation: ["cancel"] }).success).toBe(true);
    });

    it("has billing manage permission", () => {
      expect(role.authorize({ billing: ["manage"] }).success).toBe(true);
    });

    it("has all apiKey permissions", () => {
      expect(role.authorize({ apiKey: ["create"] }).success).toBe(true);
      expect(role.authorize({ apiKey: ["revoke"] }).success).toBe(true);
    });
  });

  describe("member role", () => {
    const role = permissions.member;

    it("has no organization permissions", () => {
      expect(role.authorize({ organization: ["update"] }).success).toBe(false);
      expect(role.authorize({ organization: ["delete"] }).success).toBe(false);
    });

    it("has no member permissions", () => {
      expect(role.authorize({ member: ["create"] }).success).toBe(false);
      expect(role.authorize({ member: ["update"] }).success).toBe(false);
      expect(role.authorize({ member: ["delete"] }).success).toBe(false);
    });

    it("has no invitation permissions", () => {
      expect(role.authorize({ invitation: ["create"] }).success).toBe(false);
      expect(role.authorize({ invitation: ["cancel"] }).success).toBe(false);
    });

    it("has no billing permissions", () => {
      expect(role.authorize({ billing: ["manage"] }).success).toBe(false);
    });

    it("has no apiKey permissions", () => {
      expect(role.authorize({ apiKey: ["create"] }).success).toBe(false);
      expect(role.authorize({ apiKey: ["revoke"] }).success).toBe(false);
    });
  });

  describe("ac (access control)", () => {
    it("is exported and defined", () => {
      expect(ac).toBeDefined();
    });
  });
});
