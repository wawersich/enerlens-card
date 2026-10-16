// @vitest-environment happy-dom
/**
 * Dots and lines grow with the card, damped by the square root of its scale,
 * and take the configured percentages on top (REQ K-12, changed 16.10.2026,
 * issues #10 and #12).
 */
import { describe, expect, it } from "vitest";
import { flowDesigns } from "../src/designs";
import { GLOW_BLUR, GLOW_DRAWN } from "../src/render/dot-shape";
import { DotLayer } from "../src/render/dots";
import { FanLayer } from "../src/render/fan";
import { growth, sizeFactors } from "../src/render/sizing";
import { styles } from "../src/styles";
import type { Config, DotPlan, FlowDesign } from "../src/types";

const SVG_NS = "http://www.w3.org/2000/svg";

const PLAN: DotPlan = {
  connection: "solar_house",
  w: 1000,
  count: 2,
  durationS: 3,
  colorKey: "solar",
};
const CONFIG = { colors: { solar: "#ff9800" }, flow: {} } as unknown as Config;

/** Diameter on screen of the circles in the first dot, in CSS px. */
function screenDiameters(root: Element, selector: string, scale: number): number[] {
  const dot = root.querySelector(selector);
  return [...(dot?.querySelectorAll("circle") ?? [])].map(
    (c) => 2 * Number(c.getAttribute("r")) * scale,
  );
}

/** The blur filter on the lane the first dot runs in. */
function blurOf(group: SVGGElement): string {
  const lane = group.querySelector("g.dot")?.parentElement as unknown as SVGGElement | undefined;
  return lane?.style.filter ?? "";
}

describe("growth with the card (K-12)", () => {
  it("keeps the base size at full node size", () => {
    expect(growth(1)).toBe(1);
  });

  it("shrinks by the square root of the scale below it", () => {
    // The list beside the cross: nodes of 77 px, dots at about 77 %.
    expect(growth(0.59)).toBeCloseTo(0.768, 3);
    expect(growth(0.25)).toBe(0.5);
  });

  it("never grows past the base size, and ignores a scale it cannot use", () => {
    expect(growth(1.4)).toBe(1);
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(growth(bad)).toBe(1);
  });

  it("rounds the factors to a thousandth, so a sliver of a pixel repaints nothing", () => {
    const f = sizeFactors(0.5901, { dotSize: 100, lineWidth: 100 });
    expect(f.dot).toBe(0.768);
    expect(sizeFactors(0.59012, { dotSize: 100, lineWidth: 100 }).dot).toBe(f.dot);
  });

  it("puts the configured percentages on top, each on its own", () => {
    const f = sizeFactors(0.64, { dotSize: 50, lineWidth: 150 });
    expect(f.dot).toBeCloseTo(0.4, 6);
    expect(f.line).toBeCloseTo(1.2, 6);
  });
});

describe("the layers draw at the factor they are given (K-12)", () => {
  it("the cross dots: every circle of a dot by the same factor", () => {
    const svg = document.createElementNS(SVG_NS, "svg");
    const group = document.createElementNS(SVG_NS, "g");
    svg.appendChild(group);
    document.body.appendChild(svg);
    const layer = new DotLayer(group, "waapi");
    layer.setScale(0.5);
    layer.update([PLAN], CONFIG, false);
    const before = screenDiameters(group, "g.dot", 0.5);
    expect(before[0]).toBeCloseTo(10, 6);

    layer.setDotScale(0.6);
    const after = screenDiameters(group, "g.dot", 0.5);
    expect(after).toHaveLength(before.length);
    after.forEach((d, i) => expect(d).toBeCloseTo(before[i] * 0.6, 1));
    layer.destroy();
    svg.remove();
  });

  it("a glow grows with its dot, drawn or blurred (K-12, P-10)", () => {
    const base = flowDesigns()[0] as FlowDesign;
    for (const glow of [GLOW_BLUR, GLOW_DRAWN]) {
      const spec: FlowDesign = structuredClone(base);
      spec.dark = { ...spec.dark, glow, glowStrength: 60 };
      const svg = document.createElementNS(SVG_NS, "svg");
      const group = document.createElementNS(SVG_NS, "g");
      svg.appendChild(group);
      document.body.appendChild(svg);
      const layer = new DotLayer(group, "waapi");
      layer.setScale(1);
      layer.setDesign(spec, true);
      layer.update([PLAN], CONFIG, false);
      const look = () =>
        glow === GLOW_BLUR
          ? [...blurOf(group).matchAll(/([\d.]+)px/g)].map((m) => Number(m[1]))
          : screenDiameters(group, "g.dot", 1);
      const before = look();
      expect(before.length, `glow ${glow}`).toBeGreaterThan(0);
      layer.setDotScale(0.5);
      look().forEach((v, i) => expect(v, `glow ${glow}`).toBeCloseTo(before[i] * 0.5, 0));
      layer.destroy();
      svg.remove();
    }
  });

  it("the fan dots: repainted with the next update", () => {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    const fan = new FanLayer(svg);
    fan.setDotRadius(5);
    const row = { key: "a", x: 200, y: 40, color: "#ff9800", count: 2, durationS: 3 };
    fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
    expect(screenDiameters(svg, "g.fan-dot", 1)[0]).toBeCloseTo(10, 6);

    fan.setDotScale(0.7);
    fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
    expect(screenDiameters(svg, "g.fan-dot", 1)[0]).toBeCloseTo(7, 6);
    fan.destroy();
    svg.remove();
  });

  it("a blurred glow beside the list grows with its dot too (P-10)", () => {
    const spec: FlowDesign = structuredClone(flowDesigns()[0] as FlowDesign);
    spec.dark = { ...spec.dark, glow: GLOW_BLUR, glowStrength: 60 };
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    const fan = new FanLayer(svg);
    fan.setDesign(spec, true);
    const row = { key: "a", x: 200, y: 40, color: "#ff9800", count: 2, durationS: 3 };
    const blur = () =>
      [...(fan as unknown as { lines: Map<string, { group: SVGGElement }> }).lines.values()]
        .map((line) => line.group.style.filter)
        .join(" ");
    const radii = () => [...blur().matchAll(/([\d.]+)px/g)].map((m) => Number(m[1]));
    fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
    const before = radii();
    expect(before.length).toBeGreaterThan(0);
    fan.setDotScale(0.5);
    fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
    radii().forEach((v, i) => expect(v).toBeCloseTo(before[i] * 0.5, 0));
    fan.destroy();
    svg.remove();
  });

  it("the lines: both widths in the stylesheet hang off the same factor", () => {
    const css = styles.cssText.replace(/\/\*[\s\S]*?\*\//g, "");
    const rule = (selector: RegExp) => selector.exec(css)?.[0] ?? "";
    expect(rule(/\.link\s*\{[^}]*\}/)).toContain(
      "stroke-width: calc(3px * var(--el-line-k, 1) / var(--el-scale, 1))",
    );
    expect(rule(/\.fan-line\s*\{[^}]*\}/)).toContain(
      "stroke-width: calc(2px * var(--el-line-k, 1))",
    );
  });
});
