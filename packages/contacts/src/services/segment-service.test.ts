// packages/contacts/src/services/segment-service.test.ts
import { describe, it, expect } from "vitest";
import { validateSegmentFilters, buildContactWhereFromSegment } from "./segment-service";

describe("validateSegmentFilters", () => {
  it("accepts valid v1 filters", () => {
    const result = validateSegmentFilters({ kind: "person", stageId: "cstage_abc" }, 1);
    expect(result.kind).toBe("person");
  });

  it("rejects unknown filterVersion", () => {
    expect(() => validateSegmentFilters({}, 2)).toThrow("Unsupported filter version");
  });

  it("rejects unknown filter keys (strict mode)", () => {
    expect(() => validateSegmentFilters({ unknownField: true }, 1)).toThrow();
  });

  it("accepts empty filters object", () => {
    expect(() => validateSegmentFilters({}, 1)).not.toThrow();
  });
});

describe("buildContactWhereFromSegment", () => {
  it("builds organizationId-scoped where clause", () => {
    const where = buildContactWhereFromSegment("org_1", { kind: "company" });
    expect(where.organizationId).toBe("org_1");
    expect(where.kind).toBe("company");
  });

  it("excludes archived contacts by default", () => {
    const where = buildContactWhereFromSegment("org_1", {});
    expect(where.archivedAt).toBeNull();
  });

  it("includes archived when filter requests it", () => {
    const where = buildContactWhereFromSegment("org_1", { includeArchived: true });
    expect(where).not.toHaveProperty("archivedAt");
  });

  it("builds tagIds filter with AND semantics (contact must have ALL tags)", () => {
    const where = buildContactWhereFromSegment("org_1", { tagIds: ["ctag_1", "ctag_2"] });
    expect(where.AND).toEqual([
      { tags: { some: { tagId: "ctag_1" } } },
      { tags: { some: { tagId: "ctag_2" } } },
    ]);
  });
});
