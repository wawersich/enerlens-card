import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const dev = process.env.ROLLUP_WATCH === "true";

export default {
  input: "src/enerlens-card.ts",
  output: {
    file: "dist/enerlens-card.js",
    format: "es",
    sourcemap: dev,
    // HACS ships exactly one file, so the editor's dynamic import is inlined
    // rather than split into a second chunk (REQ G-4, AL-2).
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    // The translation files are imported as JSON modules (src/translations/*.json).
    json({ compact: true }),
    typescript({ tsconfig: "./tsconfig.json", declaration: false, sourceMap: dev }),
    !dev && terser({ format: { comments: false } }),
  ],
  // Silence circular-dependency noise coming from lit's own sources.
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};
