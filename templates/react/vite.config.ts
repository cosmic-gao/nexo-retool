import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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
