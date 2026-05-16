import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement, type ReactNode } from "react";

const mockRedirect = vi.fn<(url: string) => never>();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));

const mockGetCurrentUser = vi.fn();
vi.mock("@workspace/auth/session", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

import OrganizationLayout from "./layout";

describe("OrganizationLayout session guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /api/clear-session when session is null", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      OrganizationLayout({ children: createElement("div") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/api/clear-session");
  });

  it("redirects to clear-session instead of /sign-in to avoid redirect loops", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      OrganizationLayout({ children: createElement("div") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).not.toHaveBeenCalledWith("/sign-in");
    expect(mockRedirect).toHaveBeenCalledWith("/api/clear-session");
  });

  it("renders children when session is valid", async () => {
    mockGetCurrentUser.mockResolvedValue({ user: { id: "user_1" } });

    const child = createElement("span", null, "hello");
    const result = await OrganizationLayout({ children: child });

    expect(result).toBe(child as ReactNode);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
