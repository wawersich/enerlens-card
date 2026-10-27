// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { FanLayer } from "../src/render/fan";

/*
 * A dot faces the way it runs (P-10): its lighter side ahead. The PV fan runs
 * its dots against the drawn line - from the rows into the PV node - so they
 * must be turned round with it, or they travel backwards.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

function rotations(reverse: boolean): string[] {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  document.body.appendChild(svg);
  const fan = new FanLayer(svg);
  fan.reverse = reverse;
  try {
    const row = { key: "a", x: 200, y: 40, color: "#ff9800", count: 2, durationS: 3 };
    fan.update([row], { x: 0, y: 40 }, { width: 300, height: 80 }, false);
    return [...svg.querySelectorAll<SVGGElement>("g.fan-dot")].map((d) => d.style.offsetRotate);
  } finally {
    fan.destroy();
    svg.remove();
  }
}

describe("fan dots face the way they run", () => {
  it("the consumers' fan: along the line", () => {
    const turns = rotations(false);
    expect(turns.length).toBeGreaterThan(0);
    for (const turn of turns) expect(turn).toBe("auto");
  });

  it("the PV fan, run backwards: turned round", () => {
    const turns = rotations(true);
    expect(turns.length).toBeGreaterThan(0);
    for (const turn of turns) expect(turn).toBe("auto 180deg");
  });
});
