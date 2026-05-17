import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactStage: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import {
  listContactStagesForOrg,
  getContactStageById,
  createContactStage,
  updateContactStage,
  deleteContactStage,
} from "./contact-stage-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactStagesForOrg", () => {
  it("scopes to organizationId and orders by sortOrder", async () => {
    vi.mocked(prisma.contactStage.findMany).mockResolvedValue([]);
    await listContactStagesForOrg("org_1");
    expect(prisma.contactStage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org_1" },
        orderBy: { sortOrder: "asc" },
      }),
    );
  });
});

describe("getContactStageById", () => {
  it("requires organizationId", async () => {
    vi.mocked(prisma.contactStage.findFirst).mockResolvedValue(null);
    await getContactStageById("cstage_1", "org_1");
    expect(prisma.contactStage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cstage_1", organizationId: "org_1" } }),
    );
  });
});

describe("createContactStage", () => {
  it("generates a cstage_-prefixed ID", async () => {
    vi.mocked(prisma.contactStage.create).mockResolvedValue({} as never);
    await createContactStage("org_1", { name: "Active", color: "#6366f1", sortOrder: 0, isDefault: false });
    const call = vi.mocked(prisma.contactStage.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^cstage_/);
    expect(call?.data.organizationId).toBe("org_1");
  });
});

describe("updateContactStage", () => {
  it("scopes update to organizationId", async () => {
    vi.mocked(prisma.contactStage.update).mockResolvedValue({} as never);
    await updateContactStage("cstage_1", "org_1", { name: "Updated" });
    expect(prisma.contactStage.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cstage_1", organizationId: "org_1" } }),
    );
  });
});

describe("deleteContactStage", () => {
  it("scopes delete to organizationId", async () => {
    vi.mocked(prisma.contactStage.delete).mockResolvedValue({} as never);
    await deleteContactStage("cstage_1", "org_1");
    expect(prisma.contactStage.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cstage_1", organizationId: "org_1" } }),
    );
  });
});
