# Colocated Unit Tests

When adding or moving unit tests in this monorepo:

1. **Never create `__tests__` or `__test__` directories.** Do not place tests in a separate test folder hierarchy.
2. **Colocate test files next to the code they exercise.** Use the same basename with a `.test.ts` (or `.test.tsx`) suffix — for example `guards.ts` and `guards.test.ts` in the same directory.
3. **One primary implementation file per test file** when practical. If a single test file covers multiple small modules (for example, related templates in one folder), keep that test file in the same directory as those modules.

Vitest discovers `**/*.{test,spec}.{ts,tsx}` across the repo; no special `__tests__` include paths are required.

When creating implementation plans or specs, list colocated test paths (for example `src/guards.test.ts`), not `__tests__/guards.test.ts`.
