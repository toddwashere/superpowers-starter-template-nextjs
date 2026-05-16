"use client"

import * as React from "react"

import { cn } from "#lib/utils"

type FadeInImageProps = {
  src: string
  alt: string
  size: number
  duration?: number
}

const FadeInImage = ({
  src,
  alt,
  size,
  duration = 20,
}: FadeInImageProps): React.JSX.Element => {
  const [isLoaded, setIsLoaded] = React.useState(false)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "size-full object-contain transition-opacity",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${duration}s` }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}

export type EmptyStateElement = HTMLDivElement
export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  description: string
  icon?: React.ReactNode
  imageSrc?: string
  imageAlt?: string
  imageSize?: number
  imageFadeDuration?: number
  children?: React.ReactNode
}

const EmptyState = React.forwardRef<EmptyStateElement, EmptyStateProps>(
  (
    {
      title,
      description,
      icon,
      imageSrc,
      imageAlt = "No items found",
      imageSize = 200,
      imageFadeDuration = 20,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="region"
        aria-label={title}
        className={cn(
          "flex h-full flex-col items-center justify-center gap-6 rounded-lg px-8 py-12 sm:px-10 md:px-12",
          className
        )}
        {...props}
      >
        {imageSrc ? (
          <FadeInImage
            src={imageSrc}
            alt={imageAlt}
            size={imageSize}
            duration={imageFadeDuration}
          />
        ) : (
          icon
        )}
        <div className="mx-auto flex max-w-sm flex-col gap-2 text-balance text-center">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
