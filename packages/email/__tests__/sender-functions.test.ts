import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSendEmail } = vi.hoisted(() => ({
  mockSendEmail: vi.fn().mockResolvedValue({ id: "test-email-id" }),
}));

vi.mock("../src/provider/index", () => ({
  EmailProvider: { sendEmail: mockSendEmail },
}));

vi.mock("../keys", () => ({
  keys: vi.fn(() => ({
    RESEND_API_KEY: "re_test_key",
    EMAIL_FROM: "Test <noreply@test.com>",
  })),
}));

import { sendWelcomeAndVerifyEmail } from "../src/send-welcome-and-verify-email";
import { sendWelcomeEmail } from "../src/send-welcome-email";
import { sendEmailChangeVerificationEmail } from "../src/send-email-change-verification-email";
import { sendPasswordResetEmail } from "../src/send-password-reset-email";
import { sendInvitationEmail } from "../src/send-invitation-email";

describe("Sender functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ id: "test-email-id" });
  });

  it("sendWelcomeAndVerifyEmail calls provider with correct subject", async () => {
    await sendWelcomeAndVerifyEmail({
      recipient: "user@example.com",
      name: "Jane",
      verifyUrl: "https://app.example.com/verify?token=abc",
    });

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: "user@example.com",
        subject: "Welcome! Please verify your email",
        html: expect.stringMatching(/.+/),
        text: expect.stringMatching(/.+/),
      }),
    );
  });

  it("sendWelcomeEmail calls provider with correct subject", async () => {
    await sendWelcomeEmail({
      recipient: "user@example.com",
      name: "Jane",
      getStartedUrl: "https://app.example.com/dashboard",
    });

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Welcome!",
        html: expect.stringMatching(/.+/),
        text: expect.stringMatching(/.+/),
      }),
    );
  });

  it("sendEmailChangeVerificationEmail calls provider with correct subject", async () => {
    await sendEmailChangeVerificationEmail({
      recipient: "user@example.com",
      name: "Jane",
      verifyUrl: "https://app.example.com/verify?token=xyz",
    });

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Confirm your new email address",
        html: expect.stringMatching(/.+/),
        text: expect.stringMatching(/.+/),
      }),
    );
  });

  it("sendPasswordResetEmail calls provider with correct subject", async () => {
    await sendPasswordResetEmail({
      recipient: "user@example.com",
      name: "Jane",
      resetUrl: "https://app.example.com/reset?token=qrs",
    });

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Reset your password",
        html: expect.stringMatching(/.+/),
        text: expect.stringMatching(/.+/),
      }),
    );
  });

  it("sendInvitationEmail calls provider with org name in subject", async () => {
    await sendInvitationEmail({
      recipient: "user@example.com",
      inviterName: "Bob",
      organizationName: "Acme Inc",
      acceptUrl: "https://app.example.com/accept-invitation/inv_123",
    });

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "You've been invited to Acme Inc",
        html: expect.stringMatching(/.+/),
        text: expect.stringMatching(/.+/),
      }),
    );
  });
});
