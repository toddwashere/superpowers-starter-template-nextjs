---
name: add-data-model-to-database
description: Add or change Prisma data models and repository files using this project's centralized schema and domain-owned repository conventions. Use when adding database tables, Prisma models, CRUD repositories, model repos, CRM models, billing models, auth-related models, or changing database access patterns.
---

# Add Data Model To Database

## Purpose

Use this skill whenever adding, changing, or removing persisted data models. The project uses centralized Prisma schema files, but domain-owned repository files.

## Core Rule

Schema is centralized. Repositories are domain-owned. Apps should never import Prisma directly.

## Before Editing

1. Identify the domain that owns the model: `auth`, `crm`, `billing`, or another package.
2. Read the relevant plan section in `plans/saas-starter-template-plan.md`, especially Data Management Patterns.
3. Check existing schema files in `packages/database/prisma/`.
4. Check existing repos in the owning package's `src/models/` folder.
5. If the model does not clearly fit an existing domain, ask before creating a new schema file or package.

## Prisma Schema Location

Keep Prisma schema centralized in `packages/database/prisma/`. Split it into a small number of coarse domain files:

- `base.prisma` - Prisma generator, datasource, and shared enums.
- `auth.prisma` - Everything Better Auth gives us, including core auth, organization, admin, and optional 2FA schema.
- `crm.prisma` - CRM-style reusable models such as contacts, companies, street addresses, and related records.
- `billing.prisma` - Stripe subscriptions, products, prices, invoices, app billing state, and payment-provider integration records such as Stripe and Square.
- `domain.prisma` - Any other domain specific items that do not fit in the other files should go here.

If none of the existing `*.prisma` schema files makes sense, put it in the `domain.prisma` file

Do not put Prisma schema inside domain packages such as `packages/auth` or `packages/billing`. Domain packages own behavior and repositories, not migrations or generated Prisma schema.

## Repository Location

Use a `src/models/` folder inside the owning domain package. Repository files use `modelname-repo.ts` naming.

Examples:

- `packages/crm/src/models/contact-repo.ts`
- `packages/crm/src/models/address-repo.ts`
- `packages/billing/src/models/subscription-repo.ts`
- `packages/auth/src/models/member-repo.ts`

`packages/database` should expose the Prisma client, generated types, transactions, seeds, migrations, and shared DB utilities. It should not become a catch-all business logic or repository package.

## Repository Pattern

All database table access should go through the owning model repository or a domain service that calls that repository.

Prefer focused functions over generic base repositories:

```ts
export async function getContactById(...)
export async function listContactsForOrganization(...)
export async function createContact(...)
export async function updateContact(...)
export async function archiveContact(...)
```

Avoid generic abstractions like `BaseRepository<T>` unless the codebase already has a proven local pattern for it.

Any model with an `orgId` property should typically include `orgId` passed into the repo method.
For example:

```ts
getAllContactsForOrg(orgId);
updateContact(contactId, orgId, dataToUpdate);
getContactById(contactId, orgId);
```

Keeping these to organization scope should help prevent accidental data leakage, as we should require orgId at the authorization layer (typically in nextJS actions or at http handlers)

## Better Auth Tables

Better Auth owns many auth tables through its adapter and APIs. Prefer Better Auth APIs for operations Better Auth owns, such as sessions, invitations, member role changes, and verification flows.

Only create repos for Better Auth-backed tables when the app has a clear need for direct domain access, such as:

- `packages/auth/src/models/user-repo.ts`
- `packages/auth/src/models/organization-repo.ts`
- `packages/auth/src/models/member-repo.ts`
- `packages/auth/src/models/invitation-repo.ts`

Avoid direct app CRUD repos for internal tables like `account`, `verification`, or `twoFactor` unless there is a specific product requirement.

## Implementation Checklist

When adding a model:

1. Add or update the Prisma model in the correct centralized schema file.
2. Add indexes, unique constraints, and relations needed by actual access patterns.
3. Add the domain-owned repo in `packages/<domain>/src/models/modelname-repo.ts`.
4. Keep organization scoping explicit for tenant-owned data.
5. Export repo functions through the package's public API if other packages/apps need them.
6. Add seed data only when the model is part of the default starter experience.
7. Add tests for repository behavior, especially organization scoping and unique constraints.
8. Run the relevant verification commands before claiming completion.

## Boundary Rules

- `packages/database`: Prisma schema, generated client, migrations, seeds, transactions, shared DB utilities.
- `packages/auth`: Better Auth config, permissions, guards, session helpers, auth-owned repos.
- `packages/crm`: contacts, companies, addresses, CRM-owned repos and services.
- `packages/billing`: subscriptions, products, invoices, payment-provider integrations, billing-owned repos and services.
- `packages/domain`: anything else that does not fit in other shema files, such as domain specific tables for the apps.
- `apps/*`: UI, routes, server actions, and app composition. Apps call domain package APIs rather than Prisma directly.

## Naming

Use lowercase kebab-case filenames:

- `contact-repo.ts`
- `street-address-repo.ts`
- `subscription-repo.ts`
- `member-repo.ts`

Use clear exported function names:

- `get<Model>ById`
- `list<Models>ForOrg`
- `create<Model>`
- `update<Model>`
- `archive<Model>` or `delete<Model>` depending on the domain deletion policy
