"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"

import { cn } from "#lib/utils"
import { Button } from "#components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#components/command"
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover"

export interface ComboBoxProps<T> {
  value?: T | null
  onChange: (value: T | null) => void
  options: T[]
  getDisplayText: (item: T) => React.ReactNode
  getFilterText: (item: T) => string[]
  getItemId: (item: T) => string
  renderItem?: (item: T) => React.ReactNode
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  isLoading?: boolean
  onSearch?: (search: string) => void
  onOpenChange?: (open: boolean) => void
  multiline?: boolean
  showClearButton?: boolean
  popoverClassName?: string
}

export function ComboBox<T>({
  value,
  onChange,
  options,
  getDisplayText,
  getFilterText,
  getItemId,
  renderItem,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  isLoading = false,
  onSearch,
  onOpenChange,
  multiline = false,
  showClearButton = false,
  popoverClassName,
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const highlightedRef = React.useRef<HTMLDivElement>(null)
  const commandListRef = React.useRef<HTMLDivElement>(null)

  const clearSearch = React.useCallback(() => {
    setSearch("")
    onSearch?.("")
  }, [onSearch])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        clearSearch()
        setHighlightedIndex(-1)
      }

      setOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [clearSearch, onOpenChange]
  )

  const filteredOptions = React.useMemo(() => {
    if (!search || onSearch) {
      return options
    }

    const searchLower = search.toLowerCase()

    return options.filter((option) =>
      getFilterText(option).some((text) =>
        text.toLowerCase().includes(searchLower)
      )
    )
  }, [getFilterText, onSearch, options, search])

  const scrollHighlightedIntoView = React.useCallback(() => {
    if (!highlightedRef.current || !commandListRef.current) {
      return
    }

    const container = commandListRef.current
    const element = highlightedRef.current

    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
    const elementTop = element.offsetTop
    const elementBottom = elementTop + element.offsetHeight

    if (elementTop < containerTop) {
      container.scrollTop = elementTop
    } else if (elementBottom > containerBottom) {
      container.scrollTop = elementBottom - container.clientHeight
    }
  }, [])

  const handleSearch = React.useCallback(
    (nextSearch: string) => {
      setSearch(nextSearch)
      onSearch?.(nextSearch)
      setHighlightedIndex(-1)
    },
    [onSearch]
  )

  const selectOption = React.useCallback(
    (option: T) => {
      onChange(option)
      handleOpenChange(false)
    },
    [handleOpenChange, onChange]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!open) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault()
          handleOpenChange(true)
        }

        return
      }

      if (filteredOptions.length === 0) {
        return
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setHighlightedIndex((currentIndex) =>
            currentIndex < filteredOptions.length - 1
              ? currentIndex + 1
              : currentIndex
          )
          break
        case "ArrowUp":
          event.preventDefault()
          setHighlightedIndex((currentIndex) =>
            currentIndex > 0 ? currentIndex - 1 : currentIndex
          )
          break
        case "Enter":
          event.preventDefault()
          if (highlightedIndex >= 0) {
            const selectedOption = filteredOptions[highlightedIndex]

            if (selectedOption) {
              selectOption(selectedOption)
            }
          }
          break
        case "Escape":
          event.preventDefault()
          handleOpenChange(false)
          setHighlightedIndex(-1)
          inputRef.current?.blur()
          break
      }
    },
    [
      filteredOptions,
      handleOpenChange,
      highlightedIndex,
      open,
      selectOption,
    ]
  )

  React.useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredOptions])

  React.useEffect(() => {
    if (highlightedIndex >= 0) {
      scrollHighlightedIntoView()
    }
  }, [highlightedIndex, scrollHighlightedIntoView])

  const handleClear = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onChange(null)
      clearSearch()
    },
    [clearSearch, onChange]
  )

  const shouldShowClearButton =
    showClearButton && value !== null && value !== undefined
  const displayText = value ? getDisplayText(value) : null
  const triggerLabel =
    value && typeof displayText === "string" ? displayText : placeholder

  return (
    <div className="relative w-full min-w-0">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            aria-expanded={open}
            aria-label={triggerLabel}
            className={
              multiline
                ? "h-14 w-full items-start justify-between overflow-hidden"
                : "w-full items-center justify-between overflow-hidden"
            }
            disabled={disabled}
            onKeyDown={handleKeyDown}
          >
            {displayText ? (
              displayText
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {isLoading ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : shouldShowClearButton ? null : (
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            popoverClassName
          )}
        >
          <Command
            shouldFilter={false}
            onKeyDown={handleKeyDown}
            className="max-h-[300px] overflow-hidden"
          >
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearch}
            />
            <CommandList
              ref={commandListRef}
              className="max-h-[220px] overflow-y-auto scroll-smooth"
              onWheel={(event) => {
                event.stopPropagation()
              }}
            >
              <CommandEmpty>{isLoading ? "Loading..." : emptyText}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option, index) => (
                  <CommandItem
                    key={getItemId(option)}
                    value={getItemId(option)}
                    onSelect={() => {
                      selectOption(option)
                    }}
                    className={cn(
                      "justify-start",
                      highlightedIndex === index && "bg-accent"
                    )}
                    ref={highlightedIndex === index ? highlightedRef : undefined}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        value && getItemId(value) === getItemId(option)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      {renderItem ? renderItem(option) : getDisplayText(option)}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {shouldShowClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 z-10 size-6 -translate-y-1/2"
          onClick={handleClear}
          disabled={disabled}
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
