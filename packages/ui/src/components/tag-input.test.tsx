import "@testing-library/jest-dom/vitest"
import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TagInput, type TagType } from "#components/tag-input"

function ControlledTagInput({
  tags: initialTags,
  ...props
}: Partial<React.ComponentProps<typeof TagInput>>) {
  const [tags, setTags] = React.useState<TagType[]>(initialTags ?? [])

  return (
    <TagInput
      aria-label="Tags"
      placeholder="Add tag"
      tags={tags}
      onTagsChange={setTags}
      {...props}
    />
  )
}

describe("TagInput", () => {
  it("adds a tag with Enter and removes it", async () => {
    const user = userEvent.setup()

    render(<ControlledTagInput />)

    await user.type(screen.getByLabelText("Tags"), "alpha{Enter}")
    expect(screen.getByText("alpha")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Remove alpha" }))
    expect(screen.queryByText("alpha")).not.toBeInTheDocument()
  })

  it("prevents duplicates unless allowed", async () => {
    const user = userEvent.setup()

    const { unmount } = render(
      <ControlledTagInput tags={[{ id: "1", text: "alpha" }]} />
    )

    await user.type(screen.getByLabelText("Tags"), "alpha{Enter}")
    expect(screen.getAllByText("alpha")).toHaveLength(1)

    unmount()

    render(
      <ControlledTagInput
        allowDuplicates
        tags={[{ id: "1", text: "alpha" }]}
      />
    )

    await user.type(screen.getByLabelText("Tags"), "alpha{Enter}")
    expect(screen.getAllByText("alpha")).toHaveLength(2)
  })

  it("keeps duplicate tag removals isolated after earlier removals", async () => {
    const user = userEvent.setup()

    render(
      <ControlledTagInput
        allowDuplicates
        tags={[
          { id: "tag-alpha-0", text: "alpha" },
          { id: "tag-beta-1", text: "beta" },
        ]}
      />
    )

    await user.click(screen.getByRole("button", { name: "Remove alpha" }))
    await user.type(screen.getByLabelText("Tags"), "beta{Enter}")

    expect(screen.getAllByText("beta")).toHaveLength(2)

    await user.click(screen.getAllByRole("button", { name: "Remove beta" })[0]!)

    expect(screen.getAllByText("beta")).toHaveLength(1)
  })

  it("disables input when max tags is reached and uses the full placeholder", () => {
    render(
      <ControlledTagInput
        maxTags={1}
        tags={[{ id: "1", text: "alpha" }]}
        placeholderWhenFull="Full"
      />
    )

    expect(screen.getByPlaceholderText("Full")).toBeDisabled()
  })

  it("respects custom delimiter and validation", async () => {
    const user = userEvent.setup()
    const validateTag = vi.fn((tag: string) => tag.length > 2)

    render(
      <ControlledTagInput delimiterList={[";"]} validateTag={validateTag} />
    )

    await user.type(screen.getByLabelText("Tags"), "no;")
    expect(screen.queryByText("no")).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Tags"))
    await user.type(screen.getByLabelText("Tags"), "valid;")
    expect(screen.getByText("valid")).toBeInTheDocument()
  })

  it("enforces minimum and maximum tag length", async () => {
    const user = userEvent.setup()

    render(<ControlledTagInput minLength={3} maxLength={5} />)

    await user.type(screen.getByLabelText("Tags"), "ab{Enter}")
    expect(screen.queryByText("ab")).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Tags"))
    await user.type(screen.getByLabelText("Tags"), "abcdef{Enter}")
    expect(screen.queryByText("abcdef")).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Tags"))
    await user.type(screen.getByLabelText("Tags"), "valid{Enter}")
    expect(screen.getByText("valid")).toBeInTheDocument()
  })

  it("does not remove below minTags", async () => {
    const user = userEvent.setup()

    render(<ControlledTagInput minTags={1} tags={[{ id: "1", text: "alpha" }]} />)

    expect(screen.queryByRole("button", { name: "Remove alpha" })).not.toBeInTheDocument()
    expect(screen.getByText("alpha")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Tags"), "beta{Enter}")
    await user.click(screen.getByRole("button", { name: "Remove beta" }))

    expect(screen.getByText("alpha")).toBeInTheDocument()
    expect(screen.queryByText("beta")).not.toBeInTheDocument()
  })

  it("does not mutate tags when disabled or read only", async () => {
    const user = userEvent.setup()
    const initialTags = [{ id: "1", text: "alpha" }]
    const { rerender } = render(
      <ControlledTagInput disabled clearAll tags={initialTags} />
    )

    expect(screen.getByRole("button", { name: "Clear All" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Remove alpha" })).not.toBeInTheDocument()

    rerender(<ControlledTagInput readOnly clearAll tags={initialTags} />)

    expect(screen.getByRole("button", { name: "Clear All" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Remove alpha" })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText("Tags"), "beta{Enter}")
    expect(screen.queryByText("beta")).not.toBeInTheDocument()
  })

  it("keeps original tag values when displaying truncated tags", async () => {
    const user = userEvent.setup()
    const handleTagClick = vi.fn()
    const handleTagRemove = vi.fn()

    render(
      <ControlledTagInput
        truncate={3}
        onTagClick={handleTagClick}
        onTagRemove={handleTagRemove}
        tags={[{ id: "1", text: "alphabet" }]}
      />
    )

    await user.click(screen.getByRole("button", { name: "alp..." }))
    expect(handleTagClick).toHaveBeenCalledWith({ id: "1", text: "alphabet" })

    await user.click(screen.getByRole("button", { name: "Remove alphabet" }))
    expect(handleTagRemove).toHaveBeenCalledWith("alphabet")
  })
})
