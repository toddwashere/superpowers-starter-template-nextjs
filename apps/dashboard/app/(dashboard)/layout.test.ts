import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";

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
    createElement("div", { "data-user": JSON.stringify(user) }, children),
}));

import DashboardLayout from "./layout";

describe("DashboardLayout session guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /api/clear-session when session is null", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      DashboardLayout({ children: createElement("div") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/api/clear-session");
  });

  it("redirects to clear-session (not /sign-in directly) to avoid redirect loops", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      DashboardLayout({ children: createElement("div") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).not.toHaveBeenCalledWith("/sign-in");
    expect(mockRedirect).toHaveBeenCalledWith("/api/clear-session");
  });

  it("renders DashboardShell when session is valid", async () => {
    const fakeUser = { name: "Test User", image: "https://example.com/pic.jpg" };
    mockGetCurrentUser.mockResolvedValue({ user: fakeUser });

    const child = createElement("span", null, "hello");
    const result = await DashboardLayout({ children: child });

    expect(result).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
