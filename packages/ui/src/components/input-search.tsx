"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "#components/button"
import {
  InputWithAdornments,
  type InputWithAdornmentsElement,
  type InputWithAdornmentsProps,
} from "#components/input-with-adornments"
import { cn } from "#lib/utils"

export type InputSearchProps = Omit<
  InputWithAdornmentsProps,
  "startAdornment" | "endAdornment" | "onChange" | "value" | "defaultValue"
> & {
  value?: string
  defaultValue?: string
  debounceTime?: number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onValueChange?: (value: string) => void
  onDebouncedChange?: (value: string) => void
  onClear?: () => void
  clearButtonProps?: React.ComponentProps<typeof Button>
  alwaysShowClearButton?: boolean
}

const InputSearch = React.forwardRef<
  InputWithAdornmentsElement,
  InputSearchProps
>(
  (
    {
      onChange,
      onValueChange,
      onDebouncedChange,
      value,
      defaultValue,
      disabled,
      debounceTime = 175,
      onClear,
      clearButtonProps,
      alwaysShowClearButton,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined
    const [innerValue, setInnerValue] = React.useState(defaultValue ?? "")
    const inputValue = isControlled ? value : innerValue
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const {
      className: clearButtonClassName,
      disabled: clearButtonDisabled,
      onClick: onClearButtonClick,
      ...otherClearButtonProps
    } = clearButtonProps ?? {}

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        if (!isControlled) {
          setInnerValue(newValue)
        }
        onChange?.(event)
        onValueChange?.(newValue)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          onDebouncedChange?.(newValue)
        }, debounceTime)
      },
      [debounceTime, isControlled, onChange, onDebouncedChange, onValueChange]
    )

    const handleClear = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClearButtonClick?.(event)

        if (event.defaultPrevented) {
          return
        }

        if (!isControlled) {
          setInnerValue("")
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        onValueChange?.("")
        onDebouncedChange?.("")
        onClear?.()
      },
      [
        isControlled,
        onClear,
        onClearButtonClick,
        onDebouncedChange,
        onValueChange,
      ]
    )

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <InputWithAdornments
        ref={ref}
        disabled={disabled}
        value={inputValue}
        onChange={handleChange}
        startAdornment={<SearchIcon className="size-4 shrink-0" />}
        endAdornment={
          alwaysShowClearButton || inputValue ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              className={cn("-mr-2.5 flex size-8", clearButtonClassName)}
              onClick={handleClear}
              {...otherClearButtonProps}
              disabled={disabled || clearButtonDisabled}
            >
              <XIcon className="size-4 shrink-0" />
            </Button>
          ) : undefined
        }
        {...props}
      />
    )
  }
)
InputSearch.displayName = "InputSearch"

export { InputSearch }
