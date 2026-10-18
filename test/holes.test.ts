// @vitest-environment happy-dom
/**
 * Lines and dots are cut out where the circles are (REQ K-16, EL-I3). They
 * run on under each circle so that no gap can open, and on a transparent card
 * (card-mod, issue #8) nothing but the cut keeps them out of sight. Whether
 * the cut lands on the border is measured in real browsers by
 * `npm run webkit-check`; here: that it exists and wraps the right things.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { FanLayer } from "../src/render/fan";
import { NODE_POS, NODE_R, holesPath } from "../src/render/geometry";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

const SVG_NS = "http://www.w3.org/2000/svg";

beforeAll(fakeMotion);

describe("holesPath", () => {
  it("is a frame around the drawing with one circle per node", () => {
    const d = holesPath(40);
    expect(d.startsWith("M-400,-400H800V800H-400Z")).toBe(true);
    for (const p of Object.values(NODE_POS)) {
      expect(d).toContain(`M${p.x - 40},${p.y}A40,40 0 1 0 ${p.x + 40},${p.y}`);
    }
    expect(d.match(/M/g)).toHaveLength(5);
  });
});

describe("the cross", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  it("clips its lines and dots only where the circles let them show (K-16)", async () => {
    const W = (id: string, w: number) => ({
      entity_id: id,
      state: String(w),
      attributes: { unit_of_measurement: "W" },
      last_changed: "",
      last_updated: "",
    });
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
    };
    const card = el as typeof el & { _seeThrough: boolean };
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" },
    });
    el.hass = {
      states: {
        "sensor.s": W("sensor.s", 3000),
        "sensor.g": W("sensor.g", 500),
        "sensor.h": W("sensor.h", 2500),
        "sensor.b": W("sensor.b", -1000),
      },
      locale: { language: "de", number_format: "language" },
      language: "de",
      callWS: async () => ({}) as never,
    };
    document.body.appendChild(el);
    await el.updateComplete;
    const svg = el.shadowRoot?.querySelector(".plot svg") as SVGSVGElement;
    // Opaque circles, as on almost every dashboard: drawn as before K-16.
    expect(svg.querySelector("clipPath")).toBeNull();
    expect(svg.querySelector("[clip-path]")).toBeNull();
    card._seeThrough = true;
    await el.updateComplete;
    const clip = svg.querySelector("clipPath#el-holes");
    expect(clip?.getAttribute("clipPathUnits")).toBe("userSpaceOnUse");
    const hole = clip?.querySelector("path");
    expect(hole?.getAttribute("clip-rule")).toBe("evenodd");
    // Never larger than the circle: until measured, the holes end where the
    // lines do, so an opaque card cannot show a gap.
    expect(hole?.getAttribute("d")).toBe(holesPath(NODE_R));
    const group = svg.querySelector("g[clip-path='url(#el-holes)']");
    expect(group).not.toBeNull();
    const links = svg.querySelectorAll("path.link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(group?.contains(link)).toBe(true);
    expect(group?.contains(svg.querySelector("g.dots"))).toBe(true);
    el.remove();
  });
});

describe("the fan", () => {
  const row = { key: "a", x: 200, y: 40, color: "#ff9800", count: 2, durationS: 3 };

  it("clips its lines and dots at the house when told where it is", () => {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    const fan = new FanLayer(svg);
    fan.update([row], { x: 60, y: 40 }, { width: 300, height: 80 }, false, {
      x: 20,
      y: 40,
      r: 38,
    });
    const hole = svg.querySelector("clipPath#el-fan-hole path");
    expect(hole?.getAttribute("clip-rule")).toBe("evenodd");
    expect(hole?.getAttribute("d")).toContain("M-18,40A38,38 0 1 0 58,40");
    const line = svg.querySelector("path.fan-line");
    expect(line?.getAttribute("clip-path")).toBe("url(#el-fan-hole)");
    const dots = svg.querySelector("g.fan-dot")?.parentElement;
    expect(dots?.getAttribute("clip-path")).toBe("url(#el-fan-hole)");
    fan.destroy();
    svg.remove();
  });

  it("leaves them whole below the cross, where it starts at the list", () => {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    document.body.appendChild(svg);
    const fan = new FanLayer(svg);
    fan.update([row], { x: 60, y: 40 }, { width: 300, height: 80 }, false, {
      x: 20,
      y: 40,
      r: 38,
    });
    fan.update([row], { x: 60, y: 40 }, { width: 300, height: 80 }, false);
    expect(svg.querySelector("path.fan-line")?.hasAttribute("clip-path")).toBe(false);
    fan.destroy();
    svg.remove();
  });
});
