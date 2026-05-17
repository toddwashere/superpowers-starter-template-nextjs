import {
  getPathForSignIn,
  getPathForSignUp,
  getPathForForgotPassword,
  getPathForAccountSettings,
  getPathForOrg,
  getPathForOrgSettings,
  getPathForOrgMembers,
} from "@workspace/routes";
import type { CommandContext, DashboardCommand } from "./command-types";

export function authNavProvider(_context: CommandContext): DashboardCommand[] {
  return [
    {
      id: "nav:sign-in",
      title: "Sign In",
      group: "Navigation",
      scope: "auth",
      kind: "navigation",
      keywords: ["login", "sign in", "enter"],
      run: (ctx) => ctx.router.push(getPathForSignIn()),
    },
    {
      id: "nav:sign-up",
      title: "Sign Up",
      group: "Navigation",
      scope: "auth",
      kind: "navigation",
      keywords: ["register", "create account"],
      run: (ctx) => ctx.router.push(getPathForSignUp()),
    },
    {
      id: "nav:forgot-password",
      title: "Forgot Password",
      group: "Navigation",
      scope: "auth",
      kind: "navigation",
      keywords: ["reset password", "recover"],
      run: (ctx) => ctx.router.push(getPathForForgotPassword()),
    },
  ];
}

export function userProvider(_context: CommandContext): DashboardCommand[] {
  return [
    {
      id: "user:account-settings",
      title: "Account Settings",
      group: "Account",
      scope: "user",
      kind: "navigation",
      keywords: ["profile", "account", "settings"],
      run: (ctx) => ctx.router.push(getPathForAccountSettings()),
    },
    {
      id: "theme:light",
      title: "Light Theme",
      group: "Theme",
      scope: "user",
      kind: "client-action",
      keywords: ["theme", "light", "appearance"],
      run: (ctx) => ctx.setTheme("light"),
    },
    {
      id: "theme:dark",
      title: "Dark Theme",
      group: "Theme",
      scope: "user",
      kind: "client-action",
      keywords: ["theme", "dark", "appearance"],
      run: (ctx) => ctx.setTheme("dark"),
    },
    {
      id: "theme:system",
      title: "System Theme",
      group: "Theme",
      scope: "user",
      kind: "client-action",
      keywords: ["theme", "system", "auto", "appearance"],
      run: (ctx) => ctx.setTheme("system"),
    },
    {
      id: "user:sign-out",
      title: "Sign Out",
      group: "Actions",
      scope: "user",
      kind: "client-action",
      keywords: ["logout", "sign out"],
      run: async (ctx) => {
        await ctx.signOut();
        ctx.router.push(getPathForSignIn());
      },
    },
  ];
}

export function orgNavProvider(context: CommandContext): DashboardCommand[] {
  if (!context.orgSlug) return [];
  const { orgSlug } = context;
  return [
    {
      id: "org:dashboard",
      title: "Organization Dashboard",
      group: "Navigation",
      scope: "organization",
      kind: "navigation",
      keywords: ["dashboard", "home", "org"],
      run: (ctx) => ctx.router.push(getPathForOrg(orgSlug)),
    },
    {
      id: "org:ai",
      title: "AI Assistant",
      group: "Navigation",
      scope: "organization",
      kind: "navigation",
      keywords: ["ai", "assistant", "chat"],
      run: (ctx) => ctx.router.push(`${getPathForOrg(orgSlug)}/ai`),
    },
    {
      id: "contacts:add-contact",
      title: "Add New Contact",
      group: "Contacts",
      scope: "organization",
      kind: "client-action",
      keywords: ["contacts", "new contact", "create contact", "add person", "add company"],
      run: (ctx) => ctx.showAddContactModal(),
    },
    {
      id: "org:settings",
      title: "Organization Settings",
      group: "Navigation",
      scope: "organization",
      kind: "navigation",
      keywords: ["settings", "general", "org"],
      run: (ctx) => ctx.router.push(getPathForOrgSettings(orgSlug)),
    },
    {
      id: "org:members",
      title: "Members",
      group: "Navigation",
      scope: "organization",
      kind: "navigation",
      keywords: ["members", "people", "team"],
      run: (ctx) => ctx.router.push(getPathForOrgMembers(orgSlug)),
    },
    {
      id: "org:billing",
      title: "Billing",
      group: "Navigation",
      scope: "organization",
      kind: "navigation",
      keywords: ["billing", "payment", "subscription"],
      run: (ctx) => ctx.router.push(`${getPathForOrg(orgSlug)}/settings/billing`),
    },
    {
      id: "org:api-keys",
      title: "API Keys",
      group: "Navigation",
      scope: "organization",
      kind: "navigation",
      keywords: ["api", "keys", "tokens", "access"],
      run: (ctx) => ctx.router.push(`${getPathForOrg(orgSlug)}/settings/api-keys`),
    },
  ];
}

export function orgSwitchProvider(context: CommandContext): DashboardCommand[] {
  if (!context.user || context.organizations.length === 0) return [];
  return context.organizations.map((org) => ({
    id: `org-switch:${org.id}`,
    title: org.name,
    subtitle: org.slug,
    group: "Organizations" as const,
    scope: "user" as const,
    kind: "client-action" as const,
    keywords: ["switch", "organization", org.name, org.slug],
    run: async (ctx) => {
      await ctx.setActiveOrg(org.id);
      ctx.router.push(getPathForOrg(org.slug));
    },
  }));
}

function filterByScope(
  commands: DashboardCommand[],
  context: CommandContext
): DashboardCommand[] {
  const isSignedIn = !!context.user;
  const hasOrg = isSignedIn && !!context.orgSlug;
  return commands.filter((cmd) => {
    if (cmd.scope === "public") return true;
    if (cmd.scope === "auth") return !isSignedIn;
    if (cmd.scope === "user") return isSignedIn;
    if (cmd.scope === "organization") return hasOrg;
    return false;
  });
}

export function buildCommands(context: CommandContext): DashboardCommand[] {
  const all = [
    ...authNavProvider(context),
    ...userProvider(context),
    ...orgNavProvider(context),
    ...orgSwitchProvider(context),
  ];
  return filterByScope(all, context);
}
