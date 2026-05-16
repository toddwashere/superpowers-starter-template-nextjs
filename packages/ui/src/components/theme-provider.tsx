"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeProviderProps = React.PropsWithChildren<{
  attribute?: "class" | `data-${string}`
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
  forcedTheme?: Theme
  storageKey?: string
}>

type ThemeProviderState = {
  forcedTheme?: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  systemTheme?: ResolvedTheme
  theme: Theme
  themes: Theme[]
}

const ThemeProviderContext = React.createContext<ThemeProviderState | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getStoredTheme(storageKey: string, fallback: Theme): Theme {
  if (typeof window === "undefined") {
    return fallback
  }

  const storedTheme = window.localStorage.getItem(storageKey)

  if (
    storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
  ) {
    return storedTheme
  }

  return fallback
}

function applyTheme({
  attribute,
  disableTransitionOnChange,
  resolvedTheme,
}: {
  attribute: ThemeProviderProps["attribute"]
  disableTransitionOnChange: boolean
  resolvedTheme: ResolvedTheme
}) {
  const root = document.documentElement
  let styleElement: HTMLStyleElement | undefined

  if (disableTransitionOnChange) {
    styleElement = document.createElement("style")
    styleElement.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important}"
      )
    )
    document.head.appendChild(styleElement)
  }

  if (attribute === "class") {
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  } else if (attribute) {
    root.setAttribute(attribute, resolvedTheme)
  }

  root.style.colorScheme = resolvedTheme

  if (styleElement) {
    window.getComputedStyle(document.body)
    window.setTimeout(() => styleElement?.remove(), 1)
  }
}

export function ThemeProvider({
  attribute = "class",
  defaultTheme = "light",
  disableTransitionOnChange = true,
  enableSystem = true,
  forcedTheme,
  storageKey = "theme",
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>("light")
  const activeTheme = forcedTheme ?? theme
  const resolvedTheme: ResolvedTheme =
    activeTheme === "dark"
      ? "dark"
      : activeTheme === "system" && enableSystem
        ? systemTheme
        : "light"

  React.useEffect(() => {
    setThemeState(getStoredTheme(storageKey, defaultTheme))
    setSystemTheme(getSystemTheme())
  }, [defaultTheme, storageKey])

  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => setSystemTheme(getSystemTheme())

    media.addEventListener("change", handleChange)

    return () => media.removeEventListener("change", handleChange)
  }, [])

  React.useEffect(() => {
    applyTheme({
      attribute,
      disableTransitionOnChange,
      resolvedTheme,
    })
  }, [attribute, disableTransitionOnChange, resolvedTheme])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return
      }

      setThemeState(getStoredTheme(storageKey, defaultTheme))
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [defaultTheme, storageKey])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      window.localStorage.setItem(storageKey, nextTheme)
    },
    [storageKey]
  )

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      forcedTheme,
      resolvedTheme,
      setTheme,
      systemTheme,
      theme,
      themes: enableSystem ? ["light", "dark", "system"] : ["light", "dark"],
    }),
    [enableSystem, forcedTheme, resolvedTheme, setTheme, systemTheme, theme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
