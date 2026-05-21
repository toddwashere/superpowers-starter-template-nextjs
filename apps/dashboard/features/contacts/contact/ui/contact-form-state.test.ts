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
      stageId: "",
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
      stageId: "cstage_customer",
    });

    expect(state).toMatchObject({
      kind: "company",
      displayName: "Acme Inc",
      primaryEmail: "ops@acme.test",
      primaryPhone: "555-1234",
      website: "https://acme.test",
      source: "import",
      stageId: "cstage_customer",
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
        stageId: "",
      }),
    ).toEqual({
      kind: "person",
      displayName: "Jane Doe",
      primaryEmail: undefined,
      primaryPhone: undefined,
      website: undefined,
      source: undefined,
      stageId: undefined,
    });
  });

  it("includes stageId when set on the form", () => {
    expect(
      contactFormStateToInput({
        kind: "person",
        displayName: "Jane",
        primaryEmail: "",
        primaryPhone: "",
        website: "",
        source: "",
        stageId: "cstage_active",
      }),
    ).toMatchObject({ stageId: "cstage_active" });
  });
});
