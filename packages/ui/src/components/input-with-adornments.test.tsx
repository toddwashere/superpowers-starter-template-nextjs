import "@testing-library/jest-dom/vitest"
import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { InputWithAdornments } from "#components/input-with-adornments"

describe("InputWithAdornments", () => {
  it("renders start and end adornments around a forwarded input", () => {
    render(
      <InputWithAdornments
        placeholder="Amount"
        startAdornment={<span>Start</span>}
        endAdornment={<span>End</span>}
      />
    )

    const input = screen.getByPlaceholderText("Amount")

    expect(screen.getByText("Start")).toBeInTheDocument()
    expect(input).toBeInTheDocument()
    expect(screen.getByText("End")).toBeInTheDocument()
  })

  it("forwards input props and ref", () => {
    const ref = React.createRef<HTMLInputElement>()

    render(
      <InputWithAdornments
        ref={ref}
        aria-label="Email"
        defaultValue="hello@example.com"
        disabled
      />
    )

    const input = screen.getByLabelText("Email")

    expect(input).toHaveValue("hello@example.com")
    expect(input).toBeDisabled()
    expect(ref.current).toBe(input)
  })
})
