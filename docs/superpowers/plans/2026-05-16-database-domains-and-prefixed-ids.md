# Database Domains and Prefixed IDs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize modular database-domain conventions, merge OAuth schema into the auth domain, and add prefixed ID generation without overcomplicating the starter template.

**Architecture:** Prisma schema stays centralized in `packages/database/prisma/` and split into coarse domain files. Domain packages own repository files in `src/data-models/`, with every non-Better Auth app-owned table getting one repo and Better Auth mechanism tables accessed through Better Auth APIs. Prefixed IDs are generated in TypeScript through `@workspace/common/create-id`, while Better Auth-created records use Better Auth's `advanced.database.generateId` hook.

**Tech Stack:** Prisma 7 multi-file schema, Better Auth, `@paralleldrive/cuid2`, TypeScript, Vitest, pnpm workspaces.

---

## File Map

**New files:**
- `packages/common/src/create-id.ts` - shared prefixed ID helper and domain-grouped prefix types.
- `packages/common/src/create-id.test.ts` - tests for prefix formatting, custom length, and temporary IDs.
- `packages/common/vitest.config.ts` - node test config for the common package.
- `packages/auth/src/better-auth-id.ts` - Better Auth model-to-prefix mapping and `generateId` adapter.
- `packages/auth/src/better-auth-id.test.ts` - tests for Better Auth model ID mapping.
- `packages/auth/src/data-models/README.md` - explains why Better Auth internal tables are not wrapped by default.

**Modified files:**
- `packages/common/package.json` - add `@paralleldrive/cuid2`, test script, and Vitest dev dependency.
- `packages/common/src/index.ts` - export the ID helper.
- `packages/auth/package.json` - add `@workspace/common` dependency if not already present.
- `packages/auth/src/auth.ts` - wire Better Auth `advanced.database.generateId`.
- `packages/database/prisma/auth.prisma` - move OAuth models into the auth domain file.
- `packages/database/prisma/oauth.prisma` - delete after its models are moved into `auth.prisma`.
- `.ai/skills/add-data-model-to-database/SKILL.md` - verify guidance matches the finalized conventions.
- `.claude/skills/add-data-model-to-database/SKILL.md` - verify wrapper description stays aligned.
- `.cursor/skills/add-data-model-to-database/SKILL.md` - verify wrapper description stays aligned.

**Existing user work to preserve:**
- `packages/database/prisma/auth.prisma` may already include JWKS changes.
- `packages/database/prisma/migrations/20260517003500_add_jwks_table/migration.sql` may already exist.
- Do not revert unrelated Prisma or migration work.

---

## Prerequisites

- Confirm the prior CRM rename has completed before implementing contacts-domain changes:
  - `packages/crm` should no longer be the active package name.
  - `packages/contacts` should exist if contacts models are already implemented.
  - `packages/database/prisma/contacts.prisma` should replace any old `crm.prisma` when contacts schema exists.
  - Imports should use `@workspace/contacts`.
  - ID prefix types should use `ContactsIdPrefix`, not `CrmIdPrefix`.
- If the rename has not happened yet, implement only the auth, common ID, and OAuth-schema merge tasks in this plan. Return to contacts naming after the rename lands.

---

## Critical Tests

- `packages/common/src/create-id.test.ts` should prove prefixed IDs use the exact `<prefix>_<id>` shape, honor custom suffix length, and detect temporary IDs.
- `packages/auth/src/better-auth-id.test.ts` should prove Better Auth core/plugin model names map to the intended prefixes and unknown models still get a valid unprefixed ID instead of throwing.
- `pnpm --filter @workspace/database db:generate` should prove merging `oauth.prisma` into `auth.prisma` did not break Prisma schema assembly.
- `pnpm --filter @workspace/auth test` should prove Better Auth ID mapping remains stable.
- `pnpm --filter @workspace/common test` should prove the shared ID helper works independently of app packages.
- `pnpm type-check` should prove package exports and new workspace dependencies are wired correctly.

---

### Task 1: Verify Current Domain State

**Files:**
- Read: `packages/database/prisma/`
- Read: `packages/`
- Read: `packages/database/prisma/auth.prisma`
- Read: `packages/database/prisma/oauth.prisma`
- Read: `.ai/skills/add-data-model-to-database/SKILL.md`

- [ ] **Step 1: Check Prisma domain files**

Run:

```bash
ls packages/database/prisma
```

Expected: `schema.prisma`, `auth.prisma`, `mcp.prisma`, and `oauth.prisma` are present before this plan's schema merge. `contacts.prisma` may or may not be present depending on whether the prior contacts rename has landed.

- [ ] **Step 2: Check package domain names**

Run:

```bash
ls packages
```

Expected: If the prior rename has landed, `contacts` appears and `crm` is absent. If it has not landed, note that contacts-specific implementation is deferred, but continue with common/auth/database tasks.

- [ ] **Step 3: Check for unrelated working tree changes**

Run:

```bash
git status --short
```

Expected: Any pre-existing changes are identified before editing. Do not revert unrelated changes.

---

### Task 2: Add Shared Prefixed ID Helper

**Files:**
- Modify: `packages/common/package.json`
- Create: `packages/common/vitest.config.ts`
- Create: `packages/common/src/create-id.ts`
- Create: `packages/common/src/create-id.test.ts`
- Modify: `packages/common/src/index.ts`

- [ ] **Step 1: Add common package dependencies**

Run:

```bash
pnpm add -F @workspace/common @paralleldrive/cuid2
pnpm add -D -F @workspace/common vitest
```

Expected: `packages/common/package.json` has `@paralleldrive/cuid2` in `dependencies` and `vitest` in `devDependencies`.

- [ ] **Step 2: Add common test script**

Update `packages/common/package.json` so it includes:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Keep existing fields and dependencies intact.

- [ ] **Step 3: Create `packages/common/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Create `packages/common/src/create-id.ts`**

```ts
import { createId as createCuidId, init } from "@paralleldrive/cuid2";

export type AuthIdPrefix =
  | "user"
  | "sess"
  | "acct"
  | "ver"
  | "jwks"
  | "org"
  | "mbr"
  | "inv"
  | "apikey"
  | "oauthapp"
  | "oauthat"
  | "oauthrt"
  | "oauthc";

export type ContactsIdPrefix = "contact" | "company" | "staddr";

export type BillingIdPrefix = "sub" | "price" | "prod" | "inv" | "pay";

export type McpIdPrefix = "mcptcl";

export type IdPrefix =
  | AuthIdPrefix
  | ContactsIdPrefix
  | BillingIdPrefix
  | McpIdPrefix
  | "tmp";

const temporaryIdPrefix = "tmp" satisfies IdPrefix;

export function createId(prefix?: IdPrefix, length = 16) {
  if (!prefix) {
    return createCuidId();
  }

  return `${prefix}_${createIdOfLength(length)}`;
}

export function createIdOfLength(length: number) {
  return init({
    length,
  })();
}

export function createIdTemporary() {
  return createId(temporaryIdPrefix);
}

export function isTemporaryId(id: string) {
  return id.startsWith(`${temporaryIdPrefix}_`);
}
```

- [ ] **Step 5: Export the ID helper**

Replace `packages/common/src/index.ts` with:

```ts
export * from "./create-id";
```

- [ ] **Step 6: Add ID helper tests**

Create `packages/common/src/create-id.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  createId,
  createIdOfLength,
  createIdTemporary,
  isTemporaryId,
} from "./create-id";

describe("createId", () => {
  it("creates an unprefixed cuid when no prefix is provided", () => {
    const id = createId();

    expect(id).toEqual(expect.any(String));
    expect(id).not.toContain("_");
  });

  it("creates a prefixed ID with the requested suffix length", () => {
    const id = createId("contact", 10);

    expect(id).toMatch(/^contact_[a-z0-9]{10}$/);
  });

  it("creates a raw cuid suffix with the requested length", () => {
    expect(createIdOfLength(8)).toMatch(/^[a-z0-9]{8}$/);
  });

  it("detects temporary IDs only when they use the temporary prefix", () => {
    const temporaryId = createIdTemporary();

    expect(temporaryId).toMatch(/^tmp_[a-z0-9]{16}$/);
    expect(isTemporaryId(temporaryId)).toBe(true);
    expect(isTemporaryId("contact_abc123")).toBe(false);
    expect(isTemporaryId("tmp")).toBe(false);
  });
});
```

- [ ] **Step 7: Run common tests**

Run:

```bash
pnpm --filter @workspace/common test
```

Expected: all `create-id` tests pass.

- [ ] **Step 8: Commit shared ID helper**

```bash
git add packages/common/package.json packages/common/vitest.config.ts packages/common/src/index.ts packages/common/src/create-id.ts packages/common/src/create-id.test.ts pnpm-lock.yaml
git commit -m "feat(common): add prefixed id helper"
```

---

### Task 3: Wire Better Auth ID Generation

**Files:**
- Modify: `packages/auth/package.json`
- Create: `packages/auth/src/better-auth-id.ts`
- Create: `packages/auth/src/better-auth-id.test.ts`
- Modify: `packages/auth/src/auth.ts`

- [ ] **Step 1: Add common dependency to auth**

Run:

```bash
pnpm add -F @workspace/auth @workspace/common@workspace:*
```

Expected: `packages/auth/package.json` includes `"@workspace/common": "workspace:*"` in `dependencies`.

- [ ] **Step 2: Create Better Auth ID mapping**

Create `packages/auth/src/better-auth-id.ts`:

```ts
import { createId, type AuthIdPrefix } from "@workspace/common/create-id";

type BetterAuthGenerateIdOptions = {
  model?: string;
};

const betterAuthModelIdPrefixes = {
  user: "user",
  session: "sess",
  account: "acct",
  verification: "ver",
  jwks: "jwks",
  organization: "org",
  member: "mbr",
  invitation: "inv",
  apikey: "apikey",
  apiKey: "apikey",
  oauthApplication: "oauthapp",
  oauthAccessToken: "oauthat",
  oauthRefreshToken: "oauthrt",
  oauthConsent: "oauthc",
} satisfies Record<string, AuthIdPrefix>;

export function createBetterAuthId(options: BetterAuthGenerateIdOptions) {
  const prefix = options.model
    ? betterAuthModelIdPrefixes[options.model]
    : undefined;

  return prefix ? createId(prefix) : createId();
}
```

- [ ] **Step 3: Add Better Auth ID mapping tests**

Create `packages/auth/src/better-auth-id.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createBetterAuthId } from "./better-auth-id";

describe("createBetterAuthId", () => {
  it.each([
    ["user", "user"],
    ["session", "sess"],
    ["account", "acct"],
    ["verification", "ver"],
    ["organization", "org"],
    ["member", "mbr"],
    ["invitation", "inv"],
    ["jwks", "jwks"],
    ["apikey", "apikey"],
    ["apiKey", "apikey"],
    ["oauthApplication", "oauthapp"],
    ["oauthAccessToken", "oauthat"],
    ["oauthRefreshToken", "oauthrt"],
    ["oauthConsent", "oauthc"],
  ])("maps Better Auth model %s to prefix %s", (model, prefix) => {
    expect(createBetterAuthId({ model })).toMatch(
      new RegExp(`^${prefix}_[a-z0-9]{16}$`),
    );
  });

  it("falls back to an unprefixed ID for unknown models", () => {
    const id = createBetterAuthId({ model: "unknownPluginModel" });

    expect(id).toEqual(expect.any(String));
    expect(id).not.toContain("_");
  });
});
```

- [ ] **Step 4: Wire `generateId` into Better Auth**

Update `packages/auth/src/auth.ts`:

```ts
import { createBetterAuthId } from "./better-auth-id";
```

Inside the `betterAuth({ ... })` options object, add this near the existing `database` and `experimental` settings:

```ts
  advanced: {
    database: {
      generateId: createBetterAuthId,
    },
  },
```

The top of the options object should now follow this shape:

```ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  experimental: { joins: true },
  advanced: {
    database: {
      generateId: createBetterAuthId,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // existing email handlers stay unchanged
  },
  // existing socialProviders and plugins stay unchanged
});
```

- [ ] **Step 5: Run auth tests**

Run:

```bash
pnpm --filter @workspace/auth test
```

Expected: all auth tests pass, including `better-auth-id.test.ts`.

- [ ] **Step 6: Commit Better Auth ID hook**

```bash
git add packages/auth/package.json packages/auth/src/auth.ts packages/auth/src/better-auth-id.ts packages/auth/src/better-auth-id.test.ts pnpm-lock.yaml
git commit -m "feat(auth): add prefixed better auth ids"
```

---

### Task 4: Merge OAuth Prisma Models Into Auth Schema

**Files:**
- Modify: `packages/database/prisma/auth.prisma`
- Delete: `packages/database/prisma/oauth.prisma`

- [ ] **Step 1: Move OAuth models into `auth.prisma`**

Append the contents of `packages/database/prisma/oauth.prisma` to the bottom of `packages/database/prisma/auth.prisma`, after the existing auth-domain models.

The moved models should remain unchanged except for surrounding placement:

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

- [ ] **Step 2: Delete the now-empty OAuth schema file**

Run:

```bash
rm packages/database/prisma/oauth.prisma
```

Expected: the same OAuth models exist in `auth.prisma`, and no standalone `oauth.prisma` remains.

- [ ] **Step 3: Regenerate Prisma client**

Run:

```bash
pnpm --filter @workspace/database db:generate
```

Expected: Prisma client generation succeeds. This is a schema-file reorganization, so it should not require a new database migration by itself.

- [ ] **Step 4: Commit schema merge**

```bash
git add packages/database/prisma/auth.prisma packages/database/prisma/oauth.prisma packages/database/src/generated/prisma
git commit -m "refactor(database): merge oauth schema into auth domain"
```

If Prisma generation does not change tracked generated files, omit `packages/database/src/generated/prisma` from the commit.

---

### Task 5: Document Auth Repository Exceptions

**Files:**
- Create: `packages/auth/src/data-models/README.md`

- [ ] **Step 1: Create auth data-models documentation**

Create `packages/auth/src/data-models/README.md`:

```md
# Auth Data Models

This package intentionally does not wrap every Better Auth table in repository files.

Better Auth owns mechanism tables such as sessions, accounts, verifications, OAuth tokens, OAuth consents, API keys, and most invitation/session lifecycle behavior. App code should use Better Auth APIs for those flows so it does not bypass token handling, expiry logic, revocation, hooks, or plugin assumptions.

Repository files in this package are only for app-facing auth concepts that the product intentionally reads or queries directly, such as users, organizations, or members. Do not add create/update/delete helpers for Better Auth-owned mechanism tables unless there is a specific product requirement and the Better Auth API cannot cover it.
```

- [ ] **Step 2: Commit auth documentation**

```bash
git add packages/auth/src/data-models/README.md
git commit -m "docs(auth): explain data model repository boundaries"
```

---

### Task 6: Verify AI Guidance Is Aligned

**Files:**
- Modify if needed: `.ai/skills/add-data-model-to-database/SKILL.md`
- Modify if needed: `.claude/skills/add-data-model-to-database/SKILL.md`
- Modify if needed: `.cursor/skills/add-data-model-to-database/SKILL.md`

- [ ] **Step 1: Verify canonical guidance**

Read `.ai/skills/add-data-model-to-database/SKILL.md` and confirm it includes these conventions:

```md
- Use `contacts`, not `crm`, for the contacts domain after the rename lands.
- Use `packages/<domain>/src/data-models/<database-table-name>-repo.ts`.
- Every non-Better Auth app-owned table should have a repository file.
- Better Auth internal mechanism tables should not be wrapped by default.
- OAuth provider models belong in `auth.prisma`.
- App-owned prefixed IDs belong in `@workspace/common/create-id`.
- Better Auth-created IDs use `advanced.database.generateId`.
```

- [ ] **Step 2: Verify Claude and Cursor wrappers**

Read `.claude/skills/add-data-model-to-database/SKILL.md` and `.cursor/skills/add-data-model-to-database/SKILL.md`.

Expected: both wrappers point to the canonical `.ai` skill and their descriptions mention contacts models rather than CRM models.

- [ ] **Step 3: Commit guidance changes if this task changed files**

If any guidance files changed:

```bash
git add .ai/skills/add-data-model-to-database/SKILL.md .claude/skills/add-data-model-to-database/SKILL.md .cursor/skills/add-data-model-to-database/SKILL.md
git commit -m "docs: update data model guidance"
```

If no guidance files changed, do not create an empty commit.

---

### Task 7: Final Verification

**Files:**
- Verify: all files changed by this plan

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm --filter @workspace/common test
pnpm --filter @workspace/auth test
```

Expected: both commands pass.

- [ ] **Step 2: Run database generation**

Run:

```bash
pnpm --filter @workspace/database db:generate
```

Expected: Prisma client generation succeeds with OAuth models now coming from `auth.prisma`.

- [ ] **Step 3: Run type-check**

Run:

```bash
pnpm type-check
```

Expected: TypeScript passes across the workspace.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git status --short
git diff --check
```

Expected: no whitespace errors. Any remaining uncommitted files are intentional.

- [ ] **Step 5: Final commit if needed**

If final verification required fixes:

```bash
git add <changed-files>
git commit -m "fix: stabilize database domain conventions"
```

If all tasks already committed their changes, skip this step.

---

## Execution Notes

- Keep schema files coarse. Do not create a separate Prisma file for OAuth after this plan.
- Do not create repositories for Better Auth mechanism tables unless a product requirement justifies bypassing the default Better Auth API surface.
- Repositories should generate prefixed IDs for app-owned tables rather than relying on Prisma defaults when the model uses a prefixed string ID.
- Do not run `prisma migrate dev` for the OAuth schema merge alone. Moving unchanged models between Prisma schema files should not create a database migration.
- If `generateId` causes a Better Auth runtime issue for a plugin model name not covered in `better-auth-id.ts`, add the observed model name to `betterAuthModelIdPrefixes` and add a test case for it.

