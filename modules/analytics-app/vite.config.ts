import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Always use base path for consistency between dev and prod
  base: "/modules/analytics-app/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 4002,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});

