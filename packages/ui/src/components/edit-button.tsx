import * as React from "react"
import { PencilIcon } from "lucide-react"

import { Button } from "#components/button"
import { cn } from "#lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

export type EditButtonProps = ButtonProps & {
  children?: React.ReactNode
  className?: string
  hideIcon?: boolean
}

export function EditButton({
  children,
  variant = "ghost",
  title = "Edit",
  className,
  hideIcon = false,
  ...props
}: EditButtonProps): React.JSX.Element {
  return (
    <Button
      variant={variant}
      title={title}
      className={cn(children && "px-2", className)}
      {...props}
    >
      {!hideIcon && (
        <PencilIcon
          className={cn(children && "mr-2 p-0", "h-4 w-4 opacity-50")}
        />
      )}
      {children}
    </Button>
  )
}
