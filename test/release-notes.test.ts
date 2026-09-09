/**
 * The release page takes its text from the changelog (REQ AL-2). A silent miss
 * here is only noticed by whoever reads the release afterwards, so the cut is
 * tested rather than trusted.
 */
import { describe, expect, it } from "vitest";
// @ts-expect-error - plain ESM helper, no types
import { notesFor } from "../scripts/release-notes.mjs";

const CHANGELOG = `# Changelog

Intro line that belongs to nobody.

## [0.2.0] - 2026-09-09

### Added
- A thing.

### Fixed
- Another thing.

## [0.1.1] - 2026-09-08

### Changed
- Older thing.
`;

describe("release notes from the changelog", () => {
  it("takes one version's section, without its heading", () => {
    expect(notesFor(CHANGELOG, "v0.2.0")).toBe(
      "### Added\n- A thing.\n\n### Fixed\n- Another thing.",
    );
  });

  it("stops at the next version", () => {
    expect(notesFor(CHANGELOG, "v0.2.0")).not.toContain("Older thing");
  });

  it("works without the v prefix", () => {
    expect(notesFor(CHANGELOG, "0.1.1")).toBe("### Changed\n- Older thing.");
  });

  it("returns nothing for a version the changelog does not know", () => {
    expect(notesFor(CHANGELOG, "v9.9.9")).toBeNull();
  });
});
