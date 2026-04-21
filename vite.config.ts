import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: "client",
  build: {
    outDir: "../public/dist",
  },
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/search/api": "http://localhost:3000",
      "/library/api": "http://localhost:3000",
    },
  },
});
