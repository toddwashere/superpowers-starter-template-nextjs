import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contact: {
      findFirst: vi.fn(),
    },
    contactTask: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@workspace/database";
import {
  listContactTasksForOrg,
  listContactTasksForContact,
  createContactTask,
  updateContactTask,
  archiveContactTask,
  getContactTaskById,
} from "./contact-task-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactTasksForOrg", () => {
  it("scopes to organizationId, excludes archived, and caps at 200", async () => {
    vi.mocked(prisma.contactTask.findMany).mockResolvedValue([]);
    await listContactTasksForOrg("org_1");
    const call = vi.mocked(prisma.contactTask.findMany).mock.calls[0]?.[0];
    expect(call?.where).toMatchObject({ organizationId: "org_1", archivedAt: null });
    expect(call?.take).toBe(200);
  });
});

describe("listContactTasksForContact", () => {
  it("scopes to both contactId and organizationId, caps at 200", async () => {
    vi.mocked(prisma.contactTask.findMany).mockResolvedValue([]);
    await listContactTasksForContact("contact_abc", "org_1");
    const call = vi.mocked(prisma.contactTask.findMany).mock.calls[0]?.[0];
    expect(call?.where).toMatchObject({ contactId: "contact_abc", organizationId: "org_1" });
    expect(call?.take).toBe(200);
  });
});

describe("createContactTask", () => {
  it("generates a ctask_-prefixed ID and sets organizationId", async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue({ id: "contact_abc" } as never);
    vi.mocked(prisma.contactTask.create).mockResolvedValue({} as never);
    await createContactTask("org_1", "user_1", {
      contactId: "contact_abc",
      title: "Follow up",
      priority: "normal",
      sortOrder: 0,
    });
    const call = vi.mocked(prisma.contactTask.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^ctask_/);
    expect(call?.data.organizationId).toBe("org_1");
  });

  it("throws if contact does not belong to the organization", async () => {
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);
    await expect(
      createContactTask("org_1", "user_1", {
        contactId: "contact_other_org",
        title: "Follow up",
        priority: "normal",
        sortOrder: 0,
      }),
    ).rejects.toThrow("not found in organization");
    expect(prisma.contactTask.create).not.toHaveBeenCalled();
  });
});

describe("updateContactTask", () => {
  it("scopes update to organizationId", async () => {
    vi.mocked(prisma.contactTask.update).mockResolvedValue({} as never);
    await updateContactTask("ctask_1", "org_1", { title: "Updated" });
    expect(prisma.contactTask.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctask_1", organizationId: "org_1" } }),
    );
  });
});

describe("getContactTaskById", () => {
  it("scopes to organizationId", async () => {
    vi.mocked(prisma.contactTask.findFirst).mockResolvedValue(null);
    await getContactTaskById("ctask_1", "org_1");
    expect(prisma.contactTask.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ctask_1", organizationId: "org_1" } }),
    );
  });
});

describe("archiveContactTask", () => {
  it("sets archivedAt and requires organizationId", async () => {
    vi.mocked(prisma.contactTask.update).mockResolvedValue({} as never);
    await archiveContactTask("ctask_1", "org_1");
    expect(prisma.contactTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ctask_1", organizationId: "org_1" },
        data: expect.objectContaining({ archivedAt: expect.any(Date) }),
      }),
    );
  });
});
