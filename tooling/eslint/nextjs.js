import nextPlugin from "@next/eslint-plugin-next";
import {
  appsNoLucideConfig,
  nextAppsNoDatabaseConfig,
} from "./apps-architecture.js";
import reactConfig from "./react.js";

export default [
  ...reactConfig,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  appsNoLucideConfig,
  nextAppsNoDatabaseConfig,
];
