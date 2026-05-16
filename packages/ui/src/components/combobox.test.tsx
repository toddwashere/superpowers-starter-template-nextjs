import "@testing-library/jest-dom/vitest"
import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ComboBox } from "#components/combobox"

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

function ControlledComboBox({
  onChange,
  value: initialValue,
  ...props
}: Partial<React.ComponentProps<typeof ComboBox<Option>>>) {
  const [value, setValue] = React.useState<Option | null>(initialValue ?? null)

  return (
    <ComboBox
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

describe("ComboBox", () => {
  it("filters and selects an option", async () => {
    const user = userEvent.setup()

    render(<ControlledComboBox />)

    await user.click(screen.getByRole("combobox", { name: "Select item" }))
    await user.type(screen.getByPlaceholderText("Search items"), "bet")

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument()
    await user.click(screen.getByText("Beta"))

    expect(screen.getByRole("combobox", { name: "Beta" })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Search items")).not.toBeInTheDocument()
  })

  it("clears search and notifies open change when selecting", async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    render(<ControlledComboBox onOpenChange={handleOpenChange} />)

    await user.click(screen.getByRole("combobox", { name: "Select item" }))
    await user.type(screen.getByPlaceholderText("Search items"), "bet")
    await user.click(screen.getByText("Beta"))

    expect(handleOpenChange).toHaveBeenCalledWith(false)

    await user.click(screen.getByRole("combobox", { name: "Beta" }))
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Gamma")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Search items")).toHaveValue("")
  })

  it("clears the selected option when the clear button is shown", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ControlledComboBox
        showClearButton
        value={options[0]}
        onChange={handleChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Clear selection" }))

    expect(handleChange).toHaveBeenCalledWith(null)
    expect(screen.getByRole("combobox", { name: "Select item" })).toBeInTheDocument()
  })

  it("calls external onSearch without local filtering", async () => {
    const user = userEvent.setup()
    const handleSearch = vi.fn()

    render(<ControlledComboBox onSearch={handleSearch} />)

    await user.click(screen.getByRole("combobox", { name: "Select item" }))
    await user.type(screen.getByPlaceholderText("Search items"), "zzz")

    expect(handleSearch).toHaveBeenLastCalledWith("zzz")
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByText("Beta")).toBeInTheDocument()
    expect(screen.getByText("Gamma")).toBeInTheDocument()
  })

  it("selects a highlighted option with the keyboard", async () => {
    const user = userEvent.setup()

    render(<ControlledComboBox />)

    const trigger = screen.getByRole("combobox", { name: "Select item" })
    await user.click(trigger)
    await user.keyboard("{ArrowDown}{Enter}")

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Alpha" })).toBeInTheDocument()
    })
  })
})
