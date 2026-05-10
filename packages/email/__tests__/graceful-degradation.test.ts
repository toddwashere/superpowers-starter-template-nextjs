import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockSendEmail } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
}));

vi.mock("../src/provider/index", () => ({
  EmailProvider: { sendEmail: mockSendEmail },
}));

vi.mock("../keys", () => ({
  keys: vi.fn(() => ({
    RESEND_API_KEY: undefined,
    EMAIL_FROM: "App <noreply@example.com>",
  })),
}));

import { sendWelcomeAndVerifyEmail } from "../src/send-welcome-and-verify-email";
import { sendWelcomeEmail } from "../src/send-welcome-email";
import { sendEmailChangeVerificationEmail } from "../src/send-email-change-verification-email";
import { sendPasswordResetEmail } from "../src/send-password-reset-email";
import { sendInvitationEmail } from "../src/send-invitation-email";

describe("Graceful degradation (no RESEND_API_KEY)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("sendWelcomeAndVerifyEmail logs and does not throw", async () => {
    await expect(
      sendWelcomeAndVerifyEmail({
        recipient: "user@example.com",
        name: "Jane",
        verifyUrl: "https://example.com/verify",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendWelcomeEmail logs and does not throw", async () => {
    await expect(
      sendWelcomeEmail({
        recipient: "user@example.com",
        name: "Jane",
        getStartedUrl: "https://example.com/dashboard",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendEmailChangeVerificationEmail logs and does not throw", async () => {
    await expect(
      sendEmailChangeVerificationEmail({
        recipient: "user@example.com",
        name: "Jane",
        verifyUrl: "https://example.com/verify",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendPasswordResetEmail logs and does not throw", async () => {
    await expect(
      sendPasswordResetEmail({
        recipient: "user@example.com",
        name: "Jane",
        resetUrl: "https://example.com/reset",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendInvitationEmail logs and does not throw", async () => {
    await expect(
      sendInvitationEmail({
        recipient: "user@example.com",
        inviterName: "Bob",
        organizationName: "Acme Inc",
        acceptUrl: "https://example.com/accept-invitation/inv_123",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
