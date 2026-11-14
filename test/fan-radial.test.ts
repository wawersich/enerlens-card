import { describe, expect, it } from "vitest";
import { crosses, radialFan, radialPath, samplePath } from "../src/render/fan-path";

/*
 * Radial fan lines (REQ L-16 as changed on 13.11.2026): each line leaves the
 * node on its own radius, turns aside for other nodes and labels, and no two
 * lines cross.
 */

const centre = { x: 100, y: 200 };
const radius = 40;
const start = (d: string) => {
  const [x, y] = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return { x, y };
};
const angleOf = (d: string, side = 1) => {
  const s = start(d);
  return Math.atan2(s.y - centre.y, side * (s.x - centre.x));
};
const deg = (rad: number) => (rad * 180) / Math.PI;

describe("one radial line", () => {
  it("level row: straight out at three o'clock and into the row", () => {
    const d = radialPath(centre, radius, 1, 0, { x: 300, y: 200 });
    expect(start(d)).toEqual({ x: 140, y: 200 });
    const pts = samplePath(d);
    expect(pts.at(-1)).toEqual({ x: 300, y: 200 });
    expect(pts.every((p) => Math.abs(p.y - 200) < 1e-6)).toBe(true);
  });

  it("leaves on the circle at its angle and runs level into the row", () => {
    const a = -Math.PI / 6;
    const d = radialPath(centre, radius, 1, a, { x: 300, y: 100 });
    const s = start(d);
    expect(Math.hypot(s.x - centre.x, s.y - centre.y)).toBeCloseTo(radius, 1);
    expect(angleOf(d)).toBeCloseTo(a, 2);
    const pts = samplePath(d);
    const [a1, a2] = pts.slice(-2);
    expect(Math.abs(a2.y - a1.y)).toBeLessThan(Math.abs(a2.x - a1.x));
  });

  it("rows on the left: mirrored", () => {
    const right = start(radialPath(centre, radius, 1, 0.4, { x: 300, y: 300 }));
    const left = start(radialPath(centre, radius, -1, 0.4, { x: -100, y: 300 }));
    expect(left.x - centre.x).toBeCloseTo(-(right.x - centre.x), 1);
    expect(left.y).toBeCloseTo(right.y, 1);
  });
});

describe("a radial fan", () => {
  const rows = [
    { key: "a", x: 300, y: 120 },
    { key: "b", x: 300, y: 170 },
    { key: "c", x: 300, y: 220 },
    { key: "d", x: 300, y: 270 },
  ];

  it("each line on its own radius, towards its row", () => {
    const fan = radialFan({ centre, radius, side: 1, rows, obstacles: [] });
    expect(fan).toBeDefined();
    for (const row of rows) {
      const own = Math.atan2(row.y - centre.y, row.x - centre.x);
      expect(angleOf(fan?.get(row.key) as string)).toBeCloseTo(own, 2);
    }
  });

  it("never steeper than 80 degrees", () => {
    const fan = radialFan({
      centre,
      radius,
      side: 1,
      rows: [{ key: "a", x: 110, y: -400 }],
      obstacles: [],
    });
    expect(deg(angleOf(fan?.get("a") as string))).toBeCloseTo(-80, 0);
  });

  it("rows on the left: mirrored", () => {
    const left = rows.map((r) => ({ ...r, x: 2 * centre.x - r.x }));
    const fan = radialFan({ centre, radius, side: -1, rows: left, obstacles: [] });
    for (const row of left) {
      const own = Math.atan2(row.y - centre.y, centre.x - row.x);
      expect(angleOf(fan?.get(row.key) as string, -1)).toBeCloseTo(own, 2);
    }
  });

  // The battery under the house in the square (Markus 13.11.2026).
  const battery = { x: 130, y: 330, r: 40 + 14 };
  const low = [
    { key: "a", x: 260, y: 200 },
    { key: "b", x: 260, y: 260 },
    { key: "c", x: 260, y: 320 },
    { key: "d", x: 260, y: 380 },
  ];

  it("a line that would touch another node turns towards the rows until clear", () => {
    const fan = radialFan({ centre, radius, side: 1, rows: low, obstacles: [battery] });
    expect(fan).toBeDefined();
    const d = fan?.get("d") as string;
    const own = Math.atan2(380 - centre.y, 260 - centre.x);
    expect(angleOf(d)).toBeLessThan(own);
    for (const p of samplePath(d)) {
      expect(Math.hypot(p.x - battery.x, p.y - battery.y)).toBeGreaterThanOrEqual(battery.r);
    }
  });

  it("a turned line takes the lines between it and the horizontal along: none crosses", () => {
    const fan = radialFan({ centre, radius, side: 1, rows: low, obstacles: [battery] });
    const angles = low.map((r) => angleOf(fan?.get(r.key) as string));
    for (let i = 1; i < angles.length; i++)
      expect(angles[i]).toBeGreaterThanOrEqual(angles[i - 1] - 1e-3);
    const lines = low.map((r) => samplePath(fan?.get(r.key) as string));
    for (let i = 0; i < lines.length; i++)
      for (let j = i + 1; j < lines.length; j++) expect(crosses(lines[i], lines[j])).toBe(false);
  });

  it("above the node too: a turned line takes the lines below it along, none crosses", () => {
    // A node above the house on the rows' side, as PV in the square.
    const above = { x: 130, y: 70, r: 40 + 14 };
    const high = [
      { key: "a", x: 260, y: 20 },
      { key: "b", x: 260, y: 80 },
      { key: "c", x: 260, y: 140 },
      { key: "d", x: 260, y: 200 },
    ];
    const fan = radialFan({ centre, radius, side: 1, rows: high, obstacles: [above] });
    expect(fan).toBeDefined();
    const angles = high.map((r) => angleOf(fan?.get(r.key) as string));
    expect(angles[0]).toBeGreaterThan(Math.atan2(20 - centre.y, 260 - centre.x));
    for (let i = 1; i < angles.length; i++)
      expect(angles[i]).toBeGreaterThanOrEqual(angles[i - 1] - 1e-3);
    const lines = high.map((r) => samplePath(fan?.get(r.key) as string));
    for (let i = 0; i < lines.length; i++)
      for (let j = i + 1; j < lines.length; j++) expect(crosses(lines[i], lines[j])).toBe(false);
    for (const pts of lines)
      for (const p of pts)
        expect(Math.hypot(p.x - above.x, p.y - above.y)).toBeGreaterThanOrEqual(above.r);
  });

  it("keeps out of a node's label", () => {
    // "Haus" below the house, as in the cross and the triangle.
    const label = { left: 85, top: 245, right: 145, bottom: 262 };
    const fan = radialFan({
      centre,
      radius,
      side: 1,
      rows: [{ key: "a", x: 180, y: 420 }],
      obstacles: [],
      boxes: [label],
    });
    expect(fan).toBeDefined();
    for (const p of samplePath(fan?.get("a") as string)) {
      const inside = p.x > label.left && p.x < label.right && p.y > label.top && p.y < label.bottom;
      expect(inside).toBe(false);
    }
  });

  it("no clear way: undefined, so the card draws the fan as before", () => {
    const wall = { x: 200, y: 200, r: 60 };
    expect(radialFan({ centre, radius, side: 1, rows, obstacles: [wall] })).toBeUndefined();
  });

  it("while rows glide it draws anyway, once found clear at rest", () => {
    const wall = { x: 200, y: 200, r: 60 };
    const fan = radialFan({ centre, radius, side: 1, rows, obstacles: [wall], force: true });
    expect(fan?.size).toBe(rows.length);
  });

  it("would it cross the other fan: undefined", () => {
    const other = "M150,100 L150,400";
    expect(
      radialFan({ centre, radius, side: 1, rows, obstacles: [], others: [other] }),
    ).toBeUndefined();
  });

  it("keeps out of a no-go area", () => {
    const noGo = (x: number, y: number) => x < 200 && y > 230;
    const fan = radialFan({ centre, radius, side: 1, rows, obstacles: [], noGo });
    expect(fan).toBeDefined();
    for (const r of rows) {
      for (const p of samplePath(fan?.get(r.key) as string)) expect(noGo(p.x, p.y)).toBe(false);
    }
  });
});

describe("crossing lines", () => {
  it("an X crosses, parallel lines and a shared end do not", () => {
    const a = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(
      crosses(a, [
        { x: 0, y: 10 },
        { x: 10, y: 0 },
      ]),
    ).toBe(true);
    expect(
      crosses(a, [
        { x: 0, y: 1 },
        { x: 10, y: 11 },
      ]),
    ).toBe(false);
    expect(
      crosses(a, [
        { x: 10, y: 10 },
        { x: 20, y: 0 },
      ]),
    ).toBe(false);
  });
});
