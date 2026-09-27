// @vitest-environment happy-dom
/**
 * Ring geometry (REQ R-2, R-3).
 *
 * The ring had no test of its own, which is how two rules stayed invisible
 * long enough to confuse: a segment below the floor is inflated, and an entry
 * without a share gets no segment at all. Both are pinned here.
 */
import { render } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import {
  RING_INSET_PX,
  RingAnimator,
  type RingClock,
  laneScale,
  renderRing,
  ringGeometry,
} from "../src/render/ring";
import { styles } from "../src/styles";
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
  // In display order - the DOM keeps a fixed order of its own (R-4).
  const circles = [...host.querySelectorAll("circle")].sort(
    (a, b) => Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index")),
  );
  return {
    // The targets - what is drawn is RingAnimator's business.
    lengths: circles.map((c) => Number.parseFloat(c.getAttribute("data-length") ?? "0")),
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

describe("the ring in motion (R-4)", () => {
  const C = 2 * Math.PI * ringGeometry(NODE_PX).r;
  const GAP = C * 0.0085;

  /** A clock the test turns by hand, one 16 ms frame at a time. */
  function manualClock() {
    let t = 0;
    let queued: (() => void) | undefined;
    let requested = 0;
    const clock: RingClock = {
      now: () => t,
      frame: (callback) => {
        queued = callback;
        requested++;
        return requested;
      },
      cancel: () => {
        queued = undefined;
      },
    };
    return {
      clock,
      get requested() {
        return requested;
      },
      get pending() {
        return queued !== undefined;
      },
      back(ms: number) {
        t -= ms;
      },
      /** Plays `ms` of frames, calling `each` after every one. */
      play(ms: number, each?: () => void) {
        for (let left = ms; left > 0 && queued; left -= 16) {
          t += Math.min(16, left);
          const run = queued;
          queued = undefined;
          run();
          each?.();
        }
      },
    };
  }

  const hosts: Element[] = [];
  afterEach(() => {
    for (const host of hosts.splice(0)) host.remove();
  });

  function stage(nodePx = NODE_PX) {
    const host = document.createElement("div");
    document.body.appendChild(host);
    hosts.push(host);
    const time = manualClock();
    const ring = new RingAnimator(time.clock);
    let size = nodePx;
    return {
      host,
      time,
      ring,
      show(segments: ReturnType<typeof segment>[], animate = true, px = size) {
        size = px;
        render(renderRing(segments, true, px), host);
        ring.update(host, animate, px);
      },
    };
  }

  /** What is drawn, in display order. */
  function drawn(host: Element) {
    return [...host.querySelectorAll<SVGCircleElement>("circle.ring-seg")]
      .map((c) => ({
        key: c.dataset.key,
        index: Number(c.dataset.index),
        start: -Number(c.getAttribute("stroke-dashoffset")),
        len: Number(c.getAttribute("stroke-dasharray")?.split(" ")[0]),
        toStart: Number(c.dataset.offset),
        toLen: Number(c.dataset.length),
        transform: c.getAttribute("transform"),
      }))
      .sort((a, b) => a.index - b.index);
  }

  /** Every gap, the one across twelve o'clock included. */
  function gaps(host: Element): number[] {
    const arcs = drawn(host);
    return arcs.map((a, i) => {
      const next = arcs[(i + 1) % arcs.length];
      const end = a.start + a.len;
      return i === arcs.length - 1 ? C - end + next.start : next.start - end;
    });
  }

  const atTarget = (host: Element) =>
    drawn(host).every(
      (a) => Math.abs(a.start - a.toStart) < 0.02 && Math.abs(a.len - a.toLen) < 0.02,
    );

  it("keeps every gap exact while new values keep arriving", () => {
    const { host, time, show } = stage();
    show([segment("rest", 0.64), segment("store", 0.2), segment("fridge", 0.16)]);
    const checked: number[] = [];
    const check = () => checked.push(...gaps(host));

    show([segment("rest", 0.5), segment("store", 0.3), segment("fridge", 0.2)]);
    time.play(400, check);
    // Retargeted mid-way, twice - what the live values do every second.
    show([segment("rest", 0.55), segment("store", 0.28), segment("fridge", 0.17)]);
    time.play(500, check);
    show([segment("rest", 0.45), segment("store", 0.35), segment("fridge", 0.2)]);
    time.play(4000, check);

    expect(checked.length).toBeGreaterThan(50);
    // Only the two-decimal rounding of the written attributes in between.
    for (const gap of checked) expect(Math.abs(gap - GAP)).toBeLessThan(0.02);
    expect(atTarget(host)).toBe(true);
    expect(time.pending, "the loop stops once it has arrived").toBe(false);
  });

  it("gets 95 % of the way in 1.5 s", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.8), segment("b", 0.2)]);
    show([segment("a", 0.4), segment("b", 0.6)]);
    const [a0] = drawn(host);
    time.play(1500);
    const [a1] = drawn(host);
    expect((a0.len - a1.len) / (a0.len - a1.toLen)).toBeGreaterThan(0.94);
  });

  it("lets a new segment grow where it will stand, over nobody", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("a", 0.5), segment("new", 0.2), segment("b", 0.3)]);
    const fresh = drawn(host).find((a) => a.key === "new");
    expect(fresh?.len).toBe(0);
    const narrowest: number[] = [];
    time.play(4000, () => narrowest.push(Math.min(...gaps(host))));
    for (const gap of narrowest) expect(gap).toBeGreaterThan(-0.05);
    expect(atTarget(host)).toBe(true);
  });

  /** Scale of a segment's dive, 1 when it is on the ring. */
  function depth(host: Element, key: string): number {
    const t = drawn(host).find((arc) => arc.key === key)?.transform ?? "";
    return Number(/scale\(([\d.]+)\)/.exec(t)?.[1] ?? 1);
  }

  /** Do two drawn segments lie over each other? */
  function overlap(host: Element, x: string, y: string): boolean {
    const [p, q] = [x, y].map((key) => drawn(host).find((arc) => arc.key === key));
    if (!p || !q) return false;
    return p.start < q.start + q.len && q.start < p.start + p.len;
  }

  it("keeps the overtaker under for as long as it lies over the one it passes", () => {
    // c passes b, and a new value leaves c nearly where it is while b goes the
    // long way round beneath it: c's own way is short, the passing is not.
    const { host, time, show } = stage();
    show([segment("a", 0.2), segment("b", 0.3), segment("c", 0.5)]);
    show([segment("a", 0.2), segment("c", 0.5), segment("b", 0.3)]);
    time.play(64);
    show([segment("a", 0.45), segment("c", 0.35), segment("b", 0.2)]);
    let crossed = 0;
    time.play(4000, () => {
      if (!overlap(host, "b", "c")) return;
      crossed++;
      expect(depth(host, "c"), "c surfaced on top of b").toBeLessThan(0.95);
    });
    expect(crossed).toBeGreaterThan(10);
    expect(depth(host, "c")).toBe(1);
  });

  it("dives the overtaker, and only that one", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.5), segment("b", 0.3), segment("c", 0.2)]);
    show([segment("c", 0.5), segment("a", 0.3), segment("b", 0.2)]);
    time.play(600);
    expect(depth(host, "c")).toBeCloseTo(laneScale(NODE_PX), 3);
    expect(
      drawn(host)
        .filter((arc) => arc.transform)
        .map((arc) => arc.key),
    ).toEqual(["c"]);
    time.play(5000);
    expect(depth(host, "c")).toBe(1);
    expect(atTarget(host)).toBe(true);
  });

  // c passes b and ends up behind a, so a's length decides where c stops.
  for (const [what, aShare] of [
    ["lengthens", 0.35],
    ["shortens", 0.62],
  ] as const) {
    it(`keeps the depth smooth when a new value ${what} the overtaker's way`, () => {
      const { host, time, show } = stage();
      show([segment("a", 0.5), segment("b", 0.3), segment("c", 0.2)]);
      show([segment("a", 0.5), segment("c", 0.3), segment("b", 0.2)]);
      const depths: number[] = [];
      time.play(250, () => depths.push(depth(host, "c")));
      show([segment("a", aShare), segment("c", 0.3), segment("b", 1 - aShare - 0.3)]);
      time.play(4000, () => depths.push(depth(host, "c")));

      expect(Math.min(...depths)).toBeCloseTo(laneScale(NODE_PX), 2);
      const steps = depths.slice(1).map((d, k) => Math.abs(d - depths[k]));
      expect(Math.max(...steps), "the depth jumped").toBeLessThan(0.05);
      expect(depth(host, "c")).toBe(1);
    });
  }

  it("stays under when it overtakes again before it has surfaced", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.4), segment("b", 0.3), segment("c", 0.2), segment("d", 0.1)]);
    show([segment("a", 0.4), segment("d", 0.3), segment("b", 0.2), segment("c", 0.1)]);
    time.play(500);
    const scaleOf = () => {
      const t = drawn(host).find((arc) => arc.key === "d")?.transform ?? "";
      return Number(/scale\(([\d.]+)\)/.exec(t)?.[1] ?? 1);
    };
    const under = scaleOf();
    expect(under).toBeLessThan(1);
    show([segment("d", 0.4), segment("a", 0.3), segment("b", 0.2), segment("c", 0.1)]);
    const depths: number[] = [];
    time.play(300, () => depths.push(scaleOf()));
    expect(Math.max(...depths), "it would have popped out of the lane").toBeLessThanOrEqual(
      under + 0.001,
    );
  });

  it("does not drop into the lane when a new value cuts the way short", () => {
    // Early in the dive a value moves the target most of the way towards the
    // overtaker. Measured against the old way it would count as nearly done
    // and fall to full depth in a single frame.
    const { host, time, show } = stage();
    show([segment("a", 0.2), segment("b", 0.3), segment("c", 0.5)]);
    show([segment("a", 0.2), segment("c", 0.5), segment("b", 0.3)]);
    const depths: number[] = [];
    time.play(64, () => depths.push(depth(host, "c")));
    show([segment("a", 0.45), segment("c", 0.35), segment("b", 0.2)]);
    time.play(4000, () => depths.push(depth(host, "c")));
    const steps = depths.slice(1).map((d, k) => Math.abs(d - depths[k]));
    expect(Math.max(...steps), "the depth jumped").toBeLessThan(0.05);
  });

  it("lets a segment be born between neighbours that are still moving", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.8), segment("b", 0.2)]);
    show([segment("a", 0.3), segment("b", 0.7)]);
    time.play(300);
    show([segment("a", 0.3), segment("new", 0.2), segment("b", 0.5)]);
    const seen: number[] = [];
    time.play(4000, () => seen.push(...gaps(host)));
    // No overlap and no hole: every gap between none and the proper one.
    expect(Math.min(...seen)).toBeGreaterThan(-0.02);
    expect(Math.max(...seen)).toBeLessThan(GAP + 0.02);
    expect(atTarget(host)).toBe(true);
  });

  /** Largest overlap of two segments that are both on the ring itself. */
  function worstOnRing(host: Element): number {
    const onRing = drawn(host).filter((arc) => depth(host, arc.key ?? "") > 0.95);
    let worst = 0;
    for (const p of onRing) {
      for (const q of onRing) {
        if (p === q) continue;
        const over = Math.min(p.start + p.len, q.start + q.len) - Math.max(p.start, q.start);
        worst = Math.max(worst, over);
      }
    }
    return worst;
  }

  it("takes a segment born behind an overtaker under with it", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.4), segment("b", 0.3), segment("c", 0.3)]);
    show([segment("c", 0.3), segment("x", 0.2), segment("a", 0.3), segment("b", 0.2)]);
    let worst = 0;
    time.play(4000, () => {
      worst = Math.max(worst, worstOnRing(host));
    });
    expect(worst).toBeLessThan(0.05);
  });

  it("lets several segments be born side by side without one lying over the next", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.8), segment("b", 0.2)]);
    show([segment("a", 0.3), segment("b", 0.7)]);
    time.play(300);
    show([segment("a", 0.3), segment("x", 0.1), segment("y", 0.1), segment("b", 0.5)]);
    const seen: number[] = [];
    time.play(4000, () => seen.push(...gaps(host)));
    expect(Math.min(...seen)).toBeGreaterThan(-0.02);
    expect(Math.max(...seen)).toBeLessThan(GAP + 0.02);
  });

  it("splits a full circle into two without an overlap", () => {
    const { host, time, show } = stage();
    show([segment("only", 1)]);
    show([segment("only", 0.7), segment("new", 0.3)]);
    const seen: number[] = [];
    time.play(4000, () => seen.push(...gaps(host)));
    expect(Math.min(...seen)).toBeGreaterThan(-0.02);
    expect(atTarget(host)).toBe(true);
  });

  it("is under before it lies over its neighbour by more than a gap", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.5), segment("b", 0.3), segment("c", 0.2)]);
    show([segment("c", 0.5), segment("a", 0.3), segment("b", 0.2)]);
    const late: number[] = [];
    time.play(4000, () => {
      const [b, c] = ["b", "c"].map((key) => drawn(host).find((arc) => arc.key === key));
      if (!b || !c) return;
      const over = Math.min(b.start + b.len, c.start + c.len) - Math.max(b.start, c.start);
      if (over > GAP) late.push(depth(host, "c"));
    });
    expect(late.length).toBeGreaterThan(0);
    expect(Math.max(...late), "c lay over b while still on the ring").toBeLessThan(0.9);
  });

  it("does not count moving up behind a vanished segment as overtaking", () => {
    const { host, time, show } = stage();
    show([segment("x", 0.5), segment("a", 0.3), segment("b", 0.2)]);
    show([segment("a", 0.6), segment("b", 0.4)]);
    const dived: string[] = [];
    time.play(3000, () => {
      for (const arc of drawn(host)) if (arc.transform) dived.push(arc.key ?? "");
    });
    expect(dived).toEqual([]);
  });

  it("goes straight to the values when it is to stand still", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("b", 0.7), segment("a", 0.3)], false);
    expect(atTarget(host)).toBe(true);
    expect(drawn(host).every((arc) => arc.transform === null)).toBe(true);
    expect(time.pending).toBe(false);
  });

  it("goes straight to the values when the card changes size", () => {
    const { host, show } = stage();
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("a", 0.3), segment("b", 0.7)], true, 150);
    expect(atTarget(host)).toBe(true);
  });

  it("asks for no frame when a render brings nothing new", () => {
    const { time, show } = stage();
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("a", 0.6), segment("b", 0.4)]);
    expect(time.requested).toBe(0);
  });

  it("asks for one frame at a time, however often it is updated", () => {
    const { time, show } = stage();
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("a", 0.5), segment("b", 0.5)]);
    show([segment("a", 0.45), segment("b", 0.55)]);
    show([segment("a", 0.4), segment("b", 0.6)]);
    expect(time.requested).toBe(1);
  });

  it("leaves a stopped ring where it belongs, and moves again after", () => {
    const { host, time, ring, show } = stage();
    show([segment("a", 0.5), segment("b", 0.3), segment("c", 0.2)]);
    show([segment("c", 0.5), segment("a", 0.3), segment("b", 0.2)]);
    time.play(300);
    ring.stop();
    expect(atTarget(host)).toBe(true);
    expect(drawn(host).every((arc) => arc.transform === null)).toBe(true);
    expect(time.pending).toBe(false);

    show([segment("c", 0.3), segment("a", 0.5), segment("b", 0.2)]);
    expect(time.pending).toBe(true);
  });

  it("does not trip over a frame from before it started", () => {
    const { host, time, show } = stage();
    show([segment("a", 0.6), segment("b", 0.4)]);
    show([segment("a", 0.4), segment("b", 0.6)]);
    time.back(50);
    time.play(4000);
    expect(drawn(host).every((arc) => Number.isFinite(arc.start) && Number.isFinite(arc.len))).toBe(
      true,
    );
    expect(atTarget(host)).toBe(true);
  });

  it("puts the inner lane clear of the ring, whatever the node size", () => {
    for (const nodePx of [70, 95, 123, 150]) {
      const r = nodePx / 2;
      const s = laneScale(nodePx);
      // Outer edge of the diving stroke inside the ring's inner edge.
      expect(s * (r + 5.5)).toBeLessThanOrEqual(r - 5.5);
    }
    expect(laneScale(400)).toBe(0.85);
  });

  it("leaves the motion to the card, not to CSS transitions", () => {
    const rule = /\.ring-seg\s*\{[^}]*\}/.exec(styles.cssText)?.[0] ?? "";
    expect(rule).not.toMatch(/transition\s*:/);
  });
});
