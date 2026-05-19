import * as React from "react"

import {
  PageActions,
  PageHeaderSection,
  PageSecondaryBar,
  PageTitle,
} from "#components/page"
import { cn } from "#lib/utils"

export type PageHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumb?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  actions?: React.ReactNode
  toolbar?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  leading,
  trailing,
  actions,
  toolbar,
  className,
}: PageHeaderProps) {
  return (
    <PageHeaderSection className={className}>
      <div className="border-b">
        <div className="flex min-h-14 flex-row items-center gap-2 px-4 py-3 sm:px-6">
          {leading ? (
            <div className="flex shrink-0 items-center gap-2">{leading}</div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {breadcrumb ? (
              <div className="text-muted-foreground">{breadcrumb}</div>
            ) : null}
            <PageTitle className={cn(description && "leading-tight")}>
              {title}
            </PageTitle>
            {description ? (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            ) : null}
          </div>
          {(trailing ?? actions) ? (
            <div className="flex shrink-0 items-center gap-2">
              {trailing}
              {actions ? <PageActions>{actions}</PageActions> : null}
            </div>
          ) : null}
        </div>
        {toolbar ? <PageSecondaryBar>{toolbar}</PageSecondaryBar> : null}
      </div>
    </PageHeaderSection>
  )
}
