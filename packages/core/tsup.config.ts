import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/registry/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react"],
  treeshake: true,
});

