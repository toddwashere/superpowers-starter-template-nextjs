"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#components/tooltip"

export interface InfoButtonWithTooltipProps {
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  ariaLabel?: string
}

export function InfoButtonWithTooltip({
  ariaLabel = "More information",
  content,
  side = "top",
}: InfoButtonWithTooltipProps): React.JSX.Element {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex cursor-help rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CircleHelp className="size-4 shrink-0 text-primary" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-[280px] whitespace-pre-line font-normal"
        side={side}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
