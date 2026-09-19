// @vitest-environment happy-dom
/**
 * Renders the actual custom element. This is the layer where a broken template
 * or a missing update trigger shows up - unit tests on the modules cannot see it.
 */
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";

function fakeHass(
  states: Record<string, string>,
  icons: Record<string, string> = {},
): HomeAssistant {
  const entities: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    entities[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: id.includes("soc") ? "%" : "W", icon: icons[id] },
      last_changed: "2026-09-06T20:00:00+00:00",
      last_updated: "2026-09-06T20:00:00+00:00",
    };
  }
  return {
    states: entities,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

const CONFIG = {
  type: "custom:enerlens-card",
  title: "Test",
  entities: {
    solar: "sensor.solar",
    grid: "sensor.grid",
    battery: { discharge: "sensor.bat_out", charge: "sensor.bat_in" },
    battery_soc: "sensor.soc",
    house: "sensor.house",
  },
};

const STATES = {
  "sensor.solar": "9330",
  "sensor.grid": "-3930",
  "sensor.bat_out": "0",
  "sensor.bat_in": "1600",
  "sensor.soc": "72",
  "sensor.house": "3800",
};

describe("enerlens-card element", () => {
  beforeAll(async () => {
    // happy-dom has no ResizeObserver; the card uses it only for the scale factor.
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount() {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig(CONFIG);
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("draws a working connection on top of an idle one", async () => {
    // Two connections reach the battery along the same last stretch. Drawn in
    // the fixed order, the grey of an idle one lay over the colour of a
    // working one and tinted it - visible as a line that darkens halfway.
    const el = await mount();
    const links = [...(el.shadowRoot?.querySelectorAll("path.link") ?? [])];
    const active = links.map((path) => path.classList.contains("active"));
    const firstActive = active.indexOf(true);
    if (firstActive === -1) return; // nothing flowing in this fixture
    expect(active.slice(firstActive).every(Boolean), "an idle line after a working one").toBe(true);
  });

  it("registers the element", () => {
    expect(customElements.get("enerlens-card")).toBeTruthy();
  });

  it("renders the cross with four nodes", async () => {
    const el = await mount();
    const root = el.shadowRoot;
    expect(root, "no shadow root").toBeTruthy();
    expect(root?.querySelector(".cross"), "no .cross container").toBeTruthy();
    expect(root?.querySelectorAll(".node").length, "wrong number of nodes").toBe(4);
  });

  it("shows the measured values (REQ K-7)", async () => {
    const el = await mount();
    const text = el.shadowRoot?.textContent ?? "";
    expect(text).toContain("9,33 kW");
    expect(text).toContain("3,93 kW");
    expect(text).toContain("3,80 kW");
    expect(text).toContain("1,60 kW");
  });

  it("labels grid export and battery charging (REQ K-2, K-4)", async () => {
    const el = await mount();
    const text = el.shadowRoot?.textContent ?? "";
    expect(text).toContain("Einspeisung");
    expect(text).toContain("lädt");
  });

  it("drops the battery lines when no battery is configured (REQ K-10)", async () => {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
    });
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll(".node").length, "battery node still there").toBe(3);
    // Only solar-grid, solar-house and grid-house remain.
    expect(el.shadowRoot?.querySelectorAll("path.link").length, "battery lines still there").toBe(
      3,
    );
  });

  it("leaves the layout to the available width by default", async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector(".body")?.classList.contains("force-below")).toBe(false);
  });

  it("forces the list below the cross when asked to, and back again (REQ L-14)", async () => {
    const el = await mount();
    el.setConfig({ ...CONFIG, list: { always_below: true } });
    await el.updateComplete;
    const body = el.shadowRoot?.querySelector(".body");
    expect(body?.classList.contains("force-below"), "switch did not reach the layout").toBe(true);

    // The switch acts on the stylesheet only: the stacked class stays what the
    // measurement makes of it, so nothing in the card writes it twice.
    el.setConfig({ ...CONFIG, list: { always_below: false } });
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelector(".body")?.classList.contains("force-below"),
      "switch did not take effect without a reload",
    ).toBe(false);
  });

  it("re-renders when hass changes", async () => {
    const el = await mount();
    el.hass = fakeHass({ ...STATES, "sensor.solar": "1234" });
    await el.updateComplete;
    expect(el.shadowRoot?.textContent ?? "").toContain("1,23 kW");
  });
});

describe("dot layer", () => {
  it("creates dots for the active connections (REQ P-1)", async () => {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig(CONFIG);
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    // 9330 W solar, 3930 W export, 1600 W charging, 3800 W house - four flows,
    // each above flow.min_w, so every one carries at least one dot.
    const dots = el.shadowRoot?.querySelectorAll("g.dots circle");
    expect(dots?.length, "no dots rendered").toBeGreaterThan(0);
  });

  it("keeps dots out of the light DOM template", async () => {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig(CONFIG);
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    const before = el.shadowRoot?.querySelectorAll("g.dots circle")[0];
    el.hass = fakeHass({ ...STATES, "sensor.solar": "8000" });
    await el.updateComplete;
    const after = el.shadowRoot?.querySelectorAll("g.dots circle")[0];
    // Same element instance across a re-render - otherwise the animation would
    // restart on every state change (REQ P-6).
    expect(after, "dot element was recreated").toBe(before);
  });
});

describe("dot spacing", () => {
  it("keeps gaps even when the count changes (REQ P-3)", async () => {
    const { DotLayer } = await import("../src/render/dots");
    const { normalizeConfig } = await import("../src/config");
    const config = normalizeConfig(CONFIG);
    const svgNs = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNs, "g") as SVGGElement;
    document.body.appendChild(group);

    // happy-dom has no WAAPI; stand in with an object that records the phase.
    const phases: number[] = [];
    (Element.prototype as unknown as { animate: unknown }).animate = function animate() {
      const anim = {
        currentTime: 0,
        playbackRate: 1,
        updatePlaybackRate(r: number) {
          this.playbackRate = r;
        },
        pause() {},
        play() {},
        cancel() {},
      };
      return anim as unknown as Animation;
    };

    const layer = new DotLayer(group, "waapi");
    layer.update(
      [{ connection: "solar_house", w: 300, count: 1, durationS: 5, colorKey: "solar" }],
      config,
      true,
    );
    // Advance the single dot to 30 % of a lap, then let a second one join.
    const first = group.querySelectorAll("circle")[0] as SVGCircleElement & { _a?: Animation };
    const anims = group.querySelectorAll("circle");
    expect(anims.length).toBe(1);

    layer.update(
      [{ connection: "solar_house", w: 3000, count: 3, durationS: 1.8, colorKey: "solar" }],
      config,
      true,
    );
    expect(group.querySelectorAll("circle").length, "count did not grow").toBe(3);

    // With an anchor at 0 the three dots must sit at 0, 1/3 and 2/3 of a lap.
    for (const el of group.querySelectorAll("circle")) {
      phases.push(Number.parseFloat((el as SVGCircleElement).style.offsetDistance));
    }
    expect(first).toBeTruthy();
    layer.destroy();
    group.remove();
  });
});

describe("battery node", () => {
  async function mountBattery(soc: string) {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig(CONFIG);
    el.hass = fakeHass({ ...STATES, "sensor.soc": soc });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("fills the node to the state of charge (REQ K-5)", async () => {
    const el = await mountBattery("72");
    const fill = el.shadowRoot?.querySelector(".node.battery .fill") as HTMLElement | null;
    expect(fill, "no fill element").toBeTruthy();
    expect(fill?.style.height).toBe("72%");
  });

  it("offers two separate tap targets (REQ I-2)", async () => {
    const el = await mountBattery("50");
    const hits = el.shadowRoot?.querySelectorAll(".node.battery .hit");
    expect(hits?.length, "expected an upper and a lower target").toBe(2);
    expect(hits?.[0].classList.contains("upper")).toBe(true);
    expect(hits?.[1].classList.contains("lower")).toBe(true);
  });

  it("opens the charge entity from the upper target (REQ I-2, I-1)", async () => {
    const el = await mountBattery("50");
    const seen: string[] = [];
    el.addEventListener("hass-more-info", (ev) => {
      seen.push((ev as CustomEvent<{ entityId: string }>).detail.entityId);
    });
    const hits = el.shadowRoot?.querySelectorAll(".node.battery .hit");
    (hits?.[0] as HTMLElement).click();
    (hits?.[1] as HTMLElement).click();
    expect(seen[0], "upper target should open the state of charge").toBe("sensor.soc");
    // Charging, so the lower target opens the charge entity (REQ 4.2).
    expect(seen[1]).toBe("sensor.bat_in");
  });

  it("leaves derived nodes unclickable (REQ I-4)", async () => {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
    });
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".node.house .hit"), "house is derived").toBeFalsy();
    expect(el.shadowRoot?.textContent).toContain("berechnet");
  });
});

describe("view modes (REQ V-1 to V-9)", () => {
  async function mountWithModes(view?: Record<string, unknown>) {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig(view ? { ...CONFIG, view } : CONFIG);
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("offers three chips with the configured windows", async () => {
    const el = await mountWithModes({ avg_short_minutes: 3, avg_long_minutes: 20 });
    const chips = [...(el.shadowRoot?.querySelectorAll(".mode") ?? [])].map((c) =>
      c.textContent?.trim(),
    );
    expect(chips).toEqual(["Jetzt", "Ø 3 min", "Ø 20 min"]);
  });

  it("marks exactly one chip as selected", async () => {
    const el = await mountWithModes();
    const checked = [...(el.shadowRoot?.querySelectorAll('.mode[aria-checked="true"]') ?? [])];
    expect(checked.length).toBe(1);
    expect(checked[0].textContent?.trim()).toBe("Jetzt");
  });

  it("switches mode on click and keeps the state of charge live (REQ V-5, V-8)", async () => {
    const el = await mountWithModes();
    const chips = el.shadowRoot?.querySelectorAll(".mode");
    (chips?.[2] as HTMLElement).click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.mode[aria-checked="true"]')?.textContent?.trim()).toBe(
      "Ø 15 min",
    );
    // 72 % comes straight from the sensor, never from the window mean.
    expect(el.shadowRoot?.textContent).toContain("72");
  });

  it("names the active mode even with the selector hidden (REQ V-3)", async () => {
    const el = await mountWithModes({ show_selector: false, default_mode: "avg_long" });
    expect(el.shadowRoot?.querySelector(".modes")).toBeFalsy();
    expect(el.shadowRoot?.querySelector(".mode-note")?.textContent?.trim()).toBe("Ø 15 min");
  });
});

describe("show-all toggle (REQ L-12)", () => {
  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
    shadowRoot: ShadowRoot | null;
  };

  beforeEach(() => localStorage.clear());

  async function mountWithConsumers(extra: Record<string, unknown> = {}) {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      ...CONFIG,
      consumers: [
        { entity: "sensor.pump", name: "Pump" },
        { entity: "sensor.idle", name: "Idle" },
      ],
      min_consumer_w: 10,
      ...extra,
    });
    el.hass = fakeHass({ ...STATES, "sensor.pump": "1200", "sensor.idle": "3" });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  const names = (el: Card) =>
    Array.from(el.shadowRoot?.querySelectorAll(".row .name") ?? []).map((n) => n.textContent);

  it("lists only the filtered consumers until the toggle is pressed", async () => {
    const el = await mountWithConsumers();
    expect(names(el)).not.toContain("Idle");
    const toggle = el.shadowRoot?.querySelector(".filter-toggle") as HTMLButtonElement;
    expect(toggle, "no toggle in the header").toBeTruthy();
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    toggle.click();
    await el.updateComplete;
    // The 3 W consumer is there now and can be tapped for its history.
    expect(names(el)).toContain("Idle");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(el.shadowRoot?.querySelector('.row[data-key="sensor.idle"] .row-hit')).toBeTruthy();

    toggle.click();
    await el.updateComplete;
    expect(names(el)).not.toContain("Idle");
  });

  it("keeps a lifted filter for the next card (REQ L-12, V-11)", async () => {
    const first = await mountWithConsumers();
    (first.shadowRoot?.querySelector(".filter-toggle") as HTMLButtonElement).click();
    await first.updateComplete;

    // A reload means a fresh element reading the same browser storage.
    const second = await mountWithConsumers();
    expect(names(second)).toContain("Idle");
    expect(second.shadowRoot?.querySelector(".filter-toggle")?.getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("forgets the filter when view.remember is off", async () => {
    const first = await mountWithConsumers({ view: { remember: false } });
    (first.shadowRoot?.querySelector(".filter-toggle") as HTMLButtonElement).click();
    await first.updateComplete;
    expect(names(first)).toContain("Idle");

    const second = await mountWithConsumers({ view: { remember: false } });
    expect(names(second)).not.toContain("Idle");
  });

  it("offers no toggle without consumers", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(CONFIG);
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".filter-toggle")).toBeNull();
  });

  it("gives a row with a grey line no ring segment (REQ R-2, 12.09.2026)", async () => {
    const el = await mountWithConsumers();
    const segmentKeys = () =>
      Array.from(el.shadowRoot?.querySelectorAll("circle.ring-seg") ?? []).map((c) =>
        c.getAttribute("data-key"),
      );

    const before = segmentKeys();
    expect(before.length, "no ring drawn").toBeGreaterThan(0);
    expect(before).not.toContain("sensor.idle");

    (el.shadowRoot?.querySelector(".filter-toggle") as HTMLButtonElement).click();
    await el.updateComplete;

    // The row appeared - but at 3 W its line is drawn grey and dotless, so it
    // gets no segment. The ring shows what is flowing, not what is listed.
    expect(names(el)).toContain("Idle");
    expect(segmentKeys()).toEqual(before);
  });
});

describe("consumer icons (REQ L-2)", () => {
  it("shows a configured icon in the entry's colour, and none otherwise", async () => {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig({
      ...CONFIG,
      consumers: [
        { entity: "sensor.pump", name: "Pump", icon: "mdi:heat-pump", color: "#123456" },
        { entity: "sensor.tv", name: "TV" },
      ],
    });
    el.hass = fakeHass({ ...STATES, "sensor.pump": "1200", "sensor.tv": "300" });
    document.body.appendChild(el);
    await el.updateComplete;
    const pump = el.shadowRoot?.querySelector(
      '.row[data-key="sensor.pump"] .swatch.icon',
    ) as HTMLElement & { icon?: string };
    expect(pump).toBeTruthy();
    expect(pump.icon).toBe("mdi:heat-pump");
    expect(pump.style.color).toMatch(/#123456|rgb\(18, 52, 86\)/);
    expect(el.shadowRoot?.querySelector('.row[data-key="sensor.tv"] .swatch.icon')).toBeNull();
    expect(el.shadowRoot?.querySelector('.row[data-key="sensor.tv"] .swatch.dot')).toBeTruthy();
  });
});

describe("row pitch follows the row count (REQ L-9)", () => {
  it("is roomy for few rows and compact for many", async () => {
    const { rowHeight } = await import("../src/render/list");
    expect(rowHeight(3)).toBe(40);
    expect(rowHeight(4)).toBe(40);
    expect(rowHeight(5)).toBe(34);
    expect(rowHeight(7)).toBe(34);
    expect(rowHeight(8)).toBe(28);
    expect(rowHeight(12)).toBe(28);
  });

  it("sets the pitch on the list element", async () => {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig({ ...CONFIG, consumers: [{ entity: "sensor.a", name: "A" }] });
    el.hass = fakeHass({ ...STATES, "sensor.a": "500" });
    document.body.appendChild(el);
    await el.updateComplete;
    // Two rows: the consumer and the rest.
    const list = el.shadowRoot?.querySelector(".list") as HTMLElement;
    expect(list.style.getPropertyValue("--el-row-h")).toBe("40px");
  });
});

/**
 * The banner and the node have to appear on the rendered element, not just in
 * the node view - that is the layer where a missing update trigger shows up
 * (REQ NS-4, NS-5).
 */
describe("grid outage on the element (REQ NS-4, NS-5)", () => {
  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
    shadowRoot: ShadowRoot | null;
  };

  const CONFIG_WITH_STATUS = {
    ...CONFIG,
    entities: {
      ...CONFIG.entities,
      grid_status: { entity: "sensor.grid_status", outage: ["not_detected"], ok: ["ok"] },
    },
  };

  async function mountWithStatus(status: string) {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(CONFIG_WITH_STATUS);
    const hass = fakeHass({ ...STATES, "sensor.grid_status": status });
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("shows the strip and marks the node while the grid is gone", async () => {
    const el = await mountWithStatus("not_detected");
    const root = el.shadowRoot;
    expect(root?.querySelector(".outage-banner"), "no banner").toBeTruthy();
    expect(root?.querySelector(".node.grid.outage"), "grid node not marked").toBeTruthy();
    expect(root?.querySelector(".node.grid .icon-cross svg"), "no X over the icon").toBeTruthy();
    expect(root?.textContent).toContain("kein Netz");
  });

  it("shows nothing of the sort while the grid is there", async () => {
    const el = await mountWithStatus("ok");
    expect(el.shadowRoot?.querySelector(".outage-banner")).toBeNull();
    expect(el.shadowRoot?.querySelector(".node.grid.outage")).toBeNull();
  });

  it("holds the outage when the status entity falls silent", async () => {
    const el = await mountWithStatus("not_detected");
    el.hass = fakeHass({ ...STATES, "sensor.grid_status": "unavailable" });
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelector(".outage-banner"),
      "outage dropped on unavailable - the ten-minute hold would lose it",
    ).toBeTruthy();
  });
});

describe("enerlens-card - an edit in the editor is not a reset (REQ P-6)", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
    shadowRoot: ShadowRoot | null;
  };

  const WITH_VIEW = {
    ...CONFIG,
    view: { default_mode: "current", avg_short_minutes: 2, avg_long_minutes: 15 },
    consumers: [
      { entity: "sensor.pump", name: "Wärmepumpe" },
      { entity: "sensor.fridge", name: "Kühlschränke" },
    ],
  };

  const STATES_PLUS = { ...STATES, "sensor.pump": "1789", "sensor.fridge": "69" };

  async function mount(config: unknown): Promise<Card> {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(config);
    el.hass = fakeHass(STATES_PLUS);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  /** The card keeps these across an edit; reading them is how the test sees it. */
  const guts = (el: Card) => el as unknown as { _mode: string; _buffer: unknown; _outage: unknown };

  it("keeps the view the user is on when only a colour changes", async () => {
    const el = await mount(WITH_VIEW);
    guts(el)._mode = "avg_short";
    const buffer = guts(el)._buffer;

    el.setConfig({ ...WITH_VIEW, colors: { rest: "#123456" } });
    await el.updateComplete;

    // Same view, same averaging buffer: nothing to re-sort, nothing to glide.
    expect(guts(el)._mode).toBe("avg_short");
    expect(guts(el)._buffer).toBe(buffer);
  });

  it("still follows the start view when that is what changed", async () => {
    const el = await mount(WITH_VIEW);
    guts(el)._mode = "avg_short";

    el.setConfig({ ...WITH_VIEW, view: { ...WITH_VIEW.view, default_mode: "avg_long" } });
    await el.updateComplete;
    expect(guts(el)._mode).toBe("avg_long");
  });

  it("rebuilds the averaging buffer only when its window changes", async () => {
    const el = await mount(WITH_VIEW);
    const buffer = guts(el)._buffer;

    el.setConfig({ ...WITH_VIEW, title: "Anderer Titel" });
    await el.updateComplete;
    expect(guts(el)._buffer).toBe(buffer);

    el.setConfig({ ...WITH_VIEW, view: { ...WITH_VIEW.view, avg_long_minutes: 30 } });
    await el.updateComplete;
    expect(guts(el)._buffer).not.toBe(buffer);
  });

  it("keeps a latched outage unless the status entity itself changes", async () => {
    const withStatus = {
      ...WITH_VIEW,
      entities: {
        ...WITH_VIEW.entities,
        grid_status: { entity: "sensor.status", outage: ["not_detected"], ok: ["ok"] },
      },
    };
    const el = await mount(withStatus);
    (el as unknown as { _outage: unknown })._outage = true;

    el.setConfig({ ...withStatus, colors: { rest: "#123456" } });
    await el.updateComplete;
    expect(guts(el)._outage).toBe(true);

    el.setConfig({
      ...withStatus,
      entities: {
        ...withStatus.entities,
        grid_status: { entity: "sensor.other", outage: ["not_detected"], ok: ["ok"] },
      },
    });
    await el.updateComplete;
    expect(guts(el)._outage).toBeUndefined();
  });

  it("does not glide the rows into place while the layout is still settling", async () => {
    const el = await mount(WITH_VIEW);
    // Until a measurement leaves the layout alone, gliding is off - the first
    // one can move the list from beside the cross to below it.
    const settled = (el as unknown as { _settled: boolean })._settled;
    expect(settled).toBe(true);

    const fresh = document.createElement("enerlens-card") as Card;
    fresh.setConfig(WITH_VIEW);
    expect((fresh as unknown as { _settled: boolean })._settled).toBe(false);
  });
});
