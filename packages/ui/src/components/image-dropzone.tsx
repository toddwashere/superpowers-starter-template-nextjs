"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"
import {
  useDropzone,
  type DropEvent,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone"

import { cn } from "#lib/utils"

export interface ImageDropzoneProps
  extends Omit<DropzoneOptions, "onDrop" | "onError" | "disabled"> {
  title?: string
  subtitle?: string
  src?: string
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  className?: string
  disabled?: boolean
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void
  onError?: (error: Error) => void
  children?: React.ReactNode
}

function ImageDropzone({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  multiple,
  onDrop,
  onError,
  disabled = false,
  title = "Upload image",
  subtitle = "Drag and drop or click to select",
  src,
  borderRadius = "none",
  className,
  children,
  ...dropzoneProps
}: ImageDropzoneProps): React.JSX.Element {
  const dropzoneOptions = React.useMemo<DropzoneOptions>(
    () => ({
      accept,
      maxFiles,
      maxSize,
      minSize,
      multiple,
      disabled,
      onDrop: (acceptedFiles, fileRejections, event) => {
        if (fileRejections.length > 0) {
          const firstError = fileRejections[0]?.errors[0]
          onError?.(
            new Error(
              firstError ? `File rejected: ${firstError.message}` : "File rejected"
            )
          )
          return
        }

        onDrop?.(acceptedFiles, fileRejections, event)
      },
      ...dropzoneProps,
    }),
    [
      accept,
      disabled,
      dropzoneProps,
      maxFiles,
      maxSize,
      minSize,
      multiple,
      onDrop,
      onError,
    ]
  )

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions)
  const rootProps = getRootProps({
    "aria-label": title,
    "aria-disabled": disabled,
    role: "button",
    tabIndex: disabled ? -1 : 0,
  })

  const borderRadiusClass = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  }[borderRadius]

  return (
    <div
      {...rootProps}
      className={cn(
        "flex h-fit w-full flex-col items-center justify-center border border-dashed bg-background text-sm shadow-sm transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        disabled && "pointer-events-none opacity-50",
        borderRadiusClass,
        src ? "p-0.5" : "px-0 py-3",
        isDragActive && "border-primary",
        className
      )}
    >
      <input {...getInputProps()} />
      {src ? (
        <img
          src={src}
          alt={title}
          className={cn(
            "size-full max-h-full max-w-full object-cover",
            borderRadiusClass
          )}
        />
      ) : (
        children ?? (
          <div className="flex items-center gap-3 text-left">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UploadIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        )
      )}
    </div>
  )
}

ImageDropzone.displayName = "ImageDropzone"

export { ImageDropzone }
