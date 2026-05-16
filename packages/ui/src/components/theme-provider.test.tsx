import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ThemeProvider } from "#components/theme-provider"

describe("ThemeProvider", () => {
  it("does not render a script tag in the React tree", () => {
    const { container } = render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>
    )

    expect(container.querySelector("script")).not.toBeInTheDocument()
  })
})
