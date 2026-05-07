# 01 - Add Authentication

## Goal

Build authentication and authorization around Better Auth so the starter template ships with working SaaS auth out of the box while staying easy for solo and small teams to customize.

The default should favor stable, understandable building blocks:

- Better Auth as the auth engine.
- Better Auth organization plugin as the source of truth for tenant organizations, members, invitations, and organization-scoped roles.
- Better Auth admin plugin for system-level roles and platform administration.
- Better Auth UI for shadcn/ui as the starting point for auth screens, copied/adapted into owned app feature components.
- Prisma/PostgreSQL as the durable auth, session, organization, and admin-role storage layer.

## Better Auth Configuration Choices

### Database Adapter

Use the Better Auth Prisma adapter with PostgreSQL.

```ts
database: prismaAdapter(prisma, {
  provider: "postgresql",
})
```

Better Auth can generate the required Prisma schema, but Prisma should remain the migration source of truth for the template.

### Core Auth Schema

Better Auth core auth models:

- `user` - user identity and profile fields.
- `session` - session token, expiry, user agent, IP address, and active organization fields.
- `account` - OAuth accounts and credential/password records.
- `verification` - email verification, password reset, and temporary verification records.

### Email And Password

Enable email/password by default.

Recommended defaults:

- Email/password signup enabled.
- Email verification required before login.
- Password reset enabled.
- Sessions revoked on password reset.
- Default Better Auth password hashing is acceptable for v1; consider Argon2id only if the template wants an explicit stronger-password-hashing option.

### Social Providers

Enable the common SaaS providers:

- Google OAuth.
- Microsoft Entra ID OAuth.

Optional recipes:

- GitHub OAuth for developer-focused products.
- Magic links or email OTP for passwordless flows.
- Passkeys for advanced passwordless authentication.

### Organization Plugin

Use Better Auth's organization plugin as the source of truth for organization membership.

The plugin provides:

- Organization creation.
- Organization listing.
- Active organization support.
- Member invitations.
- Invitation accept/reject/cancel flows.
- Member listing.
- Member removal.
- Member role updates.
- Organization-scoped permission checks.

Core organization plugin schema:

- `organization`
- `member`
- `invitation`
- `session.activeOrganizationId`

Default organization roles:

- `owner`
- `admin`
- `member`

Do not enable dynamic organization roles by default. Do not enable teams by default. Both can be documented as optional extensions.

### Organization Permissions

Use Better Auth access control with static, code-defined permissions.

Define starter-template permissions in `packages/auth/src/permissions.ts` using Better Auth's `resource.action` model.

Example resource groups:

- `organization.update`
- `organization.delete`
- `member.create`
- `member.update`
- `member.delete`
- `invitation.create`
- `invitation.cancel`
- `billing.manage`
- `apiKey.create`
- `apiKey.revoke`

Keep the initial permission model simple and predictable. Avoid custom runtime role creation until the product explicitly needs enterprise-style configurable RBAC.

### Admin Plugin And System Roles

Use Better Auth's admin plugin for platform-level roles and system administration.

Default system roles:

- `user`
- `admin`

Admin plugin schema additions:

- `user.role`
- `user.banned`
- `user.banReason`
- `user.banExpires`
- `session.impersonatedBy`

System admin capabilities:

- List users.
- Create users.
- Set user role.
- Ban and unban users.
- Revoke sessions.
- Impersonate users.
- Stop impersonating users.

Do not introduce custom system roles in the default template unless needed. If the template later needs richer platform roles, extend Better Auth admin access control with roles like `super_admin`, `support_admin`, or `billing_admin`.

### Two-Factor Auth

Enable 2FA as an optional user/account setting.

Recommended behavior:

- TOTP support.
- Backup codes.
- Trusted devices.
- Strongly recommend or require 2FA for system admins.

Better Auth 2FA schema additions:

- `user.twoFactorEnabled`
- `twoFactor`

### Passkeys

Do not enable passkeys by default in v1.

Keep passkeys as an optional recipe because they are powerful but add UX, support, browser testing, and WebAuthn complexity.

### Teams

Do not enable teams by default.

Teams add:

- `team`
- `teamMember`
- `invitation.teamId`
- `session.activeTeamId`

Most small SaaS teams need organizations, members, invitations, and roles before they need nested teams.

### Better Auth UI

Use Better Auth UI for shadcn/ui as the initial implementation source for auth screens.

Treat it like shadcn/ui:

- Use it to get working screens quickly.
- Copy/adapt the components into the app feature folders.
- Own the final UX in the starter template.
- Avoid depending on auth UI as a black box for central product flows.

Use Better Auth UI/shadcn for:

- Sign in.
- Sign up.
- Forgot password.
- Reset password.
- Email verification prompts.
- User/account button.
- Basic account settings.

Build or customize template-owned flows for:

- Onboarding.
- Organization creation.
- Organization switcher.
- Invite acceptance.
- Member management.
- Role management.
- 2FA setup UX.
- Admin/system dashboard.

## Package And App Boundaries

### `packages/auth`

Owns the Better Auth engine and shared auth contract.

Contents:

- `auth.ts` - Better Auth server instance.
- `auth-client.ts` - Better Auth client instance.
- `permissions.ts` - organization permission statements and static roles.
- `admin-permissions.ts` - system/admin permission statements if customizing beyond `user` and `admin`.
- `plugins.ts` - Better Auth plugin composition: organization, admin, 2FA, and optional future plugins.
- `guards.ts` - shared helpers such as `requireUser`, `requireSystemAdmin`, and `requireOrgPermission`.
- `session.ts` - helpers for reading the current user, session, active organization, and active member.
- `types.ts` - exported auth, session, organization, and member types.
- `constants.ts` - role names, route constants, and session constants.

Do not put dashboard-specific UI in this package.

### `packages/database`

Owns Prisma schema and database access.

Contents:

- Better Auth generated Prisma models.
- Organization plugin models and fields.
- Admin plugin fields.
- 2FA models and fields if enabled.
- Prisma client export.
- Seed scripts for an initial system admin user, sample organization, and demo members.
- Migration scripts.
- Business domain models.

Auth business logic should live in `packages/auth`; this package should stay focused on schema, migrations, and database access.

### `packages/ui`

Owns generic reusable UI primitives.

Contents:

- shadcn/ui primitives.
- Layout primitives.
- Form primitives.
- Data table primitives.
- Avatar and user-display primitives when they are app-agnostic.
- Toast and error display components.

Do not put sign-in pages, organization invite flows, or admin dashboards here unless they are truly reusable across apps.

### `packages/email`

Owns transactional email templates and sending helpers.

Contents:

- Email verification template.
- Password reset template.
- Organization invitation template.
- 2FA or OTP email template if used.
- Welcome email.
- Shared `sendEmail` helper.

Better Auth config should call into this package for verification, reset, and invitation emails.

### `packages/billing`

Owns Stripe and plan logic.

Auth and organization touchpoints:

- `canCreateOrganizationForPlan`
- `getOrganizationSeatLimit`
- `syncStripeCustomerForOrganization`
- Subscription state lookup used by organization limits.

Better Auth organization hooks can call package-level billing helpers when organization creation or member limits depend on the current plan.

### `packages/monitoring`

Owns Sentry/PostHog wrappers and observability helpers.

Contents:

- Auth event logging helpers.
- Error reporting wrappers.
- User and organization identification helpers.
- Audit/event tracking helpers when shared across apps.

### `packages/common`

Owns generic utilities.

Contents:

- Slug generation.
- Date helpers.
- Invariant/assertion helpers.
- Shared Zod helpers.
- ID-safe formatting utilities.

## App Responsibilities

### `apps/dashboard`

Owns the SaaS product auth experience.

Required route handler:

```txt
apps/dashboard/app/api/auth/[...all]/route.ts
```

Feature folders:

```txt
apps/dashboard/features/auth/
```

Contains:

- Sign in page content.
- Sign up page content.
- Forgot password.
- Reset password.
- Email verification prompt.
- Social login buttons.
- Better Auth UI/shadcn adapted components.

```txt
apps/dashboard/features/onboarding/
```

Contains:

- First-run onboarding.
- Create first organization.
- Accept invite after signup.
- Choose active organization.
- Post-signup routing.

```txt
apps/dashboard/features/organizations/
```

Contains:

- Organization settings.
- Organization switcher.
- Member list.
- Invite member dialog.
- Pending invitations.
- Update member role.
- Remove member.
- Organization profile and branding.

```txt
apps/dashboard/features/account/
```

Contains:

- Profile settings.
- Change password.
- Session/device list.
- 2FA setup.
- Connected OAuth accounts.
- Passkey management if later enabled.

```txt
apps/dashboard/features/admin/
```

Contains:

- System admin dashboard.
- User list/search.
- Ban/unban.
- Session revocation.
- Impersonation controls.
- Organization lookup if needed.

### `apps/www`

Owns marketing-facing entry points.

Contents:

- Marketing landing pages.
- Pricing page.
- Calls to action linking to dashboard signup.
- Optional waitlist or start-trial forms.

Do not duplicate the core auth flows here unless the template intentionally supports marketing-hosted signup pages.

### `apps/public-api`

Owns public API authentication and organization scoping.

Contents:

- API key authentication.
- Organization scoping from API keys.
- Public route permission checks.

No Better Auth UI belongs here.

### `apps/workers`

Owns background auth and organization jobs.

Possible jobs:

- Welcome emails.
- Invite reminder emails.
- Expired invitation cleanup if not handled elsewhere.
- Audit log processing.
- Auth/security notification emails.

## Recommended Default

The default starter implementation should be:

- Better Auth with Prisma/PostgreSQL.
- Email/password with verification and password reset.
- Google and Microsoft OAuth.
- Better Auth organization plugin enabled.
- Static organization roles: `owner`, `admin`, `member`.
- Better Auth admin plugin enabled.
- Static system roles: `user`, `admin`.
- Optional 2FA with TOTP and backup codes.
- Better Auth UI/shadcn used as the starting point for owned dashboard auth screens.
- No dynamic organization roles, teams, or passkeys in the default v1 template.

This gives small SaaS teams a complete auth foundation without forcing enterprise RBAC complexity on day one.
