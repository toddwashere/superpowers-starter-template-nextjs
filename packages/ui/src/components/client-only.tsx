"use client"

import * as React from "react"

export type ClientOnlyProps = React.PropsWithChildren<{
  fallback?: React.ReactNode
}>

export function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps): React.JSX.Element {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  return <>{isMounted ? children : fallback}</>
}
