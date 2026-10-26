import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { STATES } from "./fixtures";
import { haVersion, profile, putState } from "./ha";

/** Before the run: the profile as found (GT-2), the test sensors, the version (GT-9). */
export default async function globalSetup(): Promise<void> {
  writeFileSync(join(tmpdir(), "enerlens-gui-profile.json"), JSON.stringify(await profile()));
  for (const [key, [state, attributes]] of Object.entries(STATES)) {
    await putState(key, state, attributes);
  }
  console.log(`Home Assistant ${await haVersion()}`);
}
