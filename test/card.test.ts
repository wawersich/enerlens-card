// @vitest-environment happy-dom
/**
 * Renders the actual custom element. This is the layer where a broken template
 * or a missing update trigger shows up - unit tests on the modules cannot see it.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { unzoomPath } from "../src/render/path-zoom";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";
import { emulateStretch, emulateVendor } from "./webkit-stretch";

// The card only draws dots it can move (P-7).
beforeAll(fakeMotion);

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
  // A test that picks an average view leaves it remembered for every card
  // after it - even when it fails halfway.
  afterEach(() => localStorage.removeItem("enerlens-view-mode"));

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

  it("starts a new card with placeholders, never guessing sensors (E-5)", () => {
    // Guessing by order or by name picks plausible wrong sensors on large
    // setups - a single PV string, one battery module, a tablet's battery.
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: (
        hass: HomeAssistant,
        entities: string[],
        fallback: string[],
      ) => { entities: Record<string, string> };
    };
    const hass = fakeHass({ "sensor.pv": "1200", "sensor.meter": "300" });
    expect(card.getStubConfig(hass, ["sensor.pv", "sensor.meter"], []).entities).toEqual({
      solar: "sensor.solar_power",
      grid: "sensor.grid_power",
    });
  });

  it("shows example values, marked as such, until the placeholders are replaced (E-5)", async () => {
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: (hass: HomeAssistant, entities: string[], fallback: string[]) => object;
    };
    const mountWith = async (states: Record<string, string>, config?: object) => {
      const el = document.createElement("enerlens-card") as HTMLElement & {
        setConfig: (c: unknown) => void;
        hass: HomeAssistant;
        updateComplete: Promise<unknown>;
      };
      const hass = fakeHass(states);
      el.setConfig({
        type: "custom:enerlens-card",
        ...(config ?? card.getStubConfig(hass, [], [])),
      });
      el.hass = hass;
      document.body.appendChild(el);
      await el.updateComplete;
      return el;
    };
    // Nothing configured exists: invented values and a hint that says so.
    const example = await mountWith({ "sensor.other": "5" });
    const text = example.shadowRoot?.textContent ?? "";
    expect(example.shadowRoot?.querySelector(".example-banner")).not.toBeNull();
    expect(text).toContain("Beispielwerte");
    expect(text).toContain("3,20 kW");
    expect(text).toContain("0,45 kW");
    expect(text).toContain("3,65 kW");
    example.remove();
    // The placeholder names exist: they are used, with nothing invented.
    const real = await mountWith({ "sensor.solar_power": "1000", "sensor.grid_power": "200" });
    expect(real.shadowRoot?.querySelector(".example-banner")).toBeNull();
    expect(real.shadowRoot?.textContent ?? "").toContain("1,00 kW");
    real.remove();
    // A real configuration whose sensors are missing gets dashes, never examples.
    const missing = await mountWith(
      {},
      { entities: { solar: "sensor.my_pv", grid: "sensor.my_grid" } },
    );
    expect(missing.shadowRoot?.querySelector(".example-banner")).toBeNull();
    expect(missing.shadowRoot?.textContent ?? "").not.toContain("3,20 kW");
    missing.remove();
  });

  it("never lets example values outlive the example (E-5)", async () => {
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: () => Record<string, unknown>;
    };
    type El = HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
    };
    const stub = { type: "custom:enerlens-card", ...card.getStubConfig() };
    const mountWith = async (config: object, hass: HomeAssistant) => {
      const el = document.createElement("enerlens-card") as El;
      el.setConfig(config);
      el.hass = hass;
      document.body.appendChild(el);
      await el.updateComplete;
      return el;
    };
    const banner = (el: El) => el.shadowRoot?.querySelector(".example-banner");

    // Tapping an example node opens nothing: the entity does not exist.
    const opened: string[] = [];
    const listen = (e: Event) => opened.push((e as CustomEvent).detail?.entityId);
    document.addEventListener("hass-more-info", listen);
    const tapped = await mountWith(stub, fakeHass({}));
    tapped.shadowRoot?.querySelector<HTMLElement>(".node.solar .hit")?.click();
    document.removeEventListener("hass-more-info", listen);
    expect(opened).toEqual([]);
    tapped.remove();

    // Picking a real sensor in the editor ends the example at once, without
    // waiting for the next state update - and the averages never saw it.
    const hass = fakeHass({ "sensor.pv": "1000" });
    const el = await mountWith(stub, hass);
    expect(banner(el)).not.toBeNull();
    const avg = el.shadowRoot?.querySelectorAll<HTMLElement>(".mode")[1];
    avg?.click();
    await el.updateComplete;
    el.setConfig({ ...stub, entities: { solar: "sensor.pv", grid: "sensor.grid_power" } });
    await el.updateComplete;
    expect(banner(el)).toBeNull();
    expect(el.shadowRoot?.textContent ?? "").not.toContain("0,45 kW");
    el.remove();

    // A real extra value is a real configuration: no invented PV beside it.
    const extra = await mountWith(
      { ...stub, nodes: { house: { label: { entity: "sensor.share" } } } },
      fakeHass({ "sensor.share": "80" }),
    );
    expect(banner(extra)).toBeNull();
    extra.remove();

    // A registered sensor that only has no state yet is real, too.
    const registered = {
      ...fakeHass({}),
      entities: { "sensor.solar_power": { entity_id: "sensor.solar_power" } },
    } as unknown as HomeAssistant;
    const restart = await mountWith(stub, registered);
    expect(banner(restart)).toBeNull();
    restart.remove();
  });

  it("shows the example in a remembered average view, and fetches no history for it (E-5)", async () => {
    localStorage.setItem("enerlens-view-mode", "avg_long");
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: () => Record<string, unknown>;
    };
    let lookups = 0;
    const hass = {
      ...fakeHass({}),
      callWS: async () => {
        lookups++;
        return {} as never;
      },
    };
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
    };
    el.setConfig({ type: "custom:enerlens-card", ...card.getStubConfig() });
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    // The example has no history to average: it shows its invented now.
    expect(el.shadowRoot?.textContent ?? "").toContain("3,20 kW");
    // Picking the view again asks for history - not for placeholders.
    el.shadowRoot?.querySelectorAll<HTMLElement>(".mode")[1]?.click();
    await el.updateComplete;
    expect(lookups).toBe(0);
    el.remove();
  });

  it("starts a new card with an icon on the remainder row (E-5)", async () => {
    // Only the starting configuration carries it: the card itself has no
    // default, so an existing card keeps its dot, and deleting the icon
    // brings the dot back.
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: (hass: HomeAssistant, entities: string[]) => Record<string, unknown>;
    };
    const stub = card.getStubConfig(fakeHass({}), ["sensor.a", "sensor.b"]);
    expect(stub.icons).toEqual({ rest: "mdi:cloud-question" });
    // And it renders without any input (E-5).
    const { normalizeConfig } = await import("../src/config");
    expect(normalizeConfig({ type: "custom:enerlens-card", ...stub }).icons.rest).toBe(
      "mdi:cloud-question",
    );
  });

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

  it("lets card-mod find its block from the ha-card (issue #8)", async () => {
    // card-mod's own lookup, as in its source: from ha-card up to the first
    // node with a config or _config property. It never sees what Lovelace
    // passed to setConfig - only what the card keeps.
    type Lookup = Node & { config?: unknown; _config?: unknown; host?: Node };
    const findConfig = (node: Lookup | null): unknown => {
      if (!node) return null;
      if (node.config) return node.config;
      if (node._config) return node._config;
      return findConfig((node.host ?? node.parentElement ?? node.parentNode) as Lookup | null);
    };
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
    };
    const cardMod = { style: "ha-card { --ha-card-background: transparent; }" };
    el.setConfig({ ...CONFIG, card_mod: cardMod });
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    const card = el.shadowRoot?.querySelector("ha-card") as Lookup | null;
    expect(card, "no ha-card").toBeTruthy();
    expect((findConfig(card) as { card_mod?: unknown } | null)?.card_mod).toBe(cardMod);
    el.remove();
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

/** The card registered and ResizeObserver stubbed, for a describe run on its own. */
async function loadCard() {
  (globalThis as unknown as Record<string, unknown>).ResizeObserver ??= class {
    observe() {}
    disconnect() {}
  };
  await import("../src/enerlens-card");
}

describe("view modes (REQ V-1 to V-9)", () => {
  beforeAll(loadCard);
  // A remembered view would leak into the tests after it, failed or not.
  afterEach(() => localStorage.removeItem("enerlens-view-mode"));

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

  it("opens an average view with the history already in it (V-6, issue #16)", async () => {
    // Home Assistant sets the configuration first and hass afterwards
    // (hui-card.ts); a card opening in an average view must still fetch the
    // recent history once, so the mean covers its whole window from the start.
    const open = async (view: Record<string, unknown> | undefined) => {
      const calls: string[] = [];
      const longAgo = (Date.now() - 20 * 60_000) / 1000;
      const history = Object.fromEntries(
        Object.entries(STATES).map(([id, state]) => [id, [{ s: state, lu: longAgo }]]),
      );
      // Live states that changed just now, as on a dashboard: without the
      // history the window cannot be full.
      const now = new Date().toISOString();
      const live = fakeHass(STATES);
      for (const state of Object.values(live.states)) {
        state.last_changed = now;
        state.last_updated = now;
      }
      const hass = {
        ...live,
        callWS: async (msg: Record<string, unknown>) => {
          calls.push(String(msg.type));
          return history as never;
        },
      } as HomeAssistant;
      const el = document.createElement("enerlens-card") as HTMLElement & {
        setConfig: (c: unknown) => void;
        hass: HomeAssistant;
        updateComplete: Promise<unknown>;
        _buffer?: { status: (now: number) => { complete: boolean } };
      };
      el.setConfig(view ? { ...CONFIG, view } : CONFIG);
      el.hass = hass;
      document.body.appendChild(el);
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
      // Further state updates do not fetch again.
      el.hass = { ...hass, states: { ...hass.states } };
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
      const history_calls = calls.filter((t) => t === "history/history_during_period").length;
      const complete = el._buffer?.status(Date.now()).complete;
      el.remove();
      return { history_calls, complete };
    };
    // Configured as the start view.
    expect(await open({ default_mode: "avg_long" })).toEqual({ history_calls: 1, complete: true });
    // Remembered from last time.
    localStorage.setItem("enerlens-view-mode", "avg_long");
    expect(await open(undefined)).toEqual({ history_calls: 1, complete: true });
    localStorage.removeItem("enerlens-view-mode");
    // Opening on "now" fetches nothing.
    expect((await open(undefined)).history_calls).toBe(0);
  });

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

  it("draws the ring where its targets are (REQ R-4)", async () => {
    // RingAnimator writes the dashes; a ring that just appeared stands at once.
    const el = await mountWithConsumers();
    const circles = Array.from(
      el.shadowRoot?.querySelectorAll<SVGCircleElement>("circle.ring-seg") ?? [],
    );
    expect(circles.length).toBeGreaterThan(0);
    for (const circle of circles) {
      expect(Number(circle.getAttribute("stroke-dasharray")?.split(" ")[0])).toBeCloseTo(
        Number(circle.dataset.length),
        1,
      );
      expect(-Number(circle.getAttribute("stroke-dashoffset"))).toBeCloseTo(
        Number(circle.dataset.offset),
        1,
      );
    }
  });

  /** Is every ring segment drawn exactly where its targets are? */
  const ringAtTargets = (el: Card) =>
    Array.from(el.shadowRoot?.querySelectorAll<SVGCircleElement>("circle.ring-seg") ?? []).every(
      (c) =>
        Math.abs(
          Number(c.getAttribute("stroke-dasharray")?.split(" ")[0]) - Number(c.dataset.length),
        ) < 0.01 &&
        Math.abs(-Number(c.getAttribute("stroke-dashoffset")) - Number(c.dataset.offset)) < 0.01,
    );

  async function changePump(el: Card, w: string) {
    el.hass = fakeHass({ ...STATES, "sensor.pump": w, "sensor.idle": "3" });
    await el.updateComplete;
  }

  it("moves the ring towards new values, and stills it when animation is off (REQ R-4, P-7)", async () => {
    const moving = await mountWithConsumers();
    await changePump(moving, "400");
    expect(ringAtTargets(moving), "the ring should still be on its way").toBe(false);

    const still = await mountWithConsumers({ flow: { animation: "off" } });
    await changePump(still, "400");
    expect(ringAtTargets(still)).toBe(true);
  });

  it("lets the ring jump with ring.animation: jump, while the rest moves (REQ R-4)", async () => {
    const el = await mountWithConsumers({ ring: { animation: "jump" } });
    await changePump(el, "400");
    expect(ringAtTargets(el)).toBe(true);
    expect(el.shadowRoot?.querySelectorAll("g.dots g.dot").length).toBeGreaterThan(0);
  });

  it("glides the ring with ring.animation: fade (REQ R-4)", async () => {
    const el = await mountWithConsumers({ ring: { animation: "fade" } });
    await changePump(el, "400");
    expect(ringAtTargets(el)).toBe(false);
    expect(el.shadowRoot?.querySelector("svg.ring")?.classList.contains("fade")).toBe(true);

    // Motion off stills the colours too (P-7).
    const still = await mountWithConsumers({
      flow: { animation: "off" },
      ring: { animation: "fade" },
    });
    expect(still.shadowRoot?.querySelector("svg.ring")?.classList.contains("fade")).toBe(false);
  });

  it("keeps a plugged-in car at 0 W in the list and follows the plug (REQ L-15)", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      ...CONFIG,
      consumers: [
        { entity: "sensor.pump", name: "Pump" },
        {
          entity: "sensor.wallbox",
          name: "Wallbox",
          charge: { soc: "sensor.car", show: "plugged", plugged: "binary_sensor.plug" },
        },
      ],
    });
    const states = (plug: string) => {
      const hass = fakeHass({
        ...STATES,
        "sensor.pump": "1200",
        "sensor.wallbox": "0",
        "sensor.car": "80",
      });
      hass.states["binary_sensor.plug"] = {
        ...hass.states["sensor.car"],
        entity_id: "binary_sensor.plug",
        state: plug,
      };
      return hass;
    };
    el.hass = states("on");
    document.body.appendChild(el);
    await el.updateComplete;
    const row = () => el.shadowRoot?.querySelector('.row[data-key="sensor.wallbox"]');
    expect(row(), "the plugged-in car should be listed").toBeTruthy();
    expect(row()?.querySelector(".row-value")?.textContent?.trim()).toBe("80 %");

    // Unplugged: it goes on the next selection, like any idle consumer.
    el.hass = states("off");
    const guts = el as unknown as {
      _tickModel: unknown;
      _modelForMode(h: unknown, c: unknown): unknown;
      _config: unknown;
      requestUpdate(): void;
    };
    guts._tickModel = guts._modelForMode(el.hass, guts._config);
    guts.requestUpdate();
    await el.updateComplete;
    expect(row()).toBeNull();
  });

  it("draws no dots at all when animation is off (REQ P-7)", async () => {
    const moving = await mountWithConsumers();
    expect(moving.shadowRoot?.querySelectorAll("g.dots g.dot").length).toBeGreaterThan(0);
    const still = await mountWithConsumers({ flow: { animation: "off" } });
    expect(still.shadowRoot?.querySelectorAll("g.dots g.dot")).toHaveLength(0);
    expect(still.shadowRoot?.querySelectorAll("svg.fan .dot, svg.fan circle")).toHaveLength(0);
  });

  it("brings every dot back, painted, when motion is switched on again (REQ P-7)", async () => {
    const el = await mountWithConsumers();
    const crossDots = () => el.shadowRoot?.querySelectorAll("g.dots g.dot").length ?? 0;
    const fanCircles = () =>
      el.shadowRoot?.querySelectorAll("svg.fan g.fan-dot circle").length ?? 0;
    expect(fanCircles(), "the fan should carry dots to begin with").toBeGreaterThan(0);
    const config = (animation: string) => ({
      ...CONFIG,
      consumers: [
        { entity: "sensor.pump", name: "Pump" },
        { entity: "sensor.idle", name: "Idle" },
      ],
      min_consumer_w: 10,
      flow: { animation },
    });
    el.setConfig(config("off"));
    await el.updateComplete;
    expect(crossDots()).toBe(0);
    expect(fanCircles()).toBe(0);
    el.setConfig(config("on"));
    await el.updateComplete;
    expect(crossDots()).toBeGreaterThan(0);
    // Once the dots were back but empty groups - running, and invisible.
    expect(fanCircles()).toBeGreaterThan(0);
  });

  it("draws no dots in a browser that cannot move them (REQ P-7)", async () => {
    const el = await mountWithConsumers();
    const guts = el as unknown as { _technique: string; requestUpdate(): void };
    guts._technique = "static";
    guts.requestUpdate();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll("g.dots g.dot")).toHaveLength(0);
    expect(el.shadowRoot?.querySelectorAll("svg.fan g.fan-dot circle")).toHaveLength(0);
  });

  it("puts the dots back onto their lines in a zoomed WebKit, and only there (issue #7)", async () => {
    const el = await mountWithConsumers();
    const paths = (selector: string) =>
      Array.from(el.shadowRoot?.querySelectorAll<SVGGElement>(selector) ?? []).map(
        (dot) => dot.style.offsetPath,
      );
    const unzoomed = (list: string[], zoom: number) =>
      list.map((p) => `path("${unzoomPath(p.replace(/^path\("(.*)"\)$/, "$1"), zoom)}")`);
    const cross = paths("g.dots g.dot");
    const fan = paths("svg.fan g.fan-dot");
    expect(cross.length, "the card should have drawn cross dots").toBeGreaterThan(0);
    expect(fan.length, "the card should have drawn fan dots").toBeGreaterThan(0);

    // Zooming fires a window resize; that is where the card measures again.
    const browser = emulateStretch({ stretch: 1.5 });
    const leave = emulateVendor("Apple Computer, Inc.");
    try {
      window.dispatchEvent(new Event("resize"));
      expect(paths("g.dots g.dot")).toEqual(unzoomed(cross, 1.5));
      expect(paths("svg.fan g.fan-dot")).toEqual(unzoomed(fan, 1.5));

      // Back to 100 %: the paths are the drawn ones again.
      browser.stretch = 1;
      window.dispatchEvent(new Event("resize"));
      expect(paths("g.dots g.dot")).toEqual(cross);
      expect(paths("svg.fan g.fan-dot")).toEqual(fan);
    } finally {
      browser.restore();
      leave();
    }
  });

  it("opens in an already zoomed WebKit with every dot on its line (issue #7)", async () => {
    // Safari remembers the zoom per site, so the card often starts zoomed:
    // no resize comes, the first measure has to do it - for the fan too,
    // which does not exist yet when that measure runs.
    const dotPaths = (el: Card, selector: string) =>
      Array.from(el.shadowRoot?.querySelectorAll<SVGGElement>(selector) ?? []).map(
        (dot) => dot.style.offsetPath,
      );
    const unzoomed = (list: string[], zoom: number) =>
      list.map((p) => `path("${unzoomPath(p.replace(/^path\("(.*)"\)$/, "$1"), zoom)}")`);
    const plain = await mountWithConsumers();
    const cross = dotPaths(plain, "g.dots g.dot");
    const fan = dotPaths(plain, "svg.fan g.fan-dot");
    plain.remove();
    expect(cross.length).toBeGreaterThan(0);
    expect(fan.length).toBeGreaterThan(0);

    const browser = emulateStretch({ stretch: 1.5 });
    const leave = emulateVendor("Apple Computer, Inc.");
    try {
      const el = await mountWithConsumers();
      expect(dotPaths(el, "g.dots g.dot")).toEqual(unzoomed(cross, 1.5));
      expect(dotPaths(el, "svg.fan g.fan-dot")).toEqual(unzoomed(fan, 1.5));

      // Taken off the page and put back - a dashboard view switch: the new
      // dot layers start with the factor the card already knows.
      el.remove();
      document.body.appendChild(el);
      el.hass = fakeHass({ ...STATES, "sensor.pump": "1200", "sensor.idle": "3" });
      await el.updateComplete;
      expect(dotPaths(el, "g.dots g.dot")).toEqual(unzoomed(cross, 1.5));
      expect(dotPaths(el, "svg.fan g.fan-dot")).toEqual(unzoomed(fan, 1.5));

      // Off the page it no longer listens: a zoom then is measured on return.
      el.remove();
      browser.stretch = 2;
      window.dispatchEvent(new Event("resize"));
      expect((el as unknown as { _pathZoom: number })._pathZoom).toBe(1.5);
    } finally {
      browser.restore();
      leave();
    }
  });

  it("does not measure outside WebKit, so it cannot move a dot there (issue #7)", async () => {
    const el = await mountWithConsumers();
    const paths = () =>
      Array.from(
        el.shadowRoot?.querySelectorAll<SVGGElement>("g.dots g.dot, svg.fan g.fan-dot") ?? [],
      ).map((dot) => dot.style.offsetPath);
    const before = paths();
    expect(before.length).toBeGreaterThan(0);
    // Even a stretch measured by mistake must not reach Chrome or Firefox.
    const browser = emulateStretch({ stretch: 1.5 });
    try {
      for (const vendor of ["Google Inc.", ""]) {
        const leave = emulateVendor(vendor);
        window.dispatchEvent(new Event("resize"));
        leave();
        expect(paths(), vendor || "Firefox").toEqual(before);
      }
    } finally {
      browser.restore();
    }
  });

  it("puts the ring on its values as soon as the card goes out of sight (REQ P-8)", async () => {
    const el = await mountWithConsumers();
    await changePump(el, "400");
    expect(ringAtTargets(el)).toBe(false);
    const guts = el as unknown as { _visible: boolean; _syncPlayState(): void };
    guts._visible = false;
    guts._syncPlayState();
    expect(ringAtTargets(el)).toBe(true);
  });

  it("halts the dots on the lines to the list while out of sight, too (REQ P-8)", async () => {
    const el = await mountWithConsumers();
    const guts = el as unknown as {
      _visible: boolean;
      _syncPlayState(): void;
      _fan?: { paused: boolean };
      _dots?: { paused: boolean };
    };
    expect(guts._fan, "the card should have drawn its fan").toBeDefined();
    guts._visible = false;
    guts._syncPlayState();
    expect(guts._dots?.paused).toBe(true);
    expect(guts._fan?.paused).toBe(true);
    guts._visible = true;
    guts._syncPlayState();
    expect(guts._fan?.paused).toBe(false);
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

describe("dots and lines grow with the card (REQ K-12, issues #10 and #12)", () => {
  it("draws them at the base size times sqrt(s) times the configured percentages", async () => {
    // happy-dom lays nothing out, so the plot's width is handed in: 144 px of
    // a 400-unit viewBox is scale 0.36, and its square root 0.6.
    const real = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList.contains("plot")
        ? ({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 144,
            bottom: 144,
            width: 144,
            height: 144,
          } as DOMRect)
        : real.call(this);
    };
    try {
      const el = document.createElement("enerlens-card") as HTMLElement & {
        setConfig: (c: unknown) => void;
        hass: HomeAssistant;
        updateComplete: Promise<unknown>;
      };
      el.setConfig({ ...CONFIG, flow: { dot_size: 50, line_width: 120 } });
      el.hass = fakeHass(STATES);
      document.body.appendChild(el);
      await el.updateComplete;

      // Lines: 0.6 x 120 % through the stylesheet variable.
      expect(Number(el.style.getPropertyValue("--el-line-k"))).toBeCloseTo(0.72, 4);
      // Dots: 10 px x 0.6 x 50 % = 3 px on screen, at 0.36 px per unit.
      const circle = el.shadowRoot?.querySelector("g.dot circle");
      expect(circle, "no dot drawn").toBeTruthy();
      expect(2 * Number(circle?.getAttribute("r")) * 0.36).toBeCloseTo(3, 1);

      // A changed percentage reaches the running dots without a reload.
      el.setConfig({ ...CONFIG, flow: { dot_size: 100, line_width: 100 } });
      el.hass = fakeHass({ ...STATES, "sensor.solar": "9331" });
      await el.updateComplete;
      expect(Number(el.style.getPropertyValue("--el-line-k"))).toBeCloseTo(0.6, 4);
      const again = el.shadowRoot?.querySelector("g.dot circle");
      expect(2 * Number(again?.getAttribute("r")) * 0.36).toBeCloseTo(6, 1);
      el.remove();
    } finally {
      HTMLElement.prototype.getBoundingClientRect = real;
    }
  });

  it("gives the dots beside the list the same size as those on the cross", async () => {
    const real = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList.contains("plot")
        ? ({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 144,
            bottom: 144,
            width: 144,
            height: 144,
          } as DOMRect)
        : real.call(this);
    };
    try {
      const el = document.createElement("enerlens-card") as HTMLElement & {
        setConfig: (c: unknown) => void;
        hass: HomeAssistant;
        updateComplete: Promise<unknown>;
      };
      el.setConfig({
        ...CONFIG,
        consumers: [{ entity: "sensor.c1" }, { entity: "sensor.c2" }],
        flow: { dot_size: 50 },
      });
      el.hass = fakeHass({ ...STATES, "sensor.c1": "1500", "sensor.c2": "900" });
      document.body.appendChild(el);
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      const cross = el.shadowRoot?.querySelector("g.dot circle");
      const fan = el.shadowRoot?.querySelector("g.fan-dot circle");
      expect(cross, "no dot on the cross").toBeTruthy();
      expect(fan, "no dot beside the list").toBeTruthy();
      // The cross draws in viewBox units (0.36 px each), the fan in px.
      const crossPx = 2 * Number(cross?.getAttribute("r")) * 0.36;
      const fanPx = 2 * Number(fan?.getAttribute("r"));
      expect(crossPx).toBeCloseTo(3, 1);
      expect(fanPx).toBeCloseTo(crossPx, 1);
      el.remove();
    } finally {
      HTMLElement.prototype.getBoundingClientRect = real;
    }
  });
});

describe("history prefill (V-6, issue #16)", () => {
  beforeAll(loadCard);
  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
    preview?: boolean;
    _buffer?: { status: (now: number) => { complete: boolean } };
  };
  const settle = async (el: Card) => {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
  };
  afterEach(() => localStorage.removeItem("enerlens-view-mode"));

  /** A card built the way hui-card builds it, with a recorder that counts. */
  function build(
    config: Record<string, unknown>,
    states: Record<string, string> = STATES,
    answer: (msg: {
      type: string;
      start_time?: string;
      end_time?: string;
    }) => Promise<unknown> = async () => ({}),
  ) {
    const lookups: { type: string; start_time?: string; end_time?: string }[] = [];
    const live = fakeHass(states);
    const now = new Date().toISOString();
    for (const state of Object.values(live.states)) {
      state.last_changed = now;
      state.last_updated = now;
    }
    const hass = {
      ...live,
      callWS: async (msg: Record<string, unknown>) => {
        lookups.push(msg as { type: string; start_time?: string; end_time?: string });
        return (await answer(msg as { type: string })) as never;
      },
    } as HomeAssistant;
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(config);
    el.hass = hass;
    const history = () => lookups.filter((m) => m.type === "history/history_during_period");
    return { el, hass, history };
  }

  it("fetches nothing in the editor preview, which HA flags only after hass", async () => {
    const { el, history } = build({ ...CONFIG, view: { default_mode: "avg_long" } });
    el.preview = true;
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toHaveLength(0);
    el.remove();
  });

  it("fetches nothing for a card that is never shown", async () => {
    const { el, history } = build({ ...CONFIG, view: { default_mode: "avg_long" } });
    await new Promise((r) => setTimeout(r, 0));
    expect(el.isConnected).toBe(false);
    expect(history()).toHaveLength(0);
  });

  it("fetches nothing for example values, once when real sensors take over (E-5)", async () => {
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: () => Record<string, unknown>;
    };
    const stub = {
      type: "custom:enerlens-card",
      ...card.getStubConfig(),
      view: { default_mode: "avg_long" },
    };
    const { el, hass, history } = build(stub, {});
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toHaveLength(0);
    el.hass = {
      ...hass,
      states: fakeHass({ "sensor.solar_power": "1000", "sensor.grid_power": "200" }).states,
    };
    await settle(el);
    expect(history()).toHaveLength(1);
    el.remove();
  });

  it("fetches once when the editor replaces the placeholders (E-5)", async () => {
    const card = customElements.get("enerlens-card") as unknown as {
      getStubConfig: () => Record<string, unknown>;
    };
    const stub = {
      type: "custom:enerlens-card",
      ...card.getStubConfig(),
      view: { default_mode: "avg_long" },
    };
    const { el, history } = build(stub);
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toHaveLength(0);
    el.setConfig({ ...stub, entities: { solar: "sensor.solar", grid: "sensor.grid" } });
    await settle(el);
    expect(history()).toHaveLength(1);
    el.remove();
  });

  it("fetches again for a new window length, and only for that", async () => {
    const config = { ...CONFIG, view: { default_mode: "avg_long", avg_long_minutes: 15 } };
    const { el, history } = build(config);
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toHaveLength(1);
    el.setConfig({ ...config, title: "Other title" });
    await settle(el);
    expect(history()).toHaveLength(1);
    el.setConfig({ ...config, view: { ...config.view, avg_long_minutes: 30 } });
    await settle(el);
    expect(history()).toHaveLength(2);
    const last = history()[1];
    const span = Date.parse(last.end_time ?? "") - Date.parse(last.start_time ?? "");
    expect(Math.round(span / 60_000)).toBe(30);
    el.remove();
  });

  it("drops an answer whose buffer was replaced meanwhile", async () => {
    const pending: ((v: unknown) => void)[] = [];
    const longAgo = (Date.now() - 40 * 60_000) / 1000;
    const config = { ...CONFIG, view: { default_mode: "avg_long", avg_long_minutes: 15 } };
    const { el, history } = build(config, STATES, () => new Promise((r) => pending.push(r)));
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toHaveLength(1);
    // The window changes while the first answer is still on its way.
    el.setConfig({ ...config, view: { ...config.view, avg_long_minutes: 30 } });
    await settle(el);
    expect(history()).toHaveLength(2);
    const old = Object.fromEntries(
      Object.entries(STATES).map(([id, s]) => [id, [{ s, lu: longAgo }]]),
    );
    pending[0](old);
    await settle(el);
    expect(el._buffer?.status(Date.now()).complete).toBe(false);
    pending[1](old);
    await settle(el);
    expect(el._buffer?.status(Date.now()).complete).toBe(true);
    el.remove();
  });

  it("does not retry a failed lookup on every update", async () => {
    const { el, hass, history } = build(
      { ...CONFIG, view: { default_mode: "avg_long" } },
      STATES,
      async () => {
        throw new Error("recorder down");
      },
    );
    document.body.appendChild(el);
    await settle(el);
    el.hass = { ...hass, states: { ...hass.states } };
    await settle(el);
    expect(history()).toHaveLength(1);
    el.remove();
  });

  it("fetches again on every tap into an average, not on the active chip (Markus, 18.10.2026)", async () => {
    const { el, history } = build(CONFIG);
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toHaveLength(0);
    const chips = () => el.shadowRoot?.querySelectorAll<HTMLElement>(".mode") ?? [];
    chips()[1]?.click();
    await settle(el);
    expect(history()).toHaveLength(1);
    chips()[2]?.click();
    await settle(el);
    expect(history()).toHaveLength(2);
    chips()[2]?.click();
    await settle(el);
    expect(history()).toHaveLength(2);
    el.remove();
  });
});
