import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { InputPassword } from "#components/input-password"

describe("InputPassword", () => {
  it("toggles between password and text input types", async () => {
    const user = userEvent.setup()

    render(<InputPassword aria-label="Password" />)

    const input = screen.getByLabelText("Password")
    const toggle = screen.getByRole("button", {
      name: "Show password",
    })

    expect(input).toHaveAttribute("type", "password")
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    await user.click(toggle)
    expect(input).toHaveAttribute("type", "text")
    expect(
      screen.getByRole("button", { name: "Hide password" })
    ).toHaveAttribute("aria-pressed", "true")

    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("disables the visibility button when the input is disabled", () => {
    render(<InputPassword aria-label="Password" disabled />)

    expect(screen.getByLabelText("Password")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled()
  })

  it("prevents mouse down from stealing focus", () => {
    render(<InputPassword aria-label="Password" />)

    const eventWasCancelled = !fireEvent.mouseDown(
      screen.getByRole("button", { name: "Show password" })
    )

    expect(eventWasCancelled).toBe(true)
  })
})
