// Writes checksums.json for the files under test/legacy (REQ N-12).
// Adding new files is routine; a changed hash of an existing file is not -
// see README.md.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const sums = {};
for (const version of readdirSync(root)
  .filter((d) => d.startsWith("v"))
  .sort()) {
  for (const file of readdirSync(join(root, version)).sort()) {
    const path = `${version}/${file}`;
    sums[path] = createHash("sha256")
      .update(readFileSync(join(root, path)))
      .digest("hex");
  }
}
writeFileSync(join(root, "checksums.json"), `${JSON.stringify(sums, null, 2)}\n`);
console.log(`${Object.keys(sums).length} files`);
