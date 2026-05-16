"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "#components/button"
import {
  InputWithAdornments,
  type InputWithAdornmentsElement,
  type InputWithAdornmentsProps,
} from "#components/input-with-adornments"

export type InputPasswordElement = InputWithAdornmentsElement
export type InputPasswordProps = Omit<
  InputWithAdornmentsProps,
  "endAdornment" | "type"
>

const InputPassword = React.forwardRef<
  InputPasswordElement,
  InputPasswordProps
>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const handleClickShowPassword = (): void => {
    setShowPassword((previousValue) => !previousValue)
  }

  const handleMouseDownPassword = (event: React.SyntheticEvent): void => {
    event.preventDefault()
  }

  return (
    <InputWithAdornments
      ref={ref}
      {...props}
      type={showPassword ? "text" : "password"}
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="-mr-2.5 size-8"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          disabled={props.disabled}
        >
          {showPassword ? (
            <EyeOffIcon className="size-4 shrink-0" />
          ) : (
            <EyeIcon className="size-4 shrink-0" />
          )}
        </Button>
      }
    />
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
