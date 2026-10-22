// @vitest-environment happy-dom
/**
 * What a card remembers is its own (REQ V-12): the key is the view, the
 * card's memory_id and - for a second card with the same id in the same view
 * - a suffix that only the later one takes. Invented readings (N-9).
 */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};

const STATES: Record<string, string> = {
  "sensor.solar": "2000",
  "sensor.grid": "300",
  "sensor.house": "1700",
  "sensor.pump": "1200",
  "sensor.idle": "3",
};

function fakeHass(): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(STATES)) {
    states[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: "W" },
      last_changed: "2026-10-22T08:00:00+00:00",
      last_updated: "2026-10-22T08:00:00+00:00",
    };
  }
  return {
    states,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

const config = (memory_id?: string) => ({
  type: "custom:enerlens-card",
  ...(memory_id ? { memory_id } : {}),
  entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
  consumers: [
    { entity: "sensor.pump", name: "Pump" },
    { entity: "sensor.idle", name: "Idle" },
  ],
  // No energy default: these tests are about remembering, not statistics.
  view: { energy_periods: ["power"] },
});

/** Cards as a dashboard puts them: each inside a shadow root of its own. */
async function page(ids: (string | undefined)[]): Promise<Card[]> {
  const cards: Card[] = [];
  for (const id of ids) {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(config(id));
    el.hass = fakeHass();
    root.appendChild(el);
    document.body.appendChild(host);
    cards.push(el);
  }
  for (const el of cards) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  for (const el of cards) await el.updateComplete;
  return cards;
}

const mode = (el: Card) =>
  el.shadowRoot?.querySelector(".view-chip .mode-label.active")?.textContent?.trim();
const step = async (el: Card) => {
  el.shadowRoot?.querySelector<HTMLElement>(".view-chip")?.click();
  await el.updateComplete;
};
const names = (el: Card) =>
  [...(el.shadowRoot?.querySelectorAll(".row .name") ?? [])].map((n) => n.textContent);
const reload = () => {
  document.body.innerHTML = "";
};
const keys = () => Object.keys(localStorage).sort();

describe("remembered per card (REQ V-12)", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });
  afterEach(() => {
    localStorage.clear();
    reload();
    history.replaceState(null, "", "/");
  });

  it("keeps two cards with their own ids apart", async () => {
    history.replaceState(null, "", "/dashboard-energy/flow");
    const [a, b] = await page(["aaaa1111", "bbbb2222"]);
    await step(a);
    expect(mode(a)).toBe("Ø 2 min");
    expect(mode(b)).toBe("Jetzt");
    reload();
    const [a2, b2] = await page(["aaaa1111", "bbbb2222"]);
    expect(mode(a2)).toBe("Ø 2 min");
    expect(mode(b2)).toBe("Jetzt");
    expect(keys()).toEqual(["enerlens:dashboard-energy/flow:aaaa1111:view-mode"]);
  });

  it("lets only the later of two cards with the same id take a suffix", async () => {
    history.replaceState(null, "", "/dashboard-energy/flow");
    const [first, second] = await page(["same0000", "same0000"]);
    await step(second);
    await step(second);
    await step(first);
    expect(keys()).toEqual([
      "enerlens:dashboard-energy/flow:same0000#2:view-mode",
      "enerlens:dashboard-energy/flow:same0000:view-mode",
    ]);
    reload();
    const [first2, second2] = await page(["same0000", "same0000"]);
    expect(mode(first2)).toBe("Ø 2 min");
    expect(mode(second2)).toBe("Ø 15 min");
  });

  it("orders by the place on the page, not by who came first", async () => {
    history.replaceState(null, "", "/dashboard-energy/flow");
    const [first, second] = await page(["same0000", "same0000"]);
    await step(second);
    reload();
    // The later card is built first this time; it still is the later one.
    const hostA = document.createElement("div");
    const hostB = document.createElement("div");
    document.body.append(hostA, hostB);
    const later = document.createElement("enerlens-card") as Card;
    later.setConfig(config("same0000"));
    later.hass = fakeHass();
    hostB.attachShadow({ mode: "open" }).appendChild(later);
    const earlier = document.createElement("enerlens-card") as Card;
    earlier.setConfig(config("same0000"));
    earlier.hass = fakeHass();
    hostA.attachShadow({ mode: "open" }).appendChild(earlier);
    await later.updateComplete;
    await earlier.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    expect(mode(later)).toBe("Ø 2 min");
    expect(mode(earlier)).toBe("Jetzt");
    expect(first).not.toBe(second);
  });

  it("takes the order of the dashboard's configuration, not the screen's (V-12)", async () => {
    history.replaceState(null, "", "/dashboard-energy/flow");
    // As HA builds it: a section that holds the dashboard, a hui-card per
    // card whose config is the very object in it. On screen the copy comes
    // first here - a masonry column can do that - in the configuration second.
    const original = config("twin0000");
    const copy = config("twin0000");
    const section = document.createElement("div") as unknown as HTMLElement & { lovelace: unknown };
    section.lovelace = {
      config: {
        views: [
          { path: "other", cards: [] },
          { path: "flow", sections: [{ cards: [original, copy] }] },
        ],
      },
    };
    document.body.appendChild(section);
    const root = section.attachShadow({ mode: "open" });
    const cards: Card[] = [];
    for (const raw of [copy, original]) {
      const wrap = document.createElement("hui-card") as HTMLElement & { config: unknown };
      wrap.config = raw;
      const el = document.createElement("enerlens-card") as Card;
      el.setConfig(raw);
      el.hass = fakeHass();
      wrap.appendChild(el);
      root.appendChild(wrap);
      cards.push(el);
    }
    for (const el of cards) await el.updateComplete;
    const [onScreenFirst] = cards;
    await step(onScreenFirst);
    expect(keys()).toEqual(["enerlens:dashboard-energy/flow:twin0000#2:view-mode"]);
  });

  it("keeps a copy in another view apart", async () => {
    history.replaceState(null, "", "/dashboard-energy/flow");
    const [a] = await page(["copy0000"]);
    await step(a);
    reload();
    history.replaceState(null, "", "/dashboard-energy/other");
    const [elsewhere] = await page(["copy0000"]);
    expect(mode(elsewhere)).toBe("Jetzt");
  });

  it("remembers the list scope per card too", async () => {
    history.replaceState(null, "", "/dashboard-energy/flow");
    const [a, b] = await page(["aaaa1111", "bbbb2222"]);
    a.shadowRoot?.querySelector<HTMLElement>(".filter-toggle")?.click();
    await a.updateComplete;
    reload();
    const [a2, b2] = await page(["aaaa1111", "bbbb2222"]);
    expect(names(a2)).toContain("Idle");
    expect(names(b2)).not.toContain("Idle");
    expect(b).toBeTruthy();
  });

  it("keeps a tap in the editor preview a look, not a choice", async () => {
    const [card] = await page(["prev0000"]);
    (card as unknown as { preview: boolean }).preview = true;
    await step(card);
    card.shadowRoot?.querySelector<HTMLElement>(".filter-toggle")?.click();
    await card.updateComplete;
    expect(keys()).toEqual([]);
  });

  it("leaves a card without an id with the shared keys of the browser", async () => {
    localStorage.setItem("enerlens-view-mode", "avg_long");
    const [plain, own] = await page([undefined, "own00000"]);
    expect(mode(plain)).toBe("Ø 15 min");
    // A card with an id does not read the shared keys.
    expect(mode(own)).toBe("Jetzt");
  });
});
