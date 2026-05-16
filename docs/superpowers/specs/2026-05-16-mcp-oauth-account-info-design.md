# MCP OAuth Account Info Design

**Date:** 2026-05-16  
**Status:** Approved  
**Scope:** `packages/auth`, `packages/tool-calls`, `apps/public-mcp`, `apps/dashboard`

## Overview

Add OAuth-backed MCP support for the existing `account-info` tool. The first version should prove the full external-client flow for Claude, Cursor, and similar MCP clients without expanding the tool surface beyond authenticated account context.

The implementation should use Better Auth's OAuth 2.1 Provider plugin as the OAuth protocol owner. The project should not hand-roll Dynamic Client Registration, authorization code exchange, refresh token rotation, token revocation, or OAuth consent storage when Better Auth already provides those capabilities.

## Goals

- External MCP clients can authenticate through OAuth Authorization Code + PKCE.
- Better Auth handles OAuth Provider behavior, including Dynamic Client Registration, consent, refresh tokens, revocation, expiry, and token verification.
- `apps/public-mcp` acts as an OAuth-protected MCP resource server.
- The first exposed tool remains `account-info`.
- `account-info` lives in a shared `@workspace/tool-calls` package so future MCP tools do not stay coupled to the MCP transport app.
- OAuth scopes are intentionally narrow: `account:read` for the starter tool, plus `offline_access` when a client needs refresh tokens.
- The dashboard owns user-facing login and consent UI.
- MCP requests are auditable by auth kind, user/org context, OAuth client, tool name, outcome, and timestamp.

## Non-Goals

- Do not add organization, member, invitation, billing, API-key management, or write tools in this slice.
- Do not build a custom OAuth server like the RevHawk implementation; use Better Auth OAuth Provider endpoints and data model.
- Do not require the public REST API to consume `@workspace/tool-calls` in this slice.
- Do not design a full MCP tool catalog yet.
- Do not rely on long-lived API keys as the primary external MCP auth path for new clients.

## Existing Context

The repo already has a standalone `apps/public-mcp` Node service using `@modelcontextprotocol/sdk` and Streamable HTTP transport. It currently registers one local tool, `account-info`, and resolves auth through API keys, session bearer tokens, or session cookies.

`packages/auth` already owns the Better Auth instance, organization/admin plugins, and API-key plugin configuration. The dashboard exposes API-key management and a session-backed MCP test panel. The existing public API and MCP design established `account:read` as the starter permission for "who am I" behavior.

Better Auth's OAuth Provider documentation says the newer `@better-auth/oauth-provider` plugin supports OAuth 2.1, MCP resource-server use cases, Dynamic Client Registration, consent, refresh tokens, revocation, JWT-compatible verification, and well-known metadata. This replaces the deprecated Better Auth MCP plugin.

## Architecture

The design has four layers:

1. **Auth provider layer** in `packages/auth`: configures Better Auth's OAuth Provider and JWT support.
2. **Tool definition layer** in `packages/tool-calls`: owns typed tool definitions, permission metadata, inputs, outputs, and handler contracts.
3. **MCP resource-server layer** in `apps/public-mcp`: owns HTTP transport, MCP registration, OAuth token verification, metadata endpoints, unauthorized responses, and audit logging.
4. **Dashboard user flow layer** in `apps/dashboard`: owns sign-in and consent pages for OAuth users.

This keeps protocol, transport, and tool behavior separate. `packages/tool-calls` should not import MCP SDK types or Node HTTP types. It receives a normalized tool context and returns structured data. `apps/public-mcp` adapts that structured data into MCP responses.

## Auth Provider Design

`packages/auth` should add Better Auth's OAuth Provider plugin and the JWT plugin expected by the provider docs. The plugin configuration should define:

- `loginPage`: the dashboard sign-in page.
- `consentPage`: a dashboard consent page.
- `allowDynamicClientRegistration`: enabled for MCP clients.
- `allowUnauthenticatedClientRegistration`: enabled for public MCP clients so Claude, Cursor, and similar tools can register without a pre-created client. Keep this setting isolated in auth config and documented because the Better Auth docs warn that this behavior may change as MCP standards settle.
- Supported scopes including `account:read` and `offline_access`.

The OAuth Provider should remain the source of truth for:

- Dynamic Client Registration.
- Authorization code + PKCE validation.
- Refresh token issue and rotation.
- Token revocation.
- Consent records.
- OAuth client records.
- Token expiry.

If Better Auth can issue JWT access tokens with a `resource`/audience for `apps/public-mcp`, prefer local JWT verification in the MCP server to avoid introspection on every tool call. If local JWT verification is not viable for the exact token shape, use Better Auth's resource client or `verifyAccessToken` helper according to the provider documentation.

## MCP Resource Server Design

`apps/public-mcp` should continue to expose `/mcp` as the MCP endpoint. Before handling an MCP request, it should resolve an auth context from the request:

- Preferred external path: `Authorization: Bearer <oauth-access-token>`.
- Compatibility paths: keep existing API-key and session behavior during this slice so the dashboard MCP test panel and existing tests continue to work. OAuth becomes the documented path for external MCP clients.

Unauthenticated requests should return `401` with a `WWW-Authenticate` header that points clients to the OAuth protected-resource metadata endpoint. This follows the discovery behavior used by MCP clients that initiate OAuth from a protected resource.

The MCP server should publish the required well-known metadata for resource-server use:

- OAuth protected-resource metadata for the MCP service.
- OAuth authorization-server metadata at the issuer path or a proxy route, as required by Better Auth's OAuth Provider docs.
- OpenID metadata only if the implementation uses `openid`.

The metadata should advertise the resource identifier, authorization server, supported scopes, and any client-facing values needed by Claude, Cursor, and other MCP clients.

## Tool Calls Package

Add `packages/tool-calls` as the shared home for tool definitions. For this slice it should export only `account-info`.

The package should define:

- `ToolCallContext`: normalized auth and execution context.
- `ToolDefinition`: name, description, input schema, output schema, required scopes/permissions, and handler.
- `accountInfoTool`: the starter tool.
- A registry export that lists available tools.

`ToolCallContext` should be a discriminated union so future handlers can reason about auth source without stringly typed checks:

```ts
type ToolCallContext =
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

The OAuth variant is the primary target for new MCP clients. The API-key and session variants remain supported during this slice for compatibility with the existing public MCP behavior and dashboard test panel.

## `account-info` Tool

`account-info` should have no input arguments. It returns authenticated identity and authorization context:

- `authKind`
- `userId`
- `orgId`
- `ownerType` when applicable
- `clientId` when available for OAuth
- granted OAuth scopes or API/session permissions

The tool requires `account:read`. OAuth callers satisfy this through the token scope. API-key and session callers satisfy it through the existing permission map.

The tool should not return secrets, raw access tokens, refresh tokens, session tokens, API-key values, or OAuth client secrets.

## Dashboard Consent Flow

The dashboard should own login and consent UX. For the starter tool, the consent page should clearly state that the client is requesting:

- Read account identity.
- Read current organization context.
- Maintain access if `offline_access` is requested.

If the user belongs to multiple organizations and Better Auth's OAuth flow does not already select a resource/org, the design should provide a clear org-selection step before consent is accepted. The selected organization should become the org context visible to `account-info`.

Trusted clients should not bypass consent in this starter implementation. Consent bypass can be revisited for first-party clients after the basic external flow is proven.

## Audit Trail

MCP tool calls should be logged for operational and security visibility. The audit record should capture:

- tool name
- auth kind
- user ID when available
- organization ID when available
- OAuth client ID when available
- API key ID when available
- success or failure
- error code for denied or failed calls
- timestamp

The audit log should not store request tokens, refresh tokens, API-key values, or full raw MCP payloads. For `account-info`, logging the tool name and auth context is enough.

Audit records should be persisted in a small Prisma model in the auth/database domain so support and security reviews can inspect prior MCP access. The implementation must follow the project's centralized Prisma and repository conventions.

## Error Handling

Auth failures should be explicit and client-discoverable:

- Missing or invalid OAuth bearer token returns `401`.
- `401` includes `WWW-Authenticate` with `resource_metadata`.
- Valid tokens missing `account:read` return a forbidden MCP tool result or protocol-appropriate JSON-RPC error.
- Unexpected server errors return a generic internal error to the client and detailed logs server-side.

The MCP response should not leak token validation internals, database IDs beyond the authenticated context, stack traces, or Better Auth internals.

## Critical Tests

- OAuth Provider config exposes `account:read` and `offline_access` scopes and enables Dynamic Client Registration according to the chosen config.
- Well-known protected-resource metadata returns the MCP resource identifier, authorization server, and supported scopes.
- Unauthorized MCP requests return `401` with a `WWW-Authenticate` header containing `resource_metadata`.
- MCP bearer-token verification rejects missing, malformed, expired, revoked, and insufficient-scope tokens without executing the tool.
- `account-info` executes for an OAuth context with `account:read` and returns only safe identity/context fields.
- `account-info` denies OAuth contexts that lack `account:read`.
- API-key/session compatibility maps to the same normalized `ToolCallContext` and permission check.
- The MCP registry exposes `account-info` from `@workspace/tool-calls`, not from app-local tool code.
- Audit logging records success and denied calls without storing raw credentials or token values.
- Dashboard consent behavior clearly accepts or denies requested scopes and preserves redirect safety through Better Auth's OAuth flow.

## Rollout

1. Add the OAuth Provider and JWT plugin configuration to `packages/auth`.
2. Add required Better Auth schema changes through the project's Prisma workflow.
3. Add the `@workspace/tool-calls` package with the `account-info` tool, schemas, context type, and tests.
4. Update `apps/public-mcp` to register tools from `@workspace/tool-calls`.
5. Add OAuth resource-server token verification to `apps/public-mcp`.
6. Add well-known metadata routes and `WWW-Authenticate` handling.
7. Add dashboard consent UI wired to Better Auth's OAuth Provider flow.
8. Add audit logging for MCP tool calls.
9. Keep the existing MCP test panel working through a compatibility path or update it to exercise the OAuth-backed path.
10. Verify `pnpm --filter @workspace/auth test`, `pnpm --filter @workspace/tool-calls test`, `pnpm --filter @apps/public-mcp test`, and relevant dashboard tests.

## Future Tool Ideas

After OAuth and `account-info` are stable, the next tools should remain read-only unless there is a strong workflow reason to add writes:

- `list-organizations`
- `get-active-organization`
- `list-members`
- `list-invitations`
- `get-public-api-docs`
- `capabilities`

Write tools such as `create-invitation` or `revoke-api-key` should be separate specs because they need stronger consent copy, permission checks, confirmation semantics, and audit coverage.
