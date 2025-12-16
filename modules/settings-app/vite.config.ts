import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Use basePath from manifest.json for consistency
  base: "/app/settings/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 4003,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});

