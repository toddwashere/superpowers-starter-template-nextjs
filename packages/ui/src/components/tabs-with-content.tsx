"use client"

import * as React from "react"

import { Separator } from "#components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/tabs"
import { cn } from "#lib/utils"

export type TabWithContent = {
  tabId?: string
  value?: string
  label: React.ReactNode
  icon?: React.ElementType<{ className?: string }>
  content: React.ReactNode
}

export type TabsWithContentProps = {
  tabs: TabWithContent[]
  className?: string
  listClassName?: string
  triggerClassName?: string
  contentClassName?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function TabsWithContent({
  tabs,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  defaultValue,
  value,
  onValueChange,
}: TabsWithContentProps): React.JSX.Element | null {
  const [firstTab] = tabs
  const getTabValue = (item: TabWithContent) => item.tabId ?? item.value
  const firstValue = firstTab ? getTabValue(firstTab) : undefined

  if (!firstTab || !firstValue) {
    return null
  }

  return (
    <Tabs
      defaultValue={defaultValue ?? firstValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("flex size-full flex-col", className)}
    >
      <TabsList
        variant="line"
        className={cn(
          "h-12 max-h-12 min-h-12 gap-x-2 overflow-x-auto border-none px-4",
          listClassName
        )}
      >
        {tabs.map((item) => {
          const itemValue = getTabValue(item)
          const Icon = item.icon

          if (!itemValue) {
            return null
          }

          return (
            <TabsTrigger
              key={itemValue}
              value={itemValue}
              className={cn("mx-0 border-t-4 border-t-transparent", triggerClassName)}
            >
              <span className="flex flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                {item.label}
              </span>
            </TabsTrigger>
          )
        })}
      </TabsList>
      <Separator />
      {tabs.map((item) => {
        const itemValue = getTabValue(item)

        if (!itemValue) {
          return null
        }

        return (
          <TabsContent
            key={itemValue}
            value={itemValue}
            className={cn("m-0 p-0 md:grow md:overflow-hidden", contentClassName)}
          >
            {item.content}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
