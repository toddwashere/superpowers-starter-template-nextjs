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
      expect(role.authorize({ apiKey: ["read"] }).success).toBe(true);
      expect(role.authorize({ apiKey: ["update"] }).success).toBe(true);
      expect(role.authorize({ apiKey: ["delete"] }).success).toBe(true);
    });

    it("has all contacts domain permissions", () => {
      expect(role.authorize({ contact: ["read", "create", "update", "delete", "import", "export"] }).success).toBe(true);
      expect(role.authorize({ contactSettings: ["read", "create", "update", "delete"] }).success).toBe(true);
      expect(role.authorize({ contactInteraction: ["read", "create", "update", "delete"] }).success).toBe(true);
      expect(role.authorize({ contactTask: ["read", "create", "update", "delete"] }).success).toBe(true);
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
      expect(role.authorize({ apiKey: ["read"] }).success).toBe(true);
      expect(role.authorize({ apiKey: ["update"] }).success).toBe(true);
      expect(role.authorize({ apiKey: ["delete"] }).success).toBe(true);
    });

    it("has all contacts domain permissions", () => {
      expect(role.authorize({ contact: ["read", "create", "update", "delete", "import", "export"] }).success).toBe(true);
      expect(role.authorize({ contactSettings: ["read", "create", "update", "delete"] }).success).toBe(true);
      expect(role.authorize({ contactInteraction: ["read", "create", "update", "delete"] }).success).toBe(true);
      expect(role.authorize({ contactTask: ["read", "create", "update", "delete"] }).success).toBe(true);
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
      expect(role.authorize({ apiKey: ["read"] }).success).toBe(false);
      expect(role.authorize({ apiKey: ["update"] }).success).toBe(false);
      expect(role.authorize({ apiKey: ["delete"] }).success).toBe(false);
    });

    it("can work with contacts but cannot manage destructive or settings operations", () => {
      expect(role.authorize({ contact: ["read", "create", "update"] }).success).toBe(true);
      expect(role.authorize({ contact: ["delete"] }).success).toBe(false);
      expect(role.authorize({ contact: ["import"] }).success).toBe(false);
      expect(role.authorize({ contact: ["export"] }).success).toBe(false);
      expect(role.authorize({ contactSettings: ["read"] }).success).toBe(true);
      expect(role.authorize({ contactSettings: ["create"] }).success).toBe(false);
      expect(role.authorize({ contactSettings: ["update"] }).success).toBe(false);
      expect(role.authorize({ contactSettings: ["delete"] }).success).toBe(false);
      expect(role.authorize({ contactInteraction: ["read", "create", "update", "delete"] }).success).toBe(true);
      expect(role.authorize({ contactTask: ["read", "create", "update", "delete"] }).success).toBe(true);
    });
  });

  describe("ac (access control)", () => {
    it("is exported and defined", () => {
      expect(ac).toBeDefined();
    });
  });
});
