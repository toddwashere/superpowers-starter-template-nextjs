"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { Button } from "#components/button"
import { cn } from "#lib/utils"
import type { TagValue } from "#hooks/use-tags-field"

const tagChipVariants = cva(
  "inline-flex max-w-full items-center gap-0.5 whitespace-nowrap rounded-md border pl-2 text-sm transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-background text-foreground",
      },
      size: {
        sm: "h-6 text-xs",
        md: "h-7 text-sm",
        lg: "h-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

type TagChipProps<T extends TagValue = TagValue> = VariantProps<
  typeof tagChipVariants
> & {
  tag: T
  displayLabel?: string
  onRemove?: () => void
  onClick?: () => void
  className?: string
}

function TagChipInner<T extends TagValue>(
  {
    tag,
    displayLabel = tag.label,
    onRemove,
    onClick,
    variant,
    size,
    className,
  }: TagChipProps<T>,
  ref: React.ForwardedRef<HTMLSpanElement>
) {
  const hasColor = Boolean(tag.color)

  return (
    <span
      ref={ref}
      data-tag-color={tag.color}
      className={cn(
        tagChipVariants({ variant: hasColor ? "outline" : variant, size }),
        hasColor && "border-transparent text-white",
        !onRemove && "pr-2",
        className
      )}
      style={
        hasColor
          ? { backgroundColor: tag.color, borderColor: tag.color }
          : undefined
      }
    >
      {onClick ? (
        <button
          type="button"
          className="max-w-[200px] truncate bg-transparent p-0 text-left"
          onClick={onClick}
        >
          {displayLabel}
        </button>
      ) : (
        <span className="max-w-[200px] truncate">{displayLabel}</span>
      )}
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${tag.label}`}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className={cn(
            "h-full shrink-0 px-1.5 hover:bg-transparent",
            hasColor && "text-white/90 hover:text-white"
          )}
        >
          <XIcon className="size-3.5" />
        </Button>
      ) : null}
    </span>
  )
}

const TagChip = React.forwardRef(TagChipInner) as <T extends TagValue>(
  props: TagChipProps<T> & { ref?: React.ForwardedRef<HTMLSpanElement> }
) => React.JSX.Element

;(TagChip as React.FC).displayName = "TagChip"

export { TagChip, tagChipVariants }
export type { TagChipProps }
