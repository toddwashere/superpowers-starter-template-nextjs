import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { InputSearch } from "#components/input-search"

describe("InputSearch", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces onChange", async () => {
    vi.useFakeTimers()
    const handleDebouncedChange = vi.fn()
    const handleValueChange = vi.fn()

    render(
      <InputSearch
        aria-label="Search"
        debounceTime={175}
        onDebouncedChange={handleDebouncedChange}
        onValueChange={handleValueChange}
      />
    )

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "abc" },
    })

    expect(screen.getByLabelText("Search")).toHaveValue("abc")
    expect(handleValueChange).toHaveBeenCalledWith("abc")
    expect(handleDebouncedChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(174)
    expect(handleDebouncedChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(handleDebouncedChange).toHaveBeenCalledTimes(1)
    expect(handleDebouncedChange).toHaveBeenCalledWith("abc")
  })

  it("clears immediately, calls onClear, and sends an empty value", async () => {
    vi.useFakeTimers()
    const handleDebouncedChange = vi.fn()
    const handleValueChange = vi.fn()
    const handleClear = vi.fn()

    render(
      <InputSearch
        aria-label="Search"
        debounceTime={175}
        onDebouncedChange={handleDebouncedChange}
        onValueChange={handleValueChange}
        onClear={handleClear}
      />
    )

    const input = screen.getByLabelText("Search")
    fireEvent.change(input, { target: { value: "query" } })
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))

    expect(input).toHaveValue("")
    expect(handleClear).toHaveBeenCalledTimes(1)
    expect(handleValueChange).toHaveBeenLastCalledWith("")
    expect(handleDebouncedChange).toHaveBeenCalledTimes(1)
    expect(handleDebouncedChange).toHaveBeenCalledWith("")

    vi.advanceTimersByTime(175)
    expect(handleDebouncedChange).toHaveBeenCalledTimes(1)
  })

  it("syncs controlled value prop changes", () => {
    const { rerender } = render(
      <InputSearch aria-label="Search" value="initial" onChange={vi.fn()} />
    )

    expect(screen.getByLabelText("Search")).toHaveValue("initial")

    rerender(
      <InputSearch aria-label="Search" value="updated" onChange={vi.fn()} />
    )

    expect(screen.getByLabelText("Search")).toHaveValue("updated")
  })

  it("does not visually change a controlled value without a prop update", () => {
    const handleValueChange = vi.fn()

    render(
      <InputSearch
        aria-label="Search"
        value="locked"
        onValueChange={handleValueChange}
      />
    )

    const input = screen.getByLabelText("Search")
    fireEvent.change(input, { target: { value: "typed" } })

    expect(handleValueChange).toHaveBeenCalledWith("typed")
    expect(input).toHaveValue("locked")

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))

    expect(handleValueChange).toHaveBeenLastCalledWith("")
    expect(input).toHaveValue("locked")
  })

  it("uses defaultValue for the initial uncontrolled value", () => {
    render(<InputSearch aria-label="Search" defaultValue="preset" />)

    expect(screen.getByLabelText("Search")).toHaveValue("preset")
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument()
  })
})
