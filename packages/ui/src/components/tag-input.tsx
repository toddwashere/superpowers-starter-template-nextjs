"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { Button } from "#components/button"
import { Input } from "#components/input"
import { cn } from "#lib/utils"

const tagVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-md border pl-2 text-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        primary:
          "border-primary bg-primary text-primary-foreground hover:opacity-70",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-7 text-xs",
        md: "h-8 text-sm",
        lg: "h-9 text-base",
        xl: "h-10 text-lg",
      },
      shape: {
        default: "rounded-sm",
        rounded: "rounded-lg",
        square: "rounded-none",
        pill: "rounded-full",
      },
      borderStyle: {
        default: "border-solid",
        none: "border-none",
      },
      textCase: {
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
      },
      interaction: {
        clickable: "cursor-pointer hover:shadow-md",
        nonClickable: "cursor-default",
      },
      animation: {
        none: "",
        fadeIn: "animate-fadeIn",
        slideIn: "animate-slideIn",
        bounce: "animate-bounce",
      },
      textStyle: {
        normal: "font-normal",
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        lineThrough: "line-through",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
      borderStyle: "default",
      interaction: "nonClickable",
      animation: "fadeIn",
      textStyle: "normal",
    },
  }
)

type TagType = {
  id: string
  text: string
}

enum Delimiter {
  Comma = ",",
  Enter = "Enter",
}

type OmittedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "size" | "value"
>
type TagInputNestedInputProps = Omit<
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
    inputFieldPosition?: "bottom" | "top" | "inline"
    clearAll?: boolean
    onClearAll?: () => void
    inputProps?: TagInputNestedInputProps
  }

type TagProps = {
  tagObj: TagType
  displayText?: string
  variant: TagInputProps["variant"]
  size: TagInputProps["size"]
  shape: TagInputProps["shape"]
  borderStyle: TagInputProps["borderStyle"]
  textCase: TagInputProps["textCase"]
  interaction: TagInputProps["interaction"]
  animation: TagInputProps["animation"]
  textStyle: TagInputProps["textStyle"]
  onRemoveTag?: (id: string) => void
} & Pick<TagInputProps, "direction" | "onTagClick">

function Tag({
  tagObj,
  displayText = tagObj.text,
  direction,
  onTagClick,
  onRemoveTag,
  variant,
  size,
  shape,
  borderStyle,
  textCase,
  interaction,
  animation,
  textStyle,
}: TagProps): React.JSX.Element {
  return (
    <span
      key={tagObj.id}
      className={cn(
        tagVariants({
          variant,
          size,
          shape,
          borderStyle,
          textCase,
          interaction,
          animation,
          textStyle,
        }),
        {
          "justify-between": direction === "column",
        },
        !onRemoveTag && "pr-2"
      )}
    >
      {onTagClick ? (
        <button
          type="button"
          className="min-w-0 bg-transparent p-0 text-left"
          onClick={() => onTagClick(tagObj)}
        >
          {displayText}
        </button>
      ) : (
        displayText
      )}
      {onRemoveTag ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${tagObj.text}`}
          onClick={(event) => {
            event.stopPropagation()
            onRemoveTag(tagObj.id)
          }}
          className="h-full px-3 py-1 hover:bg-transparent"
        >
          <XIcon className="size-3.5 shrink-0" />
        </Button>
      ) : null}
    </span>
  )
}

type TagListProps = {
  tags: TagType[]
  getDisplayText?: (tag: TagType) => string
  direction?: TagProps["direction"]
  className?: React.HTMLAttributes<HTMLDivElement>["className"]
} & Omit<TagProps, "tagObj">

const TagList: React.FC<TagListProps> = ({
  tags,
  getDisplayText,
  direction,
  className,
  ...tagListProps
}) => {
  return (
    <div
      className={cn(
        "max-w-[450px] rounded-md",
        {
          "flex flex-wrap gap-2": direction === "row",
          "flex flex-col gap-2": direction === "column",
        },
        className
      )}
    >
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          tagObj={tag}
          displayText={getDisplayText?.(tag)}
          direction={direction}
          {...tagListProps}
        />
      ))}
    </div>
  )
}

const createTagId = (text: string, existingTags: TagType[]) => {
  const slug = text
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

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      id,
      placeholder,
      tags,
      onTagsChange,
      variant,
      size,
      shape,
      className,
      maxTags,
      minTags,
      delimiter = Delimiter.Comma,
      onTagAdd,
      onTagRemove,
      allowDuplicates,
      validateTag,
      placeholderWhenFull = "Max tags reached",
      sortTags,
      delimiterList,
      truncate,
      borderStyle,
      textCase,
      interaction,
      animation,
      textStyle,
      minLength,
      maxLength,
      direction = "row",
      onInputChange,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      onTagClick,
      inputFieldPosition = "bottom",
      clearAll = false,
      onClearAll,
      inputProps = {},
      disabled,
      readOnly,
      ...inputRestProps
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("")
    const {
      className: inputPropsClassName,
      disabled: inputPropsDisabled,
      readOnly: inputPropsReadOnly,
      onChange: inputPropsOnChange,
      onKeyDown: inputPropsOnKeyDown,
      onFocus: inputPropsOnFocus,
      onBlur: inputPropsOnBlur,
      value: _inputPropsValue,
      defaultValue: _inputPropsDefaultValue,
      ...otherInputProps
    } = inputProps as TagInputNestedInputProps & {
      value?: unknown
      defaultValue?: unknown
    }
    const isFull = maxTags !== undefined && tags.length >= maxTags
    const isDisabled = disabled || inputPropsDisabled || isFull
    const isReadOnly = readOnly || inputPropsReadOnly
    const isMutationDisabled = Boolean(disabled || inputPropsDisabled || isReadOnly)

    const canAddTag = React.useCallback(
      (tagText: string) => {
        if (!tagText) {
          return false
        }

        if (minTags !== undefined && minTags < 0) {
          return false
        }

        if (maxTags !== undefined && maxTags < 0) {
          return false
        }

        if (minLength !== undefined && tagText.length < minLength) {
          return false
        }

        if (maxLength !== undefined && tagText.length > maxLength) {
          return false
        }

        if (validateTag && !validateTag(tagText)) {
          return false
        }

        if (!allowDuplicates && tags.some((tag) => tag.text === tagText)) {
          return false
        }

        return !isFull
      },
      [
        allowDuplicates,
        isFull,
        maxLength,
        maxTags,
        minLength,
        minTags,
        tags,
        validateTag,
      ]
    )

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setInputValue(newValue)
      onChange?.(event)
      inputPropsOnChange?.(event)
      onInputChange?.(newValue)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      inputPropsOnKeyDown?.(event)

      if (event.defaultPrevented || isDisabled || isReadOnly) {
        return
      }

      const delimiterKeys = delimiterList ?? [delimiter, Delimiter.Enter]

      if (!delimiterKeys.includes(event.key)) {
        return
      }

      event.preventDefault()

      const newTagText = inputValue.trim()
      if (!canAddTag(newTagText)) {
        setInputValue("")
        return
      }

      const newTag = {
        id: createTagId(newTagText, tags),
        text: newTagText,
      }

      onTagsChange([...tags, newTag])
      onTagAdd?.(newTagText)
      setInputValue("")
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event)
      inputPropsOnFocus?.(event)
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event)
      inputPropsOnBlur?.(event)
    }

    const removeTag = (idToRemove: string) => {
      if (isMutationDisabled || (minTags !== undefined && tags.length <= minTags)) {
        return
      }

      const tagToRemove = tags.find((tag) => tag.id === idToRemove)

      onTagsChange(tags.filter((tag) => tag.id !== idToRemove))
      onTagRemove?.(tagToRemove?.text ?? "")
    }

    const handleClearAll = () => {
      if (isMutationDisabled) {
        return
      }

      const nextTags = minTags ? tags.slice(0, minTags) : []
      onTagsChange(nextTags)
      onClearAll?.()
    }

    const displayedTags = sortTags
      ? [...tags].sort((firstTag, secondTag) =>
          firstTag.text.localeCompare(secondTag.text)
        )
      : tags

    const getDisplayText = (tag: TagType) => {
      if (!truncate || tag.text.length <= truncate) {
        return tag.text
      }

      return `${tag.text.substring(0, truncate)}...`
    }

    const canRemoveTag =
      !isMutationDisabled && (minTags === undefined || tags.length > minTags)
    const canClearAll =
      !isMutationDisabled && tags.length > (minTags === undefined ? 0 : minTags)

    return (
      <div
        className={cn(
          "relative flex w-full gap-3",
          inputFieldPosition === "inline" ? "flex-row" : "flex-col",
          inputFieldPosition === "top" && "flex-col-reverse"
        )}
      >
        <TagList
          tags={displayedTags}
          getDisplayText={getDisplayText}
          variant={variant}
          size={size}
          shape={shape}
          borderStyle={borderStyle}
          textCase={textCase}
          interaction={interaction}
          animation={animation}
          textStyle={textStyle}
          onTagClick={onTagClick}
          onRemoveTag={canRemoveTag ? removeTag : undefined}
          direction={direction}
        />
        <div className="w-full">
          <Input
            ref={ref}
            id={id}
            type="text"
            {...inputRestProps}
            {...otherInputProps}
            placeholder={isFull ? placeholderWhenFull : placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(className, inputPropsClassName)}
            disabled={isDisabled}
            readOnly={isReadOnly}
          />
        </div>
        {clearAll ? (
          <Button
            type="button"
            onClick={handleClearAll}
            className="mt-2"
            disabled={!canClearAll}
          >
            Clear All
          </Button>
        ) : null}
      </div>
    )
  }
)
TagInput.displayName = "TagInput"

export { Delimiter, TagInput, TagList, tagVariants }
export type { TagInputProps, TagListProps, TagProps, TagType }
