"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "#lib/utils"
import { Button } from "#components/button"
import { Calendar } from "#components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover"
import {
  DateRangePicker,
  type DateRangePickerElement,
  type DateRangePickerProps,
} from "#components/date-range-picker"

const defaultPresets = [
  { value: 0, label: "Today" },
  { value: 1, label: "Tomorrow" },
  { value: 7, label: "Next week" },
  { value: 28, label: "Next month" },
  { value: 90, label: "In 3 months" },
]

export type DatePickerProps = React.ComponentProps<typeof Button> & {
  date?: Date
  onDateChange?: (date?: Date) => void
  placeholder?: string
  presets?: { value: number; label: string }[]
}

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  presets = defaultPresets,
  className,
  variant = "outline",
  ...other
}: DatePickerProps): React.JSX.Element {
  const label = date ? format(date, "PP") : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={variant}
          className={cn(
            "justify-start whitespace-nowrap text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          {...other}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="flex w-auto flex-row gap-2 divide-x p-2"
      >
        {presets.length > 0 && (
          <ul className="w-full list-none space-y-1">
            {presets.map((preset) => (
              <li key={preset.value}>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onDateChange?.(addDays(new Date(), preset.value))}
                >
                  {preset.label}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={onDateChange}
        />
      </PopoverContent>
    </Popover>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker, DateRangePicker }
export type { DateRangePickerElement, DateRangePickerProps }
