import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { profile } from "./ha";

/** After the run: the profile must be as it was (GT-2), or the run fails. */
export default async function globalTeardown(): Promise<void> {
  const before = readFileSync(join(tmpdir(), "enerlens-gui-profile.json"), "utf8");
  const after = JSON.stringify(await profile());
  if (after !== before) {
    throw new Error(`Profil hat sich geändert: ${before} -> ${after}`);
  }
}
