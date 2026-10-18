import { describe, expect, it, vi } from "vitest";
import { KNOWN_KEYS, normalizeConfig } from "../src/config";
import type { RawConfig } from "../src/types";

vi.mock("../src/localize", () => ({
  localize: (key: string) => key,
}));

/*
 * Issue #15: YAML reads a key left without a value as `null`. Every optional
 * value counts as "not set" when empty or null (REQ E-1) - so an empty key has
 * to give exactly the card the missing key gives, not an error card and not a
 * different card.
 */

const ENTITIES = { solar: "sensor.pv", grid: "sensor.grid", battery: "sensor.bat" };
const CONSUMER = { entity: "sensor.heat_pump" };

function base(): Record<string, unknown> {
  return { type: "custom:enerlens-card", entities: { ...ENTITIES }, consumers: [{ ...CONSUMER }] };
}

type Path = readonly string[];

/** Top-level keys that must be there; every other known key is optional. */
const REQUIRED = new Set(["type", "entities"]);

/*
 * Every optional top-level key comes from the card's own list, so a new one is
 * covered without touching this file. The keys inside the blocks are listed by
 * hand - there is no such list in the code.
 */
const OPTIONAL: readonly Path[] = [
  ...[...KNOWN_KEYS].filter((key) => !REQUIRED.has(key)).map((key) => [key]),
  ["icons", "rest"],
  ["icons", "solar"],
  ["colors", "solar"],
  ["colors", "soc_stops"],
  ["colors", "consumer_palette"],
  ["colors", "grid_label"],
  ["list", "rest_label"],
  ["ring", "enabled"],
  ["view", "avg_short_minutes"],
  ["flow", "min_w"],
  ["flow", "dot_color"],
  ["power", "unit"],
  ["nodes", "solar"],
  ["consumers", "0", "name"],
  ["consumers", "0", "min_w"],
  ["consumers", "0", "charge"],
  ["entities", "battery"],
  ["entities", "battery_soc"],
  ["entities", "house"],
  ["entities", "grid_status"],
];

/** The base config with the key at `path` set to `value`, or removed when undefined. */
function withKey(path: Path, value: unknown): RawConfig {
  const config = base();
  let node = config as Record<string, unknown>;
  for (const key of path.slice(0, -1)) {
    node[key] ??= {};
    node = node[key] as Record<string, unknown>;
  }
  const last = path[path.length - 1];
  if (value === undefined) delete node[last];
  else node[last] = value;
  return config as RawConfig;
}

describe("an empty key is a missing key (E-1, issue #15)", () => {
  for (const path of OPTIONAL) {
    for (const empty of [null, "", "  "]) {
      it(`${path.join(".")}: ${JSON.stringify(empty)}`, () => {
        const expected = normalizeConfig(withKey(path, undefined));
        expect(normalizeConfig(withKey(path, empty))).toEqual(expected);
      });
    }
  }

  for (const required of ["solar", "grid"]) {
    for (const empty of [null, "", "  "]) {
      it(`a required entity left empty stays an error: ${required}: ${JSON.stringify(empty)}`, () => {
        expect(() => normalizeConfig(withKey(["entities", required], empty))).toThrow(
          "error.config.missing_entities",
        );
      });
    }
  }

  it("an empty entities block says it is missing", () => {
    expect(() => normalizeConfig(withKey(["entities"], null))).toThrow(
      "error.config.missing_entities",
    );
  });

  it("a half-filled split source stays an error", () => {
    expect(() =>
      normalizeConfig(withKey(["entities", "grid"], { import: "sensor.in", export: null })),
    ).toThrow("error.config.mixed_form");
  });
});
