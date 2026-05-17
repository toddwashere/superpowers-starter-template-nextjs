import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactTaskStatus: {
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
  listContactTaskStatusesForOrg,
  getContactTaskStatusById,
  createContactTaskStatus,
  updateContactTaskStatus,
  deleteContactTaskStatus,
} from "./contact-task-status-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactTaskStatusesForOrg", () => {
  it("scopes to organizationId ordered by sortOrder", async () => {
    vi.mocked(prisma.contactTaskStatus.findMany).mockResolvedValue([]);
    await listContactTaskStatusesForOrg("org_1");
    expect(prisma.contactTaskStatus.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org_1" },
        orderBy: { sortOrder: "asc" },
      }),
    );
  });
});

describe("getContactTaskStatusById", () => {
  it("requires organizationId", async () => {
    vi.mocked(prisma.contactTaskStatus.findFirst).mockResolvedValue(null);
    await getContactTaskStatusById("ctstatus_1", "org_1");
    expect(prisma.contactTaskStatus.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctstatus_1", organizationId: "org_1" } }),
    );
  });
});

describe("createContactTaskStatus", () => {
  it("generates a ctstatus_-prefixed ID", async () => {
    vi.mocked(prisma.contactTaskStatus.create).mockResolvedValue({} as never);
    await createContactTaskStatus("org_1", {
      name: "To Do",
      color: "#6366f1",
      sortOrder: 0,
      isDefault: true,
      isTerminal: false,
    });
    const call = vi.mocked(prisma.contactTaskStatus.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^ctstatus_/);
    expect(call?.data.organizationId).toBe("org_1");
  });
});

describe("updateContactTaskStatus", () => {
  it("scopes update to organizationId", async () => {
    vi.mocked(prisma.contactTaskStatus.update).mockResolvedValue({} as never);
    await updateContactTaskStatus("ctstatus_1", "org_1", { name: "In Progress" });
    expect(prisma.contactTaskStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctstatus_1", organizationId: "org_1" } }),
    );
  });
});

describe("deleteContactTaskStatus", () => {
  it("scopes delete to organizationId", async () => {
    vi.mocked(prisma.contactTaskStatus.delete).mockResolvedValue({} as never);
    await deleteContactTaskStatus("ctstatus_1", "org_1");
    expect(prisma.contactTaskStatus.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctstatus_1", organizationId: "org_1" } }),
    );
  });
});
