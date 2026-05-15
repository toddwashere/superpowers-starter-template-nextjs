# Extended Components Design

**Date:** 2026-05-15
**Status:** Approved for implementation planning
**Scope:** Shared UI package and dashboard dev UI preview

## Overview

Port a selected set of reusable UI components from another starter project into `packages/ui`, adapt them to this repository's current conventions, add focused colocated tests, and expose them on the dashboard dev UI page under a new `Extended Components` section.

The goal is to expand the shared component library beyond the current baseline component set without overwriting working equivalents or carrying source-project assumptions that do not fit this starter.

## Goals

- Make the selected components reusable through `@workspace/ui/components/*`.
- Preserve existing working shared UI components when there is a direct match.
- Adapt imported components to this repo's React, Radix, Tailwind, and package conventions.
- Add high-value unit tests next to the shared UI code.
- Add a dev UI preview section named `Extended Components` with representative examples for every newly added component.
- Add richer interactive previews for stateful components where interaction is needed to verify behavior.

## Non-Goals

- Do not replace existing working direct matches such as the current toast or theme toggle components.
- Do not introduce starter-project-specific assets, routes, domain language, or data assumptions.
- Do not add broad snapshot tests or low-value visual tests.
- Do not redesign the whole dev UI page or refactor unrelated design-system sections.

## Component Scope

Expected new shared components:

- `annotated`
- `combobox`
- `combobox-autocomplete`
- `data-table`
- `data-table-filter`
- `date-picker`
- `edit-button`
- `empty-state`
- `empty-text`
- `image-dropzone`
- `info-button-with-tooltip`
- `input-currency`
- `input-password`
- `input-search`
- `input-with-adornments`
- `page`
- `radio-card`
- `spinner`
- `tabs-with-content`
- `tag-input`
- `theme-switcher`

Components with solid direct matches already in this repo stay in place. If a listed file is a direct match and the current implementation already works well, skip the port. Small behavior merges are allowed only when the improvement is clear, local, and compatible with existing consumers.

## Architecture

New reusable components live in `packages/ui/src/components`. They are exported through the package's existing wildcard export, so consumers import them as `@workspace/ui/components/<component-name>`.

Internal package imports should follow the current package style. Component code should use the existing `cn` helper, current shared primitives, and current component APIs instead of preserving older source imports. Where a source component references a primitive that already exists in `packages/ui`, use the local primitive rather than copying another copy.

The dashboard remains the preview surface. `apps/dashboard/app/(dev)/dev/ui/page.tsx` continues to render `DevUiPageContent`, and the dev helper UI adds a new `Extended Components` table-of-contents item and section. Demo state should live in dashboard dev-helper components, not in the shared UI package.

## Dependency Strategy

Add only dependencies required by the components that are actually ported. Expected additions to `packages/ui` are:

- `@tanstack/react-table` for data table components.
- `react-dropzone` for image dropzone behavior.

Existing dependencies such as `cmdk`, `date-fns`, `react-day-picker`, `next-themes`, `sonner`, and Radix primitives should be reused from the current package when compatible.

## Component Adaptation

The port is compatibility-focused rather than literal. Preserve generally useful public APIs, but remove details that only made sense in another starter project.

Specific adaptation expectations:

- Replace source relative imports with this package's current import style.
- Keep existing direct matches instead of overwriting them.
- Remove hard-coded app-specific empty-state asset paths. `EmptyState` should work with caller-provided icons, images, text, and actions.
- Adapt `tabs-with-content` to the current tabs API and variants instead of relying on unavailable underlined-tab exports.
- Keep `theme-switcher` as additive because it provides a different three-state segmented control than the existing toggle.
- Ensure date-picker code matches the current `react-day-picker` version used here.
- Keep dropzone behavior local to `ImageDropzone`; demos should not perform uploads.
- Avoid direct app-domain imports from shared UI components.

## Dev UI Preview

Add a new dev UI section named `Extended Components`.

Every newly added component gets a representative example. Stateful or complex components get interactive demos with local state:

- Combobox and autocomplete: selectable options, filtering, empty state, loading or disabled state where useful.
- Data table and table filter: mock rows, sorting/header controls, pagination if practical, grouped and ungrouped filters.
- Date picker and range picker: selected date/range state.
- Image dropzone: accepted and rejected file state with no upload side effects.
- Inputs: search debounce and clear, password visibility toggle, currency/adornment examples.
- Tag input: add, remove, duplicate prevention, max tag behavior.
- Page, annotated, empty state, empty text, spinner, edit button, radio cards, tabs with content, info tooltip, and theme switcher: concise representative examples.

The new section should be easy to inspect without bloating the existing baseline sections.

## Error Handling And States

Components should expose normal UI states rather than throwing for expected empty input:

- Empty option lists show empty messages.
- Loading selectors show loading affordances.
- Disabled inputs and selectors preserve disabled behavior.
- Dropzone file rejections call `onError` and allow consumers to render the message.
- Table/filter demos show empty, selected, and cleared states.
- Components that require caller data should document that through prop types and examples.

## Critical Tests

High-value tests live next to the shared UI code in `packages/ui`. The test setup should be the lightest practical Vitest setup for component tests.

Prioritize these tests:

- `input-search`: debounced `onChange`, clear button behavior, cleanup of pending debounce, and controlled value sync.
- `input-password`: toggles between password and text, keeps focus-safe mouse behavior, and respects disabled state.
- `tag-input`: delimiter handling, duplicate prevention, max tag behavior, remove behavior, and invalid min/max length boundaries.
- `combobox` and `combobox-autocomplete`: local filtering, option selection, clear selection where supported, empty state, keyboard selection, and controlled open behavior where supported.
- `data-table-filter`: grouped and ungrouped selection changes, count badge behavior, clear selection, and option search values.
- `image-dropzone`: accepted drop calls `onDrop`, rejected drop calls `onError`, disabled state blocks interaction.
- `input-with-adornments` and `input-currency`: adornment rendering, forwarded props, and ref compatibility if simple enough to test without brittle DOM assumptions.

Avoid low-value tests that only assert static text renders for every component.

## Verification

Implementation should pass:

- `pnpm type-check`
- `pnpm lint`
- Targeted `packages/ui` tests
- Dashboard validation sufficient to cover the changed dev UI preview

If adding the `packages/ui` test setup changes workspace scripts, keep it consistent with the existing monorepo script style.

## Implementation Notes For Planning

The implementation plan should split work into small reviewable steps:

- Add package dependencies and test setup.
- Port simple stateless components first.
- Port input components and tests.
- Port selection/date/table/dropzone components and tests.
- Add the `Extended Components` dev UI section.
- Run verification and address integration issues.

The plan should continue to describe the source only as another starter project.
