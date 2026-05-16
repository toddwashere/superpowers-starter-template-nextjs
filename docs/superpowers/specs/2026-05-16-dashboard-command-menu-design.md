# Dashboard Command Menu Design

**Date:** 2026-05-16  
**Status:** Approved  
**Scope:** `apps/dashboard`

## Overview

Add global `Cmd+K` / `Ctrl+K` command menu support to the dashboard app. The menu should work anywhere in the dashboard app, including signed-out auth routes, authenticated user routes, organization routes, and future public pages. It should start as a client-executed command palette for navigation, theme switching, sign out, and organization switching, while leaving a clear path for future server-backed commands and entity search.

This is a command system, not only a global search UI. Search is the interaction pattern; commands are the durable abstraction.

## Goals

- Users can open the command menu with `Cmd+K` on macOS and `Ctrl+K` elsewhere from any dashboard route.
- Shells and nav/header areas expose a visible search icon trigger that opens the same menu.
- Signed-out users see auth and public navigation commands.
- Signed-in users see account, theme, sign out, and organization switching commands.
- Organization-specific commands appear only when a current organization is selected.
- The command model supports future async/entity search providers and server-backed commands without requiring a rewrite.
- The design keeps possible MCP overlap in mind without exposing any MCP surface in v1.

## Non-Goals

- Do not implement MCP exposure in v1.
- Do not implement server-executed commands in v1.
- Do not implement dynamic entity search for members, API keys, projects, docs, or other domain objects in v1.
- Do not add visible command triggers to auth pages unless those pages later gain a shared nav/header.

## Existing Context

The project already has shared `cmdk` primitives in `packages/ui/src/components/command.tsx`, including `CommandDialog`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty`, `CommandShortcut`, and `CommandSeparator`.

Dashboard navigation is currently split across route areas:

- Root/authenticated dashboard shell in `apps/dashboard/features/dashboard/ui/dashboard-shell.tsx`
- Organization shell in `apps/dashboard/app/(organization)/[org-slug]/layout.tsx`
- Organization nav config in `apps/dashboard/app/(organization)/[org-slug]/nav-items-org.ts`
- Settings nav config in `apps/dashboard/app/(organization)/[org-slug]/settings/nav-items-org-settings.ts`
- User/sidebar actions in `apps/dashboard/common/ui/nav-user.tsx`
- Organization switching in `apps/dashboard/features/organization/ui/org-switcher.tsx`

The root dashboard provider already wraps the app in React Query, theme support, NiceModal, and Sonner via `apps/dashboard/features/auth/ui/auth-provider.tsx`. That provider tree is the right place to mount a global command menu provider so keyboard support is available throughout the app.

## Architecture

Add a command menu feature under `apps/dashboard/features/command-menu/`. The feature has two layers:

1. **Global UI layer**: owns open state, keyboard listener, command dialog rendering, grouping, empty state, and selection handling.
2. **Command registry layer**: composes command providers that generate commands from current app context.

The palette component should stay mostly presentational. The command list should be produced by provider functions that receive a shared `CommandContext`. This keeps availability rules and command execution separate from `cmdk` rendering.

### Command Context

`CommandContext` should include the app state needed to decide which commands are available and how to run them:

- `pathname`
- route params, including optional `orgSlug`
- session/user state
- loaded organizations
- Next.js router
- theme setter
- auth client operations needed for sign out and org switching
- current search query, reserved for future async providers

The first implementation can build this context entirely in client components using existing hooks: `usePathname()`, `useParams()`, `useRouter()`, `authClient.useSession()`, `authClient.useListOrganizations()`, and `useTheme()`.

### Command Providers

V1 command providers should cover:

- **Public/auth navigation**: sign in, sign up, forgot password, reset password, verify email where appropriate, and future public pages.
- **User commands**: account settings, theme switching, and sign out.
- **Organization navigation**: current organization dashboard, AI assistant, general settings, members, billing, and API keys.
- **Organization switching**: one command per loaded organization.
- **Future extension point**: provider shape supports async/entity-backed commands later.

Each provider should be small and focused. A top-level command builder composes the built-in providers, filters by availability, and verifies command IDs are unique in tests.

## Command Model

Commands should be plain objects with stable metadata and one execution function:

```ts
type DashboardCommand = {
  id: string;
  title: string;
  subtitle?: string;
  group: "Navigation" | "Organizations" | "Account" | "Theme" | "Actions";
  scope: "public" | "auth" | "user" | "organization";
  kind:
    | "navigation"
    | "client-action"
    | "server-action-placeholder"
    | "search-result";
  keywords?: string[];
  shortcut?: string;
  disabled?: boolean;
  run: (context: CommandContext) => void | Promise<void>;
};
```

Availability rules:

- `public` and `auth` commands can appear when signed out.
- `user` commands appear only when a signed-in user exists.
- `organization` commands appear only when a signed-in user exists and a current `orgSlug` is present.
- Organization switching commands appear only when a signed-in user exists and organizations are loaded.
- Server-backed command kinds are type-level placeholders in v1. They should not be executable until server command handling is explicitly designed and implemented.

## Components And Data Flow

Recommended files:

- `apps/dashboard/features/command-menu/command-types.ts`
- `apps/dashboard/features/command-menu/command-providers.ts`
- `apps/dashboard/features/command-menu/global-command-menu.tsx`
- `apps/dashboard/features/command-menu/command-menu-dialog.tsx`
- `apps/dashboard/features/command-menu/command-menu-trigger.tsx`

Data flow:

1. `GlobalCommandMenu` mounts inside the existing root providers.
2. It reads session, organizations, route params, pathname, router, and theme state.
3. It builds a `CommandContext`.
4. It calls command providers to produce available commands.
5. `CommandMenuDialog` renders commands with shared `@workspace/ui/components/command` primitives.
6. `cmdk` filters commands by title, subtitle, keywords, and group.
7. Selecting a command closes the palette and runs `command.run(context)`.
8. Navigation uses `router.push`.
9. Theme commands call `setTheme("light" | "dark" | "system")`.
10. Org switching calls `authClient.organization.setActive()` and then navigates to the selected org.

Visible triggers should use a reusable `CommandMenuTrigger` search icon button. Add it to shells with nav/header UI:

- Dashboard/account shell header
- Organization layout header
- Future public shell header when public pages are introduced

Auth pages can rely on keyboard access until they have a shared header.

## UX And Error Handling

Keyboard behavior:

- `Cmd+K` and `Ctrl+K` toggle the palette.
- Ignore repeated keydown events.
- Do not interfere with ordinary text entry except when the user presses the command shortcut.
- `Escape` and command selection close the dialog through existing dialog behavior.

Execution behavior:

- Navigation and theme commands close immediately and run.
- Sign out closes, calls the existing auth sign-out flow, then navigates to sign in.
- Async org switching closes, calls `setActive`, navigates to the selected organization, and shows a toast if switching fails.
- Loading org-switch commands can be omitted until organizations are loaded.

Visual organization:

- Group commands by purpose: Navigation, Organizations, Account, Theme, Actions.
- Show an empty state when no commands match.
- Use existing `@workspace/ui/components/command` primitives.
- Use the centralized icon registry for dashboard app icons. Do not import directly from `lucide-react` in app code.

## MCP Relationship

The command menu and an MCP server can share command concepts, but they should not be the same runtime surface.

The dashboard command menu is user-facing and UI-aware. It can run commands like navigation, theme changes, opening dialogs, sign out, and organization switching. These commands may depend on browser state and UI context.

An MCP server is machine-facing. It should expose explicit tools with clear inputs, outputs, permissions, and server-side execution. Commands that may later map to MCP tools should have stable IDs, explicit parameter concepts, permission/scope metadata, and server-side equivalents.

V1 should keep MCP as a design influence only:

- Keep command metadata structured.
- Keep UI-only commands local.
- Do not expose browser-only commands through MCP.
- Later, server-backed commands such as inviting a member, creating an API key, listing org members, or rotating a secret can be designed once they have explicit server handlers and permission checks.

## Future Extension Points

Future command providers can add:

- Async search-result commands based on the current query.
- Entity results for members, API keys, projects, docs, or billing records.
- Modal-opening commands for feature workflows.
- Server-backed commands with parameter collection.
- A safe MCP bridge for server-backed commands only.

The provider interface should allow async providers later, even if v1 executes synchronously. If async support is deferred, the types should still make the intended extension clear.

## Critical Tests

- Signed-out command generation returns auth/public navigation commands and excludes user, organization, and org-switch commands.
- Signed-in command generation without a current org returns account/theme/sign-out and org-switch commands, but excludes org-scoped navigation.
- Signed-in command generation with a current org returns org dashboard, AI assistant, settings, members, billing, and API key commands.
- Organization switching commands are generated from loaded organizations and call `setActive` before navigating to the selected org.
- Command IDs are unique across all built-in providers for representative signed-out, signed-in, and current-org contexts.
- Keyboard handling opens the palette on `Cmd+K` / `Ctrl+K`, ignores repeated keydown events, and closes through dialog behavior.
- Command execution closes the palette before running navigation, theme, sign out, or org-switch actions.
- Failed async org switching reports an error through the app's toast/error path without leaving the menu stuck open.

## Rollout

1. Add command types, providers, and provider composition tests.
2. Add the global command menu UI using shared `cmdk` primitives.
3. Mount the menu in the dashboard provider tree.
4. Add visible search icon triggers to existing shell/header areas.
5. Add focused component tests for shortcut handling and representative command execution.
6. Leave server-backed commands, entity search, and MCP exposure for follow-up specs once the client command model has settled.
