import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/registry/index.ts", "src/standalone/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "react-router-dom"],
  treeshake: true,
});

