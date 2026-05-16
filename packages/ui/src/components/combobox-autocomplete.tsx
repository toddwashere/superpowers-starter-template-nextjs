"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

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

export interface ComboBoxAutoCompleteProps<T> {
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
  externalInput?: React.ReactNode
  hideSearch?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ComboBoxAutoComplete<T>({
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
  externalInput,
  hideSearch = false,
  open,
  onOpenChange,
}: ComboBoxAutoCompleteProps<T>) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const highlightedRef = React.useRef<HTMLDivElement>(null)
  const commandListRef = React.useRef<HTMLDivElement>(null)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setIsOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const clearSearch = React.useCallback(() => {
    setSearch("")
    onSearch?.("")
  }, [onSearch])

  const closePopover = React.useCallback(() => {
    clearSearch()
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [clearSearch, setIsOpen])

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
      closePopover()
    },
    [closePopover, onChange]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault()
          setIsOpen(true)
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
          closePopover()
          if (!externalInput) {
            inputRef.current?.blur()
          }
          break
      }
    },
    [
      externalInput,
      filteredOptions,
      highlightedIndex,
      isOpen,
      closePopover,
      selectOption,
      setIsOpen,
    ]
  )

  React.useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1)
    } else {
      setHighlightedIndex(-1)
    }
  }, [filteredOptions, isOpen])

  React.useEffect(() => {
    if (highlightedIndex >= 0) {
      scrollHighlightedIntoView()
    }
  }, [highlightedIndex, scrollHighlightedIntoView])

  const displayText = value ? getDisplayText(value) : null
  const triggerLabel =
    value && typeof displayText === "string" ? displayText : placeholder

  const trigger =
    externalInput && React.isValidElement<React.HTMLAttributes<HTMLElement>>(externalInput) ? (
      React.cloneElement(externalInput, {
        role: "combobox",
        "aria-expanded": isOpen,
        "aria-disabled": disabled,
        "aria-label": externalInput.props["aria-label"] ?? "Autocomplete options",
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          externalInput.props.onClick?.(event)

          if (event.defaultPrevented || disabled) {
            return
          }

          setIsOpen(true)
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          externalInput.props.onKeyDown?.(event)

          if (event.defaultPrevented || disabled) {
            return
          }

          handleKeyDown(event)
        },
      })
    ) : externalInput ? (
      <span
        role="combobox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-label="Autocomplete options"
        onClick={() => {
          if (!disabled) {
            setIsOpen(true)
          }
        }}
        onKeyDown={(event) => {
          if (!disabled) {
            handleKeyDown(event)
          }
        }}
      >
        {externalInput}
      </span>
    ) : (
    <Button
      variant="outline"
      role="combobox"
      type="button"
      aria-expanded={isOpen}
      aria-label={triggerLabel}
      className="w-full justify-between"
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
      ) : (
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      )}
    </Button>
  )

  return (
    <Popover
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (disabled && nextOpen) {
          return
        }

        if (nextOpen) {
          setIsOpen(true)
        } else {
          closePopover()
        }
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <Command
          shouldFilter={false}
          onKeyDown={handleKeyDown}
          className="max-h-[300px] overflow-hidden"
        >
          {!hideSearch && (
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearch}
            />
          )}
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
                  className={cn(highlightedIndex === index && "bg-accent")}
                  ref={highlightedIndex === index ? highlightedRef : undefined}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value && getItemId(value) === getItemId(option)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {renderItem ? renderItem(option) : getDisplayText(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
