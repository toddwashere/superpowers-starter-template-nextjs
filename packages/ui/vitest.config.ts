import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "#components": path.resolve(import.meta.dirname, "src/components"),
      "#components/*": path.resolve(import.meta.dirname, "src/components/*"),
      "#hooks": path.resolve(import.meta.dirname, "src/hooks"),
      "#hooks/*": path.resolve(import.meta.dirname, "src/hooks/*"),
      "#lib": path.resolve(import.meta.dirname, "src/lib"),
      "#lib/*": path.resolve(import.meta.dirname, "src/lib/*"),
    },
  },
});
