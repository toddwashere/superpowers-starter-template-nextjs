"use client"

import * as React from "react"

import {
  InputWithAdornments,
  type InputWithAdornmentsElement,
  type InputWithAdornmentsProps,
} from "#components/input-with-adornments"
import { cn } from "#lib/utils"

export type InputCurrencyProps = Omit<
  InputWithAdornmentsProps,
  "startAdornment" | "endAdornment" | "type"
> & {
  currency?: string
}

const InputCurrency = React.forwardRef<
  InputWithAdornmentsElement,
  InputCurrencyProps
>(({ className, currency = "$", ...props }, ref) => {
  return (
    <InputWithAdornments
      ref={ref}
      {...props}
      type="number"
      startAdornment={
        <span className="text-sm text-muted-foreground">{currency}</span>
      }
      className={cn("pl-5", className)}
    />
  )
})
InputCurrency.displayName = "InputCurrency"

export { InputCurrency }
