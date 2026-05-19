import * as React from "react"

import { ScrollArea } from "#components/scroll-area"
import { Separator } from "#components/separator"
import { SidebarTrigger } from "#components/sidebar"
import { cn } from "#lib/utils"

export type PageElement = HTMLDivElement
export type PageProps = React.HTMLAttributes<HTMLDivElement>

const Page = React.forwardRef<PageElement, PageProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-full flex-col", className)} {...props}>
      {children}
    </div>
  )
)
Page.displayName = "Page"

export type PageHeaderSectionElement = HTMLDivElement
export type PageHeaderSectionProps = React.HTMLAttributes<HTMLDivElement>

const PageHeaderSection = React.forwardRef<
  PageHeaderSectionElement,
  PageHeaderSectionProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky top-0 z-20 bg-background", className)}
    {...props}
  >
    {children}
  </div>
))
PageHeaderSection.displayName = "PageHeaderSection"

export type PagePrimaryBarElement = HTMLDivElement
export type PagePrimaryBarProps = React.HTMLAttributes<HTMLDivElement> & {
  showSidebarTrigger?: boolean
}

const PagePrimaryBar = React.forwardRef<
  PagePrimaryBarElement,
  PagePrimaryBarProps
>(({ className, children, showSidebarTrigger = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-14 flex-row items-center gap-1 border-b px-4 sm:px-6",
      className
    )}
    {...props}
  >
    {showSidebarTrigger && (
      <>
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </>
    )}
    <div className="flex w-full flex-row items-center justify-between">
      {children}
    </div>
  </div>
))
PagePrimaryBar.displayName = "PagePrimaryBar"

export type PageTitleElement = HTMLHeadingElement
export type PageTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const PageTitle = React.forwardRef<PageTitleElement, PageTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h1 ref={ref} className={cn("text-sm font-semibold", className)} {...props}>
      {children}
    </h1>
  )
)
PageTitle.displayName = "PageTitle"

export type PageActionsElement = HTMLDivElement
export type PageActionsProps = React.HTMLAttributes<HTMLDivElement>

const PageActions = React.forwardRef<PageActionsElement, PageActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
)
PageActions.displayName = "PageActions"

export type PageSecondaryBarElement = HTMLDivElement
export type PageSecondaryBarProps = React.HTMLAttributes<HTMLDivElement>

const PageSecondaryBar = React.forwardRef<
  PageSecondaryBarElement,
  PageSecondaryBarProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-12 items-center justify-between gap-2 border-b px-4 sm:px-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
PageSecondaryBar.displayName = "PageSecondaryBar"

export type PageBodyElement = HTMLDivElement
export type PageBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  disableScroll?: boolean
}

const PageBody = React.forwardRef<PageBodyElement, PageBodyProps>(
  ({ children, className, disableScroll = false, ...props }, ref) => {
    if (disableScroll) {
      return (
        <div
          className={cn("flex h-full flex-col", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <div className={cn("grow overflow-hidden", className)} ref={ref} {...props}>
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    )
  }
)
PageBody.displayName = "PageBody"

export {
  Page,
  PageActions,
  PageBody,
  PageHeaderSection,
  PagePrimaryBar,
  PageSecondaryBar,
  PageTitle,
}
