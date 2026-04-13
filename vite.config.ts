import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../public/dist",
  },
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/search": "http://localhost:3000",
      "/library": "http://localhost:3000",
    },
  },
});
