import "@testing-library/jest-dom/vitest"
import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ComboBoxAutoComplete } from "#components/combobox-autocomplete"

type Option = {
  id: string
  label: string
  keywords: string[]
}

const options: Option[] = [
  { id: "alpha", label: "Alpha", keywords: ["alpha", "first"] },
  { id: "beta", label: "Beta", keywords: ["beta", "second"] },
  { id: "gamma", label: "Gamma", keywords: ["gamma", "third"] },
]

const optionProps = {
  options,
  getDisplayText: (option: Option) => option.label,
  getFilterText: (option: Option) => option.keywords,
  getItemId: (option: Option) => option.id,
}

function ControlledAutoComplete({
  onChange,
  value: initialValue,
  ...props
}: Partial<React.ComponentProps<typeof ComboBoxAutoComplete<Option>>>) {
  const [value, setValue] = React.useState<Option | null>(initialValue ?? null)

  return (
    <ComboBoxAutoComplete
      placeholder="Select item"
      searchPlaceholder="Search items"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue)
        onChange?.(nextValue)
      }}
      {...optionProps}
      {...props}
    />
  )
}

describe("ComboBoxAutoComplete", () => {
  it("selects an option from an external input trigger", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ControlledAutoComplete
        onChange={handleChange}
        externalInput={<input aria-label="City" defaultValue="A" />}
      />
    )

    await user.click(screen.getByLabelText("City"))
    await user.click(screen.getByText("Beta"))

    expect(handleChange).toHaveBeenCalledWith(options[1])
    expect(screen.queryByText("Beta")).not.toBeInTheDocument()
  })

  it("calls onOpenChange when a controlled trigger is clicked", async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    render(
      <ControlledAutoComplete
        open={false}
        onOpenChange={handleOpenChange}
        externalInput={<input aria-label="City" />}
      />
    )

    await user.click(screen.getByLabelText("City"))

    expect(handleOpenChange).toHaveBeenCalledWith(true)
  })

  it("can select an option while the internal search is hidden", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ControlledAutoComplete
        open
        hideSearch
        onChange={handleChange}
        externalInput={<input aria-label="City" />}
      />
    )

    expect(screen.queryByPlaceholderText("Search items")).not.toBeInTheDocument()

    await user.click(screen.getByText("Gamma"))

    expect(handleChange).toHaveBeenCalledWith(options[2])
  })

  it("does not open a disabled external trigger", async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    render(
      <ControlledAutoComplete
        disabled
        onOpenChange={handleOpenChange}
        externalInput={<input aria-label="City" />}
      />
    )

    await user.click(screen.getByRole("combobox", { name: "City" }))

    expect(handleOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument()
  })
})
