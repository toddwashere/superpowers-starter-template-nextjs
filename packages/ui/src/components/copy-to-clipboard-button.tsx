"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#components/input-group";
import { cn } from "#lib/utils";

function legacyCopyToClipboard(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, value.length);

  let hasCopied = false;
  try {
    hasCopied = document.execCommand("copy");
  } catch {
    hasCopied = false;
  }

  document.body.removeChild(textArea);
  return hasCopied;
}

function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = async (value: string) => {
    if (typeof window === "undefined") {
      return false;
    }

    if (!value) {
      return false;
    }

    let hasCopied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        hasCopied = true;
      } catch {
        hasCopied = legacyCopyToClipboard(value);
      }
    } else {
      hasCopied = legacyCopyToClipboard(value);
    }

    if (!hasCopied) {
      return false;
    }

    setIsCopied(true);
    onCopy?.();

    if (timeout !== 0) {
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    }

    return true;
  };

  return { isCopied, copyToClipboard };
}

type InputGroupButtonProps = React.ComponentProps<typeof InputGroupButton>;

export type CopyToClipboardButtonProps = Omit<
  InputGroupButtonProps,
  "onClick" | "children"
> & {
  text: string;
  copyLabel?: string;
  copiedLabel?: string;
  resetDelayMs?: number;
  display?: "icon" | "label";
  onCopied?: () => void;
  onCopyError?: (error?: unknown) => void;
};

export function CopyToClipboardButton({
  text,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  resetDelayMs = 2000,
  display = "icon",
  onCopied,
  onCopyError,
  size = "icon-xs",
  variant = "ghost",
  ...props
}: CopyToClipboardButtonProps): React.JSX.Element {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: resetDelayMs,
    onCopy: onCopied,
  });

  const label = isCopied ? copiedLabel : copyLabel;

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    if (!ok) {
      onCopyError?.();
    }
  }

  return (
    <InputGroupButton
      type="button"
      size={size}
      variant={variant}
      aria-label={label}
      title={label}
      onClick={() => void handleCopy()}
      {...props}
    >
      {display === "label" ? (
        label
      ) : isCopied ? (
        <CheckIcon />
      ) : (
        <CopyIcon />
      )}
    </InputGroupButton>
  );
}

type InputGroupInputProps = React.ComponentProps<typeof InputGroupInput>;

export type CopyToClipboardFieldProps = Omit<InputGroupInputProps, "value" | "readOnly"> & {
  text: string;
  groupClassName?: string;
  resetDelayMs?: number;
  onCopied?: () => void;
  onCopyError?: (error?: unknown) => void;
};

export function CopyToClipboardField({
  text,
  groupClassName,
  className,
  resetDelayMs,
  onCopied,
  onCopyError,
  ...inputProps
}: CopyToClipboardFieldProps): React.JSX.Element {
  return (
    <InputGroup className={groupClassName}>
      <InputGroupInput
        readOnly
        value={text}
        className={cn("font-mono text-sm", className)}
        {...inputProps}
      />
      <InputGroupAddon align="inline-end">
        <CopyToClipboardButton
          text={text}
          resetDelayMs={resetDelayMs}
          onCopied={onCopied}
          onCopyError={onCopyError}
        />
      </InputGroupAddon>
    </InputGroup>
  );
}
