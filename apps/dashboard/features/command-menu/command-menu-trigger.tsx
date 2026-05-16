"use client";

import { Button } from "@workspace/ui/components/button";
import { IconForSearch } from "@workspace/ui/components/icon-for";
import { useCommandMenu } from "./global-command-menu";

interface CommandMenuTriggerProps {
  className?: string;
}

export function CommandMenuTrigger({ className }: CommandMenuTriggerProps) {
  const { open } = useCommandMenu();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={open}
      aria-label="Open command menu (⌘K)"
      className={className}
    >
      <IconForSearch />
    </Button>
  );
}
