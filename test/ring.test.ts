// @vitest-environment happy-dom
/**
 * Ring geometry (REQ R-2, R-3).
 *
 * The ring had no test of its own, which is how two rules stayed invisible
 * long enough to confuse: a segment below the floor is inflated, and an entry
 * without a share gets no segment at all. Both are pinned here.
 */
import { render } from "lit";
import { describe, expect, it } from "vitest";
import { RING_INSET_PX, renderRing, ringGeometry } from "../src/render/ring";
import type { Segment } from "../src/types";

const NODE_PX = 112;

function segment(key: string, share: number, color = "#123456"): Segment {
  return { key, share, color, isRest: false };
}

/** Drawn arc length per segment, read back out of the rendered stroke-dasharray. */
function draw(segments: Segment[]): { lengths: number[]; colors: string[]; circumference: number } {
  const host = document.createElement("div");
  const result = renderRing(segments, true, NODE_PX);
  if (result === null || typeof result !== "object") throw new Error("nothing rendered");
  render(result, host);
  const circles = [...host.querySelectorAll("circle")];
  return {
    lengths: circles.map((c) =>
      Number.parseFloat(c.getAttribute("stroke-dasharray")?.split(" ")[0] ?? "0"),
    ),
    colors: circles.map((c) => c.getAttribute("stroke") ?? ""),
    circumference: 2 * Math.PI * ringGeometry(NODE_PX).r,
  };
}

describe("ring geometry", () => {
  it("inflates a segment below the floor to 1.4 % of the circumference", () => {
    // 0.1 % of the ring would be a hairline - it is lifted to the floor.
    const { lengths, circumference } = draw([segment("a", 0.999), segment("b", 0.001)]);
    expect(lengths[1] / circumference).toBeCloseTo(0.014, 4);
  });

  it("takes the borrowed length off the largest segment", () => {
    const { lengths, circumference } = draw([segment("a", 0.999), segment("b", 0.001)]);
    const gaps = 2 * 0.0085 * circumference;
    // Nothing is invented: arcs plus gaps still close the circle.
    // Lengths are written with toFixed(2), so compare to that precision.
    expect(lengths[0] + lengths[1] + gaps).toBeCloseTo(circumference, 1);
    // And the big one paid for it.
    expect(lengths[0]).toBeLessThan(0.999 * (circumference - gaps));
  });

  it("leaves a lone segment without a gap (full circle)", () => {
    const { lengths, circumference } = draw([segment("only", 1)]);
    expect(lengths).toHaveLength(1);
    expect(lengths[0]).toBeCloseTo(circumference, 1);
  });

  it("skips an entry without a share", () => {
    const { lengths } = draw([segment("a", 0.7), segment("idle", 0), segment("b", 0.3)]);
    expect(lengths).toHaveLength(2);
  });

  it("keeps the entry colour, also below flow.min_w", () => {
    // The ring never dims: colour is the list's statement, not the flow's
    // (decision of 12.09.2026).
    const { colors } = draw([segment("a", 0.999, "#aabbcc"), segment("b", 0.001, "#ddeeff")]);
    expect(colors).toEqual(["#aabbcc", "#ddeeff"]);
  });

  it("draws nothing when the ring is off or empty", () => {
    expect(renderRing([segment("a", 1)], false, NODE_PX)).toBe(renderRing([], true, NODE_PX));
  });

  it("centres the stroke on the node contour (REQ K-14)", () => {
    const { r, strokeWidth } = ringGeometry(NODE_PX);
    expect(RING_INSET_PX).toBeLessThan(0);
    expect(r + strokeWidth / 2).toBeCloseTo(50, 5);
  });
});
