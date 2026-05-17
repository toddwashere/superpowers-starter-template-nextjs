import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactInteraction: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import {
  listContactInteractions,
  createContactInteraction,
  updateContactInteraction,
  deleteContactInteraction,
} from "./contact-interaction-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactInteractions", () => {
  it("scopes to contactId and organizationId", async () => {
    vi.mocked(prisma.contactInteraction.findMany).mockResolvedValue([]);
    await listContactInteractions("contact_abc", "org_1");
    expect(prisma.contactInteraction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contactId: "contact_abc", organizationId: "org_1" },
      }),
    );
  });

  it("returns most recent first and limits to 50", async () => {
    vi.mocked(prisma.contactInteraction.findMany).mockResolvedValue([]);
    await listContactInteractions("contact_abc", "org_1");
    const call = vi.mocked(prisma.contactInteraction.findMany).mock.calls[0]?.[0];
    expect(call?.orderBy).toEqual({ happenedAt: "desc" });
    expect(call?.take).toBe(50);
  });
});

describe("createContactInteraction", () => {
  it("generates a cint_-prefixed ID and scopes to org", async () => {
    vi.mocked(prisma.contactInteraction.create).mockResolvedValue({} as never);
    await createContactInteraction("contact_abc", "org_1", "user_1", {
      contactId: "contact_abc",
      body: "Called client",
      type: "note",
    });
    const call = vi.mocked(prisma.contactInteraction.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^cint_/);
    expect(call?.data.organizationId).toBe("org_1");
  });
});

describe("updateContactInteraction", () => {
  it("scopes update to organizationId", async () => {
    vi.mocked(prisma.contactInteraction.update).mockResolvedValue({} as never);
    await updateContactInteraction("cint_1", "org_1", { body: "Updated note" });
    expect(prisma.contactInteraction.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cint_1", organizationId: "org_1" } }),
    );
  });

  it("strips contactId from update data", async () => {
    vi.mocked(prisma.contactInteraction.update).mockResolvedValue({} as never);
    await updateContactInteraction("cint_1", "org_1", {
      contactId: "contact_other",
      body: "Updated note",
    });
    const call = vi.mocked(prisma.contactInteraction.update).mock.calls[0]?.[0];
    expect(call?.data).not.toHaveProperty("contactId");
    expect(call?.data).toMatchObject({ body: "Updated note" });
  });
});

describe("deleteContactInteraction", () => {
  it("scopes delete to organizationId", async () => {
    vi.mocked(prisma.contactInteraction.delete).mockResolvedValue({} as never);
    await deleteContactInteraction("cint_1", "org_1");
    expect(prisma.contactInteraction.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cint_1", organizationId: "org_1" } }),
    );
  });
});
