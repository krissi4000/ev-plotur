import { defineWorkspace } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineWorkspace([
  {
    test: {
      name: "backend",
      include: ["src/**/*.test.ts"],
      environment: "node",
    },
  },
  {
    plugins: [react()],
    test: {
      name: "frontend",
      include: ["client/src/**/*.test.tsx"],
      environment: "jsdom",
      setupFiles: ["client/src/test-setup.ts"],
    },
  },
]);
