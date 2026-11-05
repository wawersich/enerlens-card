// @vitest-environment happy-dom
/**
 * The list switches under "Darstellung" (REQ L-14, 05.11.2026): named like the
 * rings, the PV list not "in the list" (square_left puts it on the other
 * side), and "always below" in the plural once both lists are shown.
 */
import { describe, expect, it } from "vitest";
import "../src/editor";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  _label: (i: { name: string }) => string;
  _helper: (i: { name: string }) => string;
};

const hassIn = (language: string) =>
  ({
    states: {},
    locale: { language, number_format: "language" as const },
    language,
    callWS: async () => ({}) as never,
  }) as HomeAssistant;

const SOURCES = [
  { entity: "sensor.roof", name: "Dach" },
  { entity: "sensor.balcony", name: "Balkon" },
];

async function mount(config: Record<string, unknown>, language = "de"): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hassIn(language);
  el.setConfig({
    type: "custom:enerlens-card",
    entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
    ...config,
  } as RawConfig);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const CONSUMERS = [{ entity: "sensor.c1", name: "Herd" }];
const BOTH = {
  entities: { solar: SOURCES, grid: "sensor.g", house: "sensor.h" },
  consumers: CONSUMERS,
  list: { solar: true },
};

describe("the list switches (REQ L-14)", () => {
  it("names them like the rings, the PV list not 'in the list'", async () => {
    const el = await mount({ consumers: CONSUMERS });
    expect(el._label({ name: "list_enabled" })).toBe("Verbraucherliste anzeigen");
    expect(el._label({ name: "list_solar" })).toBe("PV-Liste anzeigen");
    expect(el._helper({ name: "list_solar" })).toContain("Quadrat · PV links");
    expect(el._helper({ name: "list_solar" })).not.toContain("in der Liste");
    expect(el._helper({ name: "list_enabled" })).toContain("Standard: an, wenn Verbraucher");
  });

  it("one list: always below in the singular", async () => {
    for (const config of [
      { consumers: CONSUMERS },
      // Sources, but their list off.
      { ...BOTH, list: { solar: false } },
      // Both switched on, the consumer list off.
      { ...BOTH, list: { solar: true, enabled: false } },
      // One source has no PV rows (solar.ts), however the switch stands.
      { ...BOTH, entities: { solar: [SOURCES[0]], grid: "sensor.g", house: "sensor.h" } },
    ]) {
      const el = await mount(config);
      expect(el._label({ name: "list_always_below" })).toBe("Liste immer unten");
      expect(el._helper({ name: "list_always_below" })).toMatch(/^Die Liste bleibt/);
    }
  });

  it("both lists shown: always below in the plural", async () => {
    const el = await mount(BOTH);
    expect(el._label({ name: "list_always_below" })).toBe("Listen immer unten");
    expect(el._helper({ name: "list_always_below" })).toMatch(/^Die Listen bleiben/);
  });

  it("the same in English", async () => {
    const one = await mount({ consumers: CONSUMERS }, "en");
    expect(one._label({ name: "list_enabled" })).toBe("Show consumer list");
    expect(one._label({ name: "list_solar" })).toBe("Show PV list");
    expect(one._label({ name: "list_always_below" })).toBe("List always below");
    const both = await mount(BOTH, "en");
    expect(both._label({ name: "list_always_below" })).toBe("Lists always below");
    expect(both._helper({ name: "list_always_below" })).toMatch(/the lists under/);
  });
});
