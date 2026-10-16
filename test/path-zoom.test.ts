// @vitest-environment happy-dom
/**
 * The WebKit zoom bug (issue #7): WebKit stretches an `offset-path` by the page
 * zoom, so the dots leave their lines. The card measures the stretch and hands
 * the dots paths divided by it; everywhere else the factor is 1.
 */
import { afterEach, describe, expect, it } from "vitest";
import { DotLayer } from "../src/render/dots";
import { FanLayer } from "../src/render/fan";
import { PATHS } from "../src/render/geometry";
import { mayStretchPaths, measurePathZoom, unzoomPath } from "../src/render/path-zoom";
import type { Config, DotPlan } from "../src/types";
import { fakeMotion } from "./motion";
import { emulateStretch, emulateVendor } from "./webkit-stretch";

const SVG_NS = "http://www.w3.org/2000/svg";

/** The path string out of `path("...")`. */
const inner = (value: string) => value.replace(/^path\("(.*)"\)$/, "$1");

function svgElement(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  document.body.appendChild(svg);
  return svg;
}

let browser: ReturnType<typeof emulateStretch> | undefined;

afterEach(() => {
  browser?.restore();
  browser = undefined;
  document.body.innerHTML = "";
});

describe("measuring the stretch", () => {
  it("finds the zoom in an affected WebKit", () => {
    browser = emulateStretch({ stretch: 1.5, above: [0.75, 0, 0, 0.75, 20, 30] });
    expect(measurePathZoom(svgElement())).toBeCloseTo(1.5, 6);
    browser.stretch = 0.8;
    expect(measurePathZoom(svgElement())).toBeCloseTo(0.8, 6);
  });

  it("finds exactly 1 where nothing is stretched", () => {
    browser = emulateStretch({ stretch: 1 });
    expect(measurePathZoom(svgElement())).toBe(1);
    browser.stretch = 1.001;
    expect(measurePathZoom(svgElement())).toBe(1);
  });

  it("is not fooled by a scaled or turned element above the card", () => {
    // A card in a scaled container at 100 %: the first fix read the scale as
    // a zoom there and pushed correct dots off their lines.
    browser = emulateStretch({ stretch: 1, above: [0.8, 0, 0, 0.8, 38, 346] });
    expect(measurePathZoom(svgElement())).toBe(1);
    browser.stretch = 1.5;
    expect(measurePathZoom(svgElement())).toBeCloseTo(1.5, 6);
    const turn = Math.PI / 6;
    browser.above = [Math.cos(turn), Math.sin(turn), -Math.sin(turn), Math.cos(turn), 10, 5];
    expect(measurePathZoom(svgElement())).toBeCloseTo(1.5, 6);
    browser.above = [1, 0, 0.4, 1, 0, 0];
    expect(measurePathZoom(svgElement())).toBeCloseTo(1.5, 6);
  });

  it("says nothing under a perspective above the card - its k would be wrong", () => {
    browser = emulateStretch({ stretch: 1.5, tilt: 0.001 });
    expect(measurePathZoom(svgElement())).toBeUndefined();
    // Flat again, and the same zoom is found.
    browser.tilt = 0;
    expect(measurePathZoom(svgElement())).toBeCloseTo(1.5, 6);
  });

  it("leaves no marks behind", () => {
    browser = emulateStretch({ stretch: 1.5 });
    const svg = svgElement();
    measurePathZoom(svg);
    expect(svg.childNodes).toHaveLength(0);
  });

  it("says nothing before the SVG is laid out or without motion paths", () => {
    // Nothing laid out: every box is empty.
    expect(measurePathZoom(svgElement())).toBeUndefined();
    // No motion paths: the probe stays at the origin.
    browser = emulateStretch({ stretch: 0 });
    expect(measurePathZoom(svgElement())).toBeUndefined();
  });

  it("says nothing when the probe lands off the line - not this bug", () => {
    browser = emulateStretch({ stretch: 1 });
    const svg = svgElement();
    const append = svg.appendChild.bind(svg);
    svg.appendChild = <T extends Node>(node: T): T => {
      // Push the probe sideways: further right than down.
      const probe = (node as unknown as Element).querySelector?.("g");
      if (probe) (probe as SVGGElement).style.offsetPath = 'path("M480,400 L480,401")';
      return append(node);
    };
    expect(measurePathZoom(svg)).toBeUndefined();
  });
});

describe("only WebKit measures", () => {
  it("knows WebKit by its vendor, and nothing else", () => {
    const cases: [string, boolean][] = [
      ["Apple Computer, Inc.", true],
      ["Google Inc.", false],
      ["", false],
    ];
    for (const [vendor, webkit] of cases) {
      const leave = emulateVendor(vendor);
      try {
        expect(mayStretchPaths(), vendor || "Firefox").toBe(webkit);
      } finally {
        leave();
      }
    }
  });
});

describe("correcting a path", () => {
  it("keeps the path as it is at 1", () => {
    expect(unzoomPath(PATHS.solar_house, 1)).toBe(PATHS.solar_house);
  });

  it("divides every coordinate, so the stretch lands it on the line", () => {
    expect(unzoomPath("M100,200 C150,200 75.5,-30 300,60 L330,60", 1.5)).toBe(
      "M66.67,133.33 C100,133.33 50.33,-20 200,40 L220,40",
    );
    const back = (unzoomPath(PATHS.grid_battery, 2).match(/-?[\d.]+/g) ?? []).map(
      (n) => Number(n) * 2,
    );
    expect(back).toEqual((PATHS.grid_battery.match(/-?[\d.]+/g) ?? []).map(Number));
  });
});

describe("the layers take the correction", () => {
  const PLAN: DotPlan = {
    connection: "solar_house",
    w: 1000,
    count: 2,
    durationS: 3,
    colorKey: "solar",
  };
  const CONFIG = { colors: { solar: "#ff9800" }, flow: {} } as unknown as Config;

  it("re-aims the running cross dots without restarting them (P-6)", () => {
    fakeMotion();
    const svg = document.createElementNS(SVG_NS, "svg");
    const group = document.createElementNS(SVG_NS, "g");
    svg.appendChild(group);
    document.body.appendChild(svg);
    const layer = new DotLayer(group, "waapi");
    layer.update([PLAN], CONFIG, true);
    const dots = [...group.querySelectorAll<SVGGElement>("g.dot")];
    expect(dots).toHaveLength(2);
    expect(inner(dots[0].style.offsetPath)).toBe(PATHS.solar_house);
    // Counts every animation started from here on.
    const proto = Element.prototype as unknown as { animate: (...args: unknown[]) => unknown };
    const animate = proto.animate;
    let started = 0;
    proto.animate = function (this: Element, ...args: unknown[]) {
      started++;
      return animate.apply(this, args);
    };

    layer.setPathZoom(2);
    for (const dot of dots) {
      expect(inner(dot.style.offsetPath)).toBe(unzoomPath(PATHS.solar_house, 2));
    }
    // Same elements, nothing recreated.
    expect([...group.querySelectorAll("g.dot")]).toEqual(dots);
    expect(started).toBe(0);
    proto.animate = animate;

    // A dot added later gets the corrected path too.
    layer.update([{ ...PLAN, count: 3 }], CONFIG, true);
    const added = [...group.querySelectorAll<SVGGElement>("g.dot")][2];
    expect(inner(added.style.offsetPath)).toBe(unzoomPath(PATHS.solar_house, 2));
    layer.destroy();
  });

  it("corrects the fan's dots but not its drawn line", () => {
    fakeMotion();
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    const fan = new FanLayer(svg);
    const row = { key: "a", x: 200, y: 40, color: "#ff9800", count: 2, durationS: 3 };
    fan.update([row], { x: 0, y: 20 }, { width: 300, height: 80 }, true);
    const line = svg.querySelector("path.fan-line") as SVGPathElement;
    const d = line.getAttribute("d") ?? "";
    const dot = () => svg.querySelector("g g") as SVGGElement;
    expect(inner(dot().style.offsetPath)).toBe(d);

    fan.setPathZoom(1.25);
    fan.update([row], { x: 0, y: 20 }, { width: 300, height: 80 }, true);
    expect(line.getAttribute("d")).toBe(d);
    expect(inner(dot().style.offsetPath)).toBe(unzoomPath(d, 1.25));
    fan.destroy();
  });
});
