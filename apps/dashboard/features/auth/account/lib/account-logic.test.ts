import { describe, it, expect } from "vitest";
import {
  hasCredentialAccount,
  hasOnlyOneAuthMethod,
  isDeleteConfirmationValid,
  isCurrentSession,
  shouldShowConnectedAccounts,
} from "./account-logic";

describe("hasCredentialAccount", () => {
  it("returns true when a credential account exists", () => {
    expect(hasCredentialAccount([{ providerId: "credential" }])).toBe(true);
  });

  it("returns false when only OAuth accounts exist", () => {
    expect(hasCredentialAccount([{ providerId: "google" }])).toBe(false);
  });

  it("returns false for empty list", () => {
    expect(hasCredentialAccount([])).toBe(false);
  });
});

describe("hasOnlyOneAuthMethod", () => {
  it("returns true when exactly one account exists", () => {
    expect(hasOnlyOneAuthMethod([{ providerId: "google" }])).toBe(true);
  });

  it("returns false when two accounts exist", () => {
    expect(
      hasOnlyOneAuthMethod([
        { providerId: "google" },
        { providerId: "credential" },
      ])
    ).toBe(false);
  });

  it("returns true for empty list", () => {
    expect(hasOnlyOneAuthMethod([])).toBe(true);
  });
});

describe("isDeleteConfirmationValid", () => {
  it("returns true for exact phrase", () => {
    expect(isDeleteConfirmationValid("delete my account")).toBe(true);
  });

  it("returns false for partial match", () => {
    expect(isDeleteConfirmationValid("delete")).toBe(false);
  });

  it("returns false for case mismatch", () => {
    expect(isDeleteConfirmationValid("Delete My Account")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isDeleteConfirmationValid("")).toBe(false);
  });
});

describe("isCurrentSession", () => {
  it("returns true when tokens match", () => {
    expect(isCurrentSession("abc123", "abc123")).toBe(true);
  });

  it("returns false when tokens differ", () => {
    expect(isCurrentSession("abc123", "xyz456")).toBe(false);
  });
});

describe("shouldShowConnectedAccounts", () => {
  it("returns true when providers are configured", () => {
    expect(shouldShowConnectedAccounts([{ id: "google", name: "Google" }])).toBe(true);
  });

  it("returns false when no providers configured", () => {
    expect(shouldShowConnectedAccounts([])).toBe(false);
  });
});
