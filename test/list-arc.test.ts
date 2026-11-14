import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import { arcEase, arcGeometry, arcShift } from "../src/render/arc";
import type { RawConfig } from "../src/types";

/*
 * The arched list (REQ LZ-17): rows beside the drawing stand on an arc around
 * their node. Geometry only - the card measures and writes.
 */

const base = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.solar", grid: "sensor.grid" },
} as RawConfig;

describe("list.arc in the configuration", () => {
  it("is off by default and reads on", () => {
    expect(normalizeConfig(base).list.arc).toBe(false);
    expect(normalizeConfig({ ...base, list: { arc: true } } as RawConfig).list.arc).toBe(true);
  });

  it("an invalid value is an error, like every switch", () => {
    expect(() =>
      normalizeConfig({ ...base, list: { arc: "yes" } } as unknown as RawConfig),
    ).toThrow();
  });
});

describe("flow.radial in the configuration (L-16, 13.11.2026)", () => {
  it("is off by default and reads on", () => {
    expect(normalizeConfig(base).flow.radial).toBe(false);
    expect(normalizeConfig({ ...base, flow: { radial: true } } as RawConfig).flow.radial).toBe(
      true,
    );
  });

  it("an invalid value is an error, like every switch", () => {
    expect(() =>
      normalizeConfig({ ...base, flow: { radial: 1 } } as unknown as RawConfig),
    ).toThrow();
  });
});

describe("how far the rows move in", () => {
  const block = (rows: number[], over: Partial<Parameters<typeof arcGeometry>[0]> = {}) => ({
    side: 1 as const,
    nodeY: 200,
    nodeEdge: 140,
    rowsEdge: 240,
    rows,
    minRadius: 160,
    ...over,
  });

  it("at most half the free room, reached by the outermost row of a long list", () => {
    const g = arcGeometry(block([0, 100, 200, 300, 400]));
    expect(g.M).toBe(50);
    expect(arcShift(200, g)).toBeCloseTo(50, 5);
    expect(arcShift(0, g)).toBe(0);
  });

  it("the row level with the node stays out, the others move in the further they are", () => {
    const g = arcGeometry(block([120, 160, 200, 240, 280]));
    const shifts = [0, 40, 80].map((d) => arcShift(d, g));
    expect(shifts[0]).toBe(0);
    expect(shifts[1]).toBeGreaterThan(0);
    expect(shifts[2]).toBeGreaterThan(shifts[1]);
    for (const s of shifts) expect(s).toBeLessThanOrEqual(g.M + 1e-9);
  });

  it("a short list near the node bends little: the circle is never tighter than the minimum", () => {
    const g = arcGeometry(block([180, 220], { rowsEdge: 260 }));
    expect(g.M).toBe(60);
    expect(g.R).toBe(160);
    expect(arcShift(20, g)).toBeLessThan(2);
  });

  it("one row, or no room: nothing moves", () => {
    expect(arcGeometry(block([120])).M).toBe(0);
    expect(arcGeometry(block([0, 400], { rowsEdge: 130 })).M).toBe(0);
    expect(arcShift(150, arcGeometry(block([120])))).toBe(0);
  });

  it("rows on the left: the room is measured the other way round", () => {
    const g = arcGeometry(block([0, 400], { side: -1, nodeEdge: 300, rowsEdge: 200 }));
    expect(g.M).toBe(50);
  });

  it("the minimum circle grows with the card (K-12)", () => {
    const small = arcGeometry(block([180, 220], { rowsEdge: 260, minRadius: 160 * 0.8 }));
    expect(small.R).toBeCloseTo(128);
  });
});

describe("the arc changing", () => {
  it("glides from the old arc to the new with the glide's curve", () => {
    const from = { M: 10, R: 300 };
    const to = { M: 50, R: 200 };
    expect(arcEase(from, to, 0)).toEqual(from);
    expect(arcEase(from, to, 1)).toEqual(to);
    const half = arcEase(from, to, 0.5);
    expect(half.M).toBeGreaterThan(30);
    expect(half.M).toBeLessThan(50);
  });
});
