import { defineConfig } from "bunup";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  format: "esm",
  target: "browser",
  sourcemap: true,
  clean: true,
  dts: true,
  exports: true,
  external: ["@elysiajs/eden", "@tanstack/react-query"],
});