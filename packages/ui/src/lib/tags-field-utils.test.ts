import { describe, expect, it, vi } from "vitest"

import {
  buildTagsMenuOptions,
  canAddTagLabel,
  createTagId,
  diffTags,
  filterAvailableSuggestions,
  filterSuggestionsByQuery,
  findSuggestionByLabel,
  labelsMatchCaseInsensitive,
  mergeTagsFromLabels,
  normalizeTagLabel,
  parseTagLabelsFromPaste,
  resolveTagFromLabel,
  shouldParsePaste,
  shouldShowCreateOption,
  type TagValue,
} from "./tags-field-utils"

const vip: TagValue = { id: "ctag_vip", label: "VIP", color: "#6366f1" }
const beta: TagValue = { id: "ctag_beta", label: "Beta" }

describe("createTagId", () => {
  it("slugifies label and avoids collisions", () => {
    expect(createTagId("VIP Lead", [])).toBe("tag-vip-lead-0")
    expect(createTagId("VIP Lead", [{ id: "tag-vip-lead-0" }])).toBe("tag-vip-lead-1")
  })

  it("falls back when label is only symbols", () => {
    expect(createTagId("!!!", [])).toBe("tag-item-0")
  })
})

describe("parseTagLabelsFromPaste", () => {
  it("splits comma, semicolon, and newline separated values", () => {
    expect(parseTagLabelsFromPaste("alpha, beta;gamma\ndelta")).toEqual([
      "alpha",
      "beta",
      "gamma",
      "delta",
    ])
  })

  it("deduplicates labels", () => {
    expect(parseTagLabelsFromPaste("alpha, alpha, beta")).toEqual(["alpha", "beta"])
  })
})

describe("shouldParsePaste", () => {
  it("detects multi-value paste", () => {
    expect(shouldParsePaste("a,b")).toBe(true)
    expect(shouldParsePaste("a\nb")).toBe(true)
    expect(shouldParsePaste("single")).toBe(false)
  })
})

describe("canAddTagLabel", () => {
  const getTagLabel = (tag: TagValue) => tag.label

  it("rejects empty, too short, too long, and invalid labels", () => {
    expect(canAddTagLabel("", [], getTagLabel)).toBe(false)
    expect(canAddTagLabel("ab", [], getTagLabel, { minLength: 3 })).toBe(false)
    expect(canAddTagLabel("abcdef", [], getTagLabel, { maxLength: 5 })).toBe(false)
    expect(
      canAddTagLabel("bad", [], getTagLabel, {
        validateTag: (label) => label !== "bad",
      })
    ).toBe(false)
  })

  it("rejects duplicates case-insensitively", () => {
    expect(canAddTagLabel("vip", [vip], getTagLabel)).toBe(false)
    expect(canAddTagLabel("VIP", [vip], getTagLabel)).toBe(false)
    expect(canAddTagLabel("vip", [vip], getTagLabel, { allowDuplicates: true })).toBe(
      true
    )
  })

  it("rejects when full", () => {
    expect(canAddTagLabel("new", [vip], getTagLabel, { isFull: true })).toBe(false)
  })
})

describe("filterAvailableSuggestions", () => {
  it("excludes already selected tags", () => {
    const selected = new Set(["ctag_vip"])

    expect(
      filterAvailableSuggestions([vip, beta], selected, (tag) => tag.id)
    ).toEqual([beta])
  })

  it("returns all suggestions when duplicates are allowed", () => {
    expect(
      filterAvailableSuggestions([vip, beta], new Set(["ctag_vip"]), (tag) => tag.id, true)
    ).toEqual([vip, beta])
  })
})

describe("filterSuggestionsByQuery", () => {
  it("filters by label substring", () => {
    expect(
      filterSuggestionsByQuery([vip, beta], "vi", (tag) => [tag.label])
    ).toEqual([vip])
  })

  it("returns all suggestions for empty query", () => {
    expect(filterSuggestionsByQuery([vip, beta], "  ", (tag) => [tag.label])).toEqual([
      vip,
      beta,
    ])
  })
})

describe("findSuggestionByLabel", () => {
  it("matches case-insensitively after trim", () => {
    expect(findSuggestionByLabel("  vip ", [vip, beta], (tag) => tag.label)).toEqual(vip)
    expect(findSuggestionByLabel("missing", [vip], (tag) => tag.label)).toBeNull()
  })
})

describe("buildTagsMenuOptions", () => {
  it("includes create option when input does not match a suggestion", () => {
    const options = buildTagsMenuOptions(
      [vip],
      "New Tag",
      [],
      [vip],
      (tag) => tag.label,
      { isFull: false }
    )

    expect(options).toEqual([
      { type: "suggestion", tag: vip },
      { type: "create", label: "New Tag" },
    ])
  })

  it("omits create option when input matches an available suggestion", () => {
    const options = buildTagsMenuOptions(
      [vip],
      "vip",
      [],
      [vip],
      (tag) => tag.label
    )

    expect(options).toEqual([{ type: "suggestion", tag: vip }])
  })
})

describe("resolveTagFromLabel", () => {
  it("returns matched suggestion before creating", () => {
    expect(
      resolveTagFromLabel("VIP", [], [vip], (tag) => tag.label)
    ).toEqual(vip)
  })

  it("creates a new tag when no suggestion matches", () => {
    const created = resolveTagFromLabel("Brand New", [], [vip], (tag) => tag.label)

    expect(created).toEqual({ id: "tag-brand-new-0", label: "Brand New" })
  })

  it("uses custom createTag when provided", () => {
    const createTag = vi.fn((label: string) => ({
      id: "custom",
      label,
    }))

    expect(
      resolveTagFromLabel("X", [], [], (tag) => tag.label, { createTag })
    ).toEqual({ id: "custom", label: "X" })
  })
})

describe("mergeTagsFromLabels", () => {
  it("adds multiple unique labels and respects maxTags", () => {
    const catalog = [vip, beta]
    const { tags, changed } = mergeTagsFromLabels([], ["VIP", "Beta", "Gamma"], {
      maxTags: 2,
      getTagLabel: (tag: TagValue) => tag.label,
      findSuggestionByLabel: (label: string) =>
        findSuggestionByLabel(label, catalog, (tag) => tag.label),
    })

    expect(changed).toBe(true)
    expect(tags.map((tag) => tag.label)).toEqual(["VIP", "Beta"])
  })

  it("skips invalid and duplicate labels", () => {
    const { tags, changed } = mergeTagsFromLabels([vip], ["VIP", "ab", "Gamma"], {
      minLength: 3,
      getTagLabel: (tag) => tag.label,
      findSuggestionByLabel: () => null,
      createTag: (label) => ({ id: createTagId(label, [vip]), label }),
    })

    expect(changed).toBe(true)
    expect(tags).toHaveLength(2)
    expect(tags[1]?.label).toBe("Gamma")
  })
})

describe("diffTags", () => {
  it("returns added and removed tags by id", () => {
    const next = [vip, { id: "ctag_new", label: "New" }]

    expect(diffTags([vip, beta], next, (tag) => tag.id)).toEqual({
      added: [{ id: "ctag_new", label: "New" }],
      removed: [beta],
    })
  })
})

describe("labelsMatchCaseInsensitive", () => {
  it("compares trimmed labels", () => {
    expect(labelsMatchCaseInsensitive(" VIP ", "vip")).toBe(true)
    expect(labelsMatchCaseInsensitive("VIP", "Beta")).toBe(false)
  })
})

describe("normalizeTagLabel", () => {
  it("trims by default", () => {
    expect(normalizeTagLabel("  hello  ")).toBe("hello")
  })
})

describe("shouldShowCreateOption", () => {
  it("is false when input matches suggestion or cannot be added", () => {
    expect(
      shouldShowCreateOption("vip", [], [vip], (tag) => tag.label)
    ).toBe(false)
    expect(
      shouldShowCreateOption("", [], [vip], (tag) => tag.label)
    ).toBe(false)
    expect(
      shouldShowCreateOption("brand new", [], [vip], (tag) => tag.label)
    ).toBe(true)
  })
})
