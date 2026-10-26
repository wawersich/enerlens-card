// @vitest-environment happy-dom
/**
 * A consumer colour lands on the consumer it was picked for (REQ C-4, E-1),
 * also when the YAML holds an entry the card skips - `- sensor.x` instead of
 * `- entity: sensor.x`. The colour rows counted without that entry, the write
 * with it: from there on every colour went to the next consumer (found
 * 25.10.2026 in the review after the PV switch bug).
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
  requestUpdate(): void;
};

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

const CONFIG = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
  consumers: [
    "sensor.skipped",
    { entity: "sensor.one", name: "Eins" },
    { entity: "sensor.two", name: "Zwei" },
  ],
} as unknown as RawConfig;

beforeAll(async () => {
  await import("../src/editor");
});

async function mount(): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(CONFIG);
  document.body.appendChild(el);
  await el.updateComplete;
  (el as unknown as { _builtSections: ReadonlySet<string> })._builtSections = {
    has: () => true,
  } as unknown as ReadonlySet<string>;
  el.requestUpdate();
  await el.updateComplete;
  return el;
}

/** The swatch of the colour row that names `label`. */
function keyOf(el: Editor, label: string): string {
  const row = [...(el.shadowRoot?.querySelectorAll(".color") ?? [])].find((r) =>
    r.textContent?.includes(label),
  );
  const key = row?.querySelector(".swatch")?.getAttribute("data-key");
  if (!key) throw new Error(`no colour row for ${label}`);
  return key;
}

describe("consumer colours with an entry the card skips (C-4)", () => {
  it("the colour picked for 'Zwei' is written to 'Zwei', not to 'Eins'", async () => {
    const el = await mount();
    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    (el as unknown as { _applyColor(id: string, v: string): void })._applyColor(
      keyOf(el, "Zwei"),
      "#ff0000",
    );
    // The skipped entry itself is dropped on a rebuild, as the editor always
    // did with entries the card cannot use; what matters is who gets the colour.
    const consumers = saved?.consumers as unknown as Record<string, unknown>[];
    expect(consumers.find((c) => c.entity === "sensor.two")?.color).toBe("#ff0000");
    expect(consumers.find((c) => c.entity === "sensor.one")?.color).toBeUndefined();
  });
});

describe("the preset a consumer row shows (C-4)", () => {
  it("is the palette colour the card gives that consumer - counted like the card", async () => {
    const { DEFAULT_CONSUMER_PALETTE } = await import("../src/colors");
    const el = await mount();
    const row = [...(el.shadowRoot?.querySelectorAll(".color") ?? [])].find((r) =>
      r.textContent?.includes("Zwei"),
    ) as HTMLElement;
    // The card counts the skipped entry too (config.ts, palette[i]): Zwei is the third.
    const swatch = row.querySelector(".swatch") as HTMLElement;
    expect(swatch.getAttribute("style") ?? "").toContain(DEFAULT_CONSUMER_PALETTE[2]);
  });
});
