import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "client/src/**/*.test.tsx"],
    environmentMatchGlobs: [
      ["client/src/**", "jsdom"],
      ["src/**", "node"],
    ],
    setupFiles: ["client/src/test-setup.ts"],
  },
});
