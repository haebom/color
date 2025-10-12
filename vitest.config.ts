import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    testTimeout: 10000, // 10초 timeout
    hookTimeout: 10000, // beforeEach/afterEach 10초 timeout
    setupFiles: ["./src/tests/setup.ts"],
  },
});