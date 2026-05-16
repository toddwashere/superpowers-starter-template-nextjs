import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScrollAnchor } from "#components/scroll-anchor"

describe("ScrollAnchor", () => {
  it("renders a section with a default scroll margin", () => {
    const { container } = render(
      <ScrollAnchor id="overview">
        <h2>Overview</h2>
      </ScrollAnchor>
    )

    const section = container.querySelector("section")

    expect(section).toHaveAttribute("id", "overview")
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument()
    expect(section).toHaveStyle({ scrollMarginTop: "5rem" })
  })

  it("allows overriding the scroll offset", () => {
    const { container } = render(
      <ScrollAnchor id="details" offset="7rem">
        <h2>Details</h2>
      </ScrollAnchor>
    )

    expect(container.querySelector("section")).toHaveStyle({
      scrollMarginTop: "7rem",
    })
  })
})
