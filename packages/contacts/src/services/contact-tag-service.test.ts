import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactTagAssignment: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../data-models/contact-tag-repo", () => ({
  createContactTag: vi.fn(),
  addTagToContact: vi.fn(),
  removeTagFromContact: vi.fn(),
}));

import { prisma } from "@workspace/database";
import {
  createContactTag,
  addTagToContact,
  removeTagFromContact,
} from "../data-models/contact-tag-repo";
import { parseTagNamesFromCsv, setContactTagsForContact } from "./contact-tag-service";

describe("parseTagNamesFromCsv", () => {
  it("splits comma-separated tag names and trims duplicates", () => {
    expect(parseTagNamesFromCsv(" VIP, Partner ,VIP ")).toEqual(["VIP", "Partner"]);
  });

  it("returns empty array for blank input", () => {
    expect(parseTagNamesFromCsv("  ")).toEqual([]);
  });
});

describe("setContactTagsForContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and assigns new tags", async () => {
    vi.mocked(prisma.contactTagAssignment.findMany).mockResolvedValue([]);
    vi.mocked(createContactTag).mockResolvedValue({ id: "ctag_new" } as never);
    vi.mocked(addTagToContact).mockResolvedValue({} as never);

    await setContactTagsForContact("contact_1", "org_1", ["VIP"]);

    expect(createContactTag).toHaveBeenCalledWith("org_1", { name: "VIP", color: "#6366f1" });
    expect(addTagToContact).toHaveBeenCalledWith("contact_1", "ctag_new", "org_1");
    expect(removeTagFromContact).not.toHaveBeenCalled();
  });

  it("removes assignments not in the desired set", async () => {
    vi.mocked(prisma.contactTagAssignment.findMany).mockResolvedValue([
      {
        contactId: "contact_1",
        tagId: "ctag_old",
        createdAt: new Date(),
        tag: { id: "ctag_old", name: "Old", organizationId: "org_1", color: "#000", createdAt: new Date(), updatedAt: new Date() },
      },
    ] as never);

    await setContactTagsForContact("contact_1", "org_1", []);

    expect(removeTagFromContact).toHaveBeenCalledWith("contact_1", "ctag_old", "org_1");
    expect(createContactTag).not.toHaveBeenCalled();
  });
});
