// @vitest-environment happy-dom
/**
 * Renders the actual custom element. This is the layer where a broken template
 * or a missing update trigger shows up - unit tests on the modules cannot see it.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";

function fakeHass(states: Record<string, string>): HomeAssistant {
  const entities: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    entities[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: id.includes("soc") ? "%" : "W" },
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
