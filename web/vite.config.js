import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: { target: "es2022", sourcemap: false, chunkSizeWarningLimit: 650 },
  server: { allowedHosts: ["terminal.local"] },
});
