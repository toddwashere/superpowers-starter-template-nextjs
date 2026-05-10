# Account & Org Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `/account` settings page with 6 sections (profile, email, password, connected accounts, sessions, danger zone) plus org members page pending-invitation polish — all using existing BetterAuth APIs with no schema changes.

**Architecture:** New `(account)` route group with a minimal layout (no sidebar, back link to `/`). All 6 section components are client components under `features/auth/account/ui/`. Testable business logic is extracted to `features/auth/account/lib/account-logic.ts` so critical behaviors can be unit-tested without a DOM environment. Three NiceModal dialogs (email change, password change, delete account) follow the project's NiceModal convention.

**Tech Stack:** BetterAuth client (`authClient`), `@tanstack/react-query`, `@ebay/nice-modal-react`, shadcn Card/Dialog/AlertDialog/Button/Input/Badge/Avatar/Tooltip, sonner toasts, Vitest (node env, pure logic tests)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `packages/routes/src/index.ts` | Add `accountPath()` |
| Modify | `packages/ui/src/components/icon-for.tsx` | Add 7 new icons |
| Create | `apps/dashboard/app/(account)/layout.tsx` | Minimal layout: back link + page title |
| Create | `apps/dashboard/app/(account)/account/page.tsx` | Sparse route page |
| Create | `apps/dashboard/features/auth/account/lib/account-logic.ts` | Pure business logic (testable) |
| Create | `apps/dashboard/features/auth/account/lib/parse-user-agent.ts` | UA string → human-readable label |
| Create | `apps/dashboard/features/auth/account/ui/profile-settings.tsx` | Avatar + name editor |
| Create | `apps/dashboard/features/auth/account/ui/change-email-button-modal.tsx` | NiceModal: email change flow |
| Create | `apps/dashboard/features/auth/account/ui/email-settings.tsx` | Email card + open change modal |
| Create | `apps/dashboard/features/auth/account/ui/change-password-button-modal.tsx` | NiceModal: password change flow |
| Create | `apps/dashboard/features/auth/account/ui/password-settings.tsx` | Conditional: form or "no password" message |
| Create | `apps/dashboard/features/auth/account/ui/connected-accounts-settings.tsx` | OAuth link/unlink with unlink guard |
| Create | `apps/dashboard/features/auth/account/ui/sessions-settings.tsx` | Session list with revoke |
| Create | `apps/dashboard/features/auth/account/ui/delete-account-confirm-dialog.tsx` | NiceModal: typed-phrase confirm |
| Create | `apps/dashboard/features/auth/account/ui/danger-zone-settings.tsx` | Destructive card + open delete dialog |
| Create | `apps/dashboard/features/auth/account/ui/account-settings-page-content.tsx` | Compose all 6 sections |
| Create | `apps/dashboard/features/auth/account/__tests__/account-logic.test.ts` | 5 pure logic unit tests |
| Create | `apps/dashboard/features/auth/account/__tests__/parse-user-agent.test.ts` | 4 UA parsing unit tests |
| Modify | `apps/dashboard/common/ui/nav-user.tsx` | Account → Link to `/account`; remove Notifications |
| Modify | `apps/dashboard/features/organization/ui/pending-invitations.tsx` | Add status badge; show Cancel text |

---

### Task 1: Add `accountPath()` route helper

**Files:**
- Modify: `packages/routes/src/index.ts`

- [ ] **Step 1: Add the route helper**

Open `packages/routes/src/index.ts`. Append after the last export:

```ts
export function accountPath() {
  return "/account";
}
```

- [ ] **Step 2: Verify the file builds**

```bash
cd /path/to/repo && pnpm type-check 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/routes/src/index.ts
git commit -m "feat(routes): add accountPath()"
```

---

### Task 2: Add new icons to the icon registry

**Files:**
- Modify: `packages/ui/src/components/icon-for.tsx`

The components in later tasks use 7 icons that don't exist yet: `IconForEmail`, `IconForPassword`, `IconForVerified`, `IconForWarning`, `IconForConnect`, `IconForDisconnect`, `IconForDevice`.

- [ ] **Step 1: Add the new Lucide imports**

In `packages/ui/src/components/icon-for.tsx`, add to the existing import block (keep alphabetical order):

```ts
import {
  AlertTriangle,    // add
  BadgeCheck,
  Bell,
  Bold,
  Building2,
  CheckCircle2,     // add
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Italic,
  KeyRound,         // add
  LayoutDashboard,
  Link2,            // add
  LogOut,
  Mail,             // add
  Monitor,          // add
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  Underline,
  Unlink,           // add
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react"
```

- [ ] **Step 2: Add the 7 new icon exports**

Append after `IconForUnderline` at the bottom of the file:

```tsx
export const IconForEmail = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Mail ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForEmail.displayName = "IconForEmail";

export const IconForPassword = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <KeyRound ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForPassword.displayName = "IconForPassword";

export const IconForVerified = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <CheckCircle2 ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForVerified.displayName = "IconForVerified";

export const IconForWarning = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <AlertTriangle ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForWarning.displayName = "IconForWarning";

export const IconForConnect = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Link2 ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForConnect.displayName = "IconForConnect";

export const IconForDisconnect = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Unlink ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForDisconnect.displayName = "IconForDisconnect";

export const IconForDevice = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Monitor ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForDevice.displayName = "IconForDevice";
```

- [ ] **Step 3: Type-check**

```bash
pnpm type-check 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/icon-for.tsx
git commit -m "feat(ui): add IconForEmail, IconForPassword, IconForVerified, IconForWarning, IconForConnect, IconForDisconnect, IconForDevice"
```

---

### Task 3: Create the `(account)` route group

**Files:**
- Create: `apps/dashboard/app/(account)/layout.tsx`
- Create: `apps/dashboard/app/(account)/account/page.tsx`

- [ ] **Step 1: Create the layout**

Create `apps/dashboard/app/(account)/layout.tsx`:

```tsx
import Link from "next/link";
import { homePath } from "@workspace/routes";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-6">
          <Link
            href={homePath()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </Link>
          <h1 className="font-semibold">Account Settings</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create the sparse page**

Create `apps/dashboard/app/(account)/account/page.tsx`:

```tsx
import type { Metadata } from "next";
import { AccountSettingsPageContent } from "@/features/auth/account/ui/account-settings-page-content";

export const metadata: Metadata = { title: "Account Settings" };

export default function AccountPage() {
  return <AccountSettingsPageContent />;
}
```

Note: `AccountSettingsPageContent` doesn't exist yet — it'll be created in Task 11. The file is correct and will compile once that task is done.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/(account)/
git commit -m "feat(account): add (account) route group with layout and page"
```

---

### Task 4: Business logic utilities + tests

**Files:**
- Create: `apps/dashboard/features/auth/account/lib/account-logic.ts`
- Create: `apps/dashboard/features/auth/account/__tests__/account-logic.test.ts`

These pure functions are the testable heart of the critical behaviors. Components call them to decide what to render.

- [ ] **Step 1: Write the failing tests**

Create `apps/dashboard/features/auth/account/__tests__/account-logic.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  hasCredentialAccount,
  hasOnlyOneAuthMethod,
  isDeleteConfirmationValid,
  isCurrentSession,
  shouldShowConnectedAccounts,
} from "../account-logic";

describe("hasCredentialAccount", () => {
  it("returns true when a credential account exists", () => {
    expect(hasCredentialAccount([{ providerId: "credential" }])).toBe(true);
  });

  it("returns false when only OAuth accounts exist", () => {
    expect(hasCredentialAccount([{ providerId: "google" }])).toBe(false);
  });

  it("returns false for empty list", () => {
    expect(hasCredentialAccount([])).toBe(false);
  });
});

describe("hasOnlyOneAuthMethod", () => {
  it("returns true when exactly one account exists", () => {
    expect(hasOnlyOneAuthMethod([{ providerId: "google" }])).toBe(true);
  });

  it("returns false when two accounts exist", () => {
    expect(
      hasOnlyOneAuthMethod([
        { providerId: "google" },
        { providerId: "credential" },
      ])
    ).toBe(false);
  });

  it("returns true for empty list", () => {
    expect(hasOnlyOneAuthMethod([])).toBe(true);
  });
});

describe("isDeleteConfirmationValid", () => {
  it("returns true for exact phrase", () => {
    expect(isDeleteConfirmationValid("delete my account")).toBe(true);
  });

  it("returns false for partial match", () => {
    expect(isDeleteConfirmationValid("delete")).toBe(false);
  });

  it("returns false for case mismatch", () => {
    expect(isDeleteConfirmationValid("Delete My Account")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isDeleteConfirmationValid("")).toBe(false);
  });
});

describe("isCurrentSession", () => {
  it("returns true when tokens match", () => {
    expect(isCurrentSession("abc123", "abc123")).toBe(true);
  });

  it("returns false when tokens differ", () => {
    expect(isCurrentSession("abc123", "xyz456")).toBe(false);
  });
});

describe("shouldShowConnectedAccounts", () => {
  it("returns true when providers are configured", () => {
    expect(shouldShowConnectedAccounts([{ id: "google", name: "Google" }])).toBe(true);
  });

  it("returns false when no providers configured", () => {
    expect(shouldShowConnectedAccounts([])).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/dashboard && pnpm test 2>&1 | tail -15
```

Expected: FAIL — `account-logic` module not found.

- [ ] **Step 3: Create the implementation**

Create `apps/dashboard/features/auth/account/lib/account-logic.ts`:

```ts
export type AccountRecord = { providerId: string };

export function hasCredentialAccount(accounts: AccountRecord[]): boolean {
  return accounts.some((a) => a.providerId === "credential");
}

export function hasOnlyOneAuthMethod(accounts: AccountRecord[]): boolean {
  return accounts.length <= 1;
}

export function isDeleteConfirmationValid(input: string): boolean {
  return input === "delete my account";
}

export function isCurrentSession(
  sessionToken: string,
  currentToken: string
): boolean {
  return sessionToken === currentToken;
}

export function shouldShowConnectedAccounts(
  configuredProviders: { id: string; name: string }[]
): boolean {
  return configuredProviders.length > 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/dashboard && pnpm test 2>&1 | tail -15
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/features/auth/account/
git commit -m "feat(account): add account-logic utilities with tests"
```

---

### Task 5: User-agent parser + tests

**Files:**
- Create: `apps/dashboard/features/auth/account/lib/parse-user-agent.ts`
- Create: `apps/dashboard/features/auth/account/__tests__/parse-user-agent.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/dashboard/features/auth/account/__tests__/parse-user-agent.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseUserAgent } from "../parse-user-agent";

describe("parseUserAgent", () => {
  it("identifies Chrome on macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(parseUserAgent(ua)).toBe("Chrome on macOS");
  });

  it("identifies Firefox on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0";
    expect(parseUserAgent(ua)).toBe("Firefox on Windows");
  });

  it("identifies Edge on Windows (not Chrome, despite containing Chrome in UA)", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    expect(parseUserAgent(ua)).toBe("Edge on Windows");
  });

  it("returns 'Unknown device' for empty string", () => {
    expect(parseUserAgent("")).toBe("Unknown device");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/dashboard && pnpm test 2>&1 | tail -15
```

Expected: FAIL — `parse-user-agent` module not found.

- [ ] **Step 3: Create the implementation**

Create `apps/dashboard/features/auth/account/lib/parse-user-agent.ts`:

```ts
export function parseUserAgent(ua: string): string {
  if (!ua) return "Unknown device";

  let browser = "Unknown browser";
  // Check Edge before Chrome — Edge UA contains "Chrome"
  if (/Edg\/[\d.]+/i.test(ua)) {
    browser = "Edge";
  } else if (/Chrome\/[\d.]+/i.test(ua)) {
    browser = "Chrome";
  } else if (/Firefox\/[\d.]+/i.test(ua)) {
    browser = "Firefox";
  } else if (/Safari\/[\d.]+/i.test(ua)) {
    browser = "Safari";
  }

  let os = "Unknown OS";
  if (/iPhone|iPad/i.test(ua)) {
    os = "iOS";
  } else if (/Android/i.test(ua)) {
    os = "Android";
  } else if (/Mac OS X/i.test(ua)) {
    os = "macOS";
  } else if (/Windows/i.test(ua)) {
    os = "Windows";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  return `${browser} on ${os}`;
}
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
cd apps/dashboard && pnpm test 2>&1 | tail -15
```

Expected: all tests PASS (both account-logic and parse-user-agent suites).

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/features/auth/account/lib/parse-user-agent.ts \
        apps/dashboard/features/auth/account/__tests__/parse-user-agent.test.ts
git commit -m "feat(account): add parseUserAgent utility with tests"
```

---

### Task 6: Profile settings section

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/profile-settings.tsx`

- [ ] **Step 1: Create profile-settings.tsx**

Create `apps/dashboard/features/auth/account/ui/profile-settings.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { toast } from "sonner";

export function ProfileSettings() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [imageUrl, setImageUrl] = useState(user?.image ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    name !== (user?.name ?? "") || imageUrl !== (user?.image ?? "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl((ev.target?.result as string) ?? "");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.updateUser({ name, image: imageUrl });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user?.name ?? "User";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative"
            aria-label="Change avatar"
          >
            <Avatar className="size-16">
              <AvatarImage src={imageUrl} alt={displayName} />
              <AvatarFallback className="text-lg">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-sm text-muted-foreground">
            Click avatar to upload. Stored as base64 — swap in S3/R2 for
            production.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} readOnly disabled />
          <p className="text-xs text-muted-foreground">
            Change your email in the Email section below.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!isDirty || isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/profile-settings.tsx
git commit -m "feat(account): add ProfileSettings section"
```

---

### Task 7: Email settings section + change-email modal

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/change-email-button-modal.tsx`
- Create: `apps/dashboard/features/auth/account/ui/email-settings.tsx`

- [ ] **Step 1: Create the NiceModal for email change**

Create `apps/dashboard/features/auth/account/ui/change-email-button-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { authClient } from "@/features/auth/data/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";

export const ChangeEmailButtonModal = NiceModal.create(() => {
  const modal = useModal();
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await authClient.changeEmail({
        newEmail,
        callbackURL: "/account",
      });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to send verification email");
        return;
      }
      toast.success(`Verification email sent to ${newEmail}`);
      modal.hide();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            A verification link will be sent to your new address. Your current
            email stays active until the new one is verified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">New email address</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={modal.hide}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newEmail}>
              {isLoading ? "Sending..." : "Send verification email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
```

- [ ] **Step 2: Create email-settings.tsx**

Create `apps/dashboard/features/auth/account/ui/email-settings.tsx`:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  IconForEmail,
  IconForVerified,
  IconForWarning,
} from "@workspace/ui/components/icon-for";
import { ChangeEmailButtonModal } from "./change-email-button-modal";

export function EmailSettings() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForEmail />
          Email
        </CardTitle>
        <CardDescription>Manage your email address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{user?.email}</span>
          {user?.emailVerified ? (
            <IconForVerified
              className="text-green-500"
              aria-label="Email verified"
            />
          ) : (
            <IconForWarning
              className="text-amber-500"
              aria-label="Email not verified"
            />
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => NiceModal.show(ChangeEmailButtonModal)}
        >
          Change email
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/change-email-button-modal.tsx \
        apps/dashboard/features/auth/account/ui/email-settings.tsx
git commit -m "feat(account): add EmailSettings section with change-email modal"
```

---

### Task 8: Password settings section + change-password modal

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/change-password-button-modal.tsx`
- Create: `apps/dashboard/features/auth/account/ui/password-settings.tsx`

- [ ] **Step 1: Create the NiceModal for password change**

Create `apps/dashboard/features/auth/account/ui/change-password-button-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { authClient } from "@/features/auth/data/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";

export const ChangePasswordButtonModal = NiceModal.create(() => {
  const modal = useModal();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (newPassword.length < 8) {
      setValidationError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to change password");
        return;
      }
      toast.success("Password changed");
      modal.hide();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={modal.hide}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
```

- [ ] **Step 2: Create password-settings.tsx**

Create `apps/dashboard/features/auth/account/ui/password-settings.tsx`:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { IconForPassword } from "@workspace/ui/components/icon-for";
import { hasCredentialAccount } from "../lib/account-logic";
import { ChangePasswordButtonModal } from "./change-password-button-modal";

export function PasswordSettings() {
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const result = await authClient.listAccounts();
      return result.data ?? [];
    },
  });

  const isCredentialUser = hasCredentialAccount(accounts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForPassword />
          Password
        </CardTitle>
        <CardDescription>Manage your password.</CardDescription>
      </CardHeader>
      <CardContent>
        {isCredentialUser ? (
          <Button
            variant="outline"
            onClick={() => NiceModal.show(ChangePasswordButtonModal)}
          >
            Change password
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            You signed in with a social account. No password is set.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/change-password-button-modal.tsx \
        apps/dashboard/features/auth/account/ui/password-settings.tsx
git commit -m "feat(account): add PasswordSettings section with change-password modal"
```

---

### Task 9: Connected accounts section

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/connected-accounts-settings.tsx`

The `CONFIGURED_PROVIDERS` array is the only thing adopters touch when adding/removing OAuth providers. It must match the providers configured in `packages/auth/src/auth.ts` (currently google + microsoft).

- [ ] **Step 1: Create connected-accounts-settings.tsx**

Create `apps/dashboard/features/auth/account/ui/connected-accounts-settings.tsx`:

```tsx
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  IconForConnect,
  IconForDisconnect,
} from "@workspace/ui/components/icon-for";
import {
  hasOnlyOneAuthMethod,
  shouldShowConnectedAccounts,
} from "../lib/account-logic";
import { toast } from "sonner";

// Update this array when adding or removing OAuth providers in packages/auth/src/auth.ts
const CONFIGURED_PROVIDERS: { id: string; name: string }[] = [
  { id: "google", name: "Google" },
  { id: "microsoft", name: "Microsoft" },
];

export function ConnectedAccountsSettings() {
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const result = await authClient.listAccounts();
      return result.data ?? [];
    },
  });

  if (!shouldShowConnectedAccounts(CONFIGURED_PROVIDERS)) {
    return null;
  }

  const canUnlink = !hasOnlyOneAuthMethod(accounts);

  const handleLink = (provider: string) => {
    authClient.linkSocial({
      provider: provider as "google" | "microsoft",
      callbackURL: "/account",
    });
  };

  const handleUnlink = async (providerId: string) => {
    const result = await authClient.unlinkAccount({ providerId });
    if (result.error) {
      toast.error(result.error.message ?? "Failed to unlink account");
      return;
    }
    toast.success("Account unlinked");
    await queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Link or unlink OAuth sign-in providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {CONFIGURED_PROVIDERS.map((provider) => {
            const linked = accounts.some((a) => a.providerId === provider.id);
            return (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{provider.name}</span>
                {linked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Connected
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* span wrapper required so Tooltip works on a disabled button */}
                        <span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlink(provider.id)}
                            disabled={!canUnlink}
                          >
                            <IconForDisconnect className="mr-1" />
                            Unlink
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canUnlink && (
                        <TooltipContent>
                          You need at least one sign-in method.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(provider.id)}
                  >
                    <IconForConnect className="mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/connected-accounts-settings.tsx
git commit -m "feat(account): add ConnectedAccountsSettings section"
```

---

### Task 10: Sessions section

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/sessions-settings.tsx`

`authClient.useSession()` returns `{ data: { user, session } }`. The `session` object has `token`. `authClient.listSessions()` returns session objects with `token`, `userAgent`, `ipAddress`, `createdAt`.

- [ ] **Step 1: Create sessions-settings.tsx**

Create `apps/dashboard/features/auth/account/ui/sessions-settings.tsx`:

```tsx
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { IconForDevice } from "@workspace/ui/components/icon-for";
import { isCurrentSession } from "../lib/account-logic";
import { parseUserAgent } from "../lib/parse-user-agent";
import { toast } from "sonner";

export function SessionsSettings() {
  const queryClient = useQueryClient();
  const { data: sessionData } = authClient.useSession();
  const currentToken = sessionData?.session?.token ?? "";

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const result = await authClient.listSessions();
      return result.data ?? [];
    },
  });

  const handleRevoke = async (token: string) => {
    const result = await authClient.revokeSession({ token });
    if (result.error) {
      toast.error(result.error.message ?? "Failed to revoke session");
      return;
    }
    toast.success("Session revoked");
    await queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const handleRevokeAll = async () => {
    const result = await authClient.revokeSessions();
    if (result.error) {
      toast.error(result.error.message ?? "Failed to revoke sessions");
      return;
    }
    toast.success("All other sessions revoked");
    await queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (isCurrentSession(a.token, currentToken)) return -1;
    if (isCurrentSession(b.token, currentToken)) return 1;
    return 0;
  });

  const otherSessionCount = sessions.filter(
    (s) => !isCurrentSession(s.token, currentToken)
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForDevice />
          Active Sessions
        </CardTitle>
        <CardDescription>View and revoke active sign-in sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSessions.map((s) => {
          const isCurrent = isCurrentSession(s.token, currentToken);
          return (
            <div
              key={s.token}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {parseUserAgent(s.userAgent ?? "")}
                  </span>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      This device
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.ipAddress} · {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              {isCurrent ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => authClient.signOut()}
                >
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(s.token)}
                >
                  Revoke
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
      {otherSessionCount > 0 && (
        <CardFooter>
          <Button variant="outline" onClick={handleRevokeAll}>
            Revoke all other sessions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/sessions-settings.tsx
git commit -m "feat(account): add SessionsSettings section"
```

---

### Task 11: Danger zone section + delete-account modal

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/delete-account-confirm-dialog.tsx`
- Create: `apps/dashboard/features/auth/account/ui/danger-zone-settings.tsx`

- [ ] **Step 1: Create the NiceModal for account deletion**

Create `apps/dashboard/features/auth/account/ui/delete-account-confirm-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { authClient } from "@/features/auth/data/auth-client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { isDeleteConfirmationValid } from "../lib/account-logic";
import { signInPath } from "@workspace/routes";

export const DeleteAccountConfirmDialog = NiceModal.create(() => {
  const modal = useModal();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canConfirm = isDeleteConfirmationValid(confirmText);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.deleteUser();
      if (result.error) {
        setIsLoading(false);
        return;
      }
      await authClient.signOut();
      router.push(signInPath());
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog
      open={modal.visible}
      onOpenChange={(open) => !open && modal.hide()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account, remove you from all
            organizations, and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete">
            Type <strong>delete my account</strong> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete my account"
          />
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={modal.hide}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? "Deleting..." : "Delete my account"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
```

- [ ] **Step 2: Create danger-zone-settings.tsx**

Create `apps/dashboard/features/auth/account/ui/danger-zone-settings.tsx`:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { DeleteAccountConfirmDialog } from "./delete-account-confirm-dialog";

export function DangerZoneSettings() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={() => NiceModal.show(DeleteAccountConfirmDialog)}
        >
          Delete my account
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/delete-account-confirm-dialog.tsx \
        apps/dashboard/features/auth/account/ui/danger-zone-settings.tsx
git commit -m "feat(account): add DangerZoneSettings with delete-account confirm dialog"
```

---

### Task 12: Compose account-settings-page-content

**Files:**
- Create: `apps/dashboard/features/auth/account/ui/account-settings-page-content.tsx`

- [ ] **Step 1: Create account-settings-page-content.tsx**

Create `apps/dashboard/features/auth/account/ui/account-settings-page-content.tsx`:

```tsx
"use client";

import { ProfileSettings } from "./profile-settings";
import { EmailSettings } from "./email-settings";
import { PasswordSettings } from "./password-settings";
import { ConnectedAccountsSettings } from "./connected-accounts-settings";
import { SessionsSettings } from "./sessions-settings";
import { DangerZoneSettings } from "./danger-zone-settings";

export function AccountSettingsPageContent() {
  return (
    <div className="space-y-6">
      <ProfileSettings />
      <EmailSettings />
      <PasswordSettings />
      <ConnectedAccountsSettings />
      <SessionsSettings />
      <DangerZoneSettings />
    </div>
  );
}
```

- [ ] **Step 2: Type-check (all 12 tasks' files resolve together now)**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/features/auth/account/ui/account-settings-page-content.tsx
git commit -m "feat(account): compose AccountSettingsPageContent with all 6 sections"
```

---

### Task 13: Wire NavUser Account link, remove Notifications

**Files:**
- Modify: `apps/dashboard/common/ui/nav-user.tsx`

Current state (lines 116-123):
```tsx
<DropdownMenuGroup>
  <DropdownMenuItem>
    <IconForProfile />
    Account
  </DropdownMenuItem>
  <DropdownMenuItem>
    <IconForNotifications />
    Notifications
  </DropdownMenuItem>
</DropdownMenuGroup>
```

Target state: Account item → real Link; Notifications item removed entirely.

- [ ] **Step 1: Add the accountPath import**

In `apps/dashboard/common/ui/nav-user.tsx`, update the `@workspace/routes` import to include `accountPath`:

```tsx
import { signInPath, accountPath } from "@workspace/routes";
```

Also add `Link` from next/link (it's not currently imported):

```tsx
import Link from "next/link";
```

- [ ] **Step 2: Replace the Account/Notifications group**

Replace this block:

```tsx
<DropdownMenuGroup>
  <DropdownMenuItem>
    <IconForProfile />
    Account
  </DropdownMenuItem>
  <DropdownMenuItem>
    <IconForNotifications />
    Notifications
  </DropdownMenuItem>
</DropdownMenuGroup>
```

With:

```tsx
<DropdownMenuGroup>
  <DropdownMenuItem asChild>
    <Link href={accountPath()}>
      <IconForProfile />
      Account
    </Link>
  </DropdownMenuItem>
</DropdownMenuGroup>
```

- [ ] **Step 3: Remove the unused IconForNotifications import**

Remove `IconForNotifications` from the icon-for import line:

```tsx
import {
  IconForProfile,
  IconForExpand,
  IconForSignOut,
} from "@workspace/ui/components/icon-for";
```

- [ ] **Step 4: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/common/ui/nav-user.tsx
git commit -m "feat(account): wire Account nav link, remove Notifications stub"
```

---

### Task 14: Polish pending invitations (org enhancement)

**Files:**
- Modify: `apps/dashboard/features/organization/ui/pending-invitations.tsx`

The component already exists and is already rendered in `members-page-content.tsx`. The spec requires: email, role, **status**, expiration date, and a visible **"Cancel"** button. Currently: no status badge, Cancel button shows only an X icon with `sr-only` text.

- [ ] **Step 1: Add status badge and visible Cancel text**

Replace the contents of `apps/dashboard/features/organization/ui/pending-invitations.tsx`:

```tsx
"use client";

import { useState } from "react";
import { authClient } from "@workspace/auth/client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useQueryClient } from "@tanstack/react-query";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
}

interface PendingInvitationsProps {
  invitations: Invitation[];
  orgSlug: string;
  canManageInvitations: boolean;
}

export function PendingInvitations({
  invitations,
  orgSlug,
  canManageInvitations,
}: PendingInvitationsProps) {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );

  if (pendingInvitations.length === 0) {
    return null;
  }

  const handleCancel = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      await authClient.organization.cancelInvitation({ invitationId });
      await queryClient.invalidateQueries({
        queryKey: ["organization", orgSlug],
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pending Invitations</CardTitle>
        <CardDescription>
          {pendingInvitations.length} pending{" "}
          {pendingInvitations.length === 1 ? "invitation" : "invitations"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{invitation.email}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {invitation.role}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {invitation.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {canManageInvitations && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(invitation.id)}
                  disabled={cancellingId === invitation.id}
                >
                  {cancellingId === invitation.id ? "Cancelling..." : "Cancel"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/dashboard && pnpm type-check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/features/organization/ui/pending-invitations.tsx
git commit -m "feat(org): show status badge and Cancel text on pending invitations"
```

---

### Task 15: Full test + type-check verification

**Files:** (none new — just verification)

- [ ] **Step 1: Run the full test suite**

```bash
cd apps/dashboard && pnpm test 2>&1
```

Expected output:
```
✓ features/organization/data/__tests__/org-types.test.ts (16 tests)
✓ features/auth/account/__tests__/account-logic.test.ts (12 tests)
✓ features/auth/account/__tests__/parse-user-agent.test.ts (4 tests)

Test Files  3 passed (3)
     Tests  32 passed (32)
```

- [ ] **Step 2: Type-check the full monorepo**

```bash
cd apps/dashboard && pnpm type-check 2>&1
```

Expected: 0 errors.

- [ ] **Step 3: Commit (if any straggler files remain unstaged)**

```bash
git status
# Only commit if there's anything unstaged — all should already be committed
```

---

## Self-Review Against Spec

| Spec Requirement | Task |
|-----------------|------|
| Route at `/account`, separate from org layout | Task 3 |
| Minimal layout: back link → `/`, title "Account Settings" | Task 3 |
| Entry point: NavUser "Account" → `/account` | Task 13 |
| Remove Notifications item from NavUser | Task 13 |
| Section 1 Profile: name, avatar (click-to-upload base64), read-only email | Task 6 |
| Profile "Save changes" disabled until dirty | Task 6 |
| Profile API: `authClient.updateUser()` | Task 6 |
| Section 2 Email: current email, verified badge, "Change email" button | Task 7 |
| Change email: NiceModal with new email input | Task 7 |
| Change email API: `authClient.changeEmail()`, toast | Task 7 |
| Section 3 Password: credential users → form; OAuth-only → "no password" message | Task 8 |
| Change password: NiceModal, current + new + confirm fields | Task 8 |
| Password validation: min length, match | Task 8 |
| Password API: `authClient.changePassword()` | Task 8 |
| Detecting credential vs OAuth via `listAccounts()` | Tasks 4 + 8 |
| Section 4 Connected accounts: hides when no providers configured | Tasks 4 + 9 |
| Provider rows: Connected + Unlink, or Not connected + Connect | Task 9 |
| Unlink guard: disabled with tooltip when only one auth method | Tasks 4 + 9 |
| API: `listAccounts()`, `linkSocial()`, `unlinkAccount()` | Task 9 |
| Section 5 Sessions: current session first + "This device" badge | Task 10 |
| Current session action: "Sign out" (not "Revoke") | Task 10 |
| Other sessions: UA parsed, IP, date, "Revoke" button | Tasks 5 + 10 |
| "Revoke all other sessions" button | Task 10 |
| API: `listSessions()`, `revokeSession()`, `revokeSessions()` | Task 10 |
| Section 6 Danger zone: destructive card, "Delete my account" button | Task 11 |
| Delete: NiceModal, typed phrase gate "delete my account" | Tasks 4 + 11 |
| Delete: API `deleteUser()`, sign out, redirect to `/sign-in` | Task 11 |
| Org: pending invitations show email, role, **status**, expiration, Cancel | Task 14 |
| Cancel respects canManageInvitations prop | Task 14 |
| Test: unlink guard (hasOnlyOneAuthMethod) | Task 4 |
| Test: password conditional (hasCredentialAccount) | Task 4 |
| Test: delete confirmation gate (isDeleteConfirmationValid) | Task 4 |
| Test: current session protection (isCurrentSession) | Task 4 |
| Test: connected accounts hides when no providers (shouldShowConnectedAccounts) | Task 4 |
| Test: UA parser (parseUserAgent) | Task 5 |
| accountPath() route helper | Task 1 |
| 7 new icons added to icon registry | Task 2 |
