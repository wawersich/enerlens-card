// @vitest-environment happy-dom
/**
 * The detail window for grid and battery with two sensors (REQ 2.20, DF-1,
 * DF-2): which target opens it, which keeps opening an entity, and what the
 * card hands to Home Assistant's dialog manager. Invented figures (N-9).
 */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import { DETAIL_NAME } from "../src/const";
import { CARD_GONE_MS } from "../src/detail-dialog";
import { buildModel } from "../src/model";
import { buildNodeViews } from "../src/render/cross";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(async () => {
  fakeMotion();
  await import("../src/enerlens-card");
});

function fakeHass(states: Record<string, string>): HomeAssistant {
  const entities: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    entities[id] = {
      entity_id: id,
      state,
      attributes: id.includes("soc")
        ? { unit_of_measurement: "%" }
        : id.includes("status")
          ? {}
          : { unit_of_measurement: "W" },
      last_changed: "2026-10-26T12:00:00+00:00",
      last_updated: "2026-10-26T12:00:00+00:00",
    };
  }
  return {
    states: entities,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

const ENTITIES = {
  solar: "sensor.solar",
  grid: { import: "sensor.import", export: "sensor.export" },
  battery: { discharge: "sensor.out", charge: "sensor.in" },
  battery_soc: "sensor.soc",
  house: "sensor.house",
};

const STATES: Record<string, string> = {
  "sensor.solar": "3000",
  "sensor.import": "0",
  "sensor.export": "1200",
  "sensor.out": "0",
  "sensor.in": "800",
  "sensor.soc": "64",
  "sensor.house": "1000",
  "sensor.status": "ok",
  "sensor.extra": "12",
};

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  preview?: boolean;
};

async function mount(raw: Record<string, unknown> = {}, states = STATES, preview = false) {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig({ type: "custom:enerlens-card", entities: ENTITIES, ...raw });
  if (preview) el.preview = true;
  el.hass = fakeHass(states);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** What a tap asked for: an entity's more-info, or a dialog. */
function listen(el: Card) {
  const seen: { more: string[]; dialogs: Record<string, unknown>[] } = { more: [], dialogs: [] };
  el.addEventListener("hass-more-info", (ev) =>
    seen.more.push((ev as CustomEvent).detail.entityId),
  );
  el.addEventListener("show-dialog", (ev) => seen.dialogs.push((ev as CustomEvent).detail));
  return seen;
}

const hits = (el: Card, key: string) => [
  ...(el.shadowRoot?.querySelectorAll<HTMLElement>(`.node.${key} .hit`) ?? []),
];

afterEach(() => {
  for (const el of document.body.querySelectorAll("enerlens-card")) el.remove();
});

describe("which target opens the detail window (REQ DF-1)", () => {
  it("the grid node with two sensors", async () => {
    const el = await mount();
    const seen = listen(el);
    hits(el, "grid")[0].click();
    expect(seen.more).toEqual([]);
    expect(seen.dialogs).toHaveLength(1);
    expect(seen.dialogs[0].dialogTag).toBe(DETAIL_NAME);
    expect((seen.dialogs[0].dialogParams as { node: string }).node).toBe("grid");
  });

  it("the whole battery as one target, its charge in the window (I-2)", async () => {
    const el = await mount();
    const seen = listen(el);
    const targets = hits(el, "battery");
    expect(targets).toHaveLength(1);
    targets[0].click();
    expect(seen.more).toEqual([]);
    expect(seen.dialogs.map((d) => (d.dialogParams as { node: string }).node)).toEqual(["battery"]);
  });

  it("not a single signed sensor: that opens its entity as before", async () => {
    const el = await mount(
      { entities: { ...ENTITIES, grid: "sensor.grid" } },
      {
        ...STATES,
        "sensor.grid": "-1200",
      },
    );
    const seen = listen(el);
    hits(el, "grid")[0].click();
    expect(seen.dialogs).toEqual([]);
    expect(seen.more).toEqual(["sensor.grid"]);
  });

  it("an extra value above the icon keeps its own target (Z-7)", async () => {
    const el = await mount({ nodes: { grid: { inside: { entity: "sensor.extra" } } } });
    const seen = listen(el);
    const [upper, lower] = hits(el, "grid");
    upper.click();
    lower.click();
    expect(seen.more).toEqual(["sensor.extra"]);
    expect(seen.dialogs).toHaveLength(1);
  });

  it("in the editor's preview: the entity of the running direction instead (DF-2)", async () => {
    const el = await mount({}, STATES, true);
    const seen = listen(el);
    hits(el, "grid")[0].click();
    hits(el, "battery")[0].click();
    expect(seen.dialogs).toEqual([]);
    expect(seen.more).toEqual(["sensor.export", "sensor.in"]);
  });
});

describe("the node views behind the targets (REQ DF-1)", () => {
  const views = (entities: Record<string, unknown>, outage = false, states = STATES) => {
    const config = normalizeConfig({ type: "custom:enerlens-card", entities });
    const hass = fakeHass(states);
    return buildNodeViews(buildModel(hass, config), config, hass, outage);
  };
  const of = (list: ReturnType<typeof views>, key: string) => list.find((v) => v.key === key);

  it("marks grid and battery with two sensors, nothing else", () => {
    const list = views(ENTITIES);
    expect(of(list, "grid")?.detail).toBe("grid");
    expect(of(list, "battery")?.detail).toBe("battery");
    expect(of(list, "house")?.detail).toBeUndefined();
    expect(of(list, "solar")?.detail).toBeUndefined();
    // The entity stays: the fallback when the window cannot open (DF-7).
    expect(of(list, "grid")?.entity).toBe("sensor.export");
  });

  it("not a derived grid (I-4)", () => {
    const { grid: _grid, ...rest } = ENTITIES;
    const list = views({ ...rest, grid: "derived" });
    expect(of(list, "grid")?.detail).toBeUndefined();
    expect(of(list, "grid")?.entity).toBeUndefined();
  });

  it("not during an outage in the power view: the status entity says since when (NS-4)", () => {
    const list = views(
      { ...ENTITIES, grid_status: { entity: "sensor.status", outage: ["off"], ok: ["ok"] } },
      true,
    );
    expect(of(list, "grid")?.detail).toBeUndefined();
    expect(of(list, "grid")?.entity).toBe("sensor.status");
  });
});

describe("the dialog the card asks for (REQ DF-2)", () => {
  it("is Home Assistant's dialog manager's, with the card and the node", async () => {
    const el = await mount();
    const seen = listen(el);
    hits(el, "grid")[0].click();
    const detail = seen.dialogs[0] as {
      dialogTag: string;
      dialogImport: () => Promise<unknown>;
      dialogParams: { node: string; card: unknown };
    };
    expect(typeof detail.dialogImport).toBe("function");
    await detail.dialogImport();
    expect(customElements.get(DETAIL_NAME), "defined by the bundle itself").toBeTruthy();
    expect(detail.dialogParams.card).toBe(el);
  });

  it("opens with the node's name as title and closes for the manager", async () => {
    const el = await mount();
    const seen = listen(el);
    hits(el, "battery")[0].click();
    const { dialogParams } = seen.dialogs[0] as { dialogParams: Record<string, unknown> };
    const dialog = document.createElement(DETAIL_NAME) as HTMLElement & {
      showDialog: (p: unknown) => Promise<void> | void;
      closeDialog: () => boolean;
      updateComplete: Promise<unknown>;
    };
    document.body.appendChild(dialog);
    await dialog.showDialog(dialogParams);
    await dialog.updateComplete;
    expect(dialog.shadowRoot?.textContent ?? "").toContain("Batterie");
    let closed: unknown;
    dialog.addEventListener("dialog-closed", (ev) => {
      closed = (ev as CustomEvent).detail;
    });
    expect(dialog.closeDialog()).toBe(true);
    await dialog.updateComplete;
    expect(closed).toEqual({ dialog: DETAIL_NAME });
    dialog.remove();
  });

  it("closes when its card goes away (a view change, edit mode)", async () => {
    const el = await mount();
    const seen = listen(el);
    hits(el, "grid")[0].click();
    const { dialogParams } = seen.dialogs[0] as { dialogParams: Record<string, unknown> };
    const dialog = document.createElement(DETAIL_NAME) as HTMLElement & {
      showDialog: (p: unknown) => Promise<void> | void;
      updateComplete: Promise<unknown>;
    };
    document.body.appendChild(dialog);
    await dialog.showDialog(dialogParams);
    let closed = false;
    dialog.addEventListener("dialog-closed", () => {
      closed = true;
    });
    const wait = () => new Promise((r) => setTimeout(r, CARD_GONE_MS + 50));
    // Another card going away leaves it open.
    const other = await mount();
    other.remove();
    await wait();
    expect(closed).toBe(false);
    // Only moved, as a masonry view does when its columns change: stays open.
    const parent = el.parentElement as HTMLElement;
    el.remove();
    parent.appendChild(el);
    await wait();
    expect(closed).toBe(false);
    el.remove();
    await wait();
    expect(closed).toBe(true);
    dialog.remove();
  });

  it("starts afresh when the manager shows it again, one refresh timer only", async () => {
    const el = await mount();
    const seen = listen(el);
    hits(el, "grid")[0].click();
    const { dialogParams } = seen.dialogs[0] as { dialogParams: Record<string, unknown> };
    const dialog = document.createElement(DETAIL_NAME) as HTMLElement & {
      showDialog: (p: unknown) => Promise<void> | void;
      closeDialog: () => boolean;
    };
    document.body.appendChild(dialog);
    const timers: unknown[] = [];
    const set = window.setInterval;
    const clear = window.clearInterval;
    window.setInterval = ((fn: () => void, ms: number) => {
      const id = set(fn, ms);
      timers.push(id);
      return id;
    }) as typeof window.setInterval;
    window.clearInterval = ((id: number) => {
      timers.splice(timers.indexOf(id), 1);
      clear(id);
    }) as typeof window.clearInterval;
    try {
      await dialog.showDialog(dialogParams);
      await dialog.showDialog(dialogParams);
      expect(timers).toHaveLength(1);
      dialog.closeDialog();
      expect(timers).toHaveLength(0);
    } finally {
      window.setInterval = set;
      window.clearInterval = clear;
      dialog.remove();
    }
  });

  it("gives the focus back to the target it came from", async () => {
    const el = await mount();
    const seen = listen(el);
    const target = hits(el, "grid")[0];
    target.focus();
    target.click();
    const { dialogParams } = seen.dialogs[0] as { dialogParams: Record<string, unknown> };
    const dialog = document.createElement(DETAIL_NAME) as HTMLElement & {
      showDialog: (p: unknown) => Promise<void> | void;
      closeDialog: () => boolean;
      updateComplete: Promise<unknown>;
    };
    document.body.appendChild(dialog);
    await dialog.showDialog(dialogParams);
    (document.activeElement as HTMLElement | null)?.blur();
    dialog.closeDialog();
    await dialog.updateComplete;
    expect(el.shadowRoot?.activeElement).toBe(target);
    dialog.remove();
  });
});
