"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "#lib/utils"

type RadioCardsElement = React.ElementRef<typeof RadioGroupPrimitive.Root>

type RadioCardsProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>

const RadioCards = React.forwardRef<RadioCardsElement, RadioCardsProps>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="radio-cards"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
)

RadioCards.displayName = "RadioCards"

type RadioCardItemElement = React.ElementRef<
  typeof RadioGroupPrimitive.Item
>

type RadioCardItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & {
  checkClassName?: React.HTMLAttributes<HTMLSpanElement>["className"]
}

const RadioCardItem = React.forwardRef<
  RadioCardItemElement,
  RadioCardItemProps
>(({ className, checkClassName, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-card-item"
    className={cn(
      "group relative overflow-hidden rounded-md border border-input p-4 text-left shadow-xs transition-[background-color,border-color,box-shadow] outline-none",
      "hover:border-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5",
      className
    )}
    {...props}
  >
    <span className="block pr-6">{children}</span>
    <span
      aria-hidden="true"
      className={cn(
        "absolute right-2 bottom-2 flex size-4 items-center justify-center rounded-full border border-input bg-background group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary",
        checkClassName
      )}
    >
      <RadioGroupPrimitive.Indicator className="size-1.5 rounded-full bg-primary-foreground" />
    </span>
  </RadioGroupPrimitive.Item>
))

RadioCardItem.displayName = "RadioCardItem"

export { RadioCardItem, RadioCards }
export type {
  RadioCardItemElement,
  RadioCardItemProps,
  RadioCardsElement,
  RadioCardsProps,
}
