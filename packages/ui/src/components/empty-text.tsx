import * as React from "react"

import { cn } from "#lib/utils"

export type EmptyTextProps = React.HTMLAttributes<HTMLParagraphElement>

export function EmptyText({
  className,
  children,
  ...props
}: EmptyTextProps): React.JSX.Element {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}
