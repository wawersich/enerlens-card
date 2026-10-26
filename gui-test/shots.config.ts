import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/*
 * The documentation's editor pictures (npm run doc-shots): the GUI tests'
 * setup - same instance, same guard on the profile - with only shots.ts.
 */
export default defineConfig({
  ...base,
  testMatch: "shots.ts",
  // Its own folder: a GUI test run alongside must not clobber its artefacts.
  outputDir: "/tmp/enerlens-doc-shots",
});
