"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "#lib/utils"
import { Button } from "#components/button"
import { Calendar } from "#components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover"

export type DateRangePickerElement = HTMLDivElement

export type DateRangePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  dateRange?: DateRange
  onDateRangeChange?: (range?: DateRange) => void
  disabled?: boolean
  viewMode?: "compact" | "full"
  placeholder?: string
}

function formatDateRange(dateRange?: DateRange, placeholder = "Pick a date") {
  if (!dateRange?.from) {
    return placeholder
  }

  if (!dateRange.to) {
    return format(dateRange.from, "LLL dd, y")
  }

  return `${format(dateRange.from, "LLL dd, y")} - ${format(
    dateRange.to,
    "LLL dd, y"
  )}`
}

function DateRangePicker({
  dateRange,
  onDateRangeChange,
  disabled,
  className,
  viewMode = "full",
  placeholder = "Pick a date",
  ...other
}: DateRangePickerProps): React.JSX.Element {
  const label = formatDateRange(dateRange, placeholder)

  return (
    <div className={cn("grid gap-2", className)} {...other}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            aria-label={viewMode === "compact" ? label : undefined}
            disabled={disabled}
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              viewMode === "compact" ? "w-[50px]" : "w-[260px]",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
            {viewMode !== "compact" && <span>{label}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={viewMode === "compact" ? 1 : 2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
