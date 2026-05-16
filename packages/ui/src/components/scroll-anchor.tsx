import * as React from "react"

export type ScrollAnchorProps = React.ComponentPropsWithoutRef<"section"> & {
  offset?: React.CSSProperties["scrollMarginTop"]
}

export function ScrollAnchor({
  children,
  offset = "5rem",
  style,
  ...props
}: ScrollAnchorProps): React.JSX.Element {
  return (
    <section
      style={{ scrollMarginTop: offset, ...style }}
      {...props}
    >
      {children}
    </section>
  )
}
