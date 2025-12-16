import { defineConfig } from "tsup";

export default defineConfig([
  // Main library entry
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    external: ["react", "react-dom", "react-router-dom", "@nexoc/core"],
    treeshake: true,
    outDir: "dist",
  },
  // CLI entry
  {
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    clean: false,
    external: ["react", "react-dom", "react-router-dom", "@nexoc/core", "vite", "@vitejs/plugin-react"],
    treeshake: true,
    outDir: "dist",
    shims: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
