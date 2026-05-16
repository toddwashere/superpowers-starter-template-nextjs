import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  authNavProvider,
  userProvider,
  orgNavProvider,
  orgSwitchProvider,
  buildCommands,
} from "../command-providers";
import type { CommandContext } from "../command-types";

const mockRouter = { push: vi.fn() };
const mockSetTheme = vi.fn();
const mockSignOut = vi.fn();
const mockSetActiveOrg = vi.fn();

function makeContext(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    pathname: "/",
    orgSlug: undefined,
    user: null,
    organizations: [],
    router: mockRouter,
    setTheme: mockSetTheme,
    signOut: mockSignOut,
    setActiveOrg: mockSetActiveOrg,
    searchQuery: "",
    ...overrides,
  };
}

const testUser = { id: "user-1", name: "Test User", email: "test@example.com" };
const testOrgs = [
  { id: "org-1", name: "Acme Inc", slug: "acme-inc" },
  { id: "org-2", name: "Beta Corp", slug: "beta-corp" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Signed-out ────────────────────────────────────────────────────────────────

describe("buildCommands - signed out", () => {
  it("returns auth navigation commands (sign-in, sign-up, forgot-password)", () => {
    const commands = buildCommands(makeContext());
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("nav:sign-in");
    expect(ids).toContain("nav:sign-up");
    expect(ids).toContain("nav:forgot-password");
  });

  it("excludes user commands", () => {
    const commands = buildCommands(makeContext());
    const ids = commands.map((c) => c.id);
    expect(ids).not.toContain("user:account-settings");
    expect(ids).not.toContain("user:sign-out");
    expect(ids).not.toContain("theme:light");
  });

  it("excludes organization navigation commands", () => {
    const commands = buildCommands(makeContext());
    const ids = commands.map((c) => c.id);
    expect(ids).not.toContain("org:dashboard");
    expect(ids).not.toContain("org:members");
  });

  it("excludes org-switch commands even when organizations are present", () => {
    const commands = buildCommands(makeContext({ organizations: testOrgs }));
    const ids = commands.map((c) => c.id);
    expect(ids.some((id) => id.startsWith("org-switch:"))).toBe(false);
  });
});

// ── Signed in, no current org ─────────────────────────────────────────────────

describe("buildCommands - signed in without current org", () => {
  const ctx = makeContext({ user: testUser, organizations: testOrgs });

  it("returns account, theme, and sign-out commands", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("user:account-settings");
    expect(ids).toContain("user:sign-out");
    expect(ids).toContain("theme:light");
    expect(ids).toContain("theme:dark");
    expect(ids).toContain("theme:system");
  });

  it("returns org-switch commands for loaded organizations", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("org-switch:org-1");
    expect(ids).toContain("org-switch:org-2");
  });

  it("excludes auth navigation commands", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).not.toContain("nav:sign-in");
    expect(ids).not.toContain("nav:sign-up");
  });

  it("excludes org-scoped navigation", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).not.toContain("org:dashboard");
    expect(ids).not.toContain("org:members");
    expect(ids).not.toContain("org:billing");
    expect(ids).not.toContain("org:api-keys");
  });
});

// ── Signed in, with current org ───────────────────────────────────────────────

describe("buildCommands - signed in with current org", () => {
  const ctx = makeContext({ user: testUser, organizations: testOrgs, orgSlug: "acme-inc" });

  it("returns org navigation commands", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("org:dashboard");
    expect(ids).toContain("org:ai");
    expect(ids).toContain("org:settings");
    expect(ids).toContain("org:members");
    expect(ids).toContain("org:billing");
    expect(ids).toContain("org:api-keys");
  });

  it("still returns user and theme commands", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("user:account-settings");
    expect(ids).toContain("theme:light");
  });

  it("excludes auth navigation commands", () => {
    const commands = buildCommands(ctx);
    const ids = commands.map((c) => c.id);
    expect(ids).not.toContain("nav:sign-in");
  });
});

// ── Org-switch provider ───────────────────────────────────────────────────────

describe("orgSwitchProvider", () => {
  it("generates one command per organization", () => {
    const commands = orgSwitchProvider(makeContext({ user: testUser, organizations: testOrgs }));
    const [first, second] = commands;
    expect(commands).toHaveLength(2);
    expect(first?.id).toBe("org-switch:org-1");
    expect(second?.id).toBe("org-switch:org-2");
  });

  it("run calls setActiveOrg then navigates to the org", async () => {
    const ctx = makeContext({ user: testUser, organizations: testOrgs });
    const [first] = orgSwitchProvider(ctx);
    await first!.run(ctx);
    expect(mockSetActiveOrg).toHaveBeenCalledWith("org-1");
    expect(mockRouter.push).toHaveBeenCalledWith("/acme-inc");
  });

  it("run navigates to the correct org for the second org", async () => {
    const ctx = makeContext({ user: testUser, organizations: testOrgs });
    const [, second] = orgSwitchProvider(ctx);
    await second!.run(ctx);
    expect(mockSetActiveOrg).toHaveBeenCalledWith("org-2");
    expect(mockRouter.push).toHaveBeenCalledWith("/beta-corp");
  });

  it("returns empty array when no user", () => {
    const commands = orgSwitchProvider(makeContext({ user: null, organizations: testOrgs }));
    expect(commands).toHaveLength(0);
  });

  it("returns empty array when organizations list is empty", () => {
    const commands = orgSwitchProvider(makeContext({ user: testUser, organizations: [] }));
    expect(commands).toHaveLength(0);
  });
});

// ── orgNavProvider ────────────────────────────────────────────────────────────

describe("orgNavProvider", () => {
  it("returns empty array when orgSlug is absent", () => {
    const commands = orgNavProvider(makeContext({ user: testUser }));
    expect(commands).toHaveLength(0);
  });

  it("org:dashboard run navigates to org root", () => {
    const ctx = makeContext({ user: testUser, orgSlug: "acme-inc" });
    const commands = orgNavProvider(ctx);
    const cmd = commands.find((c) => c.id === "org:dashboard")!;
    cmd.run(ctx);
    expect(mockRouter.push).toHaveBeenCalledWith("/acme-inc");
  });

  it("org:ai run navigates to org ai page", () => {
    const ctx = makeContext({ user: testUser, orgSlug: "acme-inc" });
    const commands = orgNavProvider(ctx);
    const cmd = commands.find((c) => c.id === "org:ai")!;
    cmd.run(ctx);
    expect(mockRouter.push).toHaveBeenCalledWith("/acme-inc/ai");
  });

  it("org:members run navigates to members page", () => {
    const ctx = makeContext({ user: testUser, orgSlug: "acme-inc" });
    const commands = orgNavProvider(ctx);
    const cmd = commands.find((c) => c.id === "org:members")!;
    cmd.run(ctx);
    expect(mockRouter.push).toHaveBeenCalledWith("/acme-inc/settings/members");
  });

  it("org:billing run navigates to billing page", () => {
    const ctx = makeContext({ user: testUser, orgSlug: "acme-inc" });
    const commands = orgNavProvider(ctx);
    const cmd = commands.find((c) => c.id === "org:billing")!;
    cmd.run(ctx);
    expect(mockRouter.push).toHaveBeenCalledWith("/acme-inc/settings/billing");
  });

  it("org:api-keys run navigates to api keys page", () => {
    const ctx = makeContext({ user: testUser, orgSlug: "acme-inc" });
    const commands = orgNavProvider(ctx);
    const cmd = commands.find((c) => c.id === "org:api-keys")!;
    cmd.run(ctx);
    expect(mockRouter.push).toHaveBeenCalledWith("/acme-inc/settings/api-keys");
  });
});

// ── Command ID uniqueness ─────────────────────────────────────────────────────

describe("command ID uniqueness", () => {
  it("IDs are unique in signed-out context", () => {
    const commands = buildCommands(makeContext());
    const ids = commands.map((c) => c.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("IDs are unique in signed-in context without org", () => {
    const commands = buildCommands(makeContext({ user: testUser, organizations: testOrgs }));
    const ids = commands.map((c) => c.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("IDs are unique in signed-in context with org", () => {
    const commands = buildCommands(
      makeContext({ user: testUser, organizations: testOrgs, orgSlug: "acme-inc" })
    );
    const ids = commands.map((c) => c.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
});
