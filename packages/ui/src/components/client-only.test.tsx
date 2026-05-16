import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ClientOnly } from "#components/client-only"

describe("ClientOnly", () => {
  it("omits children during server render", () => {
    expect(
      renderToString(
        <ClientOnly>
          <span>Client content</span>
        </ClientOnly>
      )
    ).toBe("")
  })

  it("renders fallback during server render", () => {
    expect(
      renderToString(
        <ClientOnly fallback={<span>Loading</span>}>
          <span>Client content</span>
        </ClientOnly>
      )
    ).toBe("<span>Loading</span>")
  })

  it("renders children after client mount", async () => {
    render(
      <ClientOnly>
        <span>Client content</span>
      </ClientOnly>
    )

    expect(await screen.findByText("Client content")).toBeInTheDocument()
  })
})
