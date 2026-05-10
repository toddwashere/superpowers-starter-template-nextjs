import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: { send: mockSend },
  })),
}));

vi.mock("../keys", () => ({
  keys: vi.fn(() => ({
    RESEND_API_KEY: "re_test_key",
    EMAIL_FROM: "Test App <noreply@test.com>",
  })),
}));

import provider from "../src/provider/resend/index";

describe("Resend provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { id } on successful send", async () => {
    mockSend.mockResolvedValue({ data: { id: "email-id-123" }, error: null });

    const result = await provider.sendEmail({
      recipient: "user@example.com",
      subject: "Hello",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(result).toEqual({ id: "email-id-123" });
    expect(mockSend).toHaveBeenCalledOnce();
  });

  it("throws meaningful error on Resend rate limit", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "rate limited" },
    });

    await expect(
      provider.sendEmail({
        recipient: "user@example.com",
        subject: "Hello",
        html: "<p>Hello</p>",
        text: "Hello",
      }),
    ).rejects.toThrow("rate limited");
  });

  it("throws meaningful error on invalid API key", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "invalid API key" },
    });

    await expect(
      provider.sendEmail({
        recipient: "user@example.com",
        subject: "Hello",
        html: "<p>Hello</p>",
        text: "Hello",
      }),
    ).rejects.toThrow("invalid API key");
  });
});
