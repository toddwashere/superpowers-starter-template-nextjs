# Extended Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add selected reusable components from another starter project to `packages/ui`, verify them with focused colocated tests, and preview them in the dashboard dev UI under `Extended Components`.

**Architecture:** Components live in `packages/ui/src/components` and are consumed through the existing `@workspace/ui/components/*` export pattern. Existing direct matches stay in place. Dashboard dev-helper code owns preview-only state and mock data.

**Tech Stack:** React 19, Next.js 16 dashboard app, `packages/ui`, Tailwind 4, Radix primitives via `radix-ui`, Vitest, Testing Library, `@tanstack/react-table`, `react-dropzone`.

---

## Source Alias

Use `<another-starter-project-root>` in written notes and comments. It means the absolute source root supplied by the requester in this conversation.

Component source files are under:

`<another-starter-project-root>/packages/ui/src/components/<component>.tsx`

The source filenames are:

- `annotated.tsx`
- `combobox.tsx`
- `combobox-autocomplete.tsx`
- `data-table.tsx`
- `data-table-filter.tsx`
- `date-picker.tsx`
- `edit-button.tsx`
- `empty-state.tsx`
- `empty-text.tsx`
- `image-dropzone.tsx`
- `info-button-with-tooltip.tsx`
- `input-currency.tsx`
- `input-password.tsx`
- `input-search.tsx`
- `input-with-adornments.tsx`
- `page.tsx`
- `radio-card.tsx`
- `spinner.tsx`
- `tabs-with-content.tsx`
- `tag-input.tsx`
- `theme-switcher.tsx`

Skip source files with direct working matches in this repo, including `sonner.tsx` and `theme-toggle.tsx`.

## File Structure

Create or modify these files:

- Modify: `packages/ui/package.json` — add runtime dependencies and test scripts/dev dependencies.
- Create: `packages/ui/vitest.config.ts` — jsdom Vitest config for component tests.
- Create: `packages/ui/src/components/*.test.tsx` — colocated tests for high-value component behavior.
- Create: `packages/ui/src/components/annotated.tsx` — annotated layout primitives.
- Create: `packages/ui/src/components/combobox.tsx` — generic popover command combobox.
- Create: `packages/ui/src/components/combobox-autocomplete.tsx` — generic autocomplete-oriented combobox.
- Create: `packages/ui/src/components/data-table.tsx` — table shell, headers, pagination, and bulk actions.
- Create: `packages/ui/src/components/data-table-filter.tsx` — faceted filter popover.
- Create: `packages/ui/src/components/date-picker.tsx` — date and date-range pickers.
- Create: `packages/ui/src/components/edit-button.tsx` — small edit action button.
- Create: `packages/ui/src/components/empty-state.tsx` — generic empty state.
- Create: `packages/ui/src/components/empty-text.tsx` — muted empty text helper.
- Create: `packages/ui/src/components/image-dropzone.tsx` — image dropzone wrapper.
- Create: `packages/ui/src/components/info-button-with-tooltip.tsx` — help icon with tooltip.
- Create: `packages/ui/src/components/input-currency.tsx` — numeric input with currency adornment.
- Create: `packages/ui/src/components/input-password.tsx` — password input with visibility toggle.
- Create: `packages/ui/src/components/input-search.tsx` — debounced search input with clear button.
- Create: `packages/ui/src/components/input-with-adornments.tsx` — input shell with start/end adornments.
- Create: `packages/ui/src/components/page.tsx` — page layout primitives.
- Create: `packages/ui/src/components/radio-card.tsx` — radio group card items.
- Create: `packages/ui/src/components/spinner.tsx` — spinner helpers.
- Create: `packages/ui/src/components/tabs-with-content.tsx` — tab list with icons and content.
- Create: `packages/ui/src/components/tag-input.tsx` — tag input and tag list.
- Create: `packages/ui/src/components/theme-switcher.tsx` — segmented system/light/dark theme switcher.
- Modify: `apps/dashboard/features/dev-helpers/ui/dev-ui-page-content.tsx` — add `Extended Components` TOC item and section.
- Create: `apps/dashboard/features/dev-helpers/ui/section-extended-components.tsx` — demos for all new shared components.

## Critical Tests

Write only high-value tests that cover behavior likely to break during the port:

- `input-search.test.tsx`: debounce, clear behavior, controlled value sync, and cleanup.
- `input-password.test.tsx`: visibility toggle and disabled state.
- `tag-input.test.tsx`: delimiter add, duplicate prevention, max tags, removal, and validation boundaries.
- `combobox.test.tsx`: filtering, option selection, empty state, keyboard selection, and clear button.
- `combobox-autocomplete.test.tsx`: external input open control, hidden search mode, selection, and controlled open behavior.
- `data-table-filter.test.tsx`: grouped and ungrouped selection, count badge, clear selection, and search value.
- `image-dropzone.test.tsx`: accepted file callback, rejected file error callback, and disabled behavior.
- `input-with-adornments.test.tsx`: start/end adornments, forwarded props, and ref behavior.

Avoid tests that only assert static component names render.

## Task 1: Add UI Package Dependencies And Test Setup

**Files:**

- Modify: `packages/ui/package.json`
- Create: `packages/ui/vitest.config.ts`

- [ ] **Step 1: Add dependencies to `packages/ui/package.json`**

Add runtime dependencies:

```json
"@tanstack/react-table": "^8",
"react-dropzone": "^14"
```

Add dev dependencies:

```json
"@testing-library/jest-dom": "^6",
"@testing-library/react": "^16",
"@testing-library/user-event": "^14",
"jsdom": "^26",
"vitest": "^3"
```

Add scripts:

```json
"type-check": "tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest"
```

Use the package manager to update `pnpm-lock.yaml`:

```bash
pnpm add -F @workspace/ui @tanstack/react-table react-dropzone
pnpm add -F @workspace/ui -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 2: Create `packages/ui/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "#components": path.resolve(import.meta.dirname, "src/components"),
      "#components/*": path.resolve(import.meta.dirname, "src/components/*"),
      "#hooks": path.resolve(import.meta.dirname, "src/hooks"),
      "#hooks/*": path.resolve(import.meta.dirname, "src/hooks/*"),
      "#lib": path.resolve(import.meta.dirname, "src/lib"),
      "#lib/*": path.resolve(import.meta.dirname, "src/lib/*"),
    },
  },
})
```

- [ ] **Step 3: Verify package metadata**

Run:

```bash
pnpm --filter @workspace/ui test -- --passWithNoTests
```

Expected: Vitest starts and exits successfully with no test files or no failing tests.

## Task 2: Port Simple Layout And Feedback Components

**Files:**

- Create: `packages/ui/src/components/spinner.tsx`
- Create: `packages/ui/src/components/empty-text.tsx`
- Create: `packages/ui/src/components/edit-button.tsx`
- Create: `packages/ui/src/components/info-button-with-tooltip.tsx`
- Create: `packages/ui/src/components/annotated.tsx`
- Create: `packages/ui/src/components/empty-state.tsx`
- Create: `packages/ui/src/components/page.tsx`
- Create: `packages/ui/src/components/theme-switcher.tsx`

- [ ] **Step 1: Copy the source files**

Copy the corresponding files from:

```text
<another-starter-project-root>/packages/ui/src/components/
```

to:

```text
packages/ui/src/components/
```

- [ ] **Step 2: Normalize imports**

Apply these import rules in every copied file:

```ts
import { cn } from "#lib/utils"
import { Button, type ButtonProps } from "#components/button"
import { ScrollArea } from "#components/scroll-area"
import { Separator } from "#components/separator"
import { SidebarTrigger } from "#components/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/tooltip"
```

Use `@workspace/ui/components/*` only from app code, not inside `packages/ui`.

- [ ] **Step 3: Make `EmptyState` generic**

Remove built-in image URL mappings. The ported component should accept caller-provided `icon`, `imageSrc`, `imageAlt`, `imageSize`, and `children`.

The resulting props shape should be:

```ts
export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  description: string
  icon?: React.ReactNode
  imageSrc?: string
  imageAlt?: string
  imageSize?: number
  imageFadeDuration?: number
  children?: React.ReactNode
}
```

- [ ] **Step 4: Verify type-check for simple components**

Run:

```bash
pnpm --filter @workspace/ui type-check
```

Expected: no TypeScript errors from the newly copied simple components.

## Task 3: Port Input Components With Tests

**Files:**

- Create: `packages/ui/src/components/input-with-adornments.tsx`
- Create: `packages/ui/src/components/input-search.tsx`
- Create: `packages/ui/src/components/input-password.tsx`
- Create: `packages/ui/src/components/input-currency.tsx`
- Create: `packages/ui/src/components/input-with-adornments.test.tsx`
- Create: `packages/ui/src/components/input-search.test.tsx`
- Create: `packages/ui/src/components/input-password.test.tsx`

- [ ] **Step 1: Copy and normalize input component imports**

Copy the four input source files and normalize imports:

```ts
import { cn } from "#lib/utils"
import { Button } from "#components/button"
import {
  InputWithAdornments,
  type InputWithAdornmentsElement,
  type InputWithAdornmentsProps,
} from "#components/input-with-adornments"
```

- [ ] **Step 2: Write `input-with-adornments.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import * as React from "react"

import { InputWithAdornments } from "./input-with-adornments"

describe("InputWithAdornments", () => {
  it("renders start and end adornments around a forwarded input", () => {
    const ref = React.createRef<HTMLInputElement>()

    render(
      <InputWithAdornments
        ref={ref}
        aria-label="Amount"
        startAdornment={<span data-testid="start">$</span>}
        endAdornment={<span data-testid="end">USD</span>}
        defaultValue="42"
      />
    )

    expect(screen.getByTestId("start")).toBeInTheDocument()
    expect(screen.getByTestId("end")).toBeInTheDocument()
    expect(screen.getByLabelText("Amount")).toHaveValue("42")
    expect(ref.current).toBe(screen.getByLabelText("Amount"))
  })
})
```

- [ ] **Step 3: Write `input-search.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { InputSearch } from "./input-search"

describe("InputSearch", () => {
  it("debounces onChange and clears immediately", async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onChange = vi.fn()
    const onClear = vi.fn()

    render(
      <InputSearch
        aria-label="Search"
        debounceTime={200}
        onChange={onChange}
        onClear={onClear}
      />
    )

    await user.type(screen.getByLabelText("Search"), "abc")
    expect(onChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.value).toBe("abc")

    await user.click(screen.getByRole("button"))
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls.at(-1)?.[0].target.value).toBe("")
    expect(screen.getByLabelText("Search")).toHaveValue("")

    vi.useRealTimers()
  })

  it("syncs controlled value changes", () => {
    const { rerender } = render(
      <InputSearch aria-label="Search" value="first" onChange={() => {}} />
    )

    expect(screen.getByLabelText("Search")).toHaveValue("first")

    rerender(<InputSearch aria-label="Search" value="second" onChange={() => {}} />)
    expect(screen.getByLabelText("Search")).toHaveValue("second")
  })
})
```

- [ ] **Step 4: Write `input-password.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { InputPassword } from "./input-password"

describe("InputPassword", () => {
  it("toggles password visibility", async () => {
    const user = userEvent.setup()

    render(<InputPassword aria-label="Password" />)

    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: /toggle password visibility/i }))
    expect(input).toHaveAttribute("type", "text")
  })

  it("disables the visibility button when the input is disabled", () => {
    render(<InputPassword aria-label="Password" disabled />)

    expect(
      screen.getByRole("button", { name: /toggle password visibility/i })
    ).toBeDisabled()
  })
})
```

- [ ] **Step 5: Run input tests**

Run:

```bash
pnpm --filter @workspace/ui test -- src/components/input-with-adornments.test.tsx src/components/input-search.test.tsx src/components/input-password.test.tsx
```

Expected: all input tests pass.

## Task 4: Port Tag Input With Tests

**Files:**

- Create: `packages/ui/src/components/tag-input.tsx`
- Create: `packages/ui/src/components/tag-input.test.tsx`

- [ ] **Step 1: Copy and normalize `tag-input.tsx`**

Normalize imports:

```ts
import { cn } from "#lib/utils"
import { Button } from "#components/button"
import { Input } from "#components/input"
```

Keep these exports:

```ts
export { Delimiter, TagInput, TagList, tagVariants }
export type { TagInputProps, TagListProps, TagProps, TagType }
```

- [ ] **Step 2: Write `tag-input.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import * as React from "react"

import { Delimiter, TagInput, type TagType } from "./tag-input"

function ControlledTagInput(props: Partial<React.ComponentProps<typeof TagInput>>) {
  const [tags, setTags] = React.useState<TagType[]>(props.tags ?? [])

  return (
    <TagInput
      aria-label="Tags"
      placeholder="Add tag"
      tags={tags}
      onTagsChange={setTags}
      {...props}
    />
  )
}

describe("TagInput", () => {
  it("adds a tag with Enter and removes it", async () => {
    const user = userEvent.setup()

    render(<ControlledTagInput />)

    await user.type(screen.getByLabelText("Tags"), "alpha{Enter}")
    expect(screen.getByText("alpha")).toBeInTheDocument()

    await user.click(screen.getByRole("button"))
    expect(screen.queryByText("alpha")).not.toBeInTheDocument()
  })

  it("prevents duplicates unless allowed", async () => {
    const user = userEvent.setup()

    render(<ControlledTagInput tags={[{ id: "1", text: "alpha" }]} />)

    await user.type(screen.getByLabelText("Tags"), "alpha{Enter}")
    expect(screen.getAllByText("alpha")).toHaveLength(1)
  })

  it("disables input when max tags is reached", () => {
    render(
      <ControlledTagInput
        maxTags={1}
        tags={[{ id: "1", text: "alpha" }]}
        placeholderWhenFull="Full"
      />
    )

    expect(screen.getByPlaceholderText("Full")).toBeDisabled()
  })

  it("respects custom delimiter and validation", async () => {
    const user = userEvent.setup()
    const validateTag = vi.fn((tag: string) => tag.length > 2)

    render(<ControlledTagInput delimiter={Delimiter.Comma} validateTag={validateTag} />)

    await user.type(screen.getByLabelText("Tags"), "no,")
    expect(screen.queryByText("no")).not.toBeInTheDocument()

    await user.type(screen.getByLabelText("Tags"), "valid,")
    expect(screen.getByText("valid")).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tag input tests**

Run:

```bash
pnpm --filter @workspace/ui test -- src/components/tag-input.test.tsx
```

Expected: all tag input tests pass.

## Task 5: Port Combobox Components With Tests

**Files:**

- Create: `packages/ui/src/components/combobox.tsx`
- Create: `packages/ui/src/components/combobox-autocomplete.tsx`
- Create: `packages/ui/src/components/combobox.test.tsx`
- Create: `packages/ui/src/components/combobox-autocomplete.test.tsx`

- [ ] **Step 1: Copy and normalize combobox files**

Normalize imports:

```ts
import { cn } from "#lib/utils"
import { Button } from "#components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "#components/command"
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover"
```

- [ ] **Step 2: Write `combobox.test.tsx`**

```tsx
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import * as React from "react"

import { ComboBox } from "./combobox"

type Option = { id: string; label: string }
const options: Option[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
]

function ControlledComboBox() {
  const [value, setValue] = React.useState<Option | null>(null)

  return (
    <ComboBox
      value={value}
      onChange={setValue}
      options={options}
      getDisplayText={(item) => item.label}
      getFilterText={(item) => [item.label]}
      getItemId={(item) => item.id}
      showClearButton
    />
  )
}

describe("ComboBox", () => {
  it("filters and selects an option", async () => {
    const user = userEvent.setup()

    render(<ControlledComboBox />)

    await user.click(screen.getByRole("combobox"))
    await user.type(screen.getByPlaceholderText("Search..."), "ban")
    expect(screen.queryByText("Apple")).not.toBeInTheDocument()

    await user.click(screen.getByText("Banana"))
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana")
  })

  it("clears the selected option", async () => {
    const user = userEvent.setup()

    render(<ControlledComboBox />)

    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText("Apple"))
    await user.click(screen.getByRole("button", { name: /clear selection/i }))

    expect(screen.getByRole("combobox")).toHaveTextContent("Select an option...")
  })

  it("calls external search without local filtering", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()

    render(
      <ComboBox
        value={null}
        onChange={() => {}}
        options={options}
        getDisplayText={(item) => item.label}
        getFilterText={(item) => [item.label]}
        getItemId={(item) => item.id}
        onSearch={onSearch}
      />
    )

    await user.click(screen.getByRole("combobox"))
    await user.type(screen.getByPlaceholderText("Search..."), "zzz")

    expect(onSearch).toHaveBeenLastCalledWith("zzz")
    expect(screen.getByText("Apple")).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write `combobox-autocomplete.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import * as React from "react"

import { ComboBoxAutoComplete } from "./combobox-autocomplete"

type Option = { id: string; label: string }
const options: Option[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
]

describe("ComboBoxAutoComplete", () => {
  it("selects an option from an external input trigger", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ComboBoxAutoComplete
        value={null}
        onChange={onChange}
        options={options}
        getDisplayText={(item) => item.label}
        getFilterText={(item) => [item.label]}
        getItemId={(item) => item.id}
        externalInput={<input aria-label="Fruit" />}
      />
    )

    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText("Apple"))

    expect(onChange).toHaveBeenCalledWith(options[0])
  })

  it("supports controlled open state", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <ComboBoxAutoComplete
        value={null}
        onChange={() => {}}
        options={options}
        getDisplayText={(item) => item.label}
        getFilterText={(item) => [item.label]}
        getItemId={(item) => item.id}
        open={false}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole("combobox"))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 4: Run combobox tests**

Run:

```bash
pnpm --filter @workspace/ui test -- src/components/combobox.test.tsx src/components/combobox-autocomplete.test.tsx
```

Expected: all combobox tests pass.

## Task 6: Port Date, Filter, Table, And Dropzone Components

**Files:**

- Create: `packages/ui/src/components/date-picker.tsx`
- Create: `packages/ui/src/components/data-table-filter.tsx`
- Create: `packages/ui/src/components/data-table.tsx`
- Create: `packages/ui/src/components/image-dropzone.tsx`
- Create: `packages/ui/src/components/data-table-filter.test.tsx`
- Create: `packages/ui/src/components/image-dropzone.test.tsx`

- [ ] **Step 1: Copy and normalize component imports**

Normalize imports:

```ts
import { cn } from "#lib/utils"
import { Badge } from "#components/badge"
import { Button, type ButtonProps } from "#components/button"
import { Calendar } from "#components/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "#components/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover"
import { ScrollArea } from "#components/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#components/select"
import { Separator } from "#components/separator"
import { type TableProps } from "#components/table"
```

- [ ] **Step 2: Adapt `date-picker.tsx` to current `react-day-picker`**

Keep exports:

```ts
export { DatePicker, DateRangePicker }
export type { DatePickerProps, DateRangePickerElement, DateRangePickerProps }
```

Import `DateRange` as a type:

```ts
import { type DateRange } from "react-day-picker"
```

- [ ] **Step 3: Write `data-table-filter.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTableFilter } from "./data-table-filter"

describe("DataTableFilter", () => {
  it("selects and clears ungrouped options", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <DataTableFilter
        title="Status"
        selected={[]}
        onChange={onChange}
        options={[
          { label: "Active", value: "active", count: 2 },
          { label: "Inactive", value: "inactive", count: 1 },
        ]}
      />
    )

    await user.click(screen.getByRole("button", { name: /status/i }))
    await user.click(screen.getByText("Active"))

    expect(onChange).toHaveBeenCalledWith(["active"])
  })

  it("selects grouped options and shows grouped badge labels", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <DataTableFilter
        title="Filters"
        selected={["admin"]}
        onChange={onChange}
        options={[
          {
            label: "Role",
            options: [{ label: "Admin", value: "admin" }],
          },
        ]}
      />
    )

    expect(screen.getByText(/Role:/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /filters/i }))
    await user.click(screen.getByText("Clear selection"))

    expect(onChange).toHaveBeenCalledWith([])
  })
})
```

- [ ] **Step 4: Write `image-dropzone.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ImageDropzone } from "./image-dropzone"

describe("ImageDropzone", () => {
  it("renders the disabled upload control", () => {
    render(<ImageDropzone disabled title="Upload avatar" />)

    expect(screen.getByRole("button", { name: /upload avatar/i })).toBeDisabled()
  })

  it("renders an image preview when src is provided", () => {
    render(<ImageDropzone src="/avatar.png" title="Avatar" />)

    expect(screen.getByRole("img", { name: "Avatar" })).toHaveAttribute(
      "src",
      "/avatar.png"
    )
  })

  it("accepts click selection wiring without upload side effects", async () => {
    const user = userEvent.setup()
    const onDrop = vi.fn()

    render(<ImageDropzone title="Upload image" onDrop={onDrop} />)

    await user.click(screen.getByRole("button", { name: /upload image/i }))
    expect(screen.getByText("Upload image")).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run table filter and dropzone tests**

Run:

```bash
pnpm --filter @workspace/ui test -- src/components/data-table-filter.test.tsx src/components/image-dropzone.test.tsx
```

Expected: all tests pass.

## Task 7: Port Radio Cards And Tabs With Content

**Files:**

- Create: `packages/ui/src/components/radio-card.tsx`
- Create: `packages/ui/src/components/tabs-with-content.tsx`

- [ ] **Step 1: Copy `radio-card.tsx` and normalize imports**

Use current Radix import style:

```ts
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cn } from "#lib/utils"
```

Keep exports:

```ts
export { RadioCardItem, RadioCards }
export type { RadioCardItemElement, RadioCardItemProps, RadioCardsElement, RadioCardsProps }
```

- [ ] **Step 2: Create `tabs-with-content.tsx` using current tabs API**

Use the current tabs exports:

```ts
import { Separator } from "#components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/tabs"
```

The implementation shape:

```tsx
import * as React from "react"

import { Separator } from "#components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/tabs"

export type TabWithContent = {
  icon: React.ElementType
  label: string
  tabId: string
  content: React.ReactNode
}

export type TabsWithContentProps = {
  tabs: TabWithContent[]
}

export function TabsWithContent({ tabs }: TabsWithContentProps): React.JSX.Element | null {
  if (tabs.length === 0) {
    return null
  }

  return (
    <Tabs defaultValue={tabs[0].tabId} className="flex size-full flex-col">
      <TabsList variant="line" className="h-12 max-h-12 min-h-12 gap-x-2 overflow-x-auto border-none px-4">
        {tabs.map((item) => (
          <TabsTrigger key={item.tabId} value={item.tabId} className="mx-0 border-t-4 border-t-transparent">
            <span className="flex flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <Separator />
      {tabs.map((item) => (
        <TabsContent key={item.tabId} value={item.tabId} className="m-0 p-0 md:grow md:overflow-hidden">
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
```

- [ ] **Step 3: Type-check radio and tabs components**

Run:

```bash
pnpm --filter @workspace/ui type-check
```

Expected: no TypeScript errors from `radio-card.tsx` or `tabs-with-content.tsx`.

## Task 8: Add Extended Components Dev UI Section

**Files:**

- Modify: `apps/dashboard/features/dev-helpers/ui/dev-ui-page-content.tsx`
- Create: `apps/dashboard/features/dev-helpers/ui/section-extended-components.tsx`

- [ ] **Step 1: Add section import and TOC item**

In `dev-ui-page-content.tsx`, add:

```ts
import { SectionExtendedComponents } from "./section-extended-components";
```

Add the TOC item after `Data & Display`:

```ts
{ id: "extended-components", label: "Extended Components" },
```

Add the section after the data section:

```tsx
<section id="extended-components">
  <SectionExtendedComponents />
</section>
```

- [ ] **Step 2: Create demo helpers in `section-extended-components.tsx`**

The file should start with:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type DateRange } from "react-day-picker";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ComboBox } from "@workspace/ui/components/combobox";
import { ComboBoxAutoComplete } from "@workspace/ui/components/combobox-autocomplete";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFilter,
  DataTablePagination,
} from "@workspace/ui/components/data-table";
import { DatePicker, DateRangePicker } from "@workspace/ui/components/date-picker";
import { EditButton } from "@workspace/ui/components/edit-button";
import { EmptyState } from "@workspace/ui/components/empty-state";
import { EmptyText } from "@workspace/ui/components/empty-text";
import { ImageDropzone } from "@workspace/ui/components/image-dropzone";
import { InfoButtonWithTooltip } from "@workspace/ui/components/info-button-with-tooltip";
import { InputCurrency } from "@workspace/ui/components/input-currency";
import { InputPassword } from "@workspace/ui/components/input-password";
import { InputSearch } from "@workspace/ui/components/input-search";
import { InputWithAdornments } from "@workspace/ui/components/input-with-adornments";
import { Page, PageActions, PageBody, PageHeader, PagePrimaryBar, PageTitle } from "@workspace/ui/components/page";
import { RadioCardItem, RadioCards } from "@workspace/ui/components/radio-card";
import { Spinner } from "@workspace/ui/components/spinner";
import { TabsWithContent } from "@workspace/ui/components/tabs-with-content";
import { TagInput, type TagType } from "@workspace/ui/components/tag-input";
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher";
import { IconForAdd, IconForBilling, IconForDashboard, IconForSettings } from "@workspace/ui/components/icon-for";
```

- [ ] **Step 3: Implement representative demos**

Include these demo groups in `SectionExtendedComponents`:

```tsx
export function SectionExtendedComponents() {
  const [searchValue, setSearchValue] = useState("");
  const [passwordDemoValue, setPasswordDemoValue] = useState("hunter2");
  const [currencyValue, setCurrencyValue] = useState("250");
  const [selectedFruit, setSelectedFruit] = useState<DemoOption | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<DemoOption | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tags, setTags] = useState<TagType[]>([
    { id: "starter", text: "starter" },
    { id: "ui", text: "ui" },
  ]);
  const [dropzoneMessage, setDropzoneMessage] = useState("No file selected.");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const table = useDemoTable(statusFilter);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Extended Components</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <InputWithAdornments
          aria-label="Workspace URL"
          startAdornment={<span>https://</span>}
          endAdornment={<span>.example.com</span>}
          placeholder="acme"
        />
        <InputSearch
          aria-label="Search components"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onClear={() => setSearchValue("")}
        />
        <InputPassword
          aria-label="Password demo"
          value={passwordDemoValue}
          onChange={(event) => setPasswordDemoValue(event.target.value)}
        />
        <InputCurrency
          aria-label="Monthly budget"
          value={currencyValue}
          onChange={(event) => setCurrencyValue(event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ComboBox
          value={selectedFruit}
          onChange={setSelectedFruit}
          options={demoOptions}
          getDisplayText={(item) => item.label}
          getFilterText={(item) => [item.label]}
          getItemId={(item) => item.id}
          showClearButton
          placeholder="Select fruit"
        />
        <ComboBoxAutoComplete
          value={selectedAssignee}
          onChange={setSelectedAssignee}
          options={demoOptions}
          getDisplayText={(item) => item.label}
          getFilterText={(item) => [item.label]}
          getItemId={(item) => item.id}
          placeholder="Select assignee"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DatePicker date={date} onDateChange={setDate} />
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <TagInput
        aria-label="Component tags"
        tags={tags}
        onTagsChange={setTags}
        maxTags={5}
        placeholder="Add tag"
      />

      <ImageDropzone
        title="Upload preview image"
        subtitle={dropzoneMessage}
        accept={{ "image/*": [] }}
        onDrop={(files) => setDropzoneMessage(`${files.length} file selected.`)}
        onError={(error) => setDropzoneMessage(error.message)}
      />

      <div className="space-y-3">
        <DataTableFilter
          title="Status"
          selected={statusFilter}
          onChange={setStatusFilter}
          options={statusFilterOptions}
        />
        <DataTable table={table} />
        <DataTablePagination table={table} pageSizeOptions={[2, 5]} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState
          title="No projects yet"
          description="Create a project to see it here."
          icon={<IconForDashboard className="size-10 text-muted-foreground" />}
        >
          <Button size="sm"><IconForAdd />Create project</Button>
        </EmptyState>
        <Page className="h-56 rounded-lg border">
          <PageHeader>
            <PagePrimaryBar>
              <PageTitle>Preview Page</PageTitle>
              <PageActions><EditButton>Edit</EditButton></PageActions>
            </PagePrimaryBar>
          </PageHeader>
          <PageBody><div className="p-4"><EmptyText>No activity yet.</EmptyText></div></PageBody>
        </Page>
      </div>

      <RadioCards defaultValue="starter" className="grid gap-3 md:grid-cols-3">
        <RadioCardItem value="starter">Starter</RadioCardItem>
        <RadioCardItem value="pro">Pro</RadioCardItem>
        <RadioCardItem value="enterprise">Enterprise</RadioCardItem>
      </RadioCards>

      <TabsWithContent
        tabs={[
          { tabId: "overview", label: "Overview", icon: IconForDashboard, content: <div className="p-4">Overview content</div> },
          { tabId: "billing", label: "Billing", icon: IconForBilling, content: <div className="p-4">Billing content</div> },
          { tabId: "settings", label: "Settings", icon: IconForSettings, content: <div className="p-4">Settings content</div> },
        ]}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Spinner size="small">Loading</Spinner>
        <InfoButtonWithTooltip content="Extended components are reusable helpers beyond the baseline component set." />
        <ThemeSwitcher />
      </div>
    </div>
  );
}
```

Define `DemoOption`, `demoOptions`, `statusFilterOptions`, `DemoRow`, `demoRows`, `columnHelper`, and `useDemoTable(statusFilter)` above `SectionExtendedComponents` in the same file. Use mock arrays only. Do not call APIs or upload files.

- [ ] **Step 4: Type-check dashboard preview**

Run:

```bash
pnpm --filter @apps/dashboard type-check
```

Expected: no TypeScript errors from the new dev UI section.

## Task 9: Final Verification

**Files:**

- Review all files created or modified by prior tasks.

- [ ] **Step 1: Run shared UI tests**

Run:

```bash
pnpm --filter @workspace/ui test
```

Expected: all colocated UI tests pass.

- [ ] **Step 2: Run workspace type-check**

Run:

```bash
pnpm type-check
```

Expected: all packages type-check.

- [ ] **Step 3: Run workspace lint**

Run:

```bash
pnpm lint
```

Expected: no lint errors.

- [ ] **Step 4: Run dashboard build if type or routing changes require it**

Run:

```bash
pnpm --filter @apps/dashboard build
```

Expected: dashboard builds successfully.

- [ ] **Step 5: Review git diff**

Run:

```bash
git status --short
git diff -- packages/ui apps/dashboard/features/dev-helpers/ui docs/superpowers
```

Expected: diff contains only the extended component port, tests, dev UI preview, spec, and plan.

Do not commit unless the requester explicitly asks for a commit.

