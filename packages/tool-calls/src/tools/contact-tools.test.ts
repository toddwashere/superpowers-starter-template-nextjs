import { vi, describe, it, expect, beforeEach } from "vitest";

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

import * as contacts from "@workspace/contacts";
import {
  contactsListTool,
  contactsGetTool,
  contactsDocumentationTool,
  contactTools,
} from "./contact-tools";

const orgCtx = {
  kind: "api-key" as const,
  keyId: "key_1",
  orgId: "org_1",
  userId: "user_1",
  ownerType: "organization" as const,
  permissions: { contact: ["read"] },
};

const noOrgCtx = { ...orgCtx, orgId: null };

beforeEach(() => vi.clearAllMocks());

describe("contactsListTool", () => {
  it("requires contacts:read permission", () => {
    expect(contactsListTool.requiredPermissions).toEqual({ contact: ["read"] });
  });

  it("returns error when no org context", async () => {
    const result = await contactsListTool.run(noOrgCtx, {});
    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it("calls listContactsForOrg with orgId and parsed filters", async () => {
    vi.mocked(contacts.listContactsForOrg).mockResolvedValue([]);
    await contactsListTool.run(orgCtx, { kind: "person", page: 1, pageSize: 10 });
    expect(contacts.listContactsForOrg).toHaveBeenCalledWith(
      "org_1",
      expect.objectContaining({ kind: "person" }),
    );
  });
});

describe("contactsGetTool", () => {
  it("returns error when no org context", async () => {
    const result = await contactsGetTool.run(noOrgCtx, { contactId: "contact_abc" });
    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it("returns error when contact not found", async () => {
    vi.mocked(contacts.getContactById).mockResolvedValue(null);
    const result = await contactsGetTool.run(orgCtx, { contactId: "contact_abc" });
    expect(result).toMatchObject({ error: expect.any(String) });
  });
});

describe("contactsDocumentationTool", () => {
  it("returns a non-empty documentation string", async () => {
    const result = await contactsDocumentationTool.run(orgCtx, {});
    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(100);
  });
});

describe("contactTools array", () => {
  it("contains all 11 contact tools", () => {
    expect(contactTools).toHaveLength(11);
  });

  it("has unique tool names", () => {
    const names = contactTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("uses singular contact domain permission resource names", () => {
    expect(contactTools.map((tool) => tool.requiredPermissions)).toEqual([
      { contact: ["read"] },
      { contact: ["read"] },
      { contact: ["create"] },
      { contact: ["update"] },
      { contact: ["update"] },
      { contact: ["update"] },
      { contactInteraction: ["create"] },
      { contactTask: ["read"] },
      { contactTask: ["create"] },
      { contactTask: ["update"] },
      { contact: ["read"] },
    ]);
  });
});
