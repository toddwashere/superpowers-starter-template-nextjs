"use client"

import * as React from "react"

import {
  buildTagsMenuOptions,
  canAddTagLabel,
  filterAvailableSuggestions,
  filterSuggestionsByQuery,
  findSuggestionByLabel,
  mergeTagsFromLabels,
  parseTagLabelsFromPaste,
  resolveTagFromLabel,
  shouldParsePaste,
  type TagMenuOption,
  type TagValue,
} from "#lib/tags-field-utils"

export type { TagValue } from "#lib/tags-field-utils"
export {
  createTagId,
  normalizeTagLabel as defaultNormalizeInput,
  parseTagLabelsFromPaste,
} from "#lib/tags-field-utils"

import { normalizeTagLabel } from "#lib/tags-field-utils"

export type CreateTagValue<T extends TagValue> = (
  input: string,
  context: { tags: T[]; suggestions: T[] }
) => T | null

export type UseTagsFieldOptions<T extends TagValue = TagValue> = {
  tags: T[]
  onTagsChange: (tags: T[]) => void
  suggestions?: T[]
  getTagId?: (tag: T) => string
  getTagLabel?: (tag: T) => string
  getFilterTexts?: (tag: T) => string[]
  createTag?: CreateTagValue<T>
  allowDuplicates?: boolean
  maxTags?: number
  minTags?: number
  minLength?: number
  maxLength?: number
  validateTag?: (label: string) => boolean
  delimiterKeys?: string[]
  disabled?: boolean
  readOnly?: boolean
  normalizeInput?: (input: string) => string
}

const DEFAULT_DELIMITER_KEYS = ["Enter", ","]

function defaultGetTagId<T extends TagValue>(tag: T): string {
  return tag.id
}

function defaultGetTagLabel<T extends TagValue>(tag: T): string {
  return tag.label
}

function defaultGetFilterTexts<T extends TagValue>(tag: T): string[] {
  return [tag.label]
}

export function useTagsField<T extends TagValue = TagValue>(
  options: UseTagsFieldOptions<T>
) {
  const {
    tags,
    onTagsChange,
    suggestions = [],
    getTagId = defaultGetTagId,
    getTagLabel = defaultGetTagLabel,
    getFilterTexts = defaultGetFilterTexts,
    createTag,
    allowDuplicates = false,
    maxTags,
    minTags,
    minLength,
    maxLength,
    validateTag,
    delimiterKeys = DEFAULT_DELIMITER_KEYS,
    disabled = false,
    readOnly = false,
    normalizeInput = normalizeTagLabel,
  } = options

  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

  const isReadOnly = readOnly
  const isMutationDisabled = disabled || isReadOnly
  const isFull = maxTags !== undefined && tags.length >= maxTags
  const isInputDisabled = isMutationDisabled || isFull

  const labelValidationOptions = React.useMemo(
    () => ({
      allowDuplicates,
      minLength,
      maxLength,
      validateTag,
      normalizeInput,
      isFull,
    }),
    [allowDuplicates, isFull, maxLength, minLength, normalizeInput, validateTag]
  )

  const selectedIds = React.useMemo(
    () => new Set(tags.map((tag) => getTagId(tag))),
    [getTagId, tags]
  )

  const availableSuggestions = React.useMemo(
    () =>
      filterAvailableSuggestions(
        suggestions,
        selectedIds,
        getTagId,
        allowDuplicates
      ),
    [allowDuplicates, getTagId, selectedIds, suggestions]
  )

  const filteredSuggestions = React.useMemo(
    () =>
      filterSuggestionsByQuery(
        availableSuggestions,
        inputValue,
        getFilterTexts,
        normalizeInput
      ),
    [availableSuggestions, getFilterTexts, inputValue, normalizeInput]
  )

  const findAvailableSuggestionByLabel = React.useCallback(
    (rawLabel: string) =>
      findSuggestionByLabel(
        rawLabel,
        availableSuggestions,
        getTagLabel,
        normalizeInput
      ),
    [availableSuggestions, getTagLabel, normalizeInput]
  )

  const canAddLabel = React.useCallback(
    (rawLabel: string) =>
      canAddTagLabel(rawLabel, tags, getTagLabel, labelValidationOptions),
    [getTagLabel, labelValidationOptions, tags]
  )

  const resolveTagFromInput = React.useCallback(
    (rawLabel: string): T | null =>
      resolveTagFromLabel(rawLabel, tags, availableSuggestions, getTagLabel, {
        ...labelValidationOptions,
        createTag: createTag
          ? (label, context) => createTag(label, { ...context, suggestions })
          : undefined,
      }),
    [
      availableSuggestions,
      createTag,
      getTagLabel,
      labelValidationOptions,
      suggestions,
      tags,
    ]
  )

  const menuOptions: TagMenuOption<T>[] = React.useMemo(
    () =>
      buildTagsMenuOptions(
        filteredSuggestions,
        inputValue,
        tags,
        availableSuggestions,
        getTagLabel,
        labelValidationOptions
      ),
    [
      availableSuggestions,
      filteredSuggestions,
      getTagLabel,
      inputValue,
      labelValidationOptions,
      tags,
    ]
  )

  const addTag = React.useCallback(
    (tag: T) => {
      if (isMutationDisabled || !canAddLabel(getTagLabel(tag))) {
        return false
      }

      onTagsChange([...tags, tag])
      return true
    },
    [canAddLabel, getTagLabel, isMutationDisabled, onTagsChange, tags]
  )

  const addLabels = React.useCallback(
    (rawLabels: string[]) => {
      const { tags: nextTags, changed } = mergeTagsFromLabels(tags, rawLabels, {
        allowDuplicates,
        maxTags,
        minLength,
        maxLength,
        validateTag,
        normalizeInput,
        getTagLabel,
        findSuggestionByLabel: findAvailableSuggestionByLabel,
        createTag: createTag
          ? (label, context) => createTag(label, { ...context, suggestions })
          : undefined,
      })

      if (changed) {
        onTagsChange(nextTags)
      }

      return changed
    },
    [
      allowDuplicates,
      createTag,
      findAvailableSuggestionByLabel,
      getTagLabel,
      maxLength,
      maxTags,
      minLength,
      normalizeInput,
      onTagsChange,
      suggestions,
      tags,
      validateTag,
    ]
  )

  const addFromInput = React.useCallback(() => {
    const tag = resolveTagFromInput(inputValue)

    if (!tag) {
      setInputValue("")
      return false
    }

    const added = addTag(tag)

    if (added) {
      setInputValue("")
      setOpen(false)
      setHighlightedIndex(-1)
    }

    return added
  }, [addTag, inputValue, resolveTagFromInput])

  const removeTag = React.useCallback(
    (idToRemove: string) => {
      if (isMutationDisabled || (minTags !== undefined && tags.length <= minTags)) {
        return
      }

      onTagsChange(tags.filter((tag) => getTagId(tag) !== idToRemove))
    },
    [getTagId, isMutationDisabled, minTags, onTagsChange, tags]
  )

  const removeLastTag = React.useCallback(() => {
    if (isMutationDisabled || tags.length === 0) {
      return
    }

    if (minTags !== undefined && tags.length <= minTags) {
      return
    }

    const lastTag = tags[tags.length - 1]

    if (!lastTag) {
      return
    }

    removeTag(getTagId(lastTag))
  }, [getTagId, isMutationDisabled, minTags, removeTag, tags])

  const selectSuggestion = React.useCallback(
    (suggestion: T) => {
      if (addTag(suggestion)) {
        setInputValue("")
        setOpen(false)
        setHighlightedIndex(-1)
      }
    },
    [addTag]
  )

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value

      setInputValue(nextValue)

      if (!isInputDisabled) {
        setOpen(true)
      }
    },
    [isInputDisabled]
  )

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented || isInputDisabled) {
        return
      }

      if (event.key === "Backspace" && inputValue === "") {
        event.preventDefault()
        removeLastTag()
        return
      }

      if (delimiterKeys.includes(event.key)) {
        event.preventDefault()
        addFromInput()
        return
      }

      if (!open || menuOptions.length === 0) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault()
          setOpen(true)
        }

        return
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setHighlightedIndex((current) =>
            current < menuOptions.length - 1 ? current + 1 : current
          )
          break
        case "ArrowUp":
          event.preventDefault()
          setHighlightedIndex((current) => (current > 0 ? current - 1 : current))
          break
        case "Enter":
        case "Tab":
          event.preventDefault()
          if (highlightedIndex >= 0) {
            const option = menuOptions[highlightedIndex]

            if (option?.type === "suggestion") {
              selectSuggestion(option.tag)
            } else if (option?.type === "create") {
              addFromInput()
            }
          } else {
            addFromInput()
          }
          break
        case "Escape":
          event.preventDefault()
          setOpen(false)
          setHighlightedIndex(-1)
          break
      }
    },
    [
      addFromInput,
      delimiterKeys,
      highlightedIndex,
      inputValue,
      isInputDisabled,
      menuOptions,
      open,
      removeLastTag,
      selectSuggestion,
    ]
  )

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData("text")

      if (!shouldParsePaste(pasted)) {
        return
      }

      event.preventDefault()
      const labels = parseTagLabelsFromPaste(pasted)

      if (labels.length > 0) {
        addLabels(labels)
        setInputValue("")
        setOpen(false)
      }
    },
    [addLabels]
  )

  const handleInputFocus = React.useCallback(() => {
    if (!isInputDisabled && (availableSuggestions.length > 0 || inputValue)) {
      setOpen(true)
    }
  }, [availableSuggestions.length, inputValue, isInputDisabled])

  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const handleInputBlur = React.useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }

    blurTimeoutRef.current = setTimeout(() => {
      setOpen(false)
      setHighlightedIndex(-1)
      blurTimeoutRef.current = null
    }, 150)
  }, [])

  React.useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1)
      return
    }

    setHighlightedIndex(menuOptions.length > 0 ? 0 : -1)
  }, [menuOptions.length, open])

  const canRemoveTag =
    !isMutationDisabled && (minTags === undefined || tags.length > minTags)

  return {
    tags,
    inputValue,
    setInputValue,
    open,
    setOpen,
    highlightedIndex,
    setHighlightedIndex,
    menuOptions,
    filteredSuggestions,
    availableSuggestions,
    addTag,
    addFromInput,
    addLabels,
    removeTag,
    removeLastTag,
    selectSuggestion,
    resolveTagFromLabel: resolveTagFromInput,
    handleInputChange,
    handleInputKeyDown,
    handlePaste,
    handleInputFocus,
    handleInputBlur,
    canAddLabel,
    canRemoveTag,
    isInputDisabled,
    isMutationDisabled,
    isFull,
    isReadOnly,
    getTagId,
    getTagLabel,
  }
}

export type UseTagsFieldReturn<T extends TagValue = TagValue> = ReturnType<
  typeof useTagsField<T>
>
