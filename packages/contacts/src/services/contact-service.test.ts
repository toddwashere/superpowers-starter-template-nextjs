// packages/contacts/src/services/contact-service.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as contactRepo from "../data-models/contact-repo";

vi.mock("@workspace/database", () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../data-models/contact-repo");

beforeEach(() => vi.clearAllMocks());

import { createContactWithValidation, updateContactWithValidation } from "./contact-service";

const baseContact = {
  id: "contact_abc",
  organizationId: "org_1",
  kind: "person" as const,
  displayName: "Jane",
  firstName: null,
  lastName: null,
  companyName: null,
  primaryEmail: null,
  primaryPhone: null,
  website: null,
  parentContactId: null,
  stageId: null,
  ownerId: null,
  source: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
  stage: null,
  tags: [],
  parent: null,
  children: [],
};

describe("updateContactWithValidation — parent cycle detection", () => {
  it("rejects self-parenting", async () => {
    await expect(
      updateContactWithValidation("contact_abc", "org_1", { parentContactId: "contact_abc" }),
    ).rejects.toThrow("cannot be its own parent");
  });

  it("rejects a cycle where the proposed parent's ancestry includes this contact", async () => {
    // contact_parent has parentContactId: "contact_abc" — creating a cycle if we set contact_abc's parent to contact_parent
    vi.mocked(contactRepo.getContactById).mockResolvedValueOnce({
      ...baseContact,
      id: "contact_parent",
      parentContactId: "contact_abc",
    } as never);

    await expect(
      updateContactWithValidation("contact_abc", "org_1", { parentContactId: "contact_parent" }),
    ).rejects.toThrow("cycle");
  });

  it("allows a valid parent from the same org", async () => {
    vi.mocked(contactRepo.getContactById).mockResolvedValueOnce({
      ...baseContact,
      id: "contact_parent",
      parentContactId: null,
    } as never);
    vi.mocked(contactRepo.updateContact).mockResolvedValueOnce(baseContact as never);

    await expect(
      updateContactWithValidation("contact_abc", "org_1", { parentContactId: "contact_parent" }),
    ).resolves.not.toThrow();
  });
});

describe("createContactWithValidation", () => {
  it("creates without a parent", async () => {
    vi.mocked(contactRepo.createContact).mockResolvedValueOnce(baseContact as never);
    await createContactWithValidation("org_1", { kind: "person", displayName: "Jane" });
    expect(contactRepo.createContact).toHaveBeenCalledWith("org_1", expect.objectContaining({ kind: "person" }));
  });

  it("validates parent belongs to the org", async () => {
    vi.mocked(contactRepo.getContactById).mockResolvedValueOnce(null);
    await expect(
      createContactWithValidation("org_1", {
        kind: "person",
        displayName: "Jane",
        parentContactId: "contact_nonexistent",
      }),
    ).rejects.toThrow("Parent contact not found");
  });
});
