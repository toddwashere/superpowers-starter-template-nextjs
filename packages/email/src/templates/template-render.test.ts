import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { WelcomeAndVerifyEmail } from "./welcome-and-verify-email";
import { WelcomeEmail } from "./welcome-email";
import { EmailChangeVerificationEmail } from "./email-change-verification-email";
import { PasswordResetEmail } from "./password-reset-email";
import { InvitationEmail } from "./invitation-email";

describe("Template render smoke tests", () => {
  it("WelcomeAndVerifyEmail renders to HTML and text", async () => {
    const element = WelcomeAndVerifyEmail({
      name: "Jane",
      verifyUrl: "https://app.example.com/verify?token=abc",
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });
    expect(html.length).toBeGreaterThan(0);
    expect(text.length).toBeGreaterThan(0);
    expect(html).toContain("Jane");
    expect(html).toContain("https://app.example.com/verify?token=abc");
  });

  it("WelcomeEmail renders to HTML and text", async () => {
    const element = WelcomeEmail({
      name: "Jane",
      getStartedUrl: "https://app.example.com/dashboard",
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });
    expect(html.length).toBeGreaterThan(0);
    expect(text.length).toBeGreaterThan(0);
    expect(html).toContain("Jane");
    expect(html).toContain("https://app.example.com/dashboard");
  });

  it("EmailChangeVerificationEmail renders to HTML and text", async () => {
    const element = EmailChangeVerificationEmail({
      name: "Jane",
      verifyUrl: "https://app.example.com/verify?token=xyz",
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });
    expect(html.length).toBeGreaterThan(0);
    expect(text.length).toBeGreaterThan(0);
    expect(html).toContain("Jane");
    expect(html).toContain("https://app.example.com/verify?token=xyz");
  });

  it("PasswordResetEmail renders to HTML and text", async () => {
    const element = PasswordResetEmail({
      name: "Jane",
      resetUrl: "https://app.example.com/reset?token=qrs",
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });
    expect(html.length).toBeGreaterThan(0);
    expect(text.length).toBeGreaterThan(0);
    expect(html).toContain("Jane");
    expect(html).toContain("https://app.example.com/reset?token=qrs");
  });

  it("InvitationEmail renders to HTML and text", async () => {
    const element = InvitationEmail({
      inviterName: "Bob",
      organizationName: "Acme Inc",
      acceptUrl: "https://app.example.com/accept-invitation/inv_123",
    });
    const html = await render(element);
    const text = await render(element, { plainText: true });
    expect(html.length).toBeGreaterThan(0);
    expect(text.length).toBeGreaterThan(0);
    expect(html).toContain("Acme Inc");
    expect(html).toContain("https://app.example.com/accept-invitation/inv_123");
    expect(html).toContain("Bob");
  });
});
