export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type CommandContext = {
  pathname: string;
  orgSlug: string | undefined;
  user: { id: string; name: string; email: string } | null;
  organizations: Organization[];
  router: { push: (path: string) => void };
  setTheme: (theme: "light" | "dark" | "system") => void;
  signOut: () => Promise<void>;
  setActiveOrg: (orgId: string) => Promise<void>;
  searchQuery: string;
};

export type CommandGroup = "Navigation" | "Organizations" | "Account" | "Theme" | "Actions";
export type CommandScope = "public" | "auth" | "user" | "organization";
export type CommandKind =
  | "navigation"
  | "client-action"
  | "server-action-placeholder"
  | "search-result";

export type DashboardCommand = {
  id: string;
  title: string;
  subtitle?: string;
  group: CommandGroup;
  scope: CommandScope;
  kind: CommandKind;
  keywords?: string[];
  shortcut?: string;
  disabled?: boolean;
  run: (context: CommandContext) => void | Promise<void>;
};

// Supports async providers for future entity search; v1 providers return synchronously.
export type CommandProvider = (
  context: CommandContext
) => DashboardCommand[] | Promise<DashboardCommand[]>;
