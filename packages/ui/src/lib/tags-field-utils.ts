export type TagValue = {
  id: string
  label: string
  color?: string
}

export type TagMenuOption<T extends TagValue = TagValue> =
  | { type: "suggestion"; tag: T }
  | { type: "create"; label: string }

export type TagLabelValidationOptions = {
  allowDuplicates?: boolean
  minLength?: number
  maxLength?: number
  validateTag?: (label: string) => boolean
  normalizeInput?: (input: string) => string
  isFull?: boolean
}

export type MergeTagsFromLabelsOptions<T extends TagValue> = TagLabelValidationOptions & {
  allowDuplicates?: boolean
  maxTags?: number
  getTagLabel: (tag: T) => string
  findSuggestionByLabel: (label: string) => T | null
  createTag?: (label: string, context: { tags: T[] }) => T | null
}

const defaultNormalizeInput = (input: string) => input.trim()

export function createTagId(label: string, existingTags: Pick<TagValue, "id">[]): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const baseId = `tag-${slug || "item"}`
  const existingIds = new Set(existingTags.map((tag) => tag.id))
  let index = existingTags.length
  let nextId = `${baseId}-${index}`

  while (existingIds.has(nextId)) {
    index += 1
    nextId = `${baseId}-${index}`
  }

  return nextId
}

export function normalizeTagLabel(
  input: string,
  normalizeInput: (value: string) => string = defaultNormalizeInput
): string {
  return normalizeInput(input)
}

export function parseTagLabelsFromPaste(text: string): string[] {
  return [
    ...new Set(
      text
        .split(/[,;\n]+/)
        .map((part) => part.trim())
        .filter(Boolean)
    ),
  ]
}

export function shouldParsePaste(text: string): boolean {
  return text.includes(",") || text.includes(";") || text.includes("\n")
}

export function labelsMatchCaseInsensitive(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function canAddTagLabel<T extends TagValue>(
  rawLabel: string,
  tags: T[],
  getTagLabel: (tag: T) => string,
  options: TagLabelValidationOptions = {}
): boolean {
  const {
    allowDuplicates = false,
    minLength,
    maxLength,
    validateTag,
    normalizeInput = defaultNormalizeInput,
    isFull = false,
  } = options

  const label = normalizeInput(rawLabel)

  if (!label) {
    return false
  }

  if (minLength !== undefined && label.length < minLength) {
    return false
  }

  if (maxLength !== undefined && label.length > maxLength) {
    return false
  }

  if (validateTag && !validateTag(label)) {
    return false
  }

  if (
    !allowDuplicates &&
    tags.some((tag) => labelsMatchCaseInsensitive(getTagLabel(tag), label))
  ) {
    return false
  }

  return !isFull
}

export function filterAvailableSuggestions<T extends TagValue>(
  suggestions: T[],
  selectedIds: Set<string>,
  getTagId: (tag: T) => string,
  allowDuplicates = false
): T[] {
  if (allowDuplicates) {
    return suggestions
  }

  return suggestions.filter((suggestion) => !selectedIds.has(getTagId(suggestion)))
}

export function filterSuggestionsByQuery<T extends TagValue>(
  suggestions: T[],
  query: string,
  getFilterTexts: (tag: T) => string[],
  normalizeInput: (input: string) => string = defaultNormalizeInput
): T[] {
  const normalizedQuery = normalizeInput(query).toLowerCase()

  if (!normalizedQuery) {
    return suggestions
  }

  return suggestions.filter((suggestion) =>
    getFilterTexts(suggestion).some((text) =>
      text.toLowerCase().includes(normalizedQuery)
    )
  )
}

export function findSuggestionByLabel<T extends TagValue>(
  rawLabel: string,
  suggestions: T[],
  getTagLabel: (tag: T) => string,
  normalizeInput: (input: string) => string = defaultNormalizeInput
): T | null {
  const label = normalizeInput(rawLabel).toLowerCase()

  return (
    suggestions.find((suggestion) =>
      labelsMatchCaseInsensitive(getTagLabel(suggestion), label)
    ) ?? null
  )
}

export function shouldShowCreateOption<T extends TagValue>(
  inputValue: string,
  tags: T[],
  availableSuggestions: T[],
  getTagLabel: (tag: T) => string,
  options: TagLabelValidationOptions = {}
): boolean {
  const normalizeInput = options.normalizeInput ?? defaultNormalizeInput
  const label = normalizeInput(inputValue)

  if (!label || !canAddTagLabel(label, tags, getTagLabel, options)) {
    return false
  }

  return !findSuggestionByLabel(label, availableSuggestions, getTagLabel, normalizeInput)
}

export function buildTagsMenuOptions<T extends TagValue>(
  filteredSuggestions: T[],
  inputValue: string,
  tags: T[],
  availableSuggestions: T[],
  getTagLabel: (tag: T) => string,
  options: TagLabelValidationOptions = {}
): TagMenuOption<T>[] {
  const normalizeInput = options.normalizeInput ?? defaultNormalizeInput
  const items: TagMenuOption<T>[] = filteredSuggestions.map((tag) => ({
    type: "suggestion",
    tag,
  }))

  if (shouldShowCreateOption(inputValue, tags, availableSuggestions, getTagLabel, options)) {
    items.push({ type: "create", label: normalizeInput(inputValue) })
  }

  return items
}

export function resolveTagFromLabel<T extends TagValue>(
  rawLabel: string,
  tags: T[],
  availableSuggestions: T[],
  getTagLabel: (tag: T) => string,
  options: TagLabelValidationOptions & {
    createTag?: (label: string, context: { tags: T[] }) => T | null
  } = {}
): T | null {
  const normalizeInput = options.normalizeInput ?? defaultNormalizeInput
  const label = normalizeInput(rawLabel)

  if (!canAddTagLabel(label, tags, getTagLabel, options)) {
    return null
  }

  const matchedSuggestion = findSuggestionByLabel(
    label,
    availableSuggestions,
    getTagLabel,
    normalizeInput
  )

  if (matchedSuggestion) {
    return matchedSuggestion
  }

  if (options.createTag) {
    return options.createTag(label, { tags })
  }

  return {
    id: createTagId(label, tags),
    label,
  } as T
}

export function mergeTagsFromLabels<T extends TagValue>(
  tags: T[],
  rawLabels: string[],
  options: MergeTagsFromLabelsOptions<T>
): { tags: T[]; changed: boolean } {
  const {
    allowDuplicates = false,
    maxTags,
    minLength,
    maxLength,
    validateTag,
    normalizeInput = defaultNormalizeInput,
    getTagLabel,
    findSuggestionByLabel,
    createTag,
  } = options

  let nextTags = [...tags]
  let changed = false

  for (const rawLabel of rawLabels) {
    const label = normalizeInput(rawLabel)

    if (!label) {
      continue
    }

    if (maxTags !== undefined && nextTags.length >= maxTags) {
      break
    }

    const tag =
      findSuggestionByLabel(label) ??
      (createTag
        ? createTag(label, { tags: nextTags })
        : ({ id: createTagId(label, nextTags), label } as T))

    if (!tag) {
      continue
    }

    const labelToCheck = getTagLabel(tag)

    if (minLength !== undefined && labelToCheck.length < minLength) {
      continue
    }

    if (maxLength !== undefined && labelToCheck.length > maxLength) {
      continue
    }

    if (validateTag && !validateTag(labelToCheck)) {
      continue
    }

    if (
      !allowDuplicates &&
      nextTags.some((existing) =>
        labelsMatchCaseInsensitive(getTagLabel(existing), labelToCheck)
      )
    ) {
      continue
    }

    nextTags = [...nextTags, tag]
    changed = true
  }

  return { tags: nextTags, changed }
}

export function diffTags<T extends TagValue>(
  previous: T[],
  next: T[],
  getTagId: (tag: T) => string
): { added: T[]; removed: T[] } {
  const previousIds = new Set(previous.map((tag) => getTagId(tag)))
  const nextIds = new Set(next.map((tag) => getTagId(tag)))

  const added = next.filter((tag) => !previousIds.has(getTagId(tag)))
  const removed = previous.filter((tag) => !nextIds.has(getTagId(tag)))

  return { added, removed }
}
