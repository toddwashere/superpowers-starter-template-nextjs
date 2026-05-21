import type { CreateContactInput, UpdateContactInput } from "@workspace/contacts/schemas/contact-schemas";

export type ContactFormState = {
  kind: "person" | "company";
  displayName: string;
  primaryEmail: string;
  primaryPhone: string;
  website: string;
  source: string;
  stageId: string;
};

type ContactFormSource = {
  kind: string;
  displayName: string;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  website?: string | null;
  source?: string | null;
  stageId?: string | null;
};

export function createEmptyContactFormState(): ContactFormState {
  return {
    kind: "person",
    displayName: "",
    primaryEmail: "",
    primaryPhone: "",
    website: "",
    source: "",
    stageId: "",
  };
}

export function contactToContactFormState(contact: ContactFormSource): ContactFormState {
  return {
    kind: contact.kind === "company" ? "company" : "person",
    displayName: contact.displayName,
    primaryEmail: contact.primaryEmail ?? "",
    primaryPhone: contact.primaryPhone ?? "",
    website: contact.website ?? "",
    source: contact.source ?? "",
    stageId: contact.stageId ?? "",
  };
}

function optionalTrimmed(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function contactFormStateToInput(
  state: ContactFormState,
): CreateContactInput | UpdateContactInput {
  return {
    kind: state.kind,
    displayName: state.displayName.trim(),
    primaryEmail: optionalTrimmed(state.primaryEmail),
    primaryPhone: optionalTrimmed(state.primaryPhone),
    website: optionalTrimmed(state.website),
    source: optionalTrimmed(state.source),
    stageId: state.stageId || undefined,
  };
}
