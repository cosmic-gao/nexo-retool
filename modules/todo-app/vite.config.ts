import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use basePath from manifest.json for consistency
  base: "/app/todo/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 4001,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
