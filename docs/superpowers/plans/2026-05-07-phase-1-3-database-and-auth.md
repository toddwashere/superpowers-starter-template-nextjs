# Phase 1.3: Database, Authentication, and Organization Management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Prisma 7 with PostgreSQL, implement Better Auth with email/password + OAuth + org management, build auth UI screens, and add route protection — giving the starter template working multi-tenant auth.

**Architecture:** Two new packages (`@workspace/database`, `@workspace/auth`) provide the data and auth layers. The dashboard app gets auth UI via Better Auth UI for shadcn (installed then owned), custom org management screens, and three-layer route protection (middleware → layout → client). Docker Compose provides PostgreSQL for local dev.

**Tech Stack:** Prisma 7, Better Auth, Better Auth UI, React Query, Next.js 16, PostgreSQL 16, Vitest

**Design spec:** `docs/superpowers/specs/2026-05-07-phase-1-3-database-and-auth-design.md`

**Key reference files:**
- `plans/01-add-auth.md` — Better Auth configuration choices
- `.ai/skills/add-data-model-to-database/SKILL.md` — Prisma schema conventions
- `.ai/skills/add-new-page/SKILL.md` — Page creation conventions
- `.ai/skills/add-new-app/SKILL.md` — Package naming conventions

---

## File Structure

### New packages

```
packages/database/
├── package.json                    # @workspace/database
├── tsconfig.json
├── prisma.config.ts                # Prisma 7 defineConfig
├── prisma/
│   ├── schema.prisma               # Generator + datasource
│   ├── auth.prisma                  # Better Auth models
│   ├── migrations/                  # Auto-generated
│   └── seed.ts                      # Admin user + sample org
└── src/
    ├── client.ts                    # PrismaClient singleton
    └── index.ts                     # Public barrel

packages/auth/
├── package.json                    # @workspace/auth
├── tsconfig.json
└── src/
    ├── auth.ts                     # Better Auth server instance
    ├── auth-client.ts              # Better Auth client instance
    ├── permissions.ts              # Organization permission map
    ├── guards.ts                   # requireUser, requireSystemAdmin, requireOrgPermission
    ├── session.ts                  # getCurrentUser, getCurrentOrg helpers
    ├── types.ts                    # Exported types
    ├── constants.ts                # Role names, route paths
    ├── index.ts                    # Public barrel
    └── __tests__/
        ├── permissions.test.ts
        └── guards.test.ts
```

### New dashboard files

```
apps/dashboard/
├── middleware.ts                    # Route protection
├── features/
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── auth-card.tsx                     # Better Auth UI <Auth> component
│   │   │   ├── auth-provider.tsx                 # Providers wrapper
│   │   │   ├── user-button.tsx                   # Sidebar user menu
│   │   │   ├── sign-in-page-content.tsx
│   │   │   ├── sign-up-page-content.tsx
│   │   │   ├── forgot-password-page-content.tsx
│   │   │   ├── reset-password-page-content.tsx
│   │   │   └── verify-email-page-content.tsx
│   │   └── data/
│   │       ├── auth-client.ts                    # Dashboard auth client
│   │       └── query-client.ts                   # React Query factory
│   └── organization/
│       ├── ui/
│       │   ├── create-org-page-content.tsx
│       │   ├── org-switcher.tsx
│       │   ├── org-provider.tsx
│       │   ├── members-page-content.tsx
│       │   ├── invite-member-dialog.tsx
│       │   ├── pending-invitations.tsx
│       │   ├── update-member-role-dialog.tsx
│       │   ├── remove-member-dialog.tsx
│       │   └── accept-invitation-page-content.tsx
│       └── data/
│           ├── org-actions.ts
│           ├── org-types.ts
│           └── __tests__/
│               └── org-types.test.ts
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── accept-invitation/[id]/page.tsx
│   └── api/auth/[...all]/route.ts
```

### Modified files

```
apps/dashboard/app/layout.tsx                           # Add Providers wrapper
apps/dashboard/app/(organization)/[org-slug]/layout.tsx  # Add OrgProvider
apps/dashboard/app/(dashboard)/layout.tsx                # Add org redirect logic
apps/dashboard/common/ui/nav-user.tsx                    # Real session data
apps/dashboard/common/ui/org-switcher.tsx                # Real org data
apps/dashboard/package.json                              # New deps
docker-compose.yml (root)                                # New
.env.example (root)                                      # New
.env (root)                                              # New (gitignored)
packages/routes/src/index.ts                             # Auth route helpers
turbo.json                                               # DATABASE_URL passthrough
```

---

## Task 1: Infrastructure — Docker Compose + Environment

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env`
- Modify: `.gitignore`

- [ ] **Step 1: Create `docker-compose.yml` at monorepo root**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: starter_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
```

- [ ] **Step 2: Create `.env.example`**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/starter_dev

# Better Auth
BETTER_AUTH_SECRET=change-me-to-a-random-secret
BETTER_AUTH_URL=http://localhost:4000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:4000

# OAuth (optional — app works without these)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```

- [ ] **Step 3: Create `.env` from `.env.example`**

Copy `.env.example` to `.env`. Generate a real random secret for `BETTER_AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 4: Ensure `.env` is in `.gitignore`**

Check that `.gitignore` includes `.env`. Add it if missing (do NOT add `.env.example`).

- [ ] **Step 5: Start PostgreSQL**

```bash
docker compose up -d
```

Verify: `docker compose ps` shows postgres healthy.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml .env.example .gitignore
git commit -m "feat: add Docker Compose with PostgreSQL and env config"
```

---

## Task 2: `packages/database` — Prisma 7 Setup

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/prisma.config.ts`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/prisma/auth.prisma`
- Create: `packages/database/src/client.ts`
- Create: `packages/database/src/index.ts`
- Modify: `turbo.json` (add DATABASE_URL to env)

- [ ] **Step 1: Create `packages/database/package.json`**

```json
{
  "name": "@workspace/database",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "prisma": "^7"
  },
  "devDependencies": {
    "@workspace/tooling": "workspace:*",
    "dotenv": "^16",
    "tsx": "^4",
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 2: Create `packages/database/tsconfig.json`**

```json
{
  "extends": "@workspace/tooling/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src/**/*.ts", "prisma/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/database/prisma.config.ts`**

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

- [ ] **Step 4: Create `packages/database/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- [ ] **Step 5: Create `packages/database/prisma/auth.prisma`**

Use `npx auth generate` from the auth package (Task 3) to generate the initial schema, OR write it manually based on Better Auth's documented schema. The schema must include all models from the design spec: `User`, `Session`, `Account`, `Verification`, `Organization`, `Member`, `Invitation` with all Better Auth fields including admin plugin fields (`role`, `banned`, `banReason`, `banExpires`, `impersonatedBy`).

Since we can't run `auth generate` yet (Better Auth isn't installed), write the schema manually referencing the Better Auth docs. The key models are documented in the design spec Section 2 under `prisma/auth.prisma`.

- [ ] **Step 6: Create `packages/database/src/client.ts`**

```typescript
import { PrismaClient } from "./generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
```

- [ ] **Step 7: Create `packages/database/src/index.ts`**

```typescript
export { prisma, PrismaClient } from "./client";
```

- [ ] **Step 8: Update `turbo.json`**

Add `DATABASE_URL` to the global env passthrough so Prisma can access it during builds:

Add to `turbo.json` → `globalEnv` array: `"DATABASE_URL"`

- [ ] **Step 9: Install dependencies and generate Prisma client**

```bash
pnpm install
cd packages/database
pnpm db:generate
```

Verify: `src/generated/prisma/` directory is created with the Prisma client.

- [ ] **Step 10: Run initial migration**

```bash
cd packages/database
pnpm db:migrate --name init-auth
```

Verify: `prisma/migrations/` has the initial migration. Database has the tables.

- [ ] **Step 11: Commit**

```bash
git add packages/database/ turbo.json
# Do NOT commit src/generated/prisma/ — add to .gitignore if not already
git commit -m "feat(database): set up Prisma 7 with Better Auth schema"
```

---

## Task 3: `packages/auth` — Better Auth Engine

**Files:**
- Create: `packages/auth/package.json`
- Create: `packages/auth/tsconfig.json`
- Create: `packages/auth/src/constants.ts`
- Create: `packages/auth/src/permissions.ts`
- Create: `packages/auth/src/auth.ts`
- Create: `packages/auth/src/auth-client.ts`
- Create: `packages/auth/src/guards.ts`
- Create: `packages/auth/src/session.ts`
- Create: `packages/auth/src/types.ts`
- Create: `packages/auth/src/index.ts`

- [ ] **Step 1: Create `packages/auth/package.json`**

```json
{
  "name": "@workspace/auth",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/auth-client.ts",
    "./permissions": "./src/permissions.ts",
    "./guards": "./src/guards.ts",
    "./session": "./src/session.ts",
    "./constants": "./src/constants.ts",
    "./types": "./src/types.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@workspace/database": "workspace:*",
    "better-auth": "^1"
  },
  "devDependencies": {
    "@workspace/tooling": "workspace:*",
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 2: Create `packages/auth/tsconfig.json`**

```json
{
  "extends": "@workspace/tooling/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/auth/src/constants.ts`**

```typescript
export const SYSTEM_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const ORG_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  SIGN_OUT: "/sign-out",
} as const;

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.SIGN_IN,
  AUTH_ROUTES.SIGN_UP,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
  "/accept-invitation",
  "/api/auth",
] as const;
```

- [ ] **Step 4: Create `packages/auth/src/permissions.ts`**

```typescript
import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  billing: ["manage"],
  apiKey: ["create", "revoke"],
} as const;

export const ac = createAccessControl(statement);

export const permissions = {
  owner: ac.newRole({
    organization: ["update", "delete"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    billing: ["manage"],
    apiKey: ["create", "revoke"],
  }),
  admin: ac.newRole({
    organization: ["update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    billing: ["manage"],
    apiKey: ["create", "revoke"],
  }),
  member: ac.newRole({
    organization: [],
    member: [],
    invitation: [],
    billing: [],
    apiKey: [],
  }),
};
```

- [ ] **Step 5: Create `packages/auth/src/auth.ts`**

The Better Auth server instance. See design spec Section 3 for the full config. Key points:
- Prisma adapter with PostgreSQL
- Email/password with console-logged verification + reset emails
- Conditional Google + Microsoft OAuth (only if env vars set)
- Organization plugin with access control and console-logged invitation emails
- Admin plugin

- [ ] **Step 6: Create `packages/auth/src/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/client";
import { organizationClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000",
  plugins: [organizationClient(), adminClient()],
});

export type AuthClient = typeof authClient;
```

- [ ] **Step 7: Create `packages/auth/src/guards.ts`**

Server-side auth guard helpers. These use `auth.api.getSession()` with request headers:
- `requireUser()` — returns user+session or throws
- `requireSystemAdmin()` — returns admin user or throws
- `requireOrgPermission(permission)` — checks org membership permission or throws

- [ ] **Step 8: Create `packages/auth/src/session.ts`**

Session helpers:
- `getCurrentUser()` — returns user+session or null (no throw)
- `getCurrentOrg()` — returns active org+membership or null

- [ ] **Step 9: Create `packages/auth/src/types.ts` and `packages/auth/src/index.ts`**

Types re-export Better Auth types. Index barrel exports the public API.

- [ ] **Step 10: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 11: Verify types compile**

```bash
cd packages/auth
pnpm type-check
```

- [ ] **Step 12: Commit**

```bash
git add packages/auth/
git commit -m "feat(auth): add Better Auth engine with org and admin plugins"
```

---

## Task 4: Auth API Route + Dashboard Dependencies

**Files:**
- Create: `apps/dashboard/app/api/auth/[...all]/route.ts`
- Modify: `apps/dashboard/package.json`
- Modify: `packages/routes/src/index.ts`

- [ ] **Step 1: Update `apps/dashboard/package.json`**

Add dependencies:
- `@workspace/auth: "workspace:*"`
- `@workspace/database: "workspace:*"`
- `@tanstack/react-query`
- `better-auth` (needed for `better-auth/next-js` and `better-auth/client`)
- `next-themes`

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 3: Create the Better Auth API route handler**

`apps/dashboard/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@workspace/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Add auth route helpers to `packages/routes/src/index.ts`**

```typescript
export function signInPath() {
  return "/sign-in";
}

export function signUpPath() {
  return "/sign-up";
}

export function forgotPasswordPath() {
  return "/forgot-password";
}

export function resetPasswordPath() {
  return "/reset-password";
}

export function verifyEmailPath() {
  return "/verify-email";
}

export function createOrgPath() {
  return "/create-org";
}

export function orgPath(orgSlug: string) {
  return `/${orgSlug}`;
}

export function orgSettingsPath(orgSlug: string) {
  return `/${orgSlug}/settings`;
}

export function orgMembersPath(orgSlug: string) {
  return `/${orgSlug}/settings/members`;
}

export function acceptInvitationPath(invitationId: string) {
  return `/accept-invitation/${invitationId}`;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/package.json apps/dashboard/app/api/ packages/routes/
git commit -m "feat(dashboard): add Better Auth API route and auth route helpers"
```

---

## Task 5: Auth Feature — Provider, Client, UI Components

**Files:**
- Create: `apps/dashboard/features/auth/data/query-client.ts`
- Create: `apps/dashboard/features/auth/data/auth-client.ts`
- Create: `apps/dashboard/features/auth/ui/auth-provider.tsx`
- Create: `apps/dashboard/features/auth/ui/sign-in-page-content.tsx`
- Create: `apps/dashboard/features/auth/ui/sign-up-page-content.tsx`
- Create: `apps/dashboard/features/auth/ui/forgot-password-page-content.tsx`
- Create: `apps/dashboard/features/auth/ui/reset-password-page-content.tsx`
- Create: `apps/dashboard/features/auth/ui/verify-email-page-content.tsx`
- Create: `apps/dashboard/features/auth/ui/user-button.tsx`

- [ ] **Step 1: Install Better Auth UI via shadcn CLI**

```bash
cd apps/dashboard
npx shadcn@latest add https://better-auth-ui.com/r/auth.json
npx shadcn@latest add https://better-auth-ui.com/r/settings.json
npx shadcn@latest add https://better-auth-ui.com/r/user-button.json
```

This installs components into the locations defined by `components.json`. After installation, move auth-specific components to `features/auth/ui/`.

- [ ] **Step 2: Create `features/auth/data/query-client.ts`**

React Query singleton factory for SSR:

```typescript
import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
```

- [ ] **Step 3: Create `features/auth/data/auth-client.ts`**

```typescript
export { authClient } from "@workspace/auth/client";
```

- [ ] **Step 4: Create `features/auth/ui/auth-provider.tsx`**

A `"use client"` component that wraps `QueryClientProvider` + Better Auth UI's `AuthProvider` with Next.js navigation, social providers, and Sonner toaster. See the design spec Section 4 for the provider pattern.

- [ ] **Step 5: Create page content components**

Create each auth page content component in `features/auth/ui/`:
- `sign-in-page-content.tsx` — renders the auth card in sign-in mode
- `sign-up-page-content.tsx` — renders the auth card in sign-up mode
- `forgot-password-page-content.tsx` — forgot password form
- `reset-password-page-content.tsx` — reset password form
- `verify-email-page-content.tsx` — email verification pending/success state

Each is a simple wrapper that renders the Better Auth UI `<Auth>` component with the appropriate `path` prop.

- [ ] **Step 6: Create `features/auth/ui/user-button.tsx`**

A user avatar dropdown for the sidebar footer. Uses `useSession()` from Better Auth UI to show user name/avatar, with dropdown options for settings and sign out.

- [ ] **Step 7: Commit**

```bash
git add apps/dashboard/features/auth/
git commit -m "feat(dashboard): add auth feature with Better Auth UI components"
```

---

## Task 6: Auth Route Pages + Layout

**Files:**
- Create: `apps/dashboard/app/(auth)/layout.tsx`
- Create: `apps/dashboard/app/(auth)/sign-in/page.tsx`
- Create: `apps/dashboard/app/(auth)/sign-up/page.tsx`
- Create: `apps/dashboard/app/(auth)/forgot-password/page.tsx`
- Create: `apps/dashboard/app/(auth)/reset-password/page.tsx`
- Create: `apps/dashboard/app/(auth)/verify-email/page.tsx`
- Modify: `apps/dashboard/app/layout.tsx`

- [ ] **Step 1: Create auth layout**

`apps/dashboard/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create auth route pages**

Each page is a sparse Next.js page that imports its `*-page-content` component from `features/auth/ui/`. Follow the `add-new-page` skill pattern: export metadata, render the PageContent component, no business logic in page.tsx.

Create: `sign-in/page.tsx`, `sign-up/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `verify-email/page.tsx`

- [ ] **Step 3: Update root layout**

Modify `apps/dashboard/app/layout.tsx` to wrap children in the `Providers` component from `features/auth/ui/auth-provider`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/features/auth/ui/auth-provider";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/app/
git commit -m "feat(dashboard): add auth route pages and provider wrapper"
```

---

## Task 7: Middleware — Route Protection

**Files:**
- Create: `apps/dashboard/middleware.ts`

- [ ] **Step 1: Create middleware**

`apps/dashboard/middleware.ts`:

Check for a Better Auth session cookie. Redirect unauthenticated users on protected routes to `/sign-in`. Redirect authenticated users on auth routes to `/`. Skip `/api/auth/*`, `/_next/*`, `/static/*`, `/favicon.ico`.

Use Better Auth's `getSession` helper or check the session cookie directly. The middleware should be lightweight — no database calls.

- [ ] **Step 2: Verify middleware works**

Start the dev server. Navigate to `/` without signing in — should redirect to `/sign-in`. Navigate to `/sign-in` — should show the sign-in page.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/middleware.ts
git commit -m "feat(dashboard): add auth middleware for route protection"
```

---

## Task 8: Organization Feature — Types, Actions, Provider

**Files:**
- Create: `apps/dashboard/features/organization/data/org-types.ts`
- Create: `apps/dashboard/features/organization/data/org-actions.ts`
- Create: `apps/dashboard/features/organization/ui/org-provider.tsx`

- [ ] **Step 1: Create `features/organization/data/org-types.ts`**

Zod schemas for org forms:
- `createOrgSchema` — name (required, 2-50 chars), slug (required, lowercase alphanumeric + hyphens, 2-50 chars)
- `inviteMemberSchema` — email (valid email), role (enum: "admin" | "member")
- `updateMemberRoleSchema` — memberId (string), role (enum: "owner" | "admin" | "member")

Export TypeScript types inferred from the schemas.

- [ ] **Step 2: Create `features/organization/data/org-actions.ts`**

Server actions (`"use server"`) for org operations:
- `createOrganizationAction(data)` — validate with Zod, call Better Auth API
- `inviteMemberAction(data)` — validate, check permissions, call Better Auth API
- `updateMemberRoleAction(data)` — validate, check permissions, call Better Auth API
- `removeMemberAction(memberId)` — check permissions, call Better Auth API
- `cancelInvitationAction(invitationId)` — check permissions, call Better Auth API

Each action uses `requireUser()` or `requireOrgPermission()` from `@workspace/auth/guards`.

- [ ] **Step 3: Create `features/organization/ui/org-provider.tsx`**

A `"use client"` React context provider:
- Fetches active org and membership via `authClient.organization.getFullOrganization()`
- Provides `{ organization, membership, members, isLoading }` via `useCurrentOrg()` hook
- Used by org-scoped layouts

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/features/organization/
git commit -m "feat(dashboard): add organization feature data layer and provider"
```

---

## Task 9: Organization UI Components

**Files:**
- Create: `apps/dashboard/features/organization/ui/create-org-page-content.tsx`
- Create: `apps/dashboard/features/organization/ui/org-switcher.tsx`
- Create: `apps/dashboard/features/organization/ui/members-page-content.tsx`
- Create: `apps/dashboard/features/organization/ui/invite-member-dialog.tsx`
- Create: `apps/dashboard/features/organization/ui/pending-invitations.tsx`
- Create: `apps/dashboard/features/organization/ui/update-member-role-dialog.tsx`
- Create: `apps/dashboard/features/organization/ui/remove-member-dialog.tsx`
- Create: `apps/dashboard/features/organization/ui/accept-invitation-page-content.tsx`

- [ ] **Step 1: Create `create-org-page-content.tsx`**

A form with:
- Organization name input (required)
- Slug input (auto-generated from name, editable, validated with `checkSlug`)
- Submit → `authClient.organization.create()` → redirect to new org

Uses shadcn Card, Form, Input, Button, Label.

- [ ] **Step 2: Create `org-switcher.tsx`**

Replaces the placeholder in `common/ui/org-switcher.tsx`. A dropdown menu showing:
- All orgs the user belongs to (from `authClient.organization.list()`)
- Current org highlighted
- Switch action: `authClient.organization.setActive()` + navigate
- "Create Organization" link at bottom

Uses shadcn DropdownMenu, Avatar.

- [ ] **Step 3: Create `members-page-content.tsx`**

DataTable with columns: Avatar, Name, Email, Role, Joined Date, Actions.
Actions column: "Change Role" button, "Remove" button (permission-gated).
Header: "Invite Member" button.
Below table: pending invitations section.

Uses shadcn Table, Badge, Button, Avatar.

- [ ] **Step 4: Create dialog components**

- `invite-member-dialog.tsx` — Dialog with email + role select + submit
- `update-member-role-dialog.tsx` — Dialog with role select + submit
- `remove-member-dialog.tsx` — Confirmation dialog
- `pending-invitations.tsx` — List with cancel action

Uses shadcn Dialog, Select, Button, AlertDialog.

- [ ] **Step 5: Create `accept-invitation-page-content.tsx`**

Page shown when a user clicks an invitation link:
- Fetch invitation details by ID
- Show org name, inviter, role offered
- Accept/Decline buttons
- If not signed in, redirect to sign-up first, then back here

- [ ] **Step 6: Commit**

```bash
git add apps/dashboard/features/organization/
git commit -m "feat(dashboard): add organization UI components"
```

---

## Task 10: Organization Routes + Layout Integration

**Files:**
- Create: `apps/dashboard/app/(dashboard)/create-org/page.tsx`
- Create: `apps/dashboard/app/(organization)/[org-slug]/settings/members/page.tsx`
- Create: `apps/dashboard/app/(organization)/[org-slug]/settings/general/page.tsx`
- Create: `apps/dashboard/app/(auth)/accept-invitation/[id]/page.tsx`
- Modify: `apps/dashboard/app/(organization)/[org-slug]/layout.tsx`
- Modify: `apps/dashboard/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create org route pages**

Each page follows the sparse route pattern from `add-new-page` skill:
- `create-org/page.tsx` → `CreateOrgPageContent`
- `settings/members/page.tsx` → `MembersPageContent`
- `settings/general/page.tsx` → org settings form (name, slug, logo editing)
- `accept-invitation/[id]/page.tsx` → `AcceptInvitationPageContent`

- [ ] **Step 2: Update org layout**

Modify `apps/dashboard/app/(organization)/[org-slug]/layout.tsx`:
- Wrap children in `OrgProvider` passing `orgSlug` from params
- Add server-side session check with `ensureSession`
- Verify user is a member of the org, redirect if not
- Keep existing `SidebarProvider` + `AppSidebar` structure

- [ ] **Step 3: Update dashboard layout**

Modify `apps/dashboard/app/(dashboard)/layout.tsx`:
- After login, check if user has any orgs
- If no orgs → show dashboard root (with option to create org)
- If has orgs → could redirect to last active org

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/app/
git commit -m "feat(dashboard): add organization routes and layout integration"
```

---

## Task 11: Sidebar Integration — NavUser + OrgSwitcher

**Files:**
- Modify: `apps/dashboard/common/ui/nav-user.tsx`
- Modify: `apps/dashboard/common/ui/org-switcher.tsx`
- Modify: `apps/dashboard/common/ui/app-sidebar.tsx`

- [ ] **Step 1: Update `nav-user.tsx`**

Replace placeholder data with real session data from `useSession()`:
- User avatar from `session.user.image` (fallback to initials)
- User name from `session.user.name`
- Dropdown: "Account Settings" link, "Sign Out" action via `authClient.signOut()`

- [ ] **Step 2: Update `org-switcher.tsx`**

Replace placeholder with import from `features/organization/ui/org-switcher.tsx`, or update inline to use real org data.

- [ ] **Step 3: Update `app-sidebar.tsx`**

Ensure the sidebar passes through necessary props and uses the updated NavUser and OrgSwitcher.

- [ ] **Step 4: Verify sidebar works**

Start dev server. Sign in. Verify:
- NavUser shows real user data and sign-out works
- OrgSwitcher lists orgs and switching works
- Navigation links work correctly

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/common/ui/
git commit -m "feat(dashboard): integrate real auth data into sidebar components"
```

---

## Task 12: Database Seed Script

**Files:**
- Create: `packages/database/prisma/seed.ts`

- [ ] **Step 1: Create seed script**

`packages/database/prisma/seed.ts`:

Uses Better Auth's server API to create:
1. System admin user: `admin@example.com` / `password123`, role "admin"
2. Regular user: `user@example.com` / `password123`, role "user"
3. Organization: "Acme Corp", slug "acme"
4. Add admin as owner of Acme Corp
5. Add regular user as member of Acme Corp

Uses `auth.api.createUser()` for proper password hashing and `auth.api.createOrganization()` for org creation.

- [ ] **Step 2: Run seed**

```bash
cd packages/database
pnpm db:seed
```

Verify: users and org exist in the database.

- [ ] **Step 3: Commit**

```bash
git add packages/database/prisma/seed.ts
git commit -m "feat(database): add seed script with admin user and sample org"
```

---

## Task 13: Unit Tests — Permissions

**Files:**
- Create: `packages/auth/src/__tests__/permissions.test.ts`
- Modify: `packages/auth/package.json` (add vitest)

- [ ] **Step 1: Add vitest to packages/auth**

Add `vitest` to devDependencies in `packages/auth/package.json`. Add `"test": "vitest run"` script.

- [ ] **Step 2: Write permission tests**

`packages/auth/src/__tests__/permissions.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { permissions } from "../permissions";

describe("permissions", () => {
  describe("owner role", () => {
    it("has all organization permissions", () => {
      // Test that owner can update and delete organizations
    });
    it("has all member permissions", () => {
      // Test that owner can create, update, delete members
    });
    it("has all invitation permissions", () => {
      // Test that owner can create and cancel invitations
    });
    it("has billing.manage permission", () => {});
    it("has all apiKey permissions", () => {});
  });

  describe("admin role", () => {
    it("can update but NOT delete organizations", () => {
      // Admin should not have organization.delete
    });
    it("has all member permissions", () => {});
    it("has all invitation permissions", () => {});
    it("has billing.manage permission", () => {});
  });

  describe("member role", () => {
    it("has no permissions", () => {
      // Member should have empty arrays for all resources
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd packages/auth
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/auth/
git commit -m "test(auth): add permission role tests"
```

---

## Task 14: Unit Tests — Guards

**Files:**
- Create: `packages/auth/src/__tests__/guards.test.ts`

- [ ] **Step 1: Write guard tests**

Mock Better Auth's session API. Test:
- `requireUser()` returns user+session when authenticated
- `requireUser()` throws with status 401 when no session
- `requireSystemAdmin()` returns user when role is "admin"
- `requireSystemAdmin()` throws with status 403 when role is "user"
- `requireOrgPermission("member.create")` succeeds for owner/admin
- `requireOrgPermission("member.create")` throws 403 for member role
- `requireOrgPermission("organization.delete")` throws 403 for admin (only owner)

- [ ] **Step 2: Run tests**

```bash
cd packages/auth
pnpm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/auth/src/__tests__/guards.test.ts
git commit -m "test(auth): add guard helper tests"
```

---

## Task 15: Unit Tests — Org Types

**Files:**
- Create: `apps/dashboard/features/organization/data/__tests__/org-types.test.ts`

- [ ] **Step 1: Add vitest to dashboard if not present**

Ensure `vitest` is in dashboard devDependencies and a test script exists.

- [ ] **Step 2: Write org type validation tests**

Test the Zod schemas:
- Valid org name + slug passes `createOrgSchema`
- Empty org name is rejected
- Slug with spaces/uppercase/special chars is rejected
- Slug too short (<2) or too long (>50) is rejected
- Valid email + role passes `inviteMemberSchema`
- Invalid email format is rejected
- Invalid role value is rejected

- [ ] **Step 3: Run tests**

```bash
cd apps/dashboard
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/features/organization/data/__tests__/
git commit -m "test(dashboard): add organization schema validation tests"
```

---

## Task 16: Final Verification

- [ ] **Step 1: Full build check**

```bash
pnpm build
```

All packages and apps should build successfully.

- [ ] **Step 2: All tests pass**

```bash
pnpm test --if-present
```

- [ ] **Step 3: Manual smoke test**

1. `docker compose up -d` — Postgres running
2. `cd packages/database && pnpm db:migrate` — tables created
3. `cd packages/database && pnpm db:seed` — seed data created
4. `pnpm dev` — all apps start
5. Navigate to `http://localhost:4000/sign-in` — sign-in page renders
6. Sign up with a new email — verification link in console
7. Sign in after verification — redirects to dashboard
8. Create an organization — org created, redirected to org dashboard
9. Org switcher shows the org
10. Invite a member — invitation logged to console
11. Sign out — redirected to sign-in
12. Sign in as `admin@example.com` / `password123` — works, shows Acme Corp

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 1.3 — database, auth, and organization management"
```
