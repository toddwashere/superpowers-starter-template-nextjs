# Email Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add transactional email support with React Email templates, a Resend provider implementation behind a typed `EmailProvider` abstraction, and replace the three `console.log` stubs in `packages/auth/src/auth.ts` with real sender calls.

**Architecture:** A new `packages/email` shared package contains the provider interface, Resend implementation, five React Email templates, and one typed sender function per template. Sender functions render the template server-side then call the provider. An `email-routing.ts` module in `packages/auth` extracts the `sendVerificationEmail` branching logic so it can be unit-tested. A new `apps/email-preview` app runs the React Email CLI dev server for local template preview.

**Tech Stack:** `@react-email/components`, `@react-email/render`, `@react-email/tailwind`, Resend SDK, Zod v4 for env validation, Vitest, pnpm workspaces, Turborepo.

---

## File Map

**Create — `packages/email/`**
| File | Responsibility |
|------|---------------|
| `package.json` | Package config, exports map, all deps |
| `tsconfig.json` | Extends `react-library.json` for JSX support |
| `eslint.config.mjs` | React eslint config |
| `vitest.config.ts` | Node environment |
| `keys.ts` | Zod env validation: `RESEND_API_KEY` (optional), `EMAIL_FROM` (default) |
| `src/index.ts` | Barrel re-export of all 5 sender functions |
| `src/render.ts` | `renderEmail(element)` → `{ html, text }` |
| `src/provider/types.ts` | `EmailPayload` and `EmailProvider` interfaces |
| `src/provider/resend/resend-options.ts` | `getResendFrom()` reads `EMAIL_FROM` from keys |
| `src/provider/resend/index.ts` | Resend implementation of `EmailProvider` (default export) |
| `src/provider/index.ts` | Re-exports Resend provider as named `EmailProvider` |
| `src/templates/_components/email-layout.tsx` | Shared `Html→Head→Preview→Tailwind→Body→Container` wrapper |
| `src/templates/welcome-and-verify-email.tsx` | New account email-verify template |
| `src/templates/welcome-email.tsx` | Welcome-only template |
| `src/templates/email-change-verification-email.tsx` | Email change verify template |
| `src/templates/password-reset-email.tsx` | Password reset template |
| `src/templates/invitation-email.tsx` | Org invitation template |
| `src/send-welcome-and-verify-email.ts` | Sender function for welcome+verify |
| `src/send-welcome-email.ts` | Sender function for welcome-only |
| `src/send-email-change-verification-email.ts` | Sender function for email-change verify |
| `src/send-password-reset-email.ts` | Sender function for password reset |
| `src/send-invitation-email.ts` | Sender function for invitation |
| `__tests__/resend-provider.test.ts` | Provider error handling (3 cases) |
| `__tests__/template-render.test.ts` | Smoke-render each template (5 cases) |
| `__tests__/sender-functions.test.ts` | Mock provider, verify wiring (5 cases) |
| `__tests__/graceful-degradation.test.ts` | No API key → log, no throw (5 cases) |

**Create — `packages/auth/`**
| File | Responsibility |
|------|---------------|
| `src/email-routing.ts` | `routeVerificationEmail` extracted for unit-testability |
| `src/__tests__/auth-hook-routing.test.ts` | Routing logic (2 cases) |

**Create — `apps/email-preview/`**
| File | Responsibility |
|------|---------------|
| `package.json`, `tsconfig.json`, `eslint.config.mjs` | App scaffold |
| `emails/welcome-and-verify-email.tsx` | Preview with sample data |
| `emails/welcome-email.tsx` | Preview with sample data |
| `emails/email-change-verification-email.tsx` | Preview with sample data |
| `emails/password-reset-email.tsx` | Preview with sample data |
| `emails/invitation-email.tsx` | Preview with sample data |

**Modify**
| File | Change |
|------|--------|
| `packages/auth/src/auth.ts` | Replace 3 stubs; import `routeVerificationEmail` + `sendPasswordResetEmail` + `sendInvitationEmail`; widen user type |
| `packages/auth/package.json` | Add `@workspace/email: workspace:*` to dependencies |
| `.env.example` | Add commented `RESEND_API_KEY` and `EMAIL_FROM` |

---

## Task 1: packages/email scaffold + install dependencies

**Files:**
- Create: `packages/email/package.json`
- Create: `packages/email/tsconfig.json`
- Create: `packages/email/eslint.config.mjs`
- Create: `packages/email/vitest.config.ts`

- [ ] **Step 1.1: Create directory and package.json**

```bash
mkdir -p packages/email/src/provider/resend packages/email/src/templates/_components packages/email/__tests__
```

Create `packages/email/package.json`:
```json
{
  "name": "@workspace/email",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./keys": "./keys.ts",
    "./provider": "./src/provider/index.ts",
    "./send-welcome-and-verify-email": "./src/send-welcome-and-verify-email.ts",
    "./send-welcome-email": "./src/send-welcome-email.ts",
    "./send-email-change-verification-email": "./src/send-email-change-verification-email.ts",
    "./send-password-reset-email": "./src/send-password-reset-email.ts",
    "./send-invitation-email": "./src/send-invitation-email.ts",
    "./templates/welcome-and-verify-email": "./src/templates/welcome-and-verify-email.tsx",
    "./templates/welcome-email": "./src/templates/welcome-email.tsx",
    "./templates/email-change-verification-email": "./src/templates/email-change-verification-email.tsx",
    "./templates/password-reset-email": "./src/templates/password-reset-email.tsx",
    "./templates/invitation-email": "./src/templates/invitation-email.tsx"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@react-email/components": "^0.0.22",
    "@react-email/render": "^1.0.0",
    "@react-email/tailwind": "^0.0.19",
    "react": "^19.0.0",
    "resend": "^4.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@workspace/tooling": "workspace:*",
    "typescript": "^5.7",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 1.2: Create tsconfig.json**

Create `packages/email/tsconfig.json`:
```json
{
  "extends": "@workspace/tooling/typescript/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src", "keys.ts", "__tests__"]
}
```

- [ ] **Step 1.3: Create eslint.config.mjs**

Create `packages/email/eslint.config.mjs`:
```js
import reactConfig from "@workspace/tooling/eslint/react";

export default [...reactConfig];
```

- [ ] **Step 1.4: Create vitest.config.ts**

Create `packages/email/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 1.5: Install dependencies**

From the workspace root:
```bash
pnpm install
```

Expected: pnpm resolves and links `@workspace/email` into the workspace. If package versions aren't found, run `pnpm add --filter @workspace/email resend @react-email/components @react-email/render @react-email/tailwind react zod` to pull latest.

- [ ] **Step 1.6: Commit**

```bash
git add packages/email/package.json packages/email/tsconfig.json packages/email/eslint.config.mjs packages/email/vitest.config.ts
git commit -m "feat(email): scaffold @workspace/email package"
```

---

## Task 2: Environment validation and provider types

**Files:**
- Create: `packages/email/keys.ts`
- Create: `packages/email/src/provider/types.ts`

- [ ] **Step 2.1: Create keys.ts**

Create `packages/email/keys.ts`:
```typescript
import { z } from "zod";

const schema = z.object({
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("App <noreply@example.com>"),
});

export function keys() {
  return schema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  });
}
```

- [ ] **Step 2.2: Create provider types**

Create `packages/email/src/provider/types.ts`:
```typescript
export interface EmailPayload {
  recipient: string | string[];
  subject: string;
  html: string;
  text: string;
  cc?: string | string[];
  replyTo?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<{ id?: string }>;
}
```

- [ ] **Step 2.3: Commit**

```bash
git add packages/email/keys.ts packages/email/src/provider/types.ts
git commit -m "feat(email): add env validation and EmailProvider interface"
```

---

## Task 3: Resend provider (TDD)

**Files:**
- Test: `packages/email/__tests__/resend-provider.test.ts`
- Create: `packages/email/src/provider/resend/resend-options.ts`
- Create: `packages/email/src/provider/resend/index.ts`
- Create: `packages/email/src/provider/index.ts`

- [ ] **Step 3.1: Write the failing test**

Create `packages/email/__tests__/resend-provider.test.ts`:
```typescript
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
```

- [ ] **Step 3.2: Run to verify it fails**

```bash
pnpm --filter @workspace/email test
```

Expected: FAIL — `Cannot find module '../src/provider/resend/index'`

- [ ] **Step 3.3: Create resend-options.ts**

Create `packages/email/src/provider/resend/resend-options.ts`:
```typescript
import { keys } from "../../../keys";

export function getResendFrom(): string {
  return keys().EMAIL_FROM;
}
```

- [ ] **Step 3.4: Create Resend provider implementation**

Create `packages/email/src/provider/resend/index.ts`:
```typescript
import { Resend } from "resend";
import { keys } from "../../../keys";
import { getResendFrom } from "./resend-options";
import type { EmailPayload, EmailProvider } from "../types";

const provider: EmailProvider = {
  async sendEmail(payload: EmailPayload): Promise<{ id?: string }> {
    const resend = new Resend(keys().RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: getResendFrom(),
      to: payload.recipient,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      cc: payload.cc,
      reply_to: payload.replyTo,
      tags: payload.tags,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return { id: data?.id ?? undefined };
  },
};

export default provider;
```

- [ ] **Step 3.5: Create provider index (active provider re-export)**

Create `packages/email/src/provider/index.ts`:
```typescript
export { default as EmailProvider } from "./resend/index";
```

- [ ] **Step 3.6: Run tests to verify they pass**

```bash
pnpm --filter @workspace/email test
```

Expected: 3 tests PASS in `resend-provider.test.ts`

- [ ] **Step 3.7: Commit**

```bash
git add packages/email/src/provider/
git commit -m "feat(email): implement Resend EmailProvider with error handling"
```

---

## Task 4: Render helper and EmailLayout component

**Files:**
- Create: `packages/email/src/render.ts`
- Create: `packages/email/src/templates/_components/email-layout.tsx`

- [ ] **Step 4.1: Create render helper**

Create `packages/email/src/render.ts`:
```typescript
import { render } from "@react-email/render";
import type { ReactElement } from "react";

export async function renderEmail(
  component: ReactElement,
): Promise<{ html: string; text: string }> {
  const html = await render(component);
  const text = await render(component, { plainText: true });
  return { html, text };
}
```

- [ ] **Step 4.2: Create shared EmailLayout component**

Create `packages/email/src/templates/_components/email-layout.tsx`:
```tsx
import { Html, Head, Preview, Body, Container } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: "#f5f5f5",
            fontFamily: "sans-serif",
            margin: "0",
            padding: "40px 0",
          }}
        >
          <Container
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              maxWidth: "465px",
              margin: "0 auto",
              padding: "40px",
            }}
          >
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

- [ ] **Step 4.3: Commit**

```bash
git add packages/email/src/render.ts packages/email/src/templates/_components/
git commit -m "feat(email): add renderEmail helper and shared EmailLayout"
```

---

## Task 5: Email templates (TDD)

**Files:**
- Test: `packages/email/__tests__/template-render.test.ts`
- Create: `packages/email/src/templates/welcome-and-verify-email.tsx`
- Create: `packages/email/src/templates/welcome-email.tsx`
- Create: `packages/email/src/templates/email-change-verification-email.tsx`
- Create: `packages/email/src/templates/password-reset-email.tsx`
- Create: `packages/email/src/templates/invitation-email.tsx`

- [ ] **Step 5.1: Write failing smoke tests**

Create `packages/email/__tests__/template-render.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { WelcomeAndVerifyEmail } from "../src/templates/welcome-and-verify-email";
import { WelcomeEmail } from "../src/templates/welcome-email";
import { EmailChangeVerificationEmail } from "../src/templates/email-change-verification-email";
import { PasswordResetEmail } from "../src/templates/password-reset-email";
import { InvitationEmail } from "../src/templates/invitation-email";

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
  });
});
```

- [ ] **Step 5.2: Run to verify it fails**

```bash
pnpm --filter @workspace/email test
```

Expected: FAIL — `Cannot find module '../src/templates/welcome-and-verify-email'`

- [ ] **Step 5.3: Create welcome-and-verify-email.tsx**

Create `packages/email/src/templates/welcome-and-verify-email.tsx`:
```tsx
import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface WelcomeAndVerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function WelcomeAndVerifyEmail({
  name,
  verifyUrl,
}: WelcomeAndVerifyEmailProps) {
  return (
    <EmailLayout preview="Welcome! Please verify your email address.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Welcome, {name}!
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Click the button below to verify your email address and get started.
      </Text>
      <Button
        href={verifyUrl}
        style={{
          display: "block",
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          fontWeight: "bold",
          textDecoration: "none",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Verify &amp; Get Started
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {verifyUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

- [ ] **Step 5.4: Create welcome-email.tsx**

Create `packages/email/src/templates/welcome-email.tsx`:
```tsx
import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface WelcomeEmailProps {
  name: string;
  getStartedUrl: string;
}

export function WelcomeEmail({ name, getStartedUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome! Your account is ready.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Welcome, {name}!
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Your account is set up and ready to go.
      </Text>
      <Button
        href={getStartedUrl}
        style={{
          display: "block",
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          fontWeight: "bold",
          textDecoration: "none",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Get Started
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {getStartedUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t create this account, please ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

- [ ] **Step 5.5: Create email-change-verification-email.tsx**

Create `packages/email/src/templates/email-change-verification-email.tsx`:
```tsx
import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface EmailChangeVerificationEmailProps {
  name: string;
  verifyUrl: string;
}

export function EmailChangeVerificationEmail({
  name,
  verifyUrl,
}: EmailChangeVerificationEmailProps) {
  return (
    <EmailLayout preview="Confirm your new email address.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Hi, {name}
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Click below to confirm your new email address.
      </Text>
      <Button
        href={verifyUrl}
        style={{
          display: "block",
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          fontWeight: "bold",
          textDecoration: "none",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Confirm New Email
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {verifyUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t request an email change, please ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

- [ ] **Step 5.6: Create password-reset-email.tsx**

Create `packages/email/src/templates/password-reset-email.tsx`:
```tsx
import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password.">
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        Hi, {name}
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        Click the button below to reset your password. This link expires in 1 hour.
      </Text>
      <Button
        href={resetUrl}
        style={{
          display: "block",
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          fontWeight: "bold",
          textDecoration: "none",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Reset Password
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {resetUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you didn&apos;t request a password reset, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

- [ ] **Step 5.7: Create invitation-email.tsx**

Create `packages/email/src/templates/invitation-email.tsx`:
```tsx
import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";

export interface InvitationEmailProps {
  inviterName: string;
  organizationName: string;
  acceptUrl: string;
}

export function InvitationEmail({
  inviterName,
  organizationName,
  acceptUrl,
}: InvitationEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to join ${organizationName}.`}
    >
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: "0 0 8px" }}
      >
        You&apos;ve been invited!
      </Text>
      <Text style={{ color: "#444", margin: "0 0 24px" }}>
        {inviterName} has invited you to join <strong>{organizationName}</strong>.
        Click below to accept.
      </Text>
      <Button
        href={acceptUrl}
        style={{
          display: "block",
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "4px",
          fontWeight: "bold",
          textDecoration: "none",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Accept Invitation
      </Button>
      <Text style={{ color: "#888", fontSize: "12px", margin: "0 0 24px" }}>
        Or copy and paste this URL into your browser: {acceptUrl}
      </Text>
      <Hr style={{ borderColor: "#eaeaea", margin: "0 0 24px" }} />
      <Text style={{ color: "#888", fontSize: "12px", margin: "0" }}>
        If you weren&apos;t expecting an invitation, you can ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

- [ ] **Step 5.8: Run tests to verify they pass**

```bash
pnpm --filter @workspace/email test
```

Expected: `template-render.test.ts` — 5 PASS (plus the 3 from resend-provider still passing)

- [ ] **Step 5.9: Commit**

```bash
git add packages/email/src/templates/ packages/email/__tests__/template-render.test.ts
git commit -m "feat(email): add 5 React Email templates with smoke tests"
```

---

## Task 6: Sender functions (TDD)

**Files:**
- Test: `packages/email/__tests__/sender-functions.test.ts`
- Test: `packages/email/__tests__/graceful-degradation.test.ts`
- Create: `packages/email/src/send-welcome-and-verify-email.ts`
- Create: `packages/email/src/send-welcome-email.ts`
- Create: `packages/email/src/send-email-change-verification-email.ts`
- Create: `packages/email/src/send-password-reset-email.ts`
- Create: `packages/email/src/send-invitation-email.ts`
- Create: `packages/email/src/index.ts`

- [ ] **Step 6.1: Write failing sender unit tests**

Create `packages/email/__tests__/sender-functions.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendEmail = vi.fn().mockResolvedValue({ id: "test-email-id" });

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
```

- [ ] **Step 6.2: Write failing graceful degradation tests**

Create `packages/email/__tests__/graceful-degradation.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSendEmail = vi.fn();

vi.mock("../src/provider/index", () => ({
  EmailProvider: { sendEmail: mockSendEmail },
}));

vi.mock("../keys", () => ({
  keys: vi.fn(() => ({
    RESEND_API_KEY: undefined,
    EMAIL_FROM: "App <noreply@example.com>",
  })),
}));

import { sendWelcomeAndVerifyEmail } from "../src/send-welcome-and-verify-email";
import { sendWelcomeEmail } from "../src/send-welcome-email";
import { sendEmailChangeVerificationEmail } from "../src/send-email-change-verification-email";
import { sendPasswordResetEmail } from "../src/send-password-reset-email";
import { sendInvitationEmail } from "../src/send-invitation-email";

describe("Graceful degradation (no RESEND_API_KEY)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("sendWelcomeAndVerifyEmail logs and does not throw", async () => {
    await expect(
      sendWelcomeAndVerifyEmail({
        recipient: "user@example.com",
        name: "Jane",
        verifyUrl: "https://example.com/verify",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendWelcomeEmail logs and does not throw", async () => {
    await expect(
      sendWelcomeEmail({
        recipient: "user@example.com",
        name: "Jane",
        getStartedUrl: "https://example.com/dashboard",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendEmailChangeVerificationEmail logs and does not throw", async () => {
    await expect(
      sendEmailChangeVerificationEmail({
        recipient: "user@example.com",
        name: "Jane",
        verifyUrl: "https://example.com/verify",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendPasswordResetEmail logs and does not throw", async () => {
    await expect(
      sendPasswordResetEmail({
        recipient: "user@example.com",
        name: "Jane",
        resetUrl: "https://example.com/reset",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sendInvitationEmail logs and does not throw", async () => {
    await expect(
      sendInvitationEmail({
        recipient: "user@example.com",
        inviterName: "Bob",
        organizationName: "Acme Inc",
        acceptUrl: "https://example.com/accept-invitation/inv_123",
      }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("user@example.com"),
    );
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 6.3: Run to verify tests fail**

```bash
pnpm --filter @workspace/email test
```

Expected: FAIL — `Cannot find module '../src/send-welcome-and-verify-email'`

- [ ] **Step 6.4: Create send-welcome-and-verify-email.ts**

Create `packages/email/src/send-welcome-and-verify-email.ts`:
```typescript
import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { WelcomeAndVerifyEmail } from "./templates/welcome-and-verify-email";

export interface SendWelcomeAndVerifyEmailInput {
  recipient: string;
  name: string;
  verifyUrl: string;
}

export async function sendWelcomeAndVerifyEmail(
  input: SendWelcomeAndVerifyEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Welcome & verify for ${input.recipient}: ${input.verifyUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    WelcomeAndVerifyEmail({ name: input.name, verifyUrl: input.verifyUrl }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Welcome! Please verify your email",
    html,
    text,
  });
}
```

- [ ] **Step 6.5: Create send-welcome-email.ts**

Create `packages/email/src/send-welcome-email.ts`:
```typescript
import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { WelcomeEmail } from "./templates/welcome-email";

export interface SendWelcomeEmailInput {
  recipient: string;
  name: string;
  getStartedUrl: string;
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Welcome email for ${input.recipient}: ${input.getStartedUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    WelcomeEmail({ name: input.name, getStartedUrl: input.getStartedUrl }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Welcome!",
    html,
    text,
  });
}
```

- [ ] **Step 6.6: Create send-email-change-verification-email.ts**

Create `packages/email/src/send-email-change-verification-email.ts`:
```typescript
import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { EmailChangeVerificationEmail } from "./templates/email-change-verification-email";

export interface SendEmailChangeVerificationEmailInput {
  recipient: string;
  name: string;
  verifyUrl: string;
}

export async function sendEmailChangeVerificationEmail(
  input: SendEmailChangeVerificationEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Email change verify for ${input.recipient}: ${input.verifyUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    EmailChangeVerificationEmail({
      name: input.name,
      verifyUrl: input.verifyUrl,
    }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Confirm your new email address",
    html,
    text,
  });
}
```

- [ ] **Step 6.7: Create send-password-reset-email.ts**

Create `packages/email/src/send-password-reset-email.ts`:
```typescript
import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { PasswordResetEmail } from "./templates/password-reset-email";

export interface SendPasswordResetEmailInput {
  recipient: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Password reset for ${input.recipient}: ${input.resetUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    PasswordResetEmail({ name: input.name, resetUrl: input.resetUrl }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: "Reset your password",
    html,
    text,
  });
}
```

- [ ] **Step 6.8: Create send-invitation-email.ts**

Create `packages/email/src/send-invitation-email.ts`:
```typescript
import { keys } from "../keys";
import { renderEmail } from "./render";
import { EmailProvider } from "./provider/index";
import { InvitationEmail } from "./templates/invitation-email";

export interface SendInvitationEmailInput {
  recipient: string;
  inviterName: string;
  organizationName: string;
  acceptUrl: string;
}

export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<void> {
  const { RESEND_API_KEY } = keys();
  if (!RESEND_API_KEY) {
    console.log(
      `[Email] Invitation for ${input.recipient} to ${input.organizationName}: ${input.acceptUrl}`,
    );
    return;
  }

  const { html, text } = await renderEmail(
    InvitationEmail({
      inviterName: input.inviterName,
      organizationName: input.organizationName,
      acceptUrl: input.acceptUrl,
    }),
  );

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `You've been invited to ${input.organizationName}`,
    html,
    text,
  });
}
```

- [ ] **Step 6.9: Create barrel export**

Create `packages/email/src/index.ts`:
```typescript
export { sendWelcomeAndVerifyEmail } from "./send-welcome-and-verify-email";
export { sendWelcomeEmail } from "./send-welcome-email";
export { sendEmailChangeVerificationEmail } from "./send-email-change-verification-email";
export { sendPasswordResetEmail } from "./send-password-reset-email";
export { sendInvitationEmail } from "./send-invitation-email";
```

- [ ] **Step 6.10: Run all email package tests**

```bash
pnpm --filter @workspace/email test
```

Expected: 18 tests PASS total:
- `resend-provider.test.ts`: 3 PASS
- `template-render.test.ts`: 5 PASS
- `sender-functions.test.ts`: 5 PASS
- `graceful-degradation.test.ts`: 5 PASS

- [ ] **Step 6.11: Commit**

```bash
git add packages/email/src/ packages/email/__tests__/sender-functions.test.ts packages/email/__tests__/graceful-degradation.test.ts
git commit -m "feat(email): implement 5 sender functions with graceful degradation"
```

---

## Task 7: Auth integration (TDD)

**Files:**
- Test: `packages/auth/src/__tests__/auth-hook-routing.test.ts`
- Create: `packages/auth/src/email-routing.ts`
- Modify: `packages/auth/src/auth.ts`
- Modify: `packages/auth/package.json`

- [ ] **Step 7.1: Add @workspace/email to auth package**

In `packages/auth/package.json`, add to `"dependencies"`:
```json
"@workspace/email": "workspace:*"
```

Full updated `dependencies` block:
```json
"dependencies": {
  "@workspace/database": "workspace:*",
  "@workspace/email": "workspace:*",
  "better-auth": "^1"
}
```

- [ ] **Step 7.2: Run pnpm install**

```bash
pnpm install
```

Expected: pnpm links `@workspace/email` into `packages/auth/node_modules`.

- [ ] **Step 7.3: Write the failing routing test**

Create `packages/auth/src/__tests__/auth-hook-routing.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendWelcomeAndVerify = vi.fn().mockResolvedValue(undefined);
const mockSendEmailChangeVerification = vi.fn().mockResolvedValue(undefined);

vi.mock("@workspace/email/send-welcome-and-verify-email", () => ({
  sendWelcomeAndVerifyEmail: mockSendWelcomeAndVerify,
}));

vi.mock("@workspace/email/send-email-change-verification-email", () => ({
  sendEmailChangeVerificationEmail: mockSendEmailChangeVerification,
}));

import { routeVerificationEmail } from "../email-routing";

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
```

- [ ] **Step 7.4: Run to verify it fails**

```bash
pnpm --filter @workspace/auth test
```

Expected: FAIL — `Cannot find module '../email-routing'`

- [ ] **Step 7.5: Create email-routing.ts**

Create `packages/auth/src/email-routing.ts`:
```typescript
import { sendWelcomeAndVerifyEmail } from "@workspace/email/send-welcome-and-verify-email";
import { sendEmailChangeVerificationEmail } from "@workspace/email/send-email-change-verification-email";

export async function routeVerificationEmail({
  user,
  url,
}: {
  user: { email: string; name: string; emailVerified: boolean };
  url: string;
}): Promise<void> {
  if (user.emailVerified) {
    await sendEmailChangeVerificationEmail({
      recipient: user.email,
      name: user.name,
      verifyUrl: url,
    });
  } else {
    await sendWelcomeAndVerifyEmail({
      recipient: user.email,
      name: user.name,
      verifyUrl: url,
    });
  }
}
```

- [ ] **Step 7.6: Run test to verify it passes**

```bash
pnpm --filter @workspace/auth test
```

Expected: `auth-hook-routing.test.ts` — 2 PASS (plus existing guards/permissions tests still pass)

- [ ] **Step 7.7: Update auth.ts to replace console.log stubs**

Replace the entire content of `packages/auth/src/auth.ts` with:
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin } from "better-auth/plugins";
import { prisma } from "@workspace/database";
import { ac, permissions } from "./permissions";
import { routeVerificationEmail } from "./email-routing";
import { sendPasswordResetEmail } from "@workspace/email/send-password-reset-email";
import { sendInvitationEmail } from "@workspace/email/send-invitation-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string; emailVerified: boolean };
      url: string;
    }) => {
      await routeVerificationEmail({ user, url });
    },
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      await sendPasswordResetEmail({
        recipient: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),
    ...(process.env.MICROSOFT_CLIENT_ID && {
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      },
    }),
  },
  plugins: [
    organization({
      ac,
      roles: {
        owner: permissions.owner,
        admin: permissions.admin,
        member: permissions.member,
      },
      async sendInvitationEmail(data) {
        const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";
        await sendInvitationEmail({
          recipient: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          acceptUrl: `${baseUrl}/accept-invitation/${data.id}`,
        });
      },
    }),
    admin(),
  ],
});

export type Auth = typeof auth;
```

- [ ] **Step 7.8: Run full auth test suite**

```bash
pnpm --filter @workspace/auth test
```

Expected: all tests PASS — routing test (2), guards tests, permissions tests.

- [ ] **Step 7.9: Type-check auth package**

```bash
pnpm --filter @workspace/auth type-check
```

Expected: no errors. If better-auth types for `sendVerificationEmail` do not include `name` or `emailVerified`, cast with `as { email: string; name: string; emailVerified: boolean }`.

- [ ] **Step 7.10: Commit**

```bash
git add packages/auth/src/email-routing.ts packages/auth/src/__tests__/auth-hook-routing.test.ts packages/auth/src/auth.ts packages/auth/package.json
git commit -m "feat(auth): replace email console.log stubs with real sender calls"
```

---

## Task 8: Email preview app

**Files:**
- Create: `apps/email-preview/package.json`
- Create: `apps/email-preview/tsconfig.json`
- Create: `apps/email-preview/eslint.config.mjs`
- Create: `apps/email-preview/emails/welcome-and-verify-email.tsx`
- Create: `apps/email-preview/emails/welcome-email.tsx`
- Create: `apps/email-preview/emails/email-change-verification-email.tsx`
- Create: `apps/email-preview/emails/password-reset-email.tsx`
- Create: `apps/email-preview/emails/invitation-email.tsx`

- [ ] **Step 8.1: Create directory structure**

```bash
mkdir -p apps/email-preview/emails
```

- [ ] **Step 8.2: Create package.json**

Create `apps/email-preview/package.json`:
```json
{
  "name": "@workspace/email-preview",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "email dev --port 4002",
    "export": "email export"
  },
  "dependencies": {
    "@react-email/components": "^0.0.22",
    "@workspace/email": "workspace:*",
    "react": "^19.0.0",
    "react-email": "*"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@workspace/tooling": "workspace:*",
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 8.3: Create tsconfig.json**

Create `apps/email-preview/tsconfig.json`:
```json
{
  "extends": "@workspace/tooling/typescript/react-library.json",
  "include": ["emails"]
}
```

- [ ] **Step 8.4: Create eslint.config.mjs**

Create `apps/email-preview/eslint.config.mjs`:
```js
import reactConfig from "@workspace/tooling/eslint/react";

export default [...reactConfig];
```

- [ ] **Step 8.5: Create preview files**

Create `apps/email-preview/emails/welcome-and-verify-email.tsx`:
```tsx
import { WelcomeAndVerifyEmail } from "@workspace/email/templates/welcome-and-verify-email";

export default function Preview() {
  return (
    <WelcomeAndVerifyEmail
      name="Jane Doe"
      verifyUrl="https://app.example.com/verify?token=abc123preview"
    />
  );
}
```

Create `apps/email-preview/emails/welcome-email.tsx`:
```tsx
import { WelcomeEmail } from "@workspace/email/templates/welcome-email";

export default function Preview() {
  return (
    <WelcomeEmail
      name="Jane Doe"
      getStartedUrl="https://app.example.com/dashboard"
    />
  );
}
```

Create `apps/email-preview/emails/email-change-verification-email.tsx`:
```tsx
import { EmailChangeVerificationEmail } from "@workspace/email/templates/email-change-verification-email";

export default function Preview() {
  return (
    <EmailChangeVerificationEmail
      name="Jane Doe"
      verifyUrl="https://app.example.com/verify?token=xyz789preview"
    />
  );
}
```

Create `apps/email-preview/emails/password-reset-email.tsx`:
```tsx
import { PasswordResetEmail } from "@workspace/email/templates/password-reset-email";

export default function Preview() {
  return (
    <PasswordResetEmail
      name="Jane Doe"
      resetUrl="https://app.example.com/reset?token=qrs456preview"
    />
  );
}
```

Create `apps/email-preview/emails/invitation-email.tsx`:
```tsx
import { InvitationEmail } from "@workspace/email/templates/invitation-email";

export default function Preview() {
  return (
    <InvitationEmail
      inviterName="Bob Smith"
      organizationName="Acme Inc"
      acceptUrl="https://app.example.com/accept-invitation/inv_preview123"
    />
  );
}
```

- [ ] **Step 8.6: Install and verify**

```bash
pnpm install
```

Expected: `@workspace/email-preview` is linked. Run `pnpm --filter @workspace/email-preview dev` to start the preview server at http://localhost:4002 and confirm templates are visible. Then Ctrl+C.

- [ ] **Step 8.7: Commit**

```bash
git add apps/email-preview/
git commit -m "feat(email-preview): add React Email preview app on port 4002"
```

---

## Task 9: Environment variables + final verification

**Files:**
- Modify: `.env.example`

- [ ] **Step 9.1: Update .env.example**

Add to the end of `.env.example`:
```bash

# Email (Resend) — optional in development, required in production
# Get your API key at https://resend.com/api-keys
# RESEND_API_KEY=re_xxxxxxxxx
# EMAIL_FROM="App Name <noreply@yourdomain.com>"
```

- [ ] **Step 9.2: Run full workspace test suite**

```bash
pnpm test
```

Expected: all tests pass across `@workspace/email` (18 tests) and `@workspace/auth`.

- [ ] **Step 9.3: Run type-check across workspace**

```bash
pnpm type-check
```

Expected: no TypeScript errors. Common issue: if better-auth's `sendVerificationEmail` callback type doesn't include `name`/`emailVerified`, cast the `user` parameter in `auth.ts`:

```typescript
sendVerificationEmail: async ({ user: _user, url }) => {
  const user = _user as { email: string; name: string; emailVerified: boolean };
  await routeVerificationEmail({ user, url });
},
```

- [ ] **Step 9.4: Commit and final summary**

```bash
git add .env.example
git commit -m "chore(email): add RESEND_API_KEY and EMAIL_FROM to .env.example"
```

Expected final state:
- `packages/email`: 18 tests passing, type-checks clean
- `packages/auth`: all tests passing (including 2 new routing tests), type-checks clean
- `apps/email-preview`: starts on port 4002 and shows all 5 template previews
- Auth stubs replaced: `sendVerificationEmail` routes between welcome+verify and email-change-verify; `sendResetPasswordEmail` sends password-reset; `sendInvitationEmail` sends org invitation

---

## Notes

**If Resend SDK types conflict:** The `reply_to` field name may differ between Resend SDK versions. If TypeScript errors appear in `src/provider/resend/index.ts`, check the SDK's `CreateEmailOptions` type and adjust the field name accordingly (`reply_to` vs `replyTo`).

**If @react-email/render API differs:** The `plainText` option was renamed in some versions. If `render(element, { plainText: true })` fails, try `render(element, { plain: true })`.

**Version mismatches:** If any `pnpm add` fails to find a version, run `pnpm add --filter @workspace/email resend@latest @react-email/components@latest @react-email/render@latest @react-email/tailwind@latest` to pull the latest available versions and update `package.json` accordingly.
