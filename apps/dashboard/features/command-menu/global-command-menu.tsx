"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "@workspace/ui/components/theme-provider";
import { toast } from "@workspace/ui/components/sonner";
import { authClient } from "@workspace/auth/client";
import { buildCommands } from "./command-providers";
import { CommandMenuDialog } from "./command-menu-dialog";
import type { CommandContext, DashboardCommand } from "./command-types";

type CommandMenuContextValue = { open: () => void };

const CommandMenuContext = createContext<CommandMenuContextValue>({
  open: () => {},
});

export function useCommandMenu() {
  return useContext(CommandMenuContext);
}

export function GlobalCommandMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ "org-slug"?: string }>();
  const { setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const { data: orgsData } = authClient.useListOrganizations();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const context: CommandContext = {
    pathname,
    orgSlug: params["org-slug"],
    user: session?.user ?? null,
    organizations: orgsData ?? [],
    router,
    setTheme,
    signOut: async () => {
      await authClient.signOut();
    },
    setActiveOrg: async (orgId: string) => {
      await authClient.organization.setActive({
        organizationId: orgId,
      });
    },
    searchQuery: "",
  };

  const commands = buildCommands(context);

  const handleSelect = async (command: DashboardCommand) => {
    setIsOpen(false);
    try {
      await command.run(context);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <CommandMenuContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <CommandMenuDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        commands={commands}
        onSelect={handleSelect}
      />
    </CommandMenuContext.Provider>
  );
}
