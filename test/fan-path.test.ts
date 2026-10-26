import { describe, expect, it } from "vitest";
import {
  exitDirection,
  fanPath,
  placeBlock,
  placeBlocks,
  samplePath,
  splitPoint,
  trunkPath,
} from "../src/render/fan-path";

/*
 * Geometry of the fans and the lists beside the drawing (REQ L-16, L-17,
 * PV-7).
 */

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe("L-16: where a fan leaves its node", () => {
  it("rows level with the node: straight out at three o'clock", () => {
    const dir = exitDirection({ x: 100, y: 100 }, [80, 100, 120], 1);
    expect(dir.x).toBeCloseTo(1);
    expect(dir.y).toBeCloseTo(0);
  });

  it("rows above: up and out, towards their middle, unweighted", () => {
    const dir = exitDirection({ x: 100, y: 200 }, [100, 120], 1, 300);
    expect(dir.y).toBeLessThan(0);
    expect(dir.x).toBeGreaterThan(0);
    expect(Math.hypot(dir.x, dir.y)).toBeCloseTo(1);
  });

  it("never steeper than 80 degrees", () => {
    const dir = exitDirection({ x: 100, y: 500 }, [0], 1, 101);
    expect((Math.atan2(-dir.y, dir.x) * 180) / Math.PI).toBeCloseTo(80);
  });

  it("rows to the left: mirrored (a list left of the drawing, AN-3)", () => {
    const right = exitDirection({ x: 100, y: 200 }, [100], 1, 300);
    const left = exitDirection({ x: 100, y: 200 }, [100], -1, -100);
    expect(left.x).toBeCloseTo(-right.x);
    expect(left.y).toBeCloseTo(right.y);
  });

  it("no rows: three o'clock", () => {
    expect(exitDirection({ x: 0, y: 0 }, [], 1)).toEqual({ x: 1, y: 0 });
  });
});

describe("the path of one fan line", () => {
  it("level exit: the curve of old, unchanged", () => {
    const d = fanPath({ x: 10, y: 50 }, { x: 1, y: 0 }, { x: 210, y: 90 });
    expect(d).toBe("M10.0,50.0 C70.0,50.0 70.0,90.0 130.0,90.0 L210.0,90.0");
  });

  it("aimed exit: first a short straight piece along the radius", () => {
    const d = fanPath({ x: 10, y: 50 }, { x: 0.6, y: -0.8 }, { x: 210, y: 0 }, 10);
    const n = numbers(d);
    expect(n.slice(0, 4)).toEqual([10, 50, 16, 42]);
    expect(d).toContain(" L16.0,42.0 C");
  });

  it("to the left, mirrored", () => {
    const d = fanPath({ x: 210, y: 50 }, { x: -1, y: 0 }, { x: 10, y: 90 });
    expect(d).toBe("M210.0,50.0 C150.0,50.0 150.0,90.0 90.0,90.0 L10.0,90.0");
  });
});

describe("PV-7: the split point past the house", () => {
  const house = { x: 150, y: 150, r: 40 };

  it("at the node while the house is not in the way", () => {
    const xs = splitPoint({ x: 50, y: 50 }, [20, 40, 60], 300, 1, [house]);
    expect(xs).toBe(50);
  });

  it("further out while rows have to pass the house", () => {
    const xs = splitPoint({ x: 50, y: 50 }, [40, 120, 200, 240], 300, 1, [house]);
    expect(xs).toBeGreaterThan(50);
    expect(xs).toBeLessThanOrEqual(292);
  });

  it("the more rows down there, the further out", () => {
    const few = splitPoint({ x: 50, y: 50 }, [40, 120], 300, 1, [house]);
    const many = splitPoint({ x: 50, y: 50 }, [40, 120, 200, 260], 300, 1, [house]);
    expect(many).toBeGreaterThanOrEqual(few);
  });

  it("an extra no-go area pushes it further too", () => {
    const plain = splitPoint({ x: 50, y: 50 }, [40, 180], 300, 1, [house]);
    const kept = splitPoint(
      { x: 50, y: 50 },
      [40, 180],
      300,
      1,
      [house],
      (x, y) => x < 230 && y > 140,
    );
    expect(kept).toBeGreaterThan(plain);
  });

  it("the drawn lines keep clear, with an aimed exit too (10 sources, 24.10.2026)", () => {
    // The bottom row ran through the house ring: the check had tested a
    // simpler curve than the one drawn.
    // Measured on the 486 px card with ten sources: PV exit, house and its
    // clearance, rows.
    const origin = { x: 178.6, y: 191.9 };
    const dir = { x: 0.945, y: -0.328 };
    const home = { x: 225.5, y: 287.5, r: 52.5 };
    const rowYs = [18, 46, 74, 102, 130, 158, 186, 214, 242, 270];
    const xs = splitPoint(origin, rowYs, 320.5, 1, [home], undefined, dir, 7.6);
    for (const y of rowYs) {
      for (const pt of samplePath(trunkPath(origin, dir, xs, { x: 320.5, y }, 7.6))) {
        expect(Math.hypot(pt.x - home.x, pt.y - home.y)).toBeGreaterThanOrEqual(home.r);
      }
    }
  });

  it("to the left, mirrored", () => {
    const grid = { x: 150, y: 150, r: 40 };
    const xs = splitPoint({ x: 250, y: 50 }, [40, 120, 200, 240], 0, -1, [grid]);
    expect(xs).toBeLessThan(250);
    expect(xs).toBeGreaterThanOrEqual(8);
  });
});

describe("L-17: two lists beside the drawing", () => {
  const drawing = { top: 0, bottom: 400 };

  it("each list in the middle of its node when there is room", () => {
    const shift = placeBlocks({
      drawing,
      pv: { top: 100, height: 60, node: 60 },
      consumers: { top: 170, height: 80, node: 200 },
      gap: 10,
    });
    expect(shift).toEqual({ pv: -70, consumers: -10 });
  });

  it("never beyond the drawing's edge", () => {
    const shift = placeBlocks({
      drawing,
      pv: { top: 100, height: 100, node: 20 },
      consumers: { top: 210, height: 80, node: 380 },
      gap: 10,
    });
    expect(100 + shift.pv).toBe(0);
    expect(210 + shift.consumers + 80).toBe(400);
  });

  it("parting only as far as they must", () => {
    const shift = placeBlocks({
      drawing,
      pv: { top: 100, height: 100, node: 150 },
      consumers: { top: 210, height: 100, node: 200 },
      gap: 10,
    });
    const pvTop = 100 + shift.pv;
    const consumersTop = 210 + shift.consumers;
    expect(consumersTop - (pvTop + 100)).toBe(10);
    // Moved apart around their wishes, symmetric: 100 and 150 overlap by 60.
    expect(pvTop).toBe(70);
    expect(consumersTop).toBe(180);
  });

  it("taller than the drawing together: they stay as the layout put them", () => {
    const shift = placeBlocks({
      drawing,
      pv: { top: 0, height: 250, node: 60 },
      consumers: { top: 260, height: 250, node: 200 },
      gap: 10,
    });
    expect(shift).toEqual({ pv: 0, consumers: 0 });
  });
});

describe("placeBlock: one list alone on its side (AN-3, L-17)", () => {
  const drawing = { top: 0, bottom: 400 };
  it("centred on its node", () => {
    expect(placeBlock(drawing, { top: 150, height: 100, node: 100 })).toBe(-100);
  });
  it("never past the drawing's top or bottom", () => {
    expect(placeBlock(drawing, { top: 150, height: 100, node: 20 })).toBe(-150);
    expect(placeBlock(drawing, { top: 150, height: 100, node: 390 })).toBe(150);
  });
  it("taller than the drawing: stays where the layout put it", () => {
    expect(placeBlock(drawing, { top: -50, height: 500, node: 100 })).toBe(0);
  });
});
