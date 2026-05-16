# MCP OAuth Account Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OAuth 2.1 + PKCE authentication to the MCP server so external clients (Claude, Cursor) can authenticate through Better Auth's OAuth Provider and call the `account-info` tool, while preserving existing API key and session auth.

**Architecture:** Better Auth's `@better-auth/oauth-provider` plugin owns the full OAuth 2.1 protocol (Dynamic Client Registration, authorization code + PKCE, consent, refresh tokens, revocation). The MCP server verifies JWT bearer tokens locally via `verifyAccessToken` from `better-auth/oauth2`. A new shared `@workspace/tool-calls` package owns tool definitions independently of the MCP transport. Existing API key and session auth are fully preserved for backward compatibility.

**Tech Stack:** `@better-auth/oauth-provider`, `better-auth/plugins` (jwt), `better-auth/oauth2` (verifyAccessToken), Prisma v7, Vitest, Next.js 15 App Router, React 19.

---

## File Map

**New files:**
- `packages/tool-calls/package.json`
- `packages/tool-calls/tsconfig.json`
- `packages/tool-calls/vitest.config.ts`
- `packages/tool-calls/src/index.ts`
- `packages/tool-calls/src/context.ts`
- `packages/tool-calls/src/access.ts`
- `packages/tool-calls/src/tool-definition.ts`
- `packages/tool-calls/src/registry.ts`
- `packages/tool-calls/src/tools/account-info.ts`
- `packages/tool-calls/src/__tests__/account-info.test.ts`
- `packages/tool-calls/src/__tests__/registry.test.ts`
- `packages/database/prisma/oauth.prisma` — Better Auth OAuth models
- `packages/database/prisma/mcp.prisma` — McpToolCallLog model
- `apps/public-mcp/src/lib/metadata.ts` — well-known response builders
- `apps/public-mcp/src/lib/audit.ts` — audit log writer
- `apps/dashboard/app/(auth)/consent/page.tsx` — OAuth consent route
- `apps/dashboard/features/consent/ui/consent-page-content.tsx` — consent UI

**Modified files:**
- `packages/auth/package.json` — add `@better-auth/oauth-provider`
- `packages/auth/src/auth.ts` — add `jwt()` + `oauthProvider()` plugins
- `packages/auth/src/auth-client.ts` — add `oauthProviderClient()` plugin
- `packages/routes/src/getPathFor.ts` — add `getPathForConsent()`
- `packages/routes/src/index.ts` — re-export new path helper
- `packages/database/prisma/auth.prisma` — add User→OAuth relation fields
- `apps/public-mcp/package.json` — add `@workspace/tool-calls`, `@workspace/database`
- `apps/public-mcp/src/lib/context.ts` — add `OAuthAuthContext`, update union
- `apps/public-mcp/src/middleware/mcp-auth.ts` — add OAuth bearer token path
- `apps/public-mcp/src/tools/registry.ts` — use `@workspace/tool-calls` + audit
- `apps/public-mcp/src/tools/account.ts` — simplify to re-export
- `apps/public-mcp/src/tools/account.test.ts` — add OAuth context test case
- `apps/public-mcp/src/index.ts` — add well-known routes + WWW-Authenticate

---

### Task 1: Configure `@better-auth/oauth-provider` in `packages/auth`

**Files:**
- Modify: `packages/auth/package.json`
- Modify: `packages/auth/src/auth.ts`
- Modify: `packages/auth/src/auth-client.ts`

> **Parallel note:** This task can run in parallel with Task 2 — they touch different packages.

- [ ] **Step 1: Install the OAuth Provider package**

```bash
cd packages/auth && pnpm add @better-auth/oauth-provider
```

Expected: `@better-auth/oauth-provider` appears in `packages/auth/package.json` dependencies.

- [ ] **Step 2: Update `packages/auth/src/auth.ts`**

Replace the entire file contents:

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin, jwt } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { oauthProvider } from "@better-auth/oauth-provider";
import { prisma } from "@workspace/database";
import { ac, permissions } from "./permissions";
import { routeVerificationEmail } from "./email-routing";
import { sendPasswordResetEmail } from "@workspace/email/send-password-reset-email";
import { sendInvitationEmail } from "@workspace/email/send-invitation-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string; emailVerified: boolean };
      url: string;
    }) => {
      await routeVerificationEmail({ user, url });
    },
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      await sendPasswordResetEmail({
        recipient: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),
    ...(process.env.MICROSOFT_CLIENT_ID && {
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      },
    }),
  },
  plugins: [
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
      allowDynamicClientRegistration: true,
      // Public MCP clients (Claude, Cursor) register without a pre-created client.
      // Better Auth docs warn this behavior may change as MCP standards settle.
      allowUnauthenticatedClientRegistration: true,
      scopes: [
        { name: "account:read", description: "Read account identity and current organization context" },
        { name: "offline_access", description: "Maintain access after the session ends" },
      ],
    }),
    organization({
      ac,
      roles: {
        owner: permissions.owner,
        admin: permissions.admin,
        member: permissions.member,
      },
      async sendInvitationEmail(data) {
        const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";
        await sendInvitationEmail({
          recipient: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          acceptUrl: `${baseUrl}/accept-invitation/${data.id}`,
        });
      },
    }),
    admin(),
    apiKey([
      {
        configId: "org-keys",
        defaultPrefix: "sk_org_",
        references: "organization",
        enableMetadata: true,
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          timeWindow: 1000 * 60 * 60,
        },
      },
      {
        configId: "user-keys",
        defaultPrefix: "sk_user_",
        references: "user",
        enableMetadata: true,
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          timeWindow: 1000 * 60 * 60,
        },
      },
    ]),
  ],
});

export type Auth = typeof auth;
```

- [ ] **Step 3: Update `packages/auth/src/auth-client.ts`** to add the OAuth Provider client plugin

```ts
import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient } from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000",
  plugins: [organizationClient(), adminClient(), apiKeyClient(), oauthProviderClient()],
  fetchOptions: { throw: true },
});

export type AuthClient = typeof authClient;
```

- [ ] **Step 4: Type-check the auth package**

```bash
pnpm --filter @workspace/auth type-check
```

Expected: 0 errors. If `@better-auth/oauth-provider` types are unresolved, confirm the package installed correctly in `packages/auth/node_modules`.

- [ ] **Step 5: Commit**

```bash
git add packages/auth/package.json packages/auth/src/auth.ts packages/auth/src/auth-client.ts
git commit -m "feat(auth): add OAuth Provider and JWT plugins"
```

---

### Task 2: Create `@workspace/tool-calls` package

**Files:**
- Create: `packages/tool-calls/package.json`
- Create: `packages/tool-calls/tsconfig.json`
- Create: `packages/tool-calls/vitest.config.ts`
- Create: `packages/tool-calls/src/context.ts`
- Create: `packages/tool-calls/src/access.ts`
- Create: `packages/tool-calls/src/tool-definition.ts`
- Create: `packages/tool-calls/src/tools/account-info.ts`
- Create: `packages/tool-calls/src/registry.ts`
- Create: `packages/tool-calls/src/index.ts`
- Create: `packages/tool-calls/src/__tests__/account-info.test.ts`
- Create: `packages/tool-calls/src/__tests__/registry.test.ts`

> **Parallel note:** This task can run in parallel with Task 1 — they touch different packages.

- [ ] **Step 1: Write the failing tests first**

Create `packages/tool-calls/src/__tests__/account-info.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { accountInfoTool } from "../tools/account-info";

const oauthCtx = {
  kind: "oauth" as const,
  userId: "user_1",
  orgId: "org_1",
  scopes: ["account:read"],
  clientId: "client_1",
};

const apiKeyCtx = {
  kind: "api-key" as const,
  keyId: "key_1",
  userId: null,
  orgId: "org_1",
  ownerType: "organization" as const,
  permissions: { account: ["read"] },
};

const sessionCtx = {
  kind: "session" as const,
  userId: "user_2",
  orgId: null,
  permissions: { account: ["read"] },
};

describe("accountInfoTool", () => {
  it("has the correct name", () => {
    expect(accountInfoTool.name).toBe("account-info");
  });

  it("requires account:read scope", () => {
    expect(accountInfoTool.requiredScopes).toContain("account:read");
  });

  it("requires account:read permission", () => {
    expect(accountInfoTool.requiredPermissions).toEqual({ account: ["read"] });
  });

  it("returns oauth identity fields", async () => {
    const result = await accountInfoTool.run(oauthCtx);
    expect(result.authKind).toBe("oauth");
    expect(result.userId).toBe("user_1");
    expect(result.orgId).toBe("org_1");
    expect(result.clientId).toBe("client_1");
    expect(result.scopes).toEqual(["account:read"]);
    expect(result.permissions).toBeNull();
  });

  it("returns api-key identity fields", async () => {
    const result = await accountInfoTool.run(apiKeyCtx);
    expect(result.authKind).toBe("api-key");
    expect(result.ownerType).toBe("organization");
    expect(result.orgId).toBe("org_1");
    expect(result.userId).toBeNull();
    expect(result.clientId).toBeNull();
    expect(result.scopes).toBeNull();
  });

  it("returns session identity fields", async () => {
    const result = await accountInfoTool.run(sessionCtx);
    expect(result.authKind).toBe("session");
    expect(result.userId).toBe("user_2");
    expect(result.orgId).toBeNull();
    expect(result.clientId).toBeNull();
    expect(result.scopes).toBeNull();
  });
});
```

Create `packages/tool-calls/src/__tests__/registry.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { toolRegistry } from "../registry";
import { hasAccess } from "../access";

const oauthWithScope = {
  kind: "oauth" as const,
  userId: "u1",
  orgId: null,
  scopes: ["account:read"],
  clientId: null,
};

const oauthMissingScope = {
  kind: "oauth" as const,
  userId: "u1",
  orgId: null,
  scopes: [],
  clientId: null,
};

const apiKeyCtx = {
  kind: "api-key" as const,
  keyId: "k1",
  userId: null,
  orgId: null,
  ownerType: "user" as const,
  permissions: { account: ["read"] },
};

const apiKeyMissingPerm = {
  kind: "api-key" as const,
  keyId: "k1",
  userId: null,
  orgId: null,
  ownerType: "user" as const,
  permissions: {},
};

describe("toolRegistry", () => {
  it("contains account-info tool", () => {
    const found = toolRegistry.find((t) => t.name === "account-info");
    expect(found).toBeDefined();
  });

  it("tool names are unique", () => {
    const names = toolRegistry.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("hasAccess", () => {
  const [accountInfoTool] = toolRegistry;

  it("grants access to oauth with correct scopes", () => {
    expect(accountInfoTool && hasAccess(oauthWithScope, accountInfoTool)).toBe(true);
  });

  it("denies access to oauth missing required scope", () => {
    expect(accountInfoTool && hasAccess(oauthMissingScope, accountInfoTool)).toBe(false);
  });

  it("grants access to api-key with correct permissions", () => {
    expect(accountInfoTool && hasAccess(apiKeyCtx, accountInfoTool)).toBe(true);
  });

  it("denies access to api-key missing required permissions", () => {
    expect(accountInfoTool && hasAccess(apiKeyMissingPerm, accountInfoTool)).toBe(false);
  });
});
```

- [ ] **Step 2: Create the package scaffold**

Create `packages/tool-calls/package.json`:

```json
{
  "name": "@workspace/tool-calls",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@workspace/tooling": "workspace:*",
    "typescript": "^5.7",
    "vitest": "^3"
  }
}
```

Create `packages/tool-calls/tsconfig.json`:

```json
{
  "extends": "@workspace/tooling/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Create `packages/tool-calls/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 3: Install and run failing tests**

```bash
pnpm install
pnpm --filter @workspace/tool-calls test
```

Expected: FAIL with module-not-found errors — the implementation files don't exist yet.

- [ ] **Step 4: Implement `ToolCallContext` discriminated union**

Create `packages/tool-calls/src/context.ts`:

```ts
export type ToolCallContext =
  | {
      kind: "oauth";
      userId: string;
      orgId: string | null;
      scopes: string[];
      clientId: string | null;
    }
  | {
      kind: "api-key";
      keyId: string;
      ownerType: "organization" | "user";
      userId: string | null;
      orgId: string | null;
      permissions: Record<string, string[]>;
    }
  | {
      kind: "session";
      userId: string;
      orgId: string | null;
      permissions: Record<string, string[]>;
    };
```

- [ ] **Step 5: Implement access-check utility**

Create `packages/tool-calls/src/access.ts`:

```ts
import type { ToolCallContext } from "./context";
import type { ToolDefinition } from "./tool-definition";

function hasPermission(
  permissions: Record<string, string[]>,
  required: Record<string, string[]>,
): boolean {
  return Object.entries(required).every(([resource, actions]) => {
    const granted = permissions[resource] ?? [];
    return actions.every((action) => granted.includes(action));
  });
}

export function hasAccess(ctx: ToolCallContext, tool: ToolDefinition): boolean {
  if (ctx.kind === "oauth") {
    return tool.requiredScopes.every((scope) => ctx.scopes.includes(scope));
  }
  return hasPermission(ctx.permissions, tool.requiredPermissions);
}
```

- [ ] **Step 6: Implement `ToolDefinition` type**

Create `packages/tool-calls/src/tool-definition.ts`:

```ts
import type { ToolCallContext } from "./context";

export type ToolDefinition<TOutput = unknown> = {
  name: string;
  description: string;
  requiredScopes: string[];
  requiredPermissions: Record<string, string[]>;
  run: (ctx: ToolCallContext) => Promise<TOutput>;
};
```

- [ ] **Step 7: Implement the `account-info` tool**

Create `packages/tool-calls/src/tools/account-info.ts`:

```ts
import type { ToolDefinition } from "../tool-definition";
import type { ToolCallContext } from "../context";

type AccountInfoOutput = {
  authKind: string;
  userId: string | null;
  orgId: string | null;
  ownerType: "organization" | "user" | null;
  clientId: string | null;
  scopes: string[] | null;
  permissions: Record<string, string[]> | null;
};

export const accountInfoTool: ToolDefinition<AccountInfoOutput> = {
  name: "account-info",
  description: "Returns the authenticated identity and authorization context",
  requiredScopes: ["account:read"],
  requiredPermissions: { account: ["read"] },
  run: async (ctx: ToolCallContext): Promise<AccountInfoOutput> => {
    if (ctx.kind === "oauth") {
      return {
        authKind: "oauth",
        userId: ctx.userId,
        orgId: ctx.orgId,
        ownerType: null,
        clientId: ctx.clientId,
        scopes: ctx.scopes,
        permissions: null,
      };
    }
    if (ctx.kind === "api-key") {
      return {
        authKind: "api-key",
        userId: ctx.userId,
        orgId: ctx.orgId,
        ownerType: ctx.ownerType,
        clientId: null,
        scopes: null,
        permissions: ctx.permissions,
      };
    }
    return {
      authKind: "session",
      userId: ctx.userId,
      orgId: ctx.orgId,
      ownerType: null,
      clientId: null,
      scopes: null,
      permissions: ctx.permissions,
    };
  },
};
```

- [ ] **Step 8: Implement the tool registry**

Create `packages/tool-calls/src/registry.ts`:

```ts
import type { ToolDefinition } from "./tool-definition";
import { accountInfoTool } from "./tools/account-info";

export const toolRegistry: ToolDefinition[] = [accountInfoTool];
```

- [ ] **Step 9: Write the barrel export**

Create `packages/tool-calls/src/index.ts`:

```ts
export type { ToolCallContext } from "./context";
export type { ToolDefinition } from "./tool-definition";
export { hasAccess } from "./access";
export { toolRegistry } from "./registry";
export { accountInfoTool } from "./tools/account-info";
```

- [ ] **Step 10: Run tests — verify they pass**

```bash
pnpm --filter @workspace/tool-calls test
```

Expected: all 11 tests pass across `account-info.test.ts` and `registry.test.ts`.

- [ ] **Step 11: Type-check**

```bash
pnpm --filter @workspace/tool-calls type-check
```

Expected: 0 errors.

- [ ] **Step 12: Commit**

```bash
git add packages/tool-calls/
git commit -m "feat(tool-calls): add @workspace/tool-calls package with account-info tool"
```

---

### Task 3: Update Prisma schema for OAuth models and audit log

**Files:**
- Create: `packages/database/prisma/oauth.prisma`
- Create: `packages/database/prisma/mcp.prisma`
- Modify: `packages/database/prisma/auth.prisma`

Depends on Task 1 (auth.ts with `oauthProvider` must be configured before running the CLI).

- [ ] **Step 1: Generate OAuth schema additions using Better Auth CLI**

Run the Better Auth CLI to output what schema the `oauthProvider` and `jwt` plugins require:

```bash
cd packages/auth && pnpm exec better-auth generate
```

If that command is unavailable, try:

```bash
cd packages/auth && npx @better-auth/cli@latest generate
```

Inspect the output. It will emit Prisma model definitions for the OAuth plugin's tables. Copy any OAuth-related models (typically `OauthApplication`, `OauthAccessToken`, `OauthRefreshToken`, `OauthConsent`) into the next step.

- [ ] **Step 2: Create `packages/database/prisma/oauth.prisma`**

Using the CLI output from Step 1, create this file. The reference schema below shows the expected structure — use the CLI output if it differs on any field names or defaults:

```prisma
model OauthApplication {
  id                   String   @id
  name                 String?
  icon                 String?
  metadata             String?
  clientId             String   @unique
  clientSecret         String?
  redirectURLs         String
  scopes               String
  pkce                 Boolean  @default(false)
  disabled             Boolean  @default(false)
  userId               String?
  clientType           String   @default("confidential")
  authenticationScheme String   @default("none")
  requirePkce          Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user          User?               @relation(fields: [userId], references: [id])
  accessTokens  OauthAccessToken[]
  refreshTokens OauthRefreshToken[]
  consents      OauthConsent[]

  @@map("oauthApplication")
}

model OauthAccessToken {
  id                   String   @id
  accessToken          String   @unique
  accessTokenExpiresAt DateTime
  clientId             String
  userId               String
  scopes               String
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  application OauthApplication @relation(fields: [clientId], references: [clientId])
  user        User             @relation(fields: [userId], references: [id])

  @@map("oauthAccessToken")
}

model OauthRefreshToken {
  id                    String    @id
  refreshToken          String    @unique
  refreshTokenExpiresAt DateTime?
  clientId              String
  userId                String
  scopes                String
  accessTokenId         String?
  revoked               Boolean   @default(false)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  application OauthApplication @relation(fields: [clientId], references: [clientId])
  user        User             @relation(fields: [userId], references: [id])

  @@map("oauthRefreshToken")
}

model OauthConsent {
  id        String   @id
  userId    String
  clientId  String
  scopes    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  application OauthApplication @relation(fields: [clientId], references: [clientId])
  user        User             @relation(fields: [userId], references: [id])

  @@map("oauthConsent")
}
```

> **Important:** The CLI output is the source of truth. If column names differ from this reference, use the CLI output.

- [ ] **Step 3: Create `packages/database/prisma/mcp.prisma`**

```prisma
model McpToolCallLog {
  id        String   @id @default(cuid())
  toolName  String
  authKind  String
  userId    String?
  orgId     String?
  clientId  String?
  keyId     String?
  success   Boolean
  errorCode String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([clientId])
  @@index([createdAt])
  @@map("mcpToolCallLog")
}
```

- [ ] **Step 4: Add OAuth relation fields to User in `packages/database/prisma/auth.prisma`**

Add these relation fields to the User model (before the closing `}`):

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user")
  banned        Boolean   @default(false)
  banReason     String?
  banExpires    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions           Session[]
  accounts           Account[]
  members            Member[]
  invitations        Invitation[]
  oauthApplications  OauthApplication[]
  oauthAccessTokens  OauthAccessToken[]
  oauthRefreshTokens OauthRefreshToken[]
  oauthConsents      OauthConsent[]
}
```

- [ ] **Step 5: Regenerate Prisma client**

```bash
pnpm --filter @workspace/database db:generate
```

Expected: Prisma client regenerated in `packages/database/src/generated/prisma`. If it fails with schema errors, check that relation field names in `auth.prisma` match the model names in `oauth.prisma`.

- [ ] **Step 6: Create and apply migration**

```bash
pnpm --filter @workspace/database db:migrate
```

At the name prompt, enter: `add_oauth_and_mcp_audit`

If you don't have a running local database, use push instead:

```bash
pnpm --filter @workspace/database db:push
```

- [ ] **Step 7: Commit**

```bash
git add packages/database/prisma/ packages/database/prisma/migrations/
git commit -m "feat(database): add OAuth provider models and MCP audit log table"
```

---

### Task 4: Update `apps/public-mcp` dependencies and auth context

**Files:**
- Modify: `apps/public-mcp/package.json`
- Modify: `apps/public-mcp/src/lib/context.ts`

Depends on Tasks 2 and 3.

- [ ] **Step 1: Update `apps/public-mcp/package.json`**

Replace the file contents:

```json
{
  "name": "@apps/public-mcp",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1",
    "@workspace/auth": "workspace:*",
    "@workspace/database": "workspace:*",
    "@workspace/tool-calls": "workspace:*",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@workspace/tooling": "workspace:*",
    "tsx": "^4",
    "typescript": "^5.7",
    "vitest": "^3"
  }
}
```

- [ ] **Step 2: Install new workspace dependencies**

```bash
pnpm install
```

Expected: `@workspace/tool-calls` and `@workspace/database` are resolved for `apps/public-mcp`.

- [ ] **Step 3: Update `apps/public-mcp/src/lib/context.ts`** to add the OAuth auth context type

```ts
export type ApiKeyAuthContext = {
  kind: "api-key";
  keyId: string;
  orgId: string | null;
  userId: string | null;
  ownerType: "organization" | "user";
  permissions: Record<string, string[]>;
};

export type SessionAuthContext = {
  kind: "session";
  userId: string;
  orgId: string | null;
  permissions: Record<string, string[]>;
};

export type OAuthAuthContext = {
  kind: "oauth";
  userId: string;
  orgId: string | null;
  scopes: string[];
  clientId: string | null;
};

export type AuthContext = ApiKeyAuthContext | SessionAuthContext | OAuthAuthContext;
```

- [ ] **Step 4: Type-check**

```bash
pnpm --filter @apps/public-mcp type-check
```

Expected: 0 errors. (Existing code that accesses `ctx.permissions` will need narrowing guards — the type-checker will flag these so you can fix them in later tasks.)

- [ ] **Step 5: Commit**

```bash
git add apps/public-mcp/package.json apps/public-mcp/src/lib/context.ts
git commit -m "feat(public-mcp): add OAuth auth context type and new workspace deps"
```

---

### Task 5: Add OAuth bearer token verification to `apps/public-mcp`

**Files:**
- Modify: `apps/public-mcp/src/middleware/mcp-auth.ts`

Depends on Task 4.

The current middleware tries Bearer tokens as session tokens. We change it to try OAuth JWT verification first, then fall back to session lookup for dashboard test panel compatibility.

- [ ] **Step 1: Update `apps/public-mcp/src/middleware/mcp-auth.ts`**

Replace the entire file:

```ts
import type { IncomingMessage } from "node:http";
import { verifyApiKey, ApiKeyError } from "@workspace/auth/api-keys";
import { auth } from "@workspace/auth";
import type { AuthContext } from "../lib/context";
import { McpAuthError } from "../lib/errors";

export { McpAuthError } from "../lib/errors";

function orgRoleToPermissions(_role: string): Record<string, string[]> {
  return { account: ["read"] };
}

async function resolveSessionContext(
  headers: Headers,
): Promise<AuthContext | null> {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  return {
    kind: "session",
    userId: session.user.id,
    orgId: session.session.activeOrganizationId ?? null,
    permissions: orgRoleToPermissions("member"),
  };
}

async function resolveOAuthContext(
  token: string,
): Promise<AuthContext | null> {
  try {
    // verifyAccessToken verifies the JWT issued by Better Auth's OAuth Provider.
    // The exact signature depends on your installed better-auth version.
    // Check the `better-auth/oauth2` package exports and adjust if needed.
    const { verifyAccessToken } = await import("better-auth/oauth2");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = await verifyAccessToken(token, auth as any);
    if (!payload) return null;
    const record = payload as Record<string, unknown>;
    const sub = record["sub"];
    const scope = record["scope"];
    const clientId = record["client_id"] ?? null;
    const orgId = record["orgId"] ?? null;
    if (typeof sub !== "string") return null;
    return {
      kind: "oauth",
      userId: sub,
      orgId: typeof orgId === "string" ? orgId : null,
      scopes: typeof scope === "string" ? scope.split(" ") : [],
      clientId: typeof clientId === "string" ? clientId : null,
    };
  } catch {
    return null;
  }
}

export async function resolveMcpAuthContext(
  req: IncomingMessage,
): Promise<AuthContext> {
  // 1. API key via x-api-key header (external clients, preserved for backward compat)
  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string") {
    try {
      const ctx = await verifyApiKey(apiKey);
      return { kind: "api-key", ...ctx };
    } catch (err) {
      if (err instanceof ApiKeyError) {
        throw new McpAuthError(err.code, err.message);
      }
      throw new McpAuthError("UNAUTHORIZED", "Invalid API key");
    }
  }

  // 2. Bearer token — try OAuth JWT first, then fall back to session bearer
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    const oauthCtx = await resolveOAuthContext(token);
    if (oauthCtx) return oauthCtx;

    // Fallback: session token (dashboard test panel compatibility)
    const sessionCtx = await resolveSessionContext(
      new Headers({ authorization: authHeader }),
    );
    if (sessionCtx) return sessionCtx;

    throw new McpAuthError("UNAUTHORIZED", "Invalid token");
  }

  // 3. Session via Cookie (dashboard server actions forward cookies)
  const cookie = req.headers["cookie"];
  if (typeof cookie === "string") {
    const ctx = await resolveSessionContext(new Headers({ cookie }));
    if (ctx) return ctx;
  }

  throw new McpAuthError("UNAUTHORIZED", "Missing authentication");
}
```

> **Note on `verifyAccessToken`:** The dynamic import `await import("better-auth/oauth2")` guards against the case where the export path doesn't exist at build time. If your Better Auth version exposes `verifyAccessToken` at a different path (e.g., `better-auth/plugins/oauth-provider`), update the import accordingly. The function should accept a token string and the auth instance (or a secret option) and return a JWT payload or throw on failure.

- [ ] **Step 2: Type-check**

```bash
pnpm --filter @apps/public-mcp type-check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/public-mcp/src/middleware/mcp-auth.ts
git commit -m "feat(public-mcp): add OAuth bearer token verification path"
```

---

### Task 6: Add well-known metadata routes and WWW-Authenticate to `apps/public-mcp`

**Files:**
- Create: `apps/public-mcp/src/lib/metadata.ts`
- Modify: `apps/public-mcp/src/index.ts`

Depends on Task 5.

- [ ] **Step 1: Create `apps/public-mcp/src/lib/metadata.ts`**

```ts
import type { ServerResponse } from "node:http";

const MCP_URL = process.env.PUBLIC_MCP_URL ?? "http://localhost:4200";
const AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";

export function writeProtectedResourceMetadata(res: ServerResponse): void {
  const metadata = {
    resource: MCP_URL,
    authorization_servers: [AUTH_URL],
    scopes_supported: ["account:read", "offline_access"],
  };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(metadata));
}

export function getWwwAuthenticateHeader(): string {
  const metadataUrl = `${MCP_URL}/.well-known/oauth-protected-resource`;
  return `Bearer realm="MCP", resource_metadata="${metadataUrl}"`;
}
```

- [ ] **Step 2: Update `apps/public-mcp/src/index.ts`** to add metadata route + WWW-Authenticate on 401

Replace the entire file:

```ts
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { resolveMcpAuthContext, McpAuthError } from "./middleware/mcp-auth";
import { writeJsonError } from "./lib/errors";
import { writeProtectedResourceMetadata, getWwwAuthenticateHeader } from "./lib/metadata";
import { registerTools } from "./tools/registry";

async function readBody(req: IncomingMessage): Promise<unknown> {
  if (req.method !== "POST") return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString();
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? "";

  // OAuth protected-resource metadata — required for MCP client discovery
  if (url === "/.well-known/oauth-protected-resource") {
    writeProtectedResourceMetadata(res);
    return;
  }

  if (!url.startsWith("/mcp")) {
    writeJsonError(res, 404, "NOT_FOUND", "Not found");
    return;
  }

  let authContext;
  try {
    authContext = await resolveMcpAuthContext(req);
  } catch (err) {
    if (err instanceof McpAuthError) {
      const status = err.code === "RATE_LIMITED" ? 429 : 401;
      if (status === 401) {
        res.setHeader("WWW-Authenticate", getWwwAuthenticateHeader());
      }
      writeJsonError(res, status, err.code, err.message);
    } else {
      writeJsonError(res, 500, "INTERNAL_ERROR", "Internal server error");
    }
    return;
  }

  const body = await readBody(req);
  const mcpServer = new McpServer({ name: "public-mcp", version: "1.0.0" });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  registerTools(mcpServer, authContext);
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, body);
});

const port = Number(process.env.PUBLIC_MCP_PORT ?? 4200);
server.listen(port, () => {
  console.log(`Public MCP server running at http://localhost:${port}/mcp`);
});
```

- [ ] **Step 3: Type-check**

```bash
pnpm --filter @apps/public-mcp type-check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/public-mcp/src/lib/metadata.ts apps/public-mcp/src/index.ts
git commit -m "feat(public-mcp): add well-known metadata route and WWW-Authenticate header"
```

---

### Task 7: Update tool registry to use `@workspace/tool-calls` + add audit logging

**Files:**
- Create: `apps/public-mcp/src/lib/audit.ts`
- Modify: `apps/public-mcp/src/tools/registry.ts`
- Modify: `apps/public-mcp/src/tools/account.ts`
- Modify: `apps/public-mcp/src/tools/account.test.ts`

Depends on Tasks 3 and 4.

- [ ] **Step 1: Write the updated test file first**

Replace `apps/public-mcp/src/tools/account.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { accountInfoTool } from "@workspace/tool-calls";
import type { ToolCallContext } from "@workspace/tool-calls";

const orgCtx: ToolCallContext = {
  kind: "api-key",
  keyId: "key_1",
  orgId: "org_1",
  userId: null,
  ownerType: "organization",
  permissions: { account: ["read"] },
};

const userCtx: ToolCallContext = {
  kind: "session",
  userId: "user_1",
  orgId: "org_2",
  permissions: { account: ["read"] },
};

const oauthCtx: ToolCallContext = {
  kind: "oauth",
  userId: "user_3",
  orgId: "org_3",
  scopes: ["account:read"],
  clientId: "client_1",
};

describe("accountInfoTool (via @workspace/tool-calls)", () => {
  it("returns org identity for api-key context", async () => {
    const result = await accountInfoTool.run(orgCtx);
    expect(result.authKind).toBe("api-key");
    expect(result.ownerType).toBe("organization");
    expect(result.orgId).toBe("org_1");
    expect(result.userId).toBeNull();
  });

  it("returns user identity for session context", async () => {
    const result = await accountInfoTool.run(userCtx);
    expect(result.authKind).toBe("session");
    expect(result.userId).toBe("user_1");
    expect(result.orgId).toBe("org_2");
    expect(result.ownerType).toBeNull();
  });

  it("returns oauth identity for oauth context", async () => {
    const result = await accountInfoTool.run(oauthCtx);
    expect(result.authKind).toBe("oauth");
    expect(result.userId).toBe("user_3");
    expect(result.orgId).toBe("org_3");
    expect(result.clientId).toBe("client_1");
    expect(result.scopes).toEqual(["account:read"]);
  });

  it("does not return clientId for non-oauth contexts", async () => {
    const apiResult = await accountInfoTool.run(orgCtx);
    const sessionResult = await accountInfoTool.run(userCtx);
    expect(apiResult.clientId).toBeNull();
    expect(sessionResult.clientId).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail** (imports from `@workspace/tool-calls` not yet wired into registry.ts)

```bash
pnpm --filter @apps/public-mcp test
```

Expected: FAIL or skip — account.test.ts tests should pass since they import directly from `@workspace/tool-calls`. Registry is not yet updated.

- [ ] **Step 3: Create `apps/public-mcp/src/lib/audit.ts`**

```ts
import { prisma } from "@workspace/database/client";
import type { AuthContext } from "../lib/context";

type AuditInput = {
  toolName: string;
  ctx: AuthContext;
  success: boolean;
  errorCode?: string;
};

export async function logToolCall({
  toolName,
  ctx,
  success,
  errorCode,
}: AuditInput): Promise<void> {
  try {
    await prisma.mcpToolCallLog.create({
      data: {
        toolName,
        authKind: ctx.kind,
        userId: ctx.kind === "api-key" ? (ctx.userId ?? null) : ctx.userId,
        orgId: ctx.orgId ?? null,
        clientId: ctx.kind === "oauth" ? ctx.clientId : null,
        keyId: ctx.kind === "api-key" ? ctx.keyId : null,
        success,
        errorCode: errorCode ?? null,
      },
    });
  } catch (err) {
    // Audit failures must not block tool responses
    console.error("[audit] Failed to log tool call:", err);
  }
}
```

- [ ] **Step 4: Update `apps/public-mcp/src/tools/registry.ts`** to use `@workspace/tool-calls` registry

```ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthContext } from "../lib/context";
import { toolRegistry, hasAccess } from "@workspace/tool-calls";
import { logToolCall } from "../lib/audit";

export function registerTools(server: McpServer, ctx: AuthContext): void {
  for (const tool of toolRegistry) {
    server.tool(tool.name, tool.description, {}, async () => {
      if (!hasAccess(ctx, tool)) {
        void logToolCall({ toolName: tool.name, ctx, success: false, errorCode: "FORBIDDEN" });
        return {
          content: [{ type: "text" as const, text: `Forbidden: missing required permission for ${tool.name}` }],
          isError: true,
        };
      }
      try {
        const result = await tool.run(ctx);
        void logToolCall({ toolName: tool.name, ctx, success: true });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        void logToolCall({ toolName: tool.name, ctx, success: false, errorCode: "INTERNAL_ERROR" });
        console.error(`[mcp] Tool ${tool.name} failed:`, err);
        return {
          content: [{ type: "text" as const, text: "Internal error" }],
          isError: true,
        };
      }
    });
  }
}
```

- [ ] **Step 5: Simplify `apps/public-mcp/src/tools/account.ts`**

The tool implementation now lives in `@workspace/tool-calls`. Simplify this file to avoid dead code:

```ts
// Tool implementation moved to @workspace/tool-calls.
export { accountInfoTool } from "@workspace/tool-calls";
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
pnpm --filter @apps/public-mcp test
```

Expected: all tests in `account.test.ts` pass (they import from `@workspace/tool-calls` directly).

- [ ] **Step 7: Type-check**

```bash
pnpm --filter @apps/public-mcp type-check
```

Expected: 0 errors. If `hasAccess(ctx, tool)` has a type mismatch (AuthContext vs ToolCallContext), it means the two types differ structurally. Resolve by ensuring the variant shapes in `apps/public-mcp/src/lib/context.ts` exactly match `packages/tool-calls/src/context.ts`. If needed, import and re-export: `export type { ToolCallContext as AuthContext } from "@workspace/tool-calls";`

- [ ] **Step 8: Commit**

```bash
git add apps/public-mcp/src/lib/audit.ts apps/public-mcp/src/tools/registry.ts apps/public-mcp/src/tools/account.ts apps/public-mcp/src/tools/account.test.ts
git commit -m "feat(public-mcp): use @workspace/tool-calls registry and add audit logging"
```

---

### Task 8: Add dashboard consent page

**Files:**
- Modify: `packages/routes/src/getPathFor.ts`
- Modify: `packages/routes/src/index.ts`
- Create: `apps/dashboard/app/(auth)/consent/page.tsx`
- Create: `apps/dashboard/features/consent/ui/consent-page-content.tsx`

> **Parallel note:** This task can run in parallel with Tasks 5, 6, 7 — it touches different files.

Depends on Task 1 (auth client needs `oauthProviderClient` before the consent API is available).

- [ ] **Step 1: Add `getPathForConsent` to `packages/routes/src/getPathFor.ts`**

Add this function after `getPathForAccountSettings`:

```ts
export function getPathForConsent() {
  return "/consent";
}
```

- [ ] **Step 2: Re-export from `packages/routes/src/index.ts`**

Add `getPathForConsent` to the export list:

```ts
export {
  getPathForHome,
  getPathForSignIn,
  getPathForSignUp,
  getPathForForgotPassword,
  getPathForResetPassword,
  getPathForVerifyEmail,
  getPathForCreateOrg,
  getPathForOrg,
  getPathForOrgSettings,
  getPathForOrgSettingsGeneral,
  getPathForOrgMembers,
  getPathForAcceptInvitation,
  getPathForAccountSettings,
  getPathForConsent,
} from "./getPathFor";
```

- [ ] **Step 3: Create the consent page route**

Create `apps/dashboard/app/(auth)/consent/page.tsx`:

```tsx
import type { Metadata } from "next";
import { ConsentPageContent } from "@/features/consent/ui/consent-page-content";

export const metadata: Metadata = { title: "Authorize Application" };

export default function ConsentPage() {
  return <ConsentPageContent />;
}
```

- [ ] **Step 4: Create `apps/dashboard/features/consent/ui/consent-page-content.tsx`**

The spec requires an org-selection step before consent is accepted when the user belongs to multiple organizations. The component loads the user's orgs, shows a dropdown if there are multiple, and sets the active org before submitting consent.

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@workspace/auth/client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  "account:read": "Read your account identity and current organization context",
  offline_access: "Maintain access after your session ends (uses refresh tokens)",
};

export function ConsentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const scopeParam = searchParams.get("scope") ?? "";
  const scopes = scopeParam ? scopeParam.split(" ").filter(Boolean) : [];

  const { data: orgsResult } = authClient.useListOrganizations();
  const organizations = orgsResult ?? [];
  const needsOrgSelection = organizations.length > 1;

  const handleConsent = async (accept: boolean) => {
    setLoading(accept ? "accept" : "deny");
    setError(null);
    try {
      // If user has multiple orgs and is accepting, set the selected org as active first.
      // The issued OAuth token will reflect this org via the user's active session.
      if (accept && needsOrgSelection && selectedOrgId) {
        await authClient.organization.setActive({ organizationId: selectedOrgId });
      }

      // oauthProviderClient adds oauth2.consent() to the authClient.
      // Check @better-auth/oauth-provider/client for the exact method signature.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authClient as any).oauth2.consent({ accept });
      const data = result as { data?: { redirectURI?: string; redirect?: string } };
      const redirectTarget = data.data?.redirectURI ?? data.data?.redirect;
      if (redirectTarget) {
        router.push(redirectTarget);
      }
    } catch (err) {
      console.error("Consent error:", err);
      setError("Failed to process consent. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const acceptDisabled =
    loading !== null || (needsOrgSelection && !selectedOrgId);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authorize Application</CardTitle>
        <CardDescription>
          An application is requesting access to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">This application is requesting:</p>
            {scopes.length > 0 ? (
              <ul className="space-y-2">
                {scopes.map((scope) => (
                  <li key={scope} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-green-600" aria-hidden>
                      ✓
                    </span>
                    <span>{SCOPE_DESCRIPTIONS[scope] ?? scope}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific permissions requested.
              </p>
            )}
          </div>

          {needsOrgSelection && (
            <div className="space-y-2">
              <Label htmlFor="org-select">
                Select which organization to grant access to:
              </Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger id="org-select">
                  <SelectValue placeholder="Choose an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => void handleConsent(false)}
          disabled={loading !== null}
        >
          {loading === "deny" ? "Denying…" : "Deny"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => void handleConsent(true)}
          disabled={acceptDisabled}
        >
          {loading === "accept" ? "Authorizing…" : "Authorize"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

> **Note on `authClient.oauth2.consent()`:** The `oauthProviderClient()` plugin added in Task 1 extends `authClient` with OAuth2 consent methods. The exact method name and response shape depends on the `@better-auth/oauth-provider` version. After installation, check `@better-auth/oauth-provider/client` TypeScript types to get the exact API and remove the `as any` casts.
>
> **Note on `authClient.useListOrganizations()`:** Returns the user's organizations from the Better Auth organization plugin. The `data` field shape matches `Organization[]` from the Better Auth organization client. If the return shape differs (e.g., `data.data`), adjust the `organizations` derivation accordingly.

- [ ] **Step 5: Type-check the dashboard**

```bash
pnpm --filter @apps/dashboard type-check
```

Expected: 0 errors (the `as any` suppresses the dynamic plugin type until Better Auth provides typed inference).

- [ ] **Step 6: Commit**

```bash
git add packages/routes/src/getPathFor.ts packages/routes/src/index.ts apps/dashboard/app/\(auth\)/consent/ apps/dashboard/features/consent/
git commit -m "feat(dashboard): add OAuth consent page"
```

---

### Task 9: Integration verification

**Files:** No new files — verify all previous tasks compile and connect correctly.

- [ ] **Step 1: Run all package tests**

```bash
pnpm --filter @workspace/tool-calls test
pnpm --filter @apps/public-mcp test
```

Expected: all tests pass in both packages.

- [ ] **Step 2: Type-check all changed packages**

```bash
pnpm --filter @workspace/auth type-check
pnpm --filter @workspace/tool-calls type-check
pnpm --filter @apps/public-mcp type-check
pnpm --filter @apps/dashboard type-check
```

Expected: 0 errors in each.

- [ ] **Step 3: Verify well-known metadata route responds**

Start the MCP server (requires `.env` with `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`):

```bash
pnpm --filter @apps/public-mcp dev &
sleep 2
curl -s http://localhost:4200/.well-known/oauth-protected-resource | jq .
```

Expected response:

```json
{
  "resource": "http://localhost:4200",
  "authorization_servers": ["http://localhost:4000"],
  "scopes_supported": ["account:read", "offline_access"]
}
```

- [ ] **Step 4: Verify 401 + WWW-Authenticate on unauthenticated MCP request**

```bash
curl -v -X POST http://localhost:4200/mcp \
  -H "Content-Type: application/json" \
  -d '{}' 2>&1 | grep -E "< HTTP|< WWW-Authenticate|error"
```

Expected:
```
< HTTP/1.1 401 Unauthorized
< WWW-Authenticate: Bearer realm="MCP", resource_metadata="http://localhost:4200/.well-known/oauth-protected-resource"
```

- [ ] **Step 5: Verify existing API key auth still works**

```bash
curl -s -X POST http://localhost:4200/mcp \
  -H "x-api-key: sk_org_<your-test-key>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"account-info","arguments":{}},"id":1}'
```

Expected: JSON response containing `"authKind": "api-key"`.

- [ ] **Step 6: Stop the dev server and confirm all commits**

```bash
kill %1
git log --oneline -10
```

Confirm these commits are present (order may vary by parallel execution):

```
feat(dashboard): add OAuth consent page
feat(public-mcp): use @workspace/tool-calls registry and add audit logging
feat(public-mcp): add well-known metadata route and WWW-Authenticate header
feat(public-mcp): add OAuth bearer token verification path
feat(public-mcp): add OAuth auth context type and new workspace deps
feat(database): add OAuth provider models and MCP audit log table
feat(tool-calls): add @workspace/tool-calls package with account-info tool
feat(auth): add OAuth Provider and JWT plugins
```
