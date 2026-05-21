"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { TagChip } from "#components/tag-chip"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "#components/command"
import { Popover, PopoverAnchor, PopoverContent } from "#components/popover"
import { Spinner } from "#components/spinner"
import { cn } from "#lib/utils"
import { diffTags } from "#lib/tags-field-utils"
import {
  useTagsField,
  type CreateTagValue,
  type TagValue,
  type UseTagsFieldOptions,
} from "#hooks/use-tags-field"

export type TagsFieldProps<T extends TagValue = TagValue> = Omit<
  UseTagsFieldOptions<T>,
  "tags" | "onTagsChange"
> & {
  tags: T[]
  onTagsChange: (tags: T[]) => void
  placeholder?: string
  placeholderWhenFull?: string
  emptyText?: string
  createOptionLabel?: (label: string) => string
  className?: string
  inputClassName?: string
  isLoading?: boolean
  "aria-label"?: string
  id?: string
  name?: string
  onInputChange?: (value: string) => void
  onTagAdd?: (label: string) => void
  onTagRemove?: (label: string) => void
  truncate?: number
}

function TagsFieldInner<T extends TagValue>(
  {
    tags,
    onTagsChange,
    suggestions,
    getTagId,
    getTagLabel,
    getFilterTexts,
    createTag,
    allowDuplicates,
    maxTags,
    minTags,
    minLength,
    maxLength,
    validateTag,
    delimiterKeys,
    disabled,
    readOnly,
    normalizeInput,
    placeholder = "Add tag…",
    placeholderWhenFull = "Max tags reached",
    emptyText = "No matching tags",
    createOptionLabel = (label) => `Create "${label}"`,
    className,
    inputClassName,
    isLoading = false,
    "aria-label": ariaLabel = "Tags",
    id,
    name,
    onInputChange,
    onTagAdd,
    onTagRemove,
    truncate,
  }: TagsFieldProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const highlightedRef = React.useRef<HTMLDivElement>(null)
  const commandListRef = React.useRef<HTMLDivElement>(null)

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const resolveTagId = getTagId ?? ((tag: T) => tag.id)
  const resolveTagLabel = getTagLabel ?? ((tag: T) => tag.label)

  const emitTagsChange = React.useCallback(
    (nextTags: T[]) => {
      const { added, removed } = diffTags(tags, nextTags, resolveTagId)

      for (const tag of added) {
        onTagAdd?.(resolveTagLabel(tag))
      }

      for (const tag of removed) {
        onTagRemove?.(resolveTagLabel(tag))
      }

      onTagsChange(nextTags)
    },
    [onTagAdd, onTagRemove, onTagsChange, resolveTagId, resolveTagLabel, tags]
  )

  const field = useTagsField<T>({
    tags,
    onTagsChange: emitTagsChange,
    suggestions,
    getTagId,
    getTagLabel,
    getFilterTexts,
    createTag,
    allowDuplicates,
    maxTags,
    minTags,
    minLength,
    maxLength,
    validateTag,
    delimiterKeys,
    disabled: disabled || isLoading,
    readOnly,
    normalizeInput,
  })

  const {
    inputValue,
    open,
    setOpen,
    highlightedIndex,
    menuOptions,
    addFromInput,
    selectSuggestion,
    removeTag,
    handleInputChange,
    handleInputKeyDown,
    handlePaste,
    handleInputFocus,
    handleInputBlur,
    canRemoveTag,
    isInputDisabled,
    isFull,
    getTagId: fieldGetTagId,
    getTagLabel: fieldGetTagLabel,
  } = field

  const getDisplayLabel = (tag: T) => {
    const label = fieldGetTagLabel(tag)

    if (!truncate || label.length <= truncate) {
      return label
    }

    return `${label.substring(0, truncate)}…`
  }

  const showMenu = open && !isInputDisabled && menuOptions.length > 0

  React.useEffect(() => {
    if (!showMenu || highlightedIndex < 0 || !highlightedRef.current) {
      return
    }

    highlightedRef.current.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex, showMenu])

  return (
    <Popover
      open={showMenu}
      onOpenChange={(nextOpen) => {
        if (!isInputDisabled) {
          setOpen(nextOpen)
        }
      }}
    >
      <PopoverAnchor asChild>
        <div
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-xs transition-colors",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            (disabled || isLoading) && "cursor-not-allowed opacity-60",
            className
          )}
          onClick={() => {
            if (!isInputDisabled) {
              inputRef.current?.focus()
            }
          }}
        >
          {tags.map((tag) => (
            <TagChip
              key={fieldGetTagId(tag)}
              tag={tag}
              displayLabel={getDisplayLabel(tag)}
              onRemove={
                canRemoveTag
                  ? () => removeTag(fieldGetTagId(tag))
                  : undefined
              }
            />
          ))}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            autoComplete="off"
            aria-label={ariaLabel}
            aria-expanded={showMenu}
            aria-autocomplete="list"
            role="combobox"
            disabled={isInputDisabled}
            readOnly={readOnly}
            value={inputValue}
            placeholder={isFull ? placeholderWhenFull : placeholder}
            className={cn(
              "min-w-[8ch] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
              inputClassName
            )}
            onChange={(event) => {
              handleInputChange(event)
              onInputChange?.(event.target.value)
            }}
            onKeyDown={handleInputKeyDown}
            onPaste={handlePaste}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {isLoading ? <Spinner className="size-4 shrink-0" /> : null}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (inputRef.current?.contains(event.target as Node)) {
            event.preventDefault()
          }
        }}
      >
        <Command shouldFilter={false} className="max-h-[280px]">
          <CommandList
            ref={commandListRef}
            className="max-h-[220px] overflow-y-auto"
          >
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {menuOptions.map((option, index) => {
                if (option.type === "create") {
                  return (
                    <CommandItem
                      key={`create-${option.label}`}
                      value={`create-${option.label}`}
                      ref={highlightedIndex === index ? highlightedRef : undefined}
                      className={cn(highlightedIndex === index && "bg-accent")}
                      onSelect={() => addFromInput()}
                    >
                      <Plus className="mr-2 size-4 shrink-0 opacity-70" />
                      {createOptionLabel(option.label)}
                    </CommandItem>
                  )
                }

                const suggestion = option.tag

                return (
                  <CommandItem
                    key={fieldGetTagId(suggestion)}
                    value={fieldGetTagId(suggestion)}
                    ref={highlightedIndex === index ? highlightedRef : undefined}
                    className={cn(
                      "flex items-center gap-2",
                      highlightedIndex === index && "bg-accent"
                    )}
                    onSelect={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.color ? (
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: suggestion.color }}
                      />
                    ) : null}
                    <span className="truncate">{fieldGetTagLabel(suggestion)}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const TagsField = React.forwardRef(TagsFieldInner) as <T extends TagValue>(
  props: TagsFieldProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.JSX.Element

;(TagsField as React.FC).displayName = "TagsField"

export { TagsField }
export type { CreateTagValue, TagValue, UseTagsFieldOptions }
