"use client"

import * as React from "react"
import { CheckIcon, PlusCircleIcon } from "lucide-react"

import { cn } from "#lib/utils"
import { Badge } from "#components/badge"
import { Button } from "#components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "#components/command"
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover"
import { ScrollArea } from "#components/scroll-area"
import { Separator } from "#components/separator"

export type DataTableFilterOption = {
  label: string
  value: string
  count?: number
  icon?: React.ComponentType<{ className?: string }>
  content?: React.ReactNode
  searchValue?: string
}

export type DataTableFilterOptionGroup = {
  label?: string
  options: DataTableFilterOption[]
}

export type DataTableFilterProps = {
  icon?: React.ComponentType<{ className?: string }>
  title?: string
  options: DataTableFilterOption[] | DataTableFilterOptionGroup[]
  selected: string[]
  onChange: (values: string[]) => void
  maxItemsToShow?: number
  isMultiline?: boolean
  isFullWidth?: boolean
}

function isGroupedOptions(
  options: DataTableFilterOption[] | DataTableFilterOptionGroup[]
): options is DataTableFilterOptionGroup[] {
  const firstOption = options[0]

  return Boolean(firstOption && "options" in firstOption)
}

function DataTableFilter({
  icon,
  title,
  options,
  selected,
  onChange,
  maxItemsToShow = 2,
  isMultiline = false,
  isFullWidth = false,
}: DataTableFilterProps) {
  const selectedValues = new Set(selected)
  const triggerLabel =
    selectedValues.size > 0
      ? `${title ?? "Filter"} (${selectedValues.size} selected)`
      : (title ?? "Filter")
  const allOptions = isGroupedOptions(options)
    ? options.flatMap((group) => group.options)
    : options

  const updateSelection = (option: DataTableFilterOption) => {
    const nextValues = new Set(selected)

    if (nextValues.has(option.value)) {
      nextValues.delete(option.value)
    } else {
      nextValues.add(option.value)
    }

    onChange(Array.from(nextValues))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={triggerLabel}
          className={cn(
            "h-auto min-h-9 border-dashed text-sm",
            isMultiline && "items-start border-solid py-2",
            isFullWidth && "flex w-full justify-start"
          )}
        >
          {icon ? (
            React.createElement(icon, { className: "size-4 shrink-0" })
          ) : (
            <PlusCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          )}
          {title && <span className="ml-2">{title}</span>}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div
                className={cn(
                  "hidden lg:flex",
                  isMultiline ? "flex-col flex-wrap items-start gap-1" : "space-x-1"
                )}
              >
                <SelectedBadges
                  options={options}
                  allOptions={allOptions}
                  selectedValues={selectedValues}
                  maxItemsToShow={maxItemsToShow}
                />
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[200px] overflow-hidden p-0", isFullWidth && "w-full")}
        align="start"
      >
        <Command>
          <CommandInput placeholder={title ?? "Search..."} />
          <CommandList className="h-auto max-h-max overflow-hidden">
            <ScrollArea className="h-56">
              <CommandEmpty>No results found.</CommandEmpty>
              {isGroupedOptions(options) ? (
                options.map((group) => (
                  <CommandGroup key={group.label ?? "Ungrouped"} heading={group.label}>
                    {group.options.map((option) => (
                      <DataTableFilterCommandItem
                        key={option.value}
                        option={option}
                        isSelected={selectedValues.has(option.value)}
                        onSelect={() => updateSelection(option)}
                      />
                    ))}
                  </CommandGroup>
                ))
              ) : (
                <CommandGroup>
                  {options.map((option) => (
                    <DataTableFilterCommandItem
                      key={option.value}
                      option={option}
                      isSelected={selectedValues.has(option.value)}
                      onSelect={() => updateSelection(option)}
                    />
                  ))}
                </CommandGroup>
              )}
              {selectedValues.size > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onChange([])}
                      className="justify-center text-center"
                    >
                      Clear selection
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function SelectedBadges({
  options,
  allOptions,
  selectedValues,
  maxItemsToShow,
}: {
  options: DataTableFilterOption[] | DataTableFilterOptionGroup[]
  allOptions: DataTableFilterOption[]
  selectedValues: Set<string>
  maxItemsToShow: number
}) {
  if (selectedValues.size > maxItemsToShow) {
    return (
      <Badge
        variant="secondary"
        className="rounded-sm px-1 font-normal whitespace-nowrap"
      >
        {selectedValues.size} selected
      </Badge>
    )
  }

  if (!isGroupedOptions(options)) {
    return allOptions
      .filter((option) => selectedValues.has(option.value))
      .map((option) => (
        <Badge
          variant="secondary"
          key={option.value}
          className="rounded-sm px-1 font-normal whitespace-nowrap"
        >
          {option.content ?? option.label}
        </Badge>
      ))
  }

  return options.flatMap((group) =>
    group.options
      .filter((option) => selectedValues.has(option.value))
      .map((option) => (
        <Badge
          variant="secondary"
          key={option.value}
          className="rounded-sm px-1 font-normal whitespace-nowrap"
        >
          {group.label ?? "Other"}: {option.content ?? option.label}
        </Badge>
      ))
  )
}

type DataTableFilterCommandItemProps = {
  option: DataTableFilterOption
  isSelected: boolean
  onSelect: () => void
}

function DataTableFilterCommandItem({
  option,
  isSelected,
  onSelect,
}: DataTableFilterCommandItemProps) {
  return (
    <CommandItem onSelect={onSelect} value={option.searchValue ?? option.label}>
      <div
        className={cn(
          "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
      >
        <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
      </div>
      {option.content ? (
        option.content
      ) : (
        <>
          {option.icon && (
            <option.icon className="mr-2 size-4 text-muted-foreground" />
          )}
          <div className="flex w-full items-center justify-between gap-2">
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span className="text-xs text-muted-foreground">{option.count}</span>
            )}
          </div>
        </>
      )}
    </CommandItem>
  )
}

DataTableFilter.displayName = "DataTableFilter"
DataTableFilterCommandItem.displayName = "DataTableFilterCommandItem"

export { DataTableFilter }
