/**
 * Configurations of released versions keep working (REQ N-12).
 *
 * Every file under test/legacy was accepted by the release it is filed under.
 * The card must still accept it, without calling any of its keys unknown, and
 * must still make of it at least what it did when the file was added. Never
 * adjust a file here to make this pass - see test/legacy/README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import type { RawConfig } from "../src/types";

const root = join(__dirname, "legacy");
const versions = readdirSync(root).filter((d) => d.startsWith("v"));
const configs = versions.flatMap((version) =>
  readdirSync(join(root, version))
    .filter((f) => f.endsWith(".json") && !f.endsWith(".expected.json"))
    .map((f) => `${version}/${f.replace(/\.json$/, "")}`),
);
const read = (path: string): unknown => JSON.parse(readFileSync(join(root, path), "utf8"));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("configurations of released versions (N-12)", () => {
  it("has a configuration for every release folder", () => {
    expect(configs.length).toBeGreaterThan(0);
    for (const version of versions) {
      expect(
        configs.some((c) => c.startsWith(`${version}/`)),
        version,
      ).toBe(true);
    }
  });

  it.each(configs)("%s is still read as it was", (name) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = normalizeConfig(read(`${name}.json`) as RawConfig);
    expect(JSON.parse(JSON.stringify(config))).toMatchObject(
      read(`${name}.expected.json`) as Record<string, unknown>,
    );
    const unknown = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("unknown"));
    expect(unknown).toEqual([]);
  });

  it("changes no file that is already there", () => {
    const sums = read("checksums.json") as Record<string, string>;
    const files = versions.flatMap((version) =>
      readdirSync(join(root, version)).map((f) => `${version}/${f}`),
    );
    for (const file of files) {
      const hash = createHash("sha256")
        .update(readFileSync(join(root, file)))
        .digest("hex");
      expect(sums[file], `${file}: new or changed - see test/legacy/README.md`).toBe(hash);
    }
    expect(Object.keys(sums).sort()).toEqual([...files].sort());
  });
});
