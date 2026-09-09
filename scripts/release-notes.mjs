/**
 * Release notes for a tag, taken from CHANGELOG.md.
 *
 * The text exists once and is written for people; a release page that only
 * shows "Full Changelog: compare/..." makes them read commits instead. Usage:
 *   node scripts/release-notes.mjs v0.2.0 > release-notes.md
 */
import { readFileSync } from "node:fs";

/** The body of one version's section, without its heading. */
export function notesFor(changelog, tag) {
  const version = tag.replace(/^v/, "");
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tag = process.argv[2];
  if (!tag) {
    console.error("usage: release-notes.mjs <tag>");
    process.exit(2);
  }
  const notes = notesFor(readFileSync("CHANGELOG.md", "utf8"), tag);
  if (notes) {
    process.stdout.write(`${notes}\n`);
  } else {
    // Never fail the release over this: no asset would be worse than no text.
    console.error(`::warning::CHANGELOG.md has no section for ${tag}`);
    process.stdout.write(
      `See [CHANGELOG.md](https://github.com/wawersich/enerlens-card/blob/main/CHANGELOG.md).\n`,
    );
  }
}
