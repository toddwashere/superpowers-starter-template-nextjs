import { describe, expect, it } from "vitest";

import {
  assignmentsToTagValues,
  diffAssignmentTagIds,
  findOrgTagByLabel,
  orgTagsToSuggestions,
} from "./contact-tags-editor-utils";

describe("contact-tags-editor-utils", () => {
  it("maps assignments and org tags to tag values", () => {
    expect(
      assignmentsToTagValues([
        { tagId: "ctag_1", tag: { name: "VIP", color: "#111111" } },
      ]),
    ).toEqual([{ id: "ctag_1", label: "VIP", color: "#111111" }]);

    expect(
      orgTagsToSuggestions([{ id: "ctag_1", name: "VIP", color: "#111111" }]),
    ).toEqual([{ id: "ctag_1", label: "VIP", color: "#111111" }]);
  });

  it("finds org tags case-insensitively", () => {
    const orgTags = [{ id: "ctag_1", name: "VIP", color: "#111111" }];

    expect(findOrgTagByLabel(orgTags, " vip ")).toEqual(orgTags[0]);
    expect(findOrgTagByLabel(orgTags, "missing")).toBeUndefined();
  });

  it("diffs assignment tag ids", () => {
    const previous = [{ id: "a", label: "Alpha" }];
    const next = [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
    ];

    expect(diffAssignmentTagIds(previous, next)).toEqual({
      added: [{ id: "b", label: "Beta" }],
      removed: [],
    });
  });
});
