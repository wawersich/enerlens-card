import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // Reference measurements live outside the repository (REQ 5.1); tests that
    // need them skip themselves when the directory is absent.
    env: { ENERLENS_FIXTURES: "/share/dev/enerlens-fixture" },
  },
});
