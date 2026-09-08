import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { execSync } from "node:child_process";

/** Short git revision, marked when the working tree has uncommitted changes.
 *  Lets the console banner say which build a browser is actually running. */
function buildId() {
  try {
    const rev = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim();
    const dirty = execSync("git status --porcelain", { stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim() !== "";
    return dirty ? `${rev}+` : rev;
  } catch {
    return "dev";
  }
}

/** Minimal replace plugin - one placeholder, not worth a dependency. */
const injectBuildId = () => ({
  name: "inject-build-id",
  transform(code, id) {
    return id.endsWith("src/const.ts") ? code.replace("__BUILD_ID__", buildId()) : null;
  },
});

/** Element names of the dev build, so a local build and the released card can
 *  live in one browser: CARD_SUFFIX=-dev yields <enerlens-card-dev>. */
const suffix = process.env.CARD_SUFFIX ?? "";
const applyNameSuffix = () => ({
  name: "apply-name-suffix",
  transform(code, id) {
    if (!suffix || !id.endsWith("src/const.ts")) return null;
    return code
      .replace('"enerlens-card"', `"enerlens-card${suffix}"`)
      .replace('"enerlens-card-editor"', `"enerlens-card${suffix}-editor"`)
      .replace('"EnerLens Card"', `"EnerLens Card (${suffix.replace(/^-/, "")})"`);
  },
});

const dev = process.env.ROLLUP_WATCH === "true";

export default {
  input: "src/enerlens-card.ts",
  output: {
    file: `dist/enerlens-card${suffix}.js`,
    format: "es",
    sourcemap: dev,
    // HACS ships exactly one file, so the editor's dynamic import is inlined
    // rather than split into a second chunk (REQ G-4, AL-2).
    inlineDynamicImports: true,
  },
  plugins: [
    injectBuildId(),
    applyNameSuffix(),
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
