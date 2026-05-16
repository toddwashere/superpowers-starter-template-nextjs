"use client";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@workspace/ui/components/command";
import type { DashboardCommand } from "./command-types";

const GROUPS = [
  "Navigation",
  "Organizations",
  "Account",
  "Theme",
  "Actions",
] as const;

interface CommandMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: DashboardCommand[];
  onSelect: (command: DashboardCommand) => void;
}

export function CommandMenuDialog({
  open,
  onOpenChange,
  commands,
  onSelect,
}: CommandMenuDialogProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        {GROUPS.map((group) => {
          const groupCommands = commands.filter((c) => c.group === group);
          if (groupCommands.length === 0) return null;
          return (
            <CommandGroup key={group} heading={group}>
              {groupCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  value={[
                    command.title,
                    command.subtitle,
                    ...(command.keywords ?? []),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onSelect={() => onSelect(command)}
                  disabled={command.disabled}
                >
                  {command.title}
                  {command.subtitle && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {command.subtitle}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
