import { describe, expect, it } from "vitest";
import {
  createEmptyContactFormState,
  contactToContactFormState,
  contactFormStateToInput,
} from "./contact-form-state";

describe("contact form state", () => {
  it("creates a fresh empty state each time for add contact modals", () => {
    const first = createEmptyContactFormState();
    first.displayName = "Old contact";

    expect(createEmptyContactFormState()).toEqual({
      kind: "person",
      displayName: "",
      primaryEmail: "",
      primaryPhone: "",
      website: "",
      source: "",
    });
  });

  it("prefills edit state from an existing contact", () => {
    const state = contactToContactFormState({
      kind: "company",
      displayName: "Acme Inc",
      primaryEmail: "ops@acme.test",
      primaryPhone: "555-1234",
      website: "https://acme.test",
      source: "import",
    });

    expect(state).toMatchObject({
      kind: "company",
      displayName: "Acme Inc",
      primaryEmail: "ops@acme.test",
      primaryPhone: "555-1234",
      website: "https://acme.test",
      source: "import",
    });
  });

  it("normalizes blank optional fields to undefined for actions", () => {
    expect(
      contactFormStateToInput({
        kind: "person",
        displayName: " Jane Doe ",
        primaryEmail: " ",
        primaryPhone: "",
        website: "",
        source: "",
      }),
    ).toEqual({
      kind: "person",
      displayName: "Jane Doe",
      primaryEmail: undefined,
      primaryPhone: undefined,
      website: undefined,
      source: undefined,
    });
  });
});
