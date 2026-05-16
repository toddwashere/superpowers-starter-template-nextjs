import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTableFilter } from "#components/data-table-filter"

describe("DataTableFilter", () => {
  it("selects an ungrouped option", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <DataTableFilter
        title="Status"
        selected={[]}
        onChange={handleChange}
        options={[
          { label: "Active", value: "active", count: 2 },
          { label: "Inactive", value: "inactive", count: 1 },
        ]}
      />
    )

    await user.click(screen.getByRole("button", { name: /status/i }))
    await user.click(screen.getByText("Active"))

    expect(handleChange).toHaveBeenCalledWith(["active"])
  })

  it("clears grouped selections and shows grouped badge labels", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <DataTableFilter
        title="Filters"
        selected={["admin"]}
        onChange={handleChange}
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

    expect(handleChange).toHaveBeenCalledWith([])
  })
})
