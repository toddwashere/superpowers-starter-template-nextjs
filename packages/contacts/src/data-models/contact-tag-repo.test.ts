import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactTag: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contactTagAssignment: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import {
  listContactTagsForOrg,
  createContactTag,
  addTagToContact,
  removeTagFromContact,
  updateContactTag,
  deleteContactTag,
} from "./contact-tag-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactTagsForOrg", () => {
  it("scopes to organizationId", async () => {
    vi.mocked(prisma.contactTag.findMany).mockResolvedValue([]);
    await listContactTagsForOrg("org_1");
    expect(prisma.contactTag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org_1" },
        orderBy: { name: "asc" },
      }),
    );
  });
});

describe("createContactTag", () => {
  it("uses upsert so creating an existing tag name is idempotent", async () => {
    vi.mocked(prisma.contactTag.upsert).mockResolvedValue({} as never);
    await createContactTag("org_1", { name: "VIP", color: "#6366f1" });
    expect(prisma.contactTag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId_name: { organizationId: "org_1", name: "VIP" } },
      }),
    );
    const call = vi.mocked(prisma.contactTag.upsert).mock.calls[0]?.[0];
    expect(call?.create.id).toMatch(/^ctag_/);
  });
});

describe("addTagToContact", () => {
  it("uses upsert so the operation is idempotent", async () => {
    vi.mocked(prisma.contactTag.findFirst).mockResolvedValue({ id: "ctag_xyz" } as never);
    vi.mocked(prisma.contactTagAssignment.upsert).mockResolvedValue({} as never);
    await addTagToContact("contact_abc", "ctag_xyz", "org_1");
    expect(prisma.contactTagAssignment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contactId_tagId: { contactId: "contact_abc", tagId: "ctag_xyz" } },
      }),
    );
  });

  it("throws if tag does not belong to the organization", async () => {
    vi.mocked(prisma.contactTag.findFirst).mockResolvedValue(null);
    await expect(addTagToContact("contact_abc", "ctag_other_org", "org_1")).rejects.toThrow(
      "not found in organization",
    );
    expect(prisma.contactTagAssignment.upsert).not.toHaveBeenCalled();
  });
});

describe("removeTagFromContact", () => {
  it("deletes the assignment", async () => {
    vi.mocked(prisma.contactTagAssignment.deleteMany).mockResolvedValue({ count: 1 });
    await removeTagFromContact("contact_abc", "ctag_xyz");
    expect(prisma.contactTagAssignment.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { contactId: "contact_abc", tagId: "ctag_xyz" } }),
    );
  });
});

describe("updateContactTag", () => {
  it("scopes update to organizationId", async () => {
    vi.mocked(prisma.contactTag.update).mockResolvedValue({} as never);
    await updateContactTag("ctag_1", "org_1", { name: "Updated" });
    expect(prisma.contactTag.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctag_1", organizationId: "org_1" } }),
    );
  });
});

describe("deleteContactTag", () => {
  it("scopes delete to organizationId", async () => {
    vi.mocked(prisma.contactTag.delete).mockResolvedValue({} as never);
    await deleteContactTag("ctag_1", "org_1");
    expect(prisma.contactTag.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctag_1", organizationId: "org_1" } }),
    );
  });
});
