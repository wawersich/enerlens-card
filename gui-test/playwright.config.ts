import { defineConfig } from "@playwright/test";

/*
 * GUI tests against a running Home Assistant (REQ 2.19, GT-1): local only, the
 * CI has no Home Assistant. Chromium from the system (`apk add chromium`), no
 * browser download. One worker: every test talks to the same instance.
 *
 *   HA_URL=http://<host>:8123 HA_TOKEN_FILE=<file> HA_DASHBOARD=/<dashboard>/0 npm run gui-test
 */
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 300_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  // Traces and screenshots of failures, outside the repository.
  outputDir: process.env.GUI_TEST_OUT ?? "/tmp/enerlens-gui-test",
  use: {
    browserName: "chromium",
    launchOptions: {
      executablePath: process.env.CHROMIUM ?? "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-gpu"],
    },
    viewport: { width: 1200, height: 1000 },
    // A click that cannot land - something lies over the element - fails
    // here instead of waiting out the whole test.
    actionTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
