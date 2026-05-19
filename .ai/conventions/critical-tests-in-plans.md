# Critical Tests in Plans

When creating implementation plans or spec documents (in docs/superpowers/), always include a "Critical Tests" section that identifies the highest-value unit tests for the feature.

Focus on:
- Boundary conditions and edge cases
- Integration points between components
- Failure modes and error paths
- State transitions

These are the tests that, if they pass, give the most confidence the feature works correctly. Avoid listing trivial happy-path assertions.

Favor unit tests that can run quickly over other types of tests. 

Avoid adding low value tests.

List test file paths colocated beside implementation (for example `src/guards.test.ts`). Never plan or add `__tests__` folders — see [`colocated-tests.md`](./colocated-tests.md).

This section should appear in both spec documents and implementation plans, before the task breakdown.
