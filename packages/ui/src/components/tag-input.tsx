"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { tagChipVariants } from "#components/tag-chip"
import { TagsField } from "#components/tags-field"
import { Delimiter } from "#lib/tag-input-constants"
import type { TagValue } from "#lib/tags-field-utils"

/** @deprecated Prefer `TagValue` from tags-field / tags-field-utils */
export type TagType = {
  id: string
  text: string
}

export { Delimiter }

const tagVariants = tagChipVariants

type OmittedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "size" | "value"
>

type TagInputProps = OmittedInputProps &
  VariantProps<typeof tagVariants> & {
    placeholder?: string
    tags: TagType[]
    onTagsChange: (tags: TagType[]) => void
    maxTags?: number
    minTags?: number
    onTagAdd?: (tag: string) => void
    onTagRemove?: (tag: string) => void
    allowDuplicates?: boolean
    validateTag?: (tag: string) => boolean
    delimiter?: Delimiter
    placeholderWhenFull?: string
    sortTags?: boolean
    delimiterList?: string[]
    truncate?: number
    minLength?: number
    maxLength?: number
    direction?: "row" | "column"
    onInputChange?: (value: string) => void
    onTagClick?: (tag: TagType) => void
    shape?: string
    borderStyle?: string
    textCase?: string
    interaction?: string
    animation?: string
    textStyle?: string
    inputFieldPosition?: "bottom" | "top" | "inline"
    clearAll?: boolean
    onClearAll?: () => void
    inputProps?: OmittedInputProps
  }

function toTagValue(tag: TagType): TagValue {
  return { id: tag.id, label: tag.text }
}

function toTagType(tag: TagValue): TagType {
  return { id: tag.id, text: tag.label }
}

function sortTagTypes(tags: TagType[], sortTags?: boolean): TagType[] {
  if (!sortTags) {
    return tags
  }

  return [...tags].sort((a, b) => a.text.localeCompare(b.text))
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      tags,
      onTagsChange,
      delimiter = Delimiter.Comma,
      delimiterList,
      sortTags,
      direction: _direction,
      inputFieldPosition: _inputFieldPosition,
      clearAll,
      onClearAll,
      onTagClick: _onTagClick,
      inputProps,
      variant: _variant,
      size: _size,
      shape: _shape,
      borderStyle: _borderStyle,
      textCase: _textCase,
      interaction: _interaction,
      animation: _animation,
      textStyle: _textStyle,
      className,
      disabled,
      readOnly,
      minTags,
      ...rest
    },
    ref
  ) => {
    const tagValues = React.useMemo(
      () => sortTagTypes(tags, sortTags).map(toTagValue),
      [sortTags, tags]
    )

    const delimiterKeys = delimiterList ?? [delimiter, Delimiter.Enter]

    const handleClearAll = () => {
      const next = minTags ? tags.slice(0, minTags) : []
      onTagsChange(next)
      onClearAll?.()
    }

    return (
      <div className="space-y-2">
        <TagsField
          ref={ref}
          tags={tagValues}
          onTagsChange={(next) => onTagsChange(next.map(toTagType))}
          delimiterKeys={delimiterKeys}
          truncate={rest.truncate}
          allowDuplicates={rest.allowDuplicates}
          maxTags={rest.maxTags}
          minTags={minTags}
          minLength={rest.minLength}
          maxLength={rest.maxLength}
          validateTag={rest.validateTag}
          placeholder={rest.placeholder}
          placeholderWhenFull={rest.placeholderWhenFull}
          disabled={disabled}
          readOnly={readOnly}
          onInputChange={rest.onInputChange}
          onTagAdd={rest.onTagAdd}
          onTagRemove={rest.onTagRemove}
          className={className}
          id={rest.id}
          name={rest.name}
          aria-label={rest["aria-label"]}
        />
        {clearAll ? (
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            disabled={Boolean(disabled || readOnly || (minTags !== undefined && tags.length <= minTags))}
            onClick={handleClearAll}
          >
            Clear All
          </button>
        ) : null}
      </div>
    )
  }
)
TagInput.displayName = "TagInput"

function TagList({
  tags,
  className,
}: {
  tags: TagType[]
  className?: string
}) {
  return (
    <div className={className}>
      {tags.map((tag) => (
        <span key={tag.id} className="mr-2 inline-flex">
          {tag.text}
        </span>
      ))}
    </div>
  )
}

export { TagInput, TagList, tagVariants }
export type { TagInputProps }
