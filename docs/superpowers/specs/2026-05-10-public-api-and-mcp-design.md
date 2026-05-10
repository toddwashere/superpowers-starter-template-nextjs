# Public API, MCP Server & API Key Management Design

## Overview

This design covers three interconnected features:

1. **Public REST API** (`apps/public-api/`) — A Hono-based API server for third-party integrations, authenticated via API keys
2. **Public MCP Server** (`apps/public-mcp/`) — A Hono-based MCP server for AI agent integrations, with dual auth (API key + session pass-through)
3. **Dashboard API Key Management** — UI in the dashboard for creating, viewing, and revoking API keys, plus an MCP test panel and AI chat feature

All three share a unified permission model and API key infrastructure managed through BetterAuth's `@better-auth/api-key` plugin, with shared logic living in `packages/auth/`.

## Key Decisions

- **Infrastructure-first**: Ships with a single "who am I" example resource/tool. Developers add domain resources as they build features.
- **Hono** for both `public-api/` and `public-mcp/`. Lightweight, fast, first-class OpenAPI support.
- **Both org-owned and user-owned API keys** via BetterAuth's multiple configuration feature.
- **Single key type** works for both REST API and MCP server. Permissions on the key determine access regardless of which server is hit.
- **Resource-level read/write permissions** (e.g., `{ contacts: ["read", "write"] }`). Consistent between internal org permissions and API key permissions.
- **Session pass-through** for dashboard-to-MCP communication. No hidden keys.
- **Schema additions go into `auth.prisma`**. API keys are an auth domain concern.
- **Test files colocated** alongside the files they test (e.g., `verify.ts` / `verify.test.ts`). No `__tests__/` folders.

---

## 1. Package Layer: `packages/auth/` Extensions

### BetterAuth API Key Plugin

The existing `auth.ts` gains the `@better-auth/api-key` plugin with two configurations:

- **`org-keys`** — `references: "organization"`, prefix `sk_org_`, for org-level integrations
- **`user-keys`** — `references: "user"`, prefix `sk_user_`, for personal keys

Both share the same permission vocabulary and a default rate limit (configurable per key at creation time).

Configuration in `auth.ts`:

```typescript
import { apiKey } from "@better-auth/api-key";

export const auth = betterAuth({
  // ...existing config...
  plugins: [
    organization({ ac, roles: { owner: permissions.owner, admin: permissions.admin, member: permissions.member } }),
    admin(),
    apiKey([
      {
        configId: "org-keys",
        defaultPrefix: "sk_org_",
        references: "organization",
        enableMetadata: true,
        rateLimit: { enabled: true, maxRequests: 1000, timeWindow: 1000 * 60 * 60 },
      },
      {
        configId: "user-keys",
        defaultPrefix: "sk_user_",
        references: "user",
        enableMetadata: true,
        rateLimit: { enabled: true, maxRequests: 1000, timeWindow: 1000 * 60 * 60 },
      },
    ]),
  ],
});
```

### Public API Permission Vocabulary

New file `src/api-keys/permissions.ts`:

```typescript
export const publicApiPermissions = {
  account: ["read"],
  // Future resources added here as features are built:
  // contacts: ["read", "write"],
  // orders: ["read", "write"],
} as const;

export type PublicApiResource = keyof typeof publicApiPermissions;
export type PublicApiAction = (typeof publicApiPermissions)[PublicApiResource][number];
```

This is separate from the org-internal `statement` in `permissions.ts` (which controls who can manage keys, members, etc.). The public API vocabulary controls what an API key can access.

### Verification Helpers

New file `src/api-keys/verify.ts` — framework-agnostic functions:

- **`verifyApiKey(key, requiredPermissions?)`** — Calls `auth.api.verifyApiKey()`. Returns the key context or throws with a structured error.
- **`resolveApiKeyContext(key)`** — Verifies and returns a structured context object with `orgId`, `userId`, `ownerType`, and `permissions` for downstream data scoping.

### Updated AC Statement

The existing `permissions.ts` statement gets the `apiKey` actions updated to match what BetterAuth's API key plugin expects for org-key management: `["create", "read", "update", "delete"]` (currently has `["create", "revoke"]`).

### Subpath Export

`packages/auth/package.json` gets a new export:

- `@workspace/auth/api-keys` → `src/api-keys/index.ts`

### Auth Client Update

`auth-client.ts` gains `apiKeyClient()` from `@better-auth/api-key/client` so the dashboard can call API key management endpoints.

---

## 2. Public API App: `apps/public-api/`

### App Structure

```
apps/public-api/
├── src/
│   ├── index.ts              # Hono app entry, server startup
│   ├── middleware/
│   │   ├── api-key-auth.ts   # Hono middleware wrapping auth package verification
│   │   ├── rate-limit.ts     # Rate limit response handling (BetterAuth does the counting)
│   │   └── org-scope.ts      # Extracts orgId from verified key, sets context
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── index.ts      # v1 router, mounts all resource routes
│   │   │   └── account.ts    # "who am I" endpoint: GET /v1/account
│   │   └── docs.ts           # OpenAPI JSON + Scalar interactive docs
│   └── lib/
│       ├── context.ts        # Hono context type with apiKeyContext
│       └── errors.ts         # Standardized error responses (401, 403, 429, etc.)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Routing & Versioning

The API is versioned under `/v1/`. The starter ships with one route:

- **`GET /v1/account`** — Returns the authenticated identity: key name, owner type (org/user), org details if org-owned, user details if user-owned, permissions on the key.

### API Documentation

Routes are defined with `@hono/zod-openapi`, so the OpenAPI spec is generated from the route definitions themselves. No separate doc to maintain.

- **`GET /openapi.json`** — Raw OpenAPI 3.1 JSON spec
- **`GET /docs`** — Scalar interactive API reference rendered from the OpenAPI spec. Developers can see all endpoints, try them, and view request/response examples.

Adding a new endpoint is self-documenting: define Zod schemas, register with `@hono/zod-openapi`, and it appears in both the spec and the interactive docs automatically.

### Auth Middleware Flow

Every request to `/v1/*` goes through:

1. **`api-key-auth`** — Reads `x-api-key` header, calls `verifyApiKey()` from `@workspace/auth/api-keys`. Rejects with 401 if missing/invalid, 429 if rate-limited. On success, sets the resolved key context (orgId, userId, ownerType, permissions) on Hono's context.
2. **`org-scope`** — For org-owned keys, extracts the orgId and makes it available to all downstream handlers for data scoping.

Individual route handlers check permissions as needed:

```typescript
app.get("/v1/contacts", requirePermission({ contacts: ["read"] }), async (c) => {
  const { orgId } = getApiKeyContext(c);
  const contacts = await contactRepo.listByOrg(orgId);
  return c.json({ data: contacts });
});
```

### Error Response Format

Standardized JSON error responses:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

Codes: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `RATE_LIMITED` (429), `NOT_FOUND` (404), `VALIDATION_ERROR` (422), `INTERNAL_ERROR` (500).

### Server Startup

Standalone Node.js process via `tsx` in dev, compiled for production. Configurable port (default `PUBLIC_API_PORT=4100`). Added to `turbo.json` for `dev`, `build`, `type-check` tasks.

---

## 3. Public MCP Server: `apps/public-mcp/`

### App Structure

```
apps/public-mcp/
├── src/
│   ├── index.ts              # Hono app entry, MCP transport setup, server startup
│   ├── middleware/
│   │   ├── mcp-auth.ts       # Dual auth: x-api-key OR session pass-through
│   │   └── org-scope.ts      # Same pattern as public-api
│   ├── tools/
│   │   ├── registry.ts       # Tool registry mapping tool names → permission requirements
│   │   └── account.ts        # "who am I" tool implementation
│   └── lib/
│       ├── context.ts        # Auth context types shared across tools
│       ├── errors.ts         # MCP error formatting
│       └── permissions.ts    # Tool → required permissions mapping
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### MCP Transport

Uses `@modelcontextprotocol/sdk` with Streamable HTTP transport over Hono. The MCP endpoint lives at `POST /mcp` (JSON-RPC requests), `GET /mcp` (SSE streaming), and `DELETE /mcp` (session teardown).

### Dual Auth Mode

The auth middleware supports two modes, checked in order:

1. **API key** (`x-api-key` header) — For external third-party clients. Verified via `verifyApiKey()` from `@workspace/auth/api-keys`. Permissions on the key determine which tools are accessible.
2. **Session pass-through** (`Authorization: Bearer <session-token>` or session cookie) — For dashboard-originated requests. Verified via `auth.api.getSession()`. The user's active org (from `session.activeOrganizationId`) and org role are resolved. Org role is mapped to public API permissions: `owner` and `admin` get full read/write on all resources; `member` gets read-only. This mapping is defined in a shared function in `packages/auth/src/api-keys/` so it can be customized.

If neither is present, returns 401.

### Tool Permission Enforcement

Each tool declares its required permissions in the registry:

```typescript
export const toolPermissions = {
  "account-info": { account: ["read"] },
  // Future:
  // "list-contacts": { contacts: ["read"] },
  // "create-contact": { contacts: ["write"] },
} as const;
```

Before a tool executes, the MCP server checks that the authenticated key/session has the required permissions. If not, the tool call returns an MCP error at the JSON-RPC level.

### Starter Tool

**`account-info`** — Returns the authenticated identity (same data as REST `GET /v1/account`). Demonstrates the full flow: auth verification, permission check, data retrieval, MCP response formatting.

### Server Startup

Standalone Node.js process, configurable port (default `PUBLIC_MCP_PORT=4200`). Added to `turbo.json` alongside `public-api`.

---

## 4. Dashboard Features

### API Key Management — Org Settings

New settings page at `/{org-slug}/settings/api-keys`. Accessible to org owners and admins (requires `apiKey: ["read"]` or higher).

**Key list view:**

- Table showing all org-owned API keys: name, prefix (masked key), created date, last used, status (active/expired), permissions summary
- Create key button (requires `apiKey: ["create"]`)
- Revoke action per key (requires `apiKey: ["delete"]`)

**Create key dialog:**

- Name field
- Permission checkboxes — one row per resource in the public API vocabulary, with read/write toggles
- Optional expiration (never, 30 days, 90 days, 1 year, custom)
- On creation, shows the full key once with a copy button and a warning that it won't be shown again

**Connection snippets:**

When viewing a key, a "Connect" section shows copyable configuration for popular tools, dynamically inserting the key prefix and server URL:

- Claude Desktop / Claude Code (`claude_desktop_config.json`)
- Cursor (`.cursor/mcp.json`)
- OpenAI Python SDK
- cURL (REST API)

Snippets are template-driven — app name, URL, and key prefix are injected from config and the key record. Developers can customize or add snippets for other tools.

### API Key Management — Account Settings

New section in the existing account settings page at `/account` for personal API keys.

- Same UI pattern as org keys but scoped to the user
- Any user can create personal keys (no org permission required)
- Personal keys are tied to the user's identity. When a user-owned key hits an org-scoped endpoint, the request must also include an `x-org-id` header (or query parameter) to specify which org to operate on. The middleware verifies the user is a member of that org before proceeding. If omitted and the user belongs to exactly one org, it defaults to that org.

### MCP Test Panel

New page at `/{org-slug}/settings/api-keys/mcp-test` (or a tab within the API keys page). Available to org admins.

- Dropdown to select an existing API key to test with
- List of available MCP tools (fetched from the MCP server's tool list)
- Click a tool to see its input schema, fill in parameters, and execute it
- Shows the raw JSON-RPC response

### AI Chat Feature

Chat panel accessible from the org sidebar ("AI Assistant" nav item). Uses the MCP server via session pass-through.

- Simple chat interface — message input, conversation history
- Dashboard backend proxies MCP calls to `public-mcp/` using the user's session token
- Tool calls surfaced in chat as expandable result cards
- LLM provider integration is a configuration point for developers to fill in. The infrastructure for calling MCP tools and displaying results is what ships.

### Navigation Updates

- Org settings sidebar: add "API Keys" under Settings (alongside General, Members, Billing)
- Org main sidebar: add "AI Assistant" as a nav item (with a config toggle so developers can enable/disable)

### Feature File Structure

```
apps/dashboard/features/api-keys/
├── ui/
│   ├── api-keys-page-content.tsx       # Org API keys list + create
│   ├── api-key-create-modal.tsx        # Create key dialog with permission picker
│   ├── api-key-table.tsx               # Key list table
│   ├── api-key-connect-snippets.tsx    # Connection config snippets
│   ├── mcp-test-page-content.tsx       # MCP tool test panel
│   └── personal-api-keys-section.tsx   # Account settings section
├── data/
│   ├── api-key-actions.ts              # Server actions for CRUD
│   └── api-key-types.ts               # Zod schemas for key data

apps/dashboard/features/ai-chat/
├── ui/
│   ├── ai-chat-page-content.tsx        # Chat page
│   ├── chat-message.tsx                # Message display component
│   └── tool-result-card.tsx            # Expandable tool result
├── data/
│   ├── ai-chat-actions.ts             # Server actions proxying MCP calls
│   └── ai-chat-types.ts              # Message/tool types
```

---

## 5. Database Schema

BetterAuth's `@better-auth/api-key` plugin manages its own `ApiKey` table. After installing the plugin and running `npx auth generate`, the schema additions go into the existing `packages/database/prisma/auth.prisma` file, alongside the other Better Auth models. API keys are an auth domain concern.

The generated model includes:

- `id`, `key` (hashed), `name`, `prefix` (visible portion)
- `configId` — distinguishes `org-keys` vs `user-keys`
- `referenceId` — the owner ID (org ID or user ID depending on config)
- `permissions` — JSON field storing the `Record<string, string[]>`
- `enabled`, `expiresAt`, `createdAt`, `lastRequest`
- Rate limit fields: `rateLimitEnabled`, `rateLimitMax`, `rateLimitTimeWindow`, `requestCount`, `lastRefillAt`
- `remaining`, `refillAmount`, `refillInterval` (for usage-cap keys)
- `metadata` — optional JSON for developer-defined data

No custom models needed beyond what the plugin generates. The plugin handles all CRUD internally.

---

## 6. Data Flow

### External Client → Public API

```
Client (x-api-key: sk_org_...)
  → Hono middleware: extract key, call verifyApiKey()
  → BetterAuth validates key, checks rate limit, returns key context
  → Middleware sets orgId/userId/permissions on Hono context
  → Route handler checks required permissions
  → Handler calls domain repos scoped to orgId
  → Returns JSON response
```

### External Client → MCP Server

```
Client (x-api-key: sk_org_...)
  → Hono receives POST /mcp (JSON-RPC)
  → Auth middleware: extract key, call verifyApiKey()
  → MCP SDK processes JSON-RPC, dispatches to tool handler
  → Tool handler checks permissions from registry
  → Handler calls domain repos scoped to orgId
  → Returns MCP tool result
```

### Dashboard → MCP Server (Session Pass-Through)

```
User in dashboard → clicks in AI chat or MCP test panel
  → Next.js server action receives request with user's session
  → Server action calls public-mcp with session token in Authorization header
  → MCP auth middleware: detects Bearer token, calls auth.api.getSession()
  → Resolves user, active org, org role → maps role to permissions
  → MCP tool executes with user's org-scoped permissions
  → Result returned to dashboard → displayed in chat/test panel
```

### API Key Lifecycle

```
Org admin in dashboard
  → Creates key via server action (requireOrgPermission apiKey:create)
  → auth.api.createApiKey() with org config, permissions, rate limits
  → Key displayed once → user copies it
  → Key used by external clients against public-api and/or public-mcp
  → Admin can view key list, see last-used timestamps
  → Admin revokes key → auth.api.deleteApiKey()
  → Subsequent requests with that key get 401
```

### Shared Permission Flow

```
packages/auth/src/api-keys/permissions.ts
  ↓ defines public API vocabulary: { account: ["read"], ... }
  ↓
  ├── apps/public-api/ imports → route-level requirePermission() checks
  ├── apps/public-mcp/ imports → tool registry permission mapping
  └── apps/dashboard/ imports → permission checkboxes in key creation UI
```

Single source of truth. Add a resource to the vocabulary, and it's available everywhere.

---

## 7. Testing Strategy

All tests use Vitest. Test files are colocated alongside the files they test (e.g., `verify.ts` / `verify.test.ts`).

### Critical Tests

**`packages/auth/` — API key verification (`src/api-keys/verify.test.ts`):**

- Valid org-owned key is accepted and returns correct org context
- Valid user-owned key is accepted and returns correct user context
- Expired key is rejected with appropriate error
- Revoked/disabled key is rejected
- Invalid/malformed key is rejected
- Missing `x-api-key` header returns 401

**`packages/auth/` — Permission enforcement (`src/api-keys/permissions.test.ts`):**

- Key with `{ account: ["read"] }` passes permission check for `{ account: ["read"] }`
- Key with `{ account: ["read"] }` fails permission check for `{ account: ["write"] }`
- Key with no permissions fails all permission checks
- Permission vocabulary types enforce only valid resource/action combinations

**`apps/public-api/` — Org scoping (`src/routes/v1/account.test.ts`):**

- Org-owned key can only access data belonging to its org
- User-owned key resolves to the correct user and their org memberships
- Key for org A cannot access org B's data

**`apps/public-api/` — Rate limiting (`src/middleware/rate-limit.test.ts`):**

- Requests within the limit succeed
- Request exceeding the limit returns 429 with retry information

**`apps/public-mcp/` — Dual auth (`src/middleware/mcp-auth.test.ts`):**

- Request with valid `x-api-key` authenticates as external client
- Request with valid session token authenticates as dashboard user
- Request with neither gets 401
- Session-authenticated user's permissions come from org role, not an API key

### High-Value Tests

**`apps/public-api/` — Route tests (`src/routes/v1/account.test.ts`):**

- `GET /v1/account` returns correct identity for org-owned key
- `GET /v1/account` returns correct identity for user-owned key
- `GET /docs` returns valid OpenAPI JSON
- Error responses follow the standardized format

**`apps/public-mcp/` — Tool tests (`src/tools/account.test.ts`):**

- `account-info` tool returns correct data for API key auth
- `account-info` tool returns correct data for session auth
- Tool with insufficient permissions returns MCP error (not transport error)
- Tool registry correctly maps tools to required permissions

**`apps/dashboard/` — API key management (`features/api-keys/data/api-key-actions.test.ts`):**

- Org admin can create org key with specified permissions
- Org member without `apiKey: ["create"]` permission is rejected
- Any user can create a personal key
- Revoking a key makes it immediately unusable (verified end-to-end)
- Key list returns only keys for the current org/user (no cross-org leakage)

**`packages/auth/` — Permission vocabulary consistency (`src/api-keys/permissions.test.ts`):**

- The public API permission vocabulary used by `public-api/` and `public-mcp/` is the same (imported from the same source)
- The AC statement for org-level key management has all required actions (`create`, `read`, `update`, `delete`)
