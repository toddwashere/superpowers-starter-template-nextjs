import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("../auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "../auth";
import { getCurrentUser } from "../session";

const mockGetSession = vi.mocked(auth.api.getSession);

const fakeSession = {
  user: {
    id: "u1",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: "s1",
    token: "tok_abc",
    userId: "u1",
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the session when authenticated", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    await expect(getCurrentUser()).resolves.toEqual(fakeSession);
  });

  it("returns null when no session exists", async () => {
    mockGetSession.mockResolvedValue(null as never);

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when session lookup fails", async () => {
    mockGetSession.mockRejectedValue(new Error("Session lookup failed"));

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
