// @vitest-environment happy-dom
/**
 * The fan follows the rows only while they glide (L-8, EL-I1 follow-up).
 *
 * The lines to the list rows are measured from where the rows are drawn, so
 * while a row glides they are redrawn frame by frame. That used to happen for
 * 650 ms after every render - also when only a number changed and nothing
 * moved, which on a live installation kept a card in the loop about a third
 * of the time. Now the glides themselves say how long: one draw per render,
 * frames only while a row is under way, and one last frame once it landed.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FanLayer } from "../src/render/fan";
import { RowAnimator } from "../src/render/list";
import type { HassEntity, HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);

// --- frames by hand ----------------------------------------------------------

let frames: FrameRequestCallback[] = [];
let clock = 0;

beforeEach(() => {
  frames = [];
  clock = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.spyOn(performance, "now").mockImplementation(() => clock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Runs the frames asked for, 16 ms apart, until none is left or `max` ran. */
function runFrames(max = 200): number {
  let ran = 0;
  while (frames.length && ran < max) {
    const due = frames;
    frames = [];
    clock += 16;
    for (const cb of due) cb(clock);
    ran++;
  }
  return ran;
}

// --- the card ----------------------------------------------------------------

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<boolean>;
  _drawFan: () => void;
  _rows: RowAnimator;
};

const state = (id: string, value: string): HassEntity => ({
  entity_id: id,
  state: value,
  attributes: { unit_of_measurement: "W" },
  last_changed: "2026-10-28T10:00:00+00:00",
  last_updated: "2026-10-28T10:00:00+00:00",
});

const CONFIG = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
  consumers: [
    { entity: "sensor.pump", name: "Pump" },
    { entity: "sensor.oven", name: "Oven" },
  ],
};

function baseHass(): HomeAssistant {
  return {
    states: {
      "sensor.solar": state("sensor.solar", "3200"),
      "sensor.grid": state("sensor.grid", "450"),
      "sensor.house": state("sensor.house", "2900"),
      "sensor.pump": state("sensor.pump", "700"),
      "sensor.oven": state("sensor.oven", "400"),
    },
    locale: { language: "de", number_format: "language" },
    language: "de",
    entities: {},
    formatEntityState: (s: HassEntity) => s.state,
    callWS: async () => ({}) as never,
    connected: true,
    themes: { darkMode: false, theme: "default" },
  } as HomeAssistant;
}

/** The IntersectionObserver callbacks, so a test can scroll the card away. */
let seen: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];

describe("the fan follows the rows only while they glide", () => {
  let el: Card;
  let hass: HomeAssistant;
  let draws: number;

  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        seen.push(cb);
      }
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(): Promise<void> {
    seen = [];
    el = document.createElement("enerlens-card") as Card;
    el.setConfig(CONFIG);
    hass = baseHass();
    el.hass = hass;
    document.body.appendChild(el);
    for (let i = 0; i < 3; i++) {
      while (!(await el.updateComplete));
      await new Promise((r) => setTimeout(r, 0));
    }
    runFrames();
    draws = 0;
    const draw = el._drawFan.bind(el);
    el._drawFan = () => {
      draws++;
      draw();
    };
  }

  /** A new value for the pump - a render that moves no row. */
  async function nudge(): Promise<void> {
    const pump = hass.states["sensor.pump"];
    hass = {
      ...hass,
      states: { ...hass.states, "sensor.pump": { ...pump, state: String(Number(pump.state) + 1) } },
    };
    el.hass = hass;
    await el.updateComplete;
  }

  /** Makes the rows report a glide for the next `n` questions. */
  function glideFor(n: number): void {
    let left = n;
    vi.spyOn(el._rows, "gliding").mockImplementation(() => left-- > 0);
  }

  afterEach(() => el?.remove());

  it("draws once for a render that moves nothing, then rests", async () => {
    await mount();
    await nudge();
    expect(draws).toBe(1);
    runFrames();
    expect(draws).toBe(1);
  });

  it("follows a glide frame by frame, with one last frame once it landed", async () => {
    await mount();
    // Asked once after the render, then once in each frame before drawing.
    glideFor(3);
    await nudge();
    expect(draws).toBe(1);
    runFrames();
    // Two frames while gliding, one after it landed.
    expect(draws).toBe(4);
  });

  it("a render mid-glide draws once and leaves the running loop be", async () => {
    await mount();
    glideFor(4);
    await nudge();
    runFrames(1);
    await nudge();
    expect(draws).toBe(3);
    runFrames();
    // One loop asking on: one more frame while gliding, one after it landed.
    // A second loop would have asked as well and drawn more.
    expect(draws).toBe(5);
  });

  it("a glide that starts while the loop runs gets its full time", async () => {
    await mount();
    vi.spyOn(el._rows, "gliding").mockReturnValue(true);
    await nudge();
    runFrames(50);
    const second = clock;
    await nudge();
    runFrames(500);
    expect(frames.length).toBe(0);
    expect(clock).toBeGreaterThanOrEqual(second + 1000);
    expect(clock).toBeLessThanOrEqual(second + 1100);
  });

  it("a draw that throws does not stop later loops from starting", async () => {
    await mount();
    glideFor(2);
    await nudge();
    const draw = el._drawFan;
    el._drawFan = () => {
      throw new Error("boom");
    };
    expect(() => runFrames(1)).toThrow("boom");
    el._drawFan = draw;
    frames = [];
    glideFor(2);
    const before = draws;
    await nudge();
    runFrames();
    // The render's draw, one frame while gliding, one after it landed.
    expect(draws - before).toBe(3);
  });

  it("stops after a second even if a glide never finishes", async () => {
    await mount();
    vi.spyOn(el._rows, "gliding").mockReturnValue(true);
    await nudge();
    const start = clock;
    const ran = runFrames(500);
    expect(ran).toBeLessThan(100);
    expect(clock - start).toBeLessThanOrEqual(1100);
  });

  it("off screen: one draw, no frames; back in view it picks the glide up (P-8)", async () => {
    await mount();
    for (const cb of seen) cb([{ isIntersecting: false }]);
    vi.spyOn(el._rows, "gliding").mockReturnValue(true);
    await nudge();
    expect(draws).toBe(1);
    expect(frames.length).toBe(0);

    glideFor(2);
    for (const cb of seen) cb([{ isIntersecting: true }]);
    expect(draws).toBe(2);
    runFrames();
    expect(draws).toBe(4);
  });
});

// --- the row animator --------------------------------------------------------

describe("RowAnimator.gliding()", () => {
  type FakeAnimation = { id: string; playState: AnimationPlayState; cancel(): void };
  let animations: Map<Element, FakeAnimation[]>;

  function list(keys: string[]): HTMLElement {
    const body = document.createElement("div");
    const rows = document.createElement("div");
    rows.className = "rows";
    body.appendChild(rows);
    for (const key of keys) {
      const row = document.createElement("div");
      row.className = "row";
      row.dataset.key = key;
      rows.appendChild(row);
    }
    return body;
  }

  function place(body: HTMLElement, order: string[]): void {
    for (const row of body.querySelectorAll<HTMLElement>(".row")) {
      const top = order.indexOf(row.dataset.key ?? "") * 28;
      row.getBoundingClientRect = () => ({ top, height: 28 }) as DOMRect;
      (row as unknown as { animate: unknown }).animate = () => {
        const a: FakeAnimation = {
          id: "",
          playState: "running",
          cancel() {
            a.playState = "idle";
          },
        };
        animations.set(row, [...(animations.get(row) ?? []), a]);
        return a;
      };
      (row as unknown as { getAnimations: unknown }).getAnimations = () =>
        animations.get(row) ?? [];
    }
  }

  beforeEach(() => {
    animations = new Map();
  });

  function reordered(enabled: boolean): { body: HTMLElement; rows: RowAnimator } {
    const body = list(["a", "b"]);
    place(body, ["a", "b"]);
    const rows = new RowAnimator();
    rows.capture(body);
    place(body, ["b", "a"]);
    rows.play(body, enabled);
    return { body, rows };
  }

  it("is true while a reordered row glides, false once it finished", () => {
    const { body, rows } = reordered(true);
    expect(rows.gliding(body)).toBe(true);
    for (const all of animations.values()) for (const a of all) a.playState = "finished";
    expect(rows.gliding(body)).toBe(false);
  });

  it("counts a glide an older WebKit still reports as pending", () => {
    const { body, rows } = reordered(true);
    for (const all of animations.values())
      for (const a of all) a.playState = "pending" as AnimationPlayState;
    expect(rows.gliding(body)).toBe(true);
  });

  it("stays true across a render mid-glide that starts nothing new", () => {
    const { body, rows } = reordered(true);
    const started = [...animations.values()].flat().length;
    rows.capture(body);
    rows.play(body, true);
    expect([...animations.values()].flat().length).toBe(started);
    expect(rows.gliding(body)).toBe(true);
  });

  it("is false where rows jump - reduced motion, or not settled yet (P-7)", () => {
    const { body, rows } = reordered(false);
    expect(rows.gliding(body)).toBe(false);
  });
});

// --- the fan layer -----------------------------------------------------------

describe("FanLayer writes only what changed", () => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const row = { key: "a", x: 200, y: 40, color: "#ff9800", count: 2, durationS: 3 };
  const at = { x: 0, y: 40 };
  const size = { width: 300, height: 80 };

  function layer(): { fan: FanLayer; svg: SVGSVGElement } {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    return { fan: new FanLayer(svg), svg };
  }

  /** Counts writes of a path's `d` and of the dots' motion path. */
  function watch(svg: SVGSVGElement): { d: number; offsetPath: number } {
    const count = { d: 0, offsetPath: 0 };
    const path = svg.querySelector("path.fan-line") as SVGPathElement;
    const setAttribute = path.setAttribute.bind(path);
    path.setAttribute = (name: string, value: string) => {
      if (name === "d") count.d++;
      setAttribute(name, value);
    };
    for (const dot of svg.querySelectorAll<SVGGElement>("g.fan-dot")) {
      let value = dot.style.offsetPath;
      Object.defineProperty(dot.style, "offsetPath", {
        configurable: true,
        get: () => value,
        set: (v: string) => {
          count.offsetPath++;
          value = v;
        },
      });
    }
    return count;
  }

  it("a second update with the same rows writes no path", () => {
    const { fan, svg } = layer();
    fan.update([row], at, size, true);
    const count = watch(svg);
    fan.update([row], at, size, true);
    expect(count).toEqual({ d: 0, offsetPath: 0 });
    fan.destroy();
    svg.remove();
  });

  it("a moved row, or a new path zoom, writes them again (issue #7)", () => {
    const { fan, svg } = layer();
    fan.update([row], at, size, true);
    let count = watch(svg);
    fan.update([{ ...row, y: 50 }], at, size, true);
    expect(count.d).toBe(1);
    expect(count.offsetPath).toBe(2);

    count = watch(svg);
    fan.setPathZoom(1.5);
    fan.update([{ ...row, y: 50 }], at, size, true);
    expect(count.offsetPath).toBe(2);
    fan.destroy();
    svg.remove();
  });

  it("a dot that joins gets its motion path", () => {
    const { fan, svg } = layer();
    fan.update([row], at, size, true);
    fan.update([{ ...row, count: 3 }], at, size, true);
    const dots = [...svg.querySelectorAll<SVGGElement>("g.fan-dot")];
    expect(dots).toHaveLength(3);
    for (const dot of dots) expect(dot.style.offsetPath).toContain("path(");
    fan.destroy();
    svg.remove();
  });
});
