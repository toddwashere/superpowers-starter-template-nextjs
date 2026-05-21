/**
 * Enforces app-layer architecture from .ai/skills (add-icon, add-data-model-to-database).
 * Applied to Next.js apps via tooling/eslint/nextjs.js.
 */

const lucideRestriction = {
  paths: [
    {
      name: "lucide-react",
      message:
        "Import icons from @workspace/ui/components/icon-for in apps. See .ai/skills/add-icon/SKILL.md.",
    },
  ],
};

const databaseRestriction = {
  paths: [
    {
      name: "@workspace/database",
      message:
        "Apps call domain packages, not Prisma. See .ai/skills/add-data-model-to-database/SKILL.md.",
    },
    {
      name: "@workspace/database/client",
      message:
        "Apps call domain packages, not Prisma. See .ai/skills/add-data-model-to-database/SKILL.md.",
    },
    {
      name: "@prisma/client",
      message:
        "Apps call domain packages, not Prisma. See .ai/skills/add-data-model-to-database/SKILL.md.",
    },
  ],
};

/** Block lucide-react in all apps (dashboard, www, public-mcp, etc.). */
export const appsNoLucideConfig = {
  files: ["apps/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
  rules: {
    "no-restricted-imports": ["error", lucideRestriction],
  },
};

/** Block direct DB access in UI-oriented Next.js apps. */
export const nextAppsNoDatabaseConfig = {
  files: ["apps/dashboard/**/*.{js,jsx,ts,tsx}", "apps/www/**/*.{js,jsx,ts,tsx}"],
  rules: {
    "no-restricted-imports": ["error", databaseRestriction],
  },
};
