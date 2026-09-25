// @vitest-environment happy-dom
/**
 * The dots, and the design they follow (P-10).
 *
 * One layer draws both: without a design a dot is a single circle, with one it
 * gains rings and a glow. There is no second layer and no switch between them.
 */
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { flowDesign, flowDesigns } from "../src/designs";
import { dotRings, glowFilter, lighten } from "../src/render/dot-shape";
import { DotLayer } from "../src/render/dots";
import { FanLayer } from "../src/render/fan";
import type { Config, DotPlan, FlowDesign, HomeAssistant } from "../src/types";

const SVG_NS = "http://www.w3.org/2000/svg";

function stage(): SVGGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  const group = document.createElementNS(SVG_NS, "g");
  svg.appendChild(group);
  document.body.appendChild(svg);
  return group;
}

const PLAN: DotPlan = {
  connection: "solar_house",
  w: 1000,
  count: 3,
  durationS: 3,
  colorKey: "solar",
};

const CONFIG = { colors: { solar: "#ff9800" }, flow: {} } as unknown as Config;

/** A shipped design that actually has a lighter core, whatever it is called. */
const WITH_CORE =
  flowDesigns().find((entry) => entry.shape.caps > 0 && entry.dark.core > 0)?.id ?? "";

function design(over: Partial<FlowDesign> = {}): FlowDesign {
  const base = flowDesign(WITH_CORE);
  if (!base) throw new Error("no design with a core in flow-designs.json");
  return { ...structuredClone(base), ...over };
}

describe("the shape of a dot", () => {
  it("is one circle without a core, and one more per ring with it", () => {
    expect(
      dotRings({ dot: 10, caps: 0, core: 0, coreLight: 0, bias: 0, colour: "#ff9800" }),
    ).toHaveLength(1);
    const rings = dotRings({
      dot: 10,
      caps: 3,
      core: 0.3,
      coreLight: 0.6,
      bias: 0.7,
      colour: "#ff9800",
    });
    expect(rings).toHaveLength(4);
    // Each ring is smaller, lighter and a little further forward than the last.
    for (let i = 1; i < rings.length; i++) {
      expect(rings[i].r).toBeLessThan(rings[i - 1].r);
      expect(rings[i].forward).toBeGreaterThanOrEqual(rings[i - 1].forward);
    }
    expect(rings[0].r).toBe(5);
  });

  it("stays a plain circle when the core has no brightness to give", () => {
    const rings = dotRings({
      dot: 10,
      caps: 5,
      core: 0.3,
      coreLight: 0,
      bias: 0.7,
      colour: "#ff9800",
    });
    expect(rings).toHaveLength(1);
  });

  it("lightens a colour, and leaves anything else alone", () => {
    expect(lighten("#000000", 0.5)).toBe("rgb(128,128,128)");
    expect(lighten("#ff9800", 0)).toBe("rgb(255,152,0)");
    expect(lighten("var(--energy-solar-color)", 0.5)).toBe("var(--energy-solar-color)");
  });

  it("asks for a blur only where the design wants one", () => {
    expect(glowFilter(0, 100, "#ff9800", 1)).toBe("");
    expect(glowFilter(1, 0, "#ff9800", 1)).toBe("");
    expect(glowFilter(2, 60, "#ff9800", 1)).toBe("");
    expect(glowFilter(1, 60, "#ff9800", 1)).toContain("drop-shadow");
  });
});

describe("the dot layer (P-10)", () => {
  it("puts every circle of a dot in one group, so they move as one", () => {
    const group = stage();
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.setDesign(design(), true);
    layer.update([PLAN], CONFIG, false);

    const dots = [...group.querySelectorAll("g.dot")];
    expect(dots).toHaveLength(PLAN.count);
    for (const dot of dots) expect(dot.querySelectorAll("circle").length).toBeGreaterThan(1);
    layer.destroy();
  });

  it("costs one group per dot, whatever the design", () => {
    const group = stage();
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.update([{ ...PLAN, count: 6 }], CONFIG, false);
    expect(group.querySelectorAll("g.dot")).toHaveLength(6);
    layer.setDesign(design(), true);
    expect(group.querySelectorAll("g.dot")).toHaveLength(6);
    layer.destroy();
  });

  it("takes the values of the ground it sits on", () => {
    const group = stage();
    const spec = design();
    spec.dark = { ...spec.dark, dot: 20 };
    spec.light = { ...spec.light, dot: 6 };
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.setDesign(spec, true);
    layer.update([PLAN], CONFIG, false);
    const wide = Number(group.querySelector("g.dot circle")?.getAttribute("r"));
    layer.setDesign(spec, false);
    const narrow = Number(group.querySelector("g.dot circle")?.getAttribute("r"));
    expect(wide).toBeGreaterThan(narrow);
    layer.destroy();
  });

  it("drops a lane that stops flowing", () => {
    const group = stage();
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.update([PLAN], CONFIG, false);
    expect(group.querySelectorAll("g.dot").length).toBeGreaterThan(0);
    layer.update([], CONFIG, false);
    expect(group.querySelectorAll("g.dot")).toHaveLength(0);
    layer.destroy();
  });

  it("keeps the dots evenly spread, however often the tempo changes", () => {
    // They cannot drift on their own - position is a function of the clock -
    // but an uneven rate change would set them apart, and over an hour that
    // shows as ragged spacing.
    const group = stage();
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.update([PLAN], CONFIG, true);
    for (const durationS of [3, 2.5, 4, 1.2, 3]) {
      layer.update([{ ...PLAN, durationS }], CONFIG, true);
    }
    const animations = group.getAnimations?.() ?? [];
    if (animations.length === PLAN.count) {
      const times = animations.map((a) => Number(a.currentTime)).sort((x, y) => x - y);
      const gaps = times.slice(1).map((t, i) => t - times[i]);
      for (const gap of gaps) expect(gap).toBeCloseTo(5000 / PLAN.count, 3);
      expect(new Set(animations.map((a) => a.playbackRate)).size).toBe(1);
    }
    layer.destroy();
  });

  it("never hands an animation a pending rate", () => {
    // updatePlaybackRate applies on some later frame and recomputes that one
    // animation's start time there - which is how the dots lose their spacing.
    const sources = ["src/render/dots.ts", "src/render/fan.ts"];
    for (const file of sources) {
      expect(readFileSync(file, "utf8")).not.toMatch(/\.updatePlaybackRate\(/);
    }
  });
});

describe("a colour the browser cannot read yet (issue #3)", () => {
  // Firefox, while a dashboard is being built, answers the colour probe with
  // nothing; the same probe a moment later reads rgb(). A layer that kept the
  // first answer drew flat dots without their core until the card was rebuilt.
  // Any colour the dot cannot mix from on its own. The card's is a var(), which
  // the test DOM refuses to take into a style at all; a colour name goes the
  // same way through the probe and is just as unreadable to lighten().
  const THEMED = "orange";
  const THEMED_CONFIG = { colors: { solar: THEMED }, flow: {} } as unknown as Config;

  /** Answers the probe with whatever `answer` holds, and counts the questions. */
  function browser(): { answer: string; asked: number; restore: () => void } {
    const original = globalThis.getComputedStyle;
    const state = {
      answer: "",
      asked: 0,
      restore: () => {
        globalThis.getComputedStyle = original;
      },
    };
    globalThis.getComputedStyle = (() => {
      state.asked++;
      return { color: state.answer };
    }) as unknown as typeof getComputedStyle;
    return state;
  }

  const lit = (root: Element) =>
    [...root.querySelectorAll("circle")].some((c) => c.getAttribute("fill")?.startsWith("rgb("));

  it("asks again on the cross until it has an answer, then stops asking", () => {
    const group = stage();
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.setDesign(design(), true);
    const probe = browser();
    try {
      layer.update([PLAN], THEMED_CONFIG, false);
      expect(lit(group)).toBe(false);

      probe.answer = "rgb(255, 152, 0)";
      layer.update([PLAN], THEMED_CONFIG, false);
      expect(lit(group)).toBe(true);

      const asked = probe.asked;
      layer.update([PLAN], THEMED_CONFIG, false);
      expect(probe.asked).toBe(asked);
    } finally {
      probe.restore();
      layer.destroy();
    }
  });

  it("keeps the dots and their animations while the late answer repaints them", () => {
    const group = stage();
    const layer = new DotLayer(group, "waapi");
    layer.setScale(1);
    layer.setDesign(design(), true);
    const probe = browser();
    try {
      layer.update([PLAN], THEMED_CONFIG, true);
      const before = [...group.querySelectorAll("g.dot")];
      probe.answer = "rgb(255, 152, 0)";
      layer.update([PLAN], THEMED_CONFIG, true);
      expect([...group.querySelectorAll("g.dot")]).toEqual(before);
    } finally {
      probe.restore();
      layer.destroy();
    }
  });

  it("asks again on the consumer lines too", () => {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    const fan = new FanLayer(svg);
    fan.setDesign(design(), true);
    const row = { key: "a", x: 200, y: 40, color: THEMED, count: 2, durationS: 3 };
    const probe = browser();
    try {
      fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
      expect(lit(svg)).toBe(false);

      probe.answer = "rgb(255, 152, 0)";
      fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
      expect(lit(svg)).toBe(true);
    } finally {
      probe.restore();
      fan.destroy();
      svg.remove();
    }
  });
});

describe("the card draws the chosen design (P-10)", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(designId?: string) {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
      ...(designId ? { flow: { design: designId } } : {}),
    });
    el.hass = {
      states: {
        "sensor.solar": {
          entity_id: "sensor.solar",
          state: "3000",
          attributes: { unit_of_measurement: "W" },
          last_changed: "",
          last_updated: "",
        },
        "sensor.grid": {
          entity_id: "sensor.grid",
          state: "-1000",
          attributes: { unit_of_measurement: "W" },
          last_changed: "",
          last_updated: "",
        },
        "sensor.house": {
          entity_id: "sensor.house",
          state: "2000",
          attributes: { unit_of_measurement: "W" },
          last_changed: "",
          last_updated: "",
        },
      },
      locale: { language: "de", number_format: "language" },
      language: "de",
      callWS: async () => ({}) as never,
    } as HomeAssistant;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("draws one circle per dot without a design, and more with one", async () => {
    const plain = await mount();
    const plainDots = plain.shadowRoot?.querySelector("g.dots");
    const dots = plainDots?.querySelectorAll("g.dot").length ?? 0;
    expect(dots).toBeGreaterThan(0);
    // No design: a dot is the single circle it always was (K-12).
    expect(plainDots?.querySelectorAll("circle").length).toBe(dots);

    const withDesign = await mount(WITH_CORE);
    const designed = withDesign.shadowRoot?.querySelector("g.dots");
    const designedDots = designed?.querySelectorAll("g.dot").length ?? 0;
    expect(designedDots).toBeGreaterThan(0);
    // With a core: the circle plus its rings, inside the same group.
    expect(designed?.querySelectorAll("circle").length).toBeGreaterThan(designedDots);
  });

  it("falls back to the plain dots for an id this build does not know", async () => {
    const el = await mount("was-here-once");
    const dots = el.shadowRoot?.querySelector("g.dots");
    const groups = dots?.querySelectorAll("g.dot").length ?? 0;
    expect(groups).toBeGreaterThan(0);
    expect(dots?.querySelectorAll("circle").length).toBe(groups);
  });
});
