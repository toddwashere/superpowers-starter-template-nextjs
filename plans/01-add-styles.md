# Phase 1.2: Styling and Components (SUPERSEDED)

> **This plan has been superseded by the design spec at `docs/superpowers/specs/2026-05-07-phase-1-2-styling-and-components-design.md`.**
> Key changes: Tailwind v4 (CSS-first, OKLCH), `@workspace/ui` naming, ESM-only, sidebar navigation included.

## Original Goal (outdated — see spec above)

Establish Tailwind CSS with a centralized design token system and initialize the Shadcn/ui component library, shared across the monorepo via `packages/ui`.

## Architecture

```
packages/ui/
├── package.json              # @repo/ui — exports config, CSS, utilities, components
├── tailwind.config.ts        # Shared Tailwind config (colors, fonts, spacing, radius)
├── postcss.config.mjs        # Shared PostCSS config
├── globals.css               # CSS custom properties + @tailwind directives
├── lib/
│   └── utils.ts              # cn() helper (clsx + tailwind-merge)
└── components/               # Shadcn/ui components (added incrementally)
```

Each app (`apps/dashboard`, `apps/www`) extends the shared config and imports the global CSS.

## Design Token Strategy

All colors and design tokens are defined as **CSS custom properties** in `packages/ui/globals.css`. The Tailwind config maps semantic names (`primary`, `muted`, `destructive`, etc.) to those variables via `hsl(var(--token))`. This gives us:

- **Single source of truth** — change a color once, every app updates
- **Light/dark theming** — swap variables under a `.dark` class
- **Shadcn/ui compatibility** — this is the exact pattern Shadcn expects
- **Developer ergonomics** — write `bg-primary` or `text-muted-foreground`, no hex hunting

## Implementation Steps

### Step 1: Add Dependencies

At the workspace root:

```bash
pnpm add -D tailwindcss postcss autoprefixer tailwindcss-animate -w
pnpm add clsx tailwind-merge class-variance-authority -w
```

Or scope to `packages/ui` depending on workspace configuration.

### Step 2: Create `packages/ui/package.json`

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./tailwind.config": "./tailwind.config.ts",
    "./postcss.config": "./postcss.config.mjs",
    "./globals.css": "./globals.css",
    "./lib/utils": "./lib/utils.ts",
    "./components/*": "./components/*.tsx"
  },
  "dependencies": {
    "clsx": "^2.1",
    "tailwind-merge": "^2.6",
    "class-variance-authority": "^0.7"
  },
  "devDependencies": {
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4",
    "tailwindcss-animate": "^1.0"
  }
}
```

### Step 3: Create `packages/ui/globals.css`

Define all design tokens as CSS custom properties with light and dark variants:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 4: Create `packages/ui/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Step 5: Create `packages/ui/postcss.config.mjs`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Step 6: Create `packages/ui/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 7: Configure Each App to Extend Shared Config

**`apps/dashboard/tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@repo/ui/tailwind.config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "../../packages/ui/components/**/*.{ts,tsx}",
  ],
};

export default config;
```

**`apps/dashboard/postcss.config.mjs`:**

```javascript
export { default } from "@repo/ui/postcss.config";
```

**`apps/www/tailwind.config.ts`** and **`apps/www/postcss.config.mjs`** — same pattern with appropriate content paths.

### Step 8: Import Global CSS in App Root Layouts

In each app's root `layout.tsx`:

```typescript
import "@repo/ui/globals.css";
```

### Step 9: Initialize Shadcn/ui

Create `packages/ui/components.json` for the Shadcn CLI:

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@repo/ui/components",
    "utils": "@repo/ui/lib/utils"
  }
}
```

Then add initial components:

```bash
cd packages/ui
npx shadcn@latest add button card input label
```

### Step 10: Verify

- [ ] `pnpm build` succeeds across all packages
- [ ] Apps render with correct colors from CSS variables
- [ ] Dark mode toggle switches theme via `.dark` class
- [ ] Shadcn components import and render correctly from `@repo/ui/components/button`
- [ ] Tailwind IntelliSense resolves custom colors in IDE

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token format | HSL CSS custom properties | Shadcn standard; allows opacity modifiers like `bg-primary/50` |
| Config sharing | Export from `@repo/ui` | Single source of truth for all apps |
| Dark mode | `class` strategy | Works with SSR, user preference, and system preference |
| Component location | `packages/ui/components/` | Shared across apps, managed by Shadcn CLI |
| Class merging | `cn()` with `tailwind-merge` | Prevents class conflicts when composing components |

## Files Created/Modified

- `packages/ui/package.json` — new
- `packages/ui/tailwind.config.ts` — new
- `packages/ui/postcss.config.mjs` — new
- `packages/ui/globals.css` — new
- `packages/ui/lib/utils.ts` — new
- `packages/ui/components.json` — new
- `apps/dashboard/tailwind.config.ts` — new
- `apps/dashboard/postcss.config.mjs` — new
- `apps/dashboard/app/layout.tsx` — modified (add globals.css import)
- `apps/www/tailwind.config.ts` — new
- `apps/www/postcss.config.mjs` — new
- `apps/www/app/layout.tsx` — modified (add globals.css import)
