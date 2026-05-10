# Account & Org Settings Design

## Goal

Ship a batteries-included account settings experience so template adopters get profile management, security controls, session management, and account deletion for free. Enhance existing org settings with proper invitation management. All features use existing BetterAuth config and database schema — no migrations, no new plugins.

## Decisions

- **Account settings are user-scoped**, independent of any organization
- **Separate route** at `/account` — not a modal, not inside the org layout
- **Single scrollable page** with stacked card sections (not tabbed sub-routes)
- **Components are layout-agnostic** so they can be mounted in a modal later
- **All 6 account features** use existing BetterAuth APIs — zero schema changes
- **Org enhancements** are limited to surfacing pending invitations on the members page

## Scope

### Account Settings (new)

1. Profile — edit name, avatar
2. Email — change email with re-verification
3. Password — change password (credential users only)
4. Connected accounts — link/unlink OAuth providers
5. Active sessions — view and revoke sessions
6. Danger zone — delete account

### Org Settings (enhance existing)

7. Pending invitations — surface on the members page with cancel capability

### Out of scope

- Two-factor authentication (requires `twoFactor()` plugin + DB migration)
- Notification preferences (requires custom model, no BetterAuth support)
- Server-persisted theme preference (client-side `next-themes` is sufficient)
- Roles & permissions display page
- Org deletion

---

## Architecture

### Routing & Layout

**New route group:** `apps/dashboard/app/(account)/`

```
app/(account)/
  layout.tsx              # Minimal layout — no org sidebar
  account/
    page.tsx              # Renders AccountSettingsPageContent
```

**Layout:** Simple header with a back link ("Back to dashboard" → `/`) and the page title "Account Settings". No sidebar, no org context.

**Entry point:** The "Account" menu item in the `NavUser` dropdown gets an `href` to `/account`. Currently a dead stub — becomes a real `Link`.

**Middleware:** `/account` is not in the `publicPaths` list, so authentication is already enforced. No middleware changes needed.

### Feature Structure

All account settings components live under the existing auth feature boundary:

```
features/auth/account/ui/
  account-settings-page-content.tsx
  profile-settings.tsx
  email-settings.tsx
  password-settings.tsx
  connected-accounts-settings.tsx
  sessions-settings.tsx
  danger-zone-settings.tsx
```

`account-settings-page-content.tsx` composes all six section components vertically. This is the component that would be mounted in a modal if the navigation pattern changes later.

### Data Flow

All account settings sections are **client components** using BetterAuth's React client hooks and methods. No server actions needed — BetterAuth's client SDK talks directly to the `/api/auth/[...all]` catch-all route.

Session data comes from `authClient.useSession()` (already used throughout the app). Section-specific data (sessions list, linked accounts) is fetched via `useQuery` wrapping the relevant `authClient` methods.

---

## Section Designs

### 1. Profile Settings

**Component:** `profile-settings.tsx`

**UI:** Card containing:
- Avatar display (current `user.image`) with click-to-upload. File input converts to base64 data URL for storage in the `image` field. Document how adopters can swap in S3/Cloudflare R2 later.
- Name text field (pre-filled with `user.name`)
- Email displayed as read-only (editing is in the email section)
- "Save changes" button, disabled until a field changes

**API:** `authClient.updateUser({ name, image })`

**UX:** Toast on success ("Profile updated") or error.

### 2. Email Settings

**Component:** `email-settings.tsx`

**UI:** Card containing:
- Current email with verification badge (green check if `emailVerified`, warning icon if not)
- "Change email" button

**Change email flow:** Button opens a NiceModal confirm dialog with:
- New email input field
- Current password field (for verification)
- On submit: calls the API, shows toast "Verification email sent to {newEmail}"
- Current email stays active until the new one is verified

**API:** `authClient.changeEmail({ newEmail, callbackURL })`

**Note:** The verification email sender is a `console.log` stub. The template documents where to wire in a real email provider.

### 3. Password Settings

**Component:** `password-settings.tsx`

**Conditional rendering:**
- If the user has a `credential` provider account → show the password change card
- If OAuth-only (no credential account) → show a muted card: "You signed in with {provider}. No password is set."

**UI (credential users):** Card with a "Change password" button that opens a NiceModal confirm dialog with:
- Current password field
- New password field
- Confirm new password field
- Client-side validation: minimum length, passwords match

**API:** `authClient.changePassword({ currentPassword, newPassword })`

**Detecting credential vs OAuth:** Check `authClient.listAccounts()` for an account with `providerId: "credential"`.

### 4. Connected Accounts Settings

**Component:** `connected-accounts-settings.tsx`

**Conditional rendering:** Entire section hides when no OAuth providers are configured. The available providers are defined in a small config array in the component (e.g., `[{ id: "google", name: "Google" }, { id: "microsoft", name: "Microsoft" }]`) matching what's in `auth.ts`. Adopters update this array when they add or remove providers. The section checks `authClient.listAccounts()` to determine which are already linked. If the config array is empty, the entire section is hidden.

**UI:** Card with a row per provider:
- Provider icon + name (Google, Microsoft)
- Status: "Connected" with Unlink button, or "Not connected" with Connect button

**Unlink guard:** If the user has only one auth method (e.g., only Google linked, no password), the Unlink button is disabled with a tooltip: "You need at least one sign-in method." BetterAuth enforces this server-side too, but the UI prevents the confusing error.

**API:**
- `authClient.listAccounts()` — current linked providers
- `authClient.linkSocial({ provider: "google", callbackURL: "/account" })` — initiates OAuth redirect
- `authClient.unlinkAccount({ providerId: "google" })` — removes the link

### 5. Sessions Settings

**Component:** `sessions-settings.tsx`

**UI:** Card listing all active sessions:
- **Current session** at the top, highlighted with a "This device" badge. Action button says "Sign out" (not "Revoke").
- **Other sessions** listed below with: device/browser (parsed from `userAgent`), IP address, created date. Each has a "Revoke" button.
- **"Revoke all other sessions"** button at the card footer

**User agent parsing:** Lightweight regex-based utility to extract browser + OS (e.g., "Chrome on macOS"). No heavy dependency — a small utility function in `features/auth/account/lib/parse-user-agent.ts`.

**API:**
- `authClient.listSessions()` — all active sessions with token, IP, userAgent, expiresAt
- `authClient.revokeSession({ token })` — kill a specific session
- `authClient.revokeSessions()` — kill all sessions except current

### 6. Danger Zone Settings

**Component:** `danger-zone-settings.tsx`

**UI:** Card with destructive styling (red/destructive border):
- Description: "Permanently delete your account and all associated data."
- "Delete my account" button (destructive variant)

**Delete flow:** Button opens a NiceModal confirm dialog:
- Warning text: "This will permanently delete your account, remove you from all organizations, and cannot be undone."
- Text input: user must type "delete my account" to enable the confirm button
- On confirm: calls the API, signs the user out, redirects to `/sign-in`

**API:** `authClient.deleteUser()`

BetterAuth + Prisma `onDelete: Cascade` handles cascading deletion of sessions, accounts, and memberships.

### 7. Org Settings — Pending Invitations

**Enhancement to existing members page** at `/{org-slug}/settings/members`.

The `PendingInvitations` component already exists at `features/organization/ui/pending-invitations.tsx`. Ensure it is:
- Rendered on the members page below the active members list
- Showing: email, assigned role, status, expiration date, and a "Cancel" button
- Cancel button respects `invitation:cancel` permission (owners and admins only, per `permissions.ts`)
- Styled consistently with the members table above it

No new routes or components needed — this is wiring and polish of existing code.

---

## NavUser Dropdown Changes

The `NavUser` dropdown in `common/ui/nav-user.tsx` needs two changes:

1. **"Account" menu item** gets an `onSelect` handler that navigates to `/account` (or use `asChild` with a `Link`)
2. **"Notifications" menu item** is removed (notification preferences are out of scope; a dead stub is worse than no item)

---

## Testing

Six component-level tests with mocked `authClient`. Fast, no database, no network.

### Critical (guards and destructive actions)

1. **Unlink guard** — `connected-accounts-settings` disables the Unlink button when only one auth method remains (one credential account, or one OAuth account with no password)
2. **Password conditional rendering** — `password-settings` renders the change form for credential users, shows the "no password" message for OAuth-only users
3. **Delete confirmation gate** — `danger-zone-settings` confirm button stays disabled until user types the exact confirmation phrase "delete my account"
4. **Current session protection** — `sessions-settings` shows "Sign out" for the current session (not "Revoke"), and "Revoke all other sessions" button text implies current session is preserved

### Smoke tests

5. **Page composition** — `account-settings-page-content` renders all six section components
6. **Connected accounts hides when no providers** — `connected-accounts-settings` renders nothing when no OAuth providers are available

---

## Dependencies

No new packages. All features use:
- `better-auth/react` (already installed) — `authClient` methods
- `@tanstack/react-query` (already installed) — data fetching
- `@ebay/nice-modal-react` (already installed) — confirm dialogs
- `@workspace/ui` (already installed) — Card, Button, Input, Avatar, Badge, Tooltip, etc.
- `sonner` via `@workspace/ui` (already installed) — toast notifications

---

## What This Spec Does NOT Cover

- **Avatar upload infrastructure** — The template uses base64 data URLs stored in the `image` field. Production adopters should swap in a proper upload service. This is documented, not implemented.
- **Email delivery** — Verification/reset emails use `console.log` stubs. Documented where to wire in Resend, SendGrid, etc.
- **OAuth provider expansion** — Only Google and Microsoft are configured. Adding more providers is a BetterAuth config change, not a template concern.
- **2FA, notification preferences, theme persistence** — Deferred per scope decision.
