# Phase 1.1: Core Foundation — Design Spec

## Goal

Set up the TurboRepo monorepo structure from scratch with two Next.js 16 apps (`dashboard`, `www`), shared tooling configs, and lightweight structural packages. This phase produces a working, buildable, lintable monorepo with bare-minimum placeholder UI — no styling, no database, no auth.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo tool | TurboRepo + pnpm | Plan specifies this; industry standard for Next.js monorepos |
| Package scope | `@workspace/` | Matches pnpm workspace protocol and skill references |
| Tooling structure | Single `@workspace/tooling` package | Matches plan's `tooling/` layout; atomic config changes |
| Next.js version | 16.x (latest stable: 16.2.4) | Plan specifies Next.js 16; confirmed stable and LTS |
| React version | 19.x | Required by Next.js 16 |
| TypeScript version | 5.7+ | Plan specifies; strict mode enabled |
| ESLint config format | Flat config (eslint.config.js) | Modern standard, recommended by ESLint |
| Build strategy for packages | No compile step; apps transpile via `transpilePackages` | Standard Next.js monorepo approach; avoids per-package build pipelines |
| Scaffold method | From scratch | Full control over every file; matches plan exactly |
| Dashboard UI | Bare minimum placeholder | Styling comes in Phase 1.2; no reason to build unstyled shells |

## Monorepo Structure

```
/
├── package.json                    # Root workspace — scripts, devDeps (turbo, typescript)
├── pnpm-workspace.yaml             # Declares apps/*, packages/*, tooling/
├── turbo.json                      # Task pipeline: build, dev, lint, type-check
├── .npmrc                          # pnpm settings
├── .gitignore                      # Updated for TurboRepo, Next.js, node_modules
│
├── tooling/                        # @workspace/tooling — shared dev configs
│   ├── package.json
│   ├── eslint/
│   │   ├── base.js                 # Base ESLint flat config
│   │   ├── react.js                # Adds React + JSX rules
│   │   └── nextjs.js               # Extends react, adds Next.js plugin
│   ├── prettier/
│   │   └── index.js                # Shared Prettier config
│   └── typescript/
│       ├── base.json               # Strict TS base
│       ├── nextjs.json             # Extends base for Next.js apps
│       └── react-library.json      # Extends base for library packages
│
├── apps/
│   ├── dashboard/                  # @apps/dashboard — main SaaS app
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.js
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── features/
│   │       └── dashboard/
│   │           └── ui/
│   │               └── dashboard-page-content.tsx
│   │
│   └── www/                        # @apps/www — marketing site
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── eslint.config.js
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── features/
│           └── marketing/
│               └── ui/
│                   └── home-page-content.tsx
│
├── packages/
│   ├── common/                     # @workspace/common — shared utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── routes/                     # @workspace/routes — URL builder helpers
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   │
│   └── ui-common/                  # @workspace/ui-common — empty shell for Phase 1.2
│       ├── package.json
│       └── tsconfig.json
```

## Root Configuration

### `package.json`

- `"private": true`
- `"packageManager"`: pinned pnpm version via corepack
- Scripts delegate through `turbo run`: `dev`, `build`, `lint`, `type-check`, `format`, `clean`
- DevDependencies: `turbo`, `typescript`

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling"
```

### `turbo.json`

| Task | dependsOn | Outputs | Cache |
|------|-----------|---------|-------|
| `build` | `^build` | `.next/**`, `dist/**` | yes |
| `dev` | `^build` | — | no (persistent) |
| `lint` | `^build` | — | yes |
| `type-check` | `^build` | — | yes |
| `clean` | — | — | no |

### `.npmrc`

```
auto-install-peers=true
strict-peer-dependencies=false
```

## Tooling Package

### `@workspace/tooling`

Single package exporting shared configs. Apps and packages reference these via thin local config files.

**TypeScript** (`tooling/typescript/`):

- `base.json` — strict mode, ES2022 target, `bundler` module resolution, `skipLibCheck`, `noUncheckedIndexedAccess`, `forceConsistentCasingInFileNames`
- `nextjs.json` — extends base, adds `jsx: preserve`, `module: esnext`, Next.js plugin, `@/*` path alias
- `react-library.json` — extends base, adds `jsx: react-jsx`, `declaration: true`, `declarationMap: true`

**ESLint** (`tooling/eslint/`):

Using ESLint flat config format.

- `base.js` — TypeScript parser, core recommended rules, import ordering
- `react.js` — extends base, adds React and React Hooks plugins
- `nextjs.js` — extends react, adds `@next/eslint-plugin-next`

**Prettier** (`tooling/prettier/`):

- `index.js` — `semi: true`, `singleQuote: false`, `tabWidth: 2`, `trailingComma: "all"`, `printWidth: 100`

### Config consumption pattern

Each app/package has a thin config that extends the shared one:

```js
// apps/dashboard/eslint.config.js
import nextjsConfig from "@workspace/tooling/eslint/nextjs";
export default nextjsConfig;
```

```jsonc
// apps/dashboard/tsconfig.json
{ "extends": "@workspace/tooling/typescript/nextjs.json" }
```

## Next.js Apps

### `apps/dashboard` (`@apps/dashboard`)

- Next.js 16 with App Router
- Dependencies: `next`, `react`, `react-dom`, `@workspace/common`, `@workspace/routes`
- `next.config.ts` — minimal config with `transpilePackages` for workspace packages
- `app/layout.tsx` — Server Component; sets `<html lang="en">`, `<body>`, metadata `title: "Dashboard"`
- `app/page.tsx` — sparse route file; imports and renders `DashboardPageContent`
- `features/dashboard/ui/dashboard-page-content.tsx` — `"use client"`; renders "Dashboard" heading
- Port: 4000

### `apps/www` (`@apps/www`)

- Same Next.js 16 setup
- Dependencies: `next`, `react`, `react-dom`, `@workspace/common`, `@workspace/routes`
- `app/layout.tsx` — Server Component; richer metadata with title template, description, OpenGraph placeholders
- `app/page.tsx` — sparse route file; imports and renders `HomePageContent`
- `features/marketing/ui/home-page-content.tsx` — Server Component (no `"use client"`); renders "Welcome" heading
- Port: 4001

### Key difference

Dashboard page content defaults to `"use client"` (interactive app). WWW page content defaults to RSC (static marketing). Per the `add-new-page` skill conventions.

## Shared Packages

### `packages/common` (`@workspace/common`)

- Minimal shell with `src/index.ts` barrel export (empty)
- Will hold slug generation, date helpers, invariant/assertion helpers, shared Zod utilities in later phases
- Exports TypeScript source directly; no build step

### `packages/routes` (`@workspace/routes`)

- `src/index.ts` with starter route helpers: `homePath()` → `"/"`
- Pure functions, no dependencies
- New route helpers added as pages are created in later phases

### `packages/ui-common` (`@workspace/ui-common`)

- Empty shell: `package.json` and `tsconfig.json` only
- No `src/`, no components, no dependencies
- Phase 1.2 (styling/shadcn) populates this per `01-add-styles.md`

### Build strategy

No compile step for internal packages. They export TypeScript source directly. Consuming Next.js apps transpile them via `transpilePackages` in `next.config.ts`. This is the standard approach for Next.js monorepos.

## Cleanup

- Remove existing empty `apps/app/` directory
- Remove existing empty `packages/ui/` directory
- Update `.gitignore` for TurboRepo (`.turbo/`), Next.js (`.next/`), node_modules, dist, env files

## Verification Criteria

Phase 1.1 is complete when:

1. `pnpm install` succeeds from a clean checkout
2. `pnpm build` succeeds across all packages and apps
3. `pnpm dev` starts both Next.js apps (dashboard on :3000, www on :3001)
4. `pnpm lint` passes with no errors
5. `pnpm type-check` passes with no errors
6. Both apps render their placeholder pages in a browser

## Explicitly Out of Scope

- No Tailwind, CSS, or styling (Phase 1.2)
- No database or Prisma (Phase 1.3)
- No authentication or Better Auth (Phase 1.3)
- No sidebar, navigation, or app shell UI
- No tests or test framework setup
- No Docker or CI/CD
- No route groups like `(dashboard)` or `(organization)/[org-slug]`
