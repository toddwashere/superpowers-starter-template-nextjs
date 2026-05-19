import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendWelcomeAndVerify = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockSendEmailChangeVerification = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@workspace/email/send-welcome-and-verify-email", () => ({
  sendWelcomeAndVerifyEmail: mockSendWelcomeAndVerify,
}));

vi.mock("@workspace/email/send-email-change-verification-email", () => ({
  sendEmailChangeVerificationEmail: mockSendEmailChangeVerification,
}));

import { routeVerificationEmail } from "./email-routing";

describe("routeVerificationEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls sendWelcomeAndVerifyEmail when emailVerified is false (new account)", async () => {
    await routeVerificationEmail({
      user: {
        email: "user@example.com",
        name: "Jane",
        emailVerified: false,
      },
      url: "https://app.example.com/verify?token=abc",
    });

    expect(mockSendWelcomeAndVerify).toHaveBeenCalledOnce();
    expect(mockSendWelcomeAndVerify).toHaveBeenCalledWith({
      recipient: "user@example.com",
      name: "Jane",
      verifyUrl: "https://app.example.com/verify?token=abc",
    });
    expect(mockSendEmailChangeVerification).not.toHaveBeenCalled();
  });

  it("calls sendEmailChangeVerificationEmail when emailVerified is true (email change)", async () => {
    await routeVerificationEmail({
      user: {
        email: "newemail@example.com",
        name: "Jane",
        emailVerified: true,
      },
      url: "https://app.example.com/verify?token=xyz",
    });

    expect(mockSendEmailChangeVerification).toHaveBeenCalledOnce();
    expect(mockSendEmailChangeVerification).toHaveBeenCalledWith({
      recipient: "newemail@example.com",
      name: "Jane",
      verifyUrl: "https://app.example.com/verify?token=xyz",
    });
    expect(mockSendWelcomeAndVerify).not.toHaveBeenCalled();
  });
});
