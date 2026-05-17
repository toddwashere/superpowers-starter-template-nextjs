import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@workspace/database", () => ({
  prisma: {
    contactSegment: {
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
  listContactSegmentsForOrg,
  getContactSegmentById,
  createContactSegment,
} from "./contact-segment-repo";

beforeEach(() => vi.clearAllMocks());

describe("listContactSegmentsForOrg", () => {
  it("scopes to organizationId", async () => {
    vi.mocked(prisma.contactSegment.findMany).mockResolvedValue([]);
    await listContactSegmentsForOrg("org_1");
    expect(prisma.contactSegment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org_1" } }),
    );
  });
});

describe("getContactSegmentById", () => {
  it("requires organizationId", async () => {
    vi.mocked(prisma.contactSegment.findFirst).mockResolvedValue(null);
    await getContactSegmentById("cseg_1", "org_1");
    expect(prisma.contactSegment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cseg_1", organizationId: "org_1" } }),
    );
  });
});

describe("createContactSegment", () => {
  it("generates a cseg_-prefixed ID and sets filterVersion", async () => {
    vi.mocked(prisma.contactSegment.create).mockResolvedValue({} as never);
    await createContactSegment("org_1", "user_1", {
      name: "My Segment",
      filters: {},
      filterVersion: 1,
      sortKey: "displayName",
      sortDirection: "asc",
    });
    const call = vi.mocked(prisma.contactSegment.create).mock.calls[0]?.[0];
    expect(call?.data.id).toMatch(/^cseg_/);
    expect(call?.data.filterVersion).toBe(1);
    expect(call?.data.organizationId).toBe("org_1");
  });
});
