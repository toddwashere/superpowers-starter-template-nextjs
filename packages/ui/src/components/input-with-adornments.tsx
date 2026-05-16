import * as React from "react"

import { cn } from "#lib/utils"

export type InputWithAdornmentsElement = HTMLInputElement
export type InputWithAdornmentsProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    startAdornment?: React.JSX.Element
    endAdornment?: React.JSX.Element
    containerClassName?: string
  }

const InputWithAdornments = React.forwardRef<
  InputWithAdornmentsElement,
  InputWithAdornmentsProps
>(
  (
    { className, startAdornment, endAdornment, containerClassName, ...props },
    ref
  ) => (
    <div
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        containerClassName
      )}
    >
      {startAdornment && (
        <span className="flex shrink-0 pl-3 text-muted-foreground">
          {startAdornment}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          startAdornment && !endAdornment && "pl-1",
          !startAdornment && endAdornment && "pr-1",
          startAdornment && endAdornment && "px-1",
          className
        )}
        {...props}
      />
      {endAdornment && (
        <span className="flex shrink-0 pr-3 text-muted-foreground">
          {endAdornment}
        </span>
      )}
    </div>
  )
)
InputWithAdornments.displayName = "InputWithAdornments"

export { InputWithAdornments }
