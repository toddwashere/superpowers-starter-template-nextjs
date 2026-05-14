import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";

const mockDelete = vi.fn();
const mockCookies = vi.fn().mockResolvedValue({ delete: mockDelete });
vi.mock("next/headers", () => ({ cookies: () => mockCookies() }));

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

vi.mock("@/features/dashboard/ui/dashboard-shell", () => ({
  DashboardShell: ({ user, children }: { user: unknown; children: unknown }) =>
    createElement("div", { "data-testid": "shell", "data-user": JSON.stringify(user) }, children),
}));

import DashboardLayout from "./layout";

describe("DashboardLayout session guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /sign-in when session is null", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      DashboardLayout({ children: createElement("div") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/sign-in");
  });

  it("clears session cookies before redirecting to prevent redirect loops", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      DashboardLayout({ children: createElement("div") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockDelete).toHaveBeenCalledWith("better-auth.session_token");
    expect(mockDelete).toHaveBeenCalledWith(
      "__Secure-better-auth.session_token",
    );

    const deleteOrder = mockDelete.mock.invocationCallOrder;
    const redirectOrder = mockRedirect.mock.invocationCallOrder;
    expect(deleteOrder[0]!).toBeLessThan(redirectOrder[0]!);
    expect(deleteOrder[1]!).toBeLessThan(redirectOrder[0]!);
  });

  it("renders DashboardShell when session is valid", async () => {
    const fakeUser = { name: "Test User", image: "https://example.com/pic.jpg" };
    mockGetCurrentUser.mockResolvedValue({ user: fakeUser });

    const child = createElement("span", null, "hello");
    const result = await DashboardLayout({ children: child });

    expect(result).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
