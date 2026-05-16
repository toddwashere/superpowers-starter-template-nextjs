import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ImageDropzone } from "#components/image-dropzone"

describe("ImageDropzone", () => {
  it("renders the disabled upload control", () => {
    render(<ImageDropzone disabled title="Upload avatar" />)

    expect(
      screen.getByRole("button", { name: /upload avatar/i })
    ).toHaveAttribute("aria-disabled", "true")
  })

  it("renders an image preview when src is provided", () => {
    render(<ImageDropzone src="/avatar.png" title="Avatar" />)

    expect(screen.getByRole("img", { name: "Avatar" })).toHaveAttribute(
      "src",
      "/avatar.png"
    )
  })

  it("calls onDrop for accepted image files", async () => {
    const handleDrop = vi.fn()
    const file = new File(["avatar"], "avatar.png", { type: "image/png" })

    render(<ImageDropzone title="Upload image" onDrop={handleDrop} />)

    fireEvent.drop(screen.getByRole("button", { name: /upload image/i }), {
      dataTransfer: {
        files: [file],
        items: [
          {
            kind: "file",
            type: file.type,
            getAsFile: () => file,
          },
        ],
        types: ["Files"],
      },
    })

    await waitFor(() => {
      expect(handleDrop).toHaveBeenCalledWith([file], [], expect.any(Object))
    })
  })

  it("opens the file picker when enabled", async () => {
    const user = userEvent.setup()
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click")

    render(<ImageDropzone title="Upload image" />)

    await user.click(screen.getByRole("button", { name: /upload image/i }))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it("does not open the file picker when disabled", async () => {
    const user = userEvent.setup()
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click")

    render(<ImageDropzone disabled title="Upload image" />)

    await user.click(screen.getByRole("button", { name: /upload image/i }))

    expect(clickSpy).not.toHaveBeenCalled()
    clickSpy.mockRestore()
  })
})
