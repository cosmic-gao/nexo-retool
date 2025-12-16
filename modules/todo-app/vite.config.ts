import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Always use base path for consistency between dev and prod
  base: "/modules/todo-app/",
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
