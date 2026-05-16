"use client"

import * as React from "react"
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#components/tooltip"

const THEME_OPTIONS = [
  {
    value: "system",
    icon: LaptopIcon,
    label: "System",
  },
  {
    value: "light",
    icon: SunIcon,
    label: "Light",
  },
  {
    value: "dark",
    icon: MoonIcon,
    label: "Dark",
  },
]

export function ThemeSwitcher(): React.JSX.Element {
  const { setTheme, theme } = useTheme()
  const id = React.useId()
  const themeValue = theme || "system"

  const handleChangeTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value)
  }

  return (
    <div className="flex w-fit rounded-full border bg-background p-0.5">
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <span key={value} className="h-full">
          <input
            className="peer sr-only"
            type="radio"
            id={`${id}-theme-switch-${value}`}
            name={`${id}-theme-switch`}
            value={value}
            checked={themeValue === value}
            onChange={handleChangeTheme}
          />
          <label
            htmlFor={`${id}-theme-switch-${value}`}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground"
            aria-label={`${label} theme`}
          >
            <Tooltip delayDuration={600}>
              <TooltipTrigger asChild>
                <Icon className="size-4 shrink-0" />
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </label>
        </span>
      ))}
    </div>
  )
}
