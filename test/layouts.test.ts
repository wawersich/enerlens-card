import { describe, expect, it } from "vitest";
import { samplePath } from "../src/render/fan-path";
import { NODE_R, PATHS, geometryFor } from "../src/render/geometry";
import type { NodeKey, RawConfig } from "../src/types";

/*
 * The arrangements (REQ AN-1, AN-2, AN-5): where the nodes stand, how the
 * lines run between them, which side a label takes.
 */

const ends = (d: string) => {
  const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  return { start: { x: n[0], y: n[1] }, end: { x: n[n.length - 2], y: n[n.length - 1] } };
};

const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const LINKS: Array<[string, NodeKey, NodeKey]> = [
  ["solar_house", "solar", "house"],
  ["solar_grid", "solar", "grid"],
  ["solar_battery", "solar", "battery"],
  ["grid_house", "grid", "house"],
  ["grid_battery", "grid", "battery"],
  ["battery_house", "battery", "house"],
];

describe("AN-1: where the nodes stand", () => {
  it("the cross as it always was, lines included", () => {
    const g = geometryFor("cross", "curved", true);
    expect(g.viewW).toBe(400);
    expect(g.viewH).toBe(400);
    expect(g.paths).toEqual(PATHS);
    expect(g.nodePos.solar).toEqual({ x: 200, y: 58 });
  });

  it("square, solar right: PV top right, house bottom right, battery bottom left, grid top left", () => {
    const p = geometryFor("square_right", "straight", true).nodePos;
    expect(p.solar.x).toBeGreaterThan(200);
    expect(p.solar.y).toBeLessThan(200);
    expect(p.house.x).toBeGreaterThan(200);
    expect(p.house.y).toBeGreaterThan(200);
    expect(p.battery.x).toBeLessThan(200);
    expect(p.battery.y).toBeGreaterThan(200);
    expect(p.grid.x).toBeLessThan(200);
    expect(p.grid.y).toBeLessThan(200);
  });

  it("square, solar left: PV top left, house top right, battery bottom right, grid bottom left", () => {
    const p = geometryFor("square_left", "straight", true).nodePos;
    expect(p.solar.x).toBeLessThan(200);
    expect(p.solar.y).toBeLessThan(200);
    expect(p.house.x).toBeGreaterThan(200);
    expect(p.house.y).toBeLessThan(200);
    expect(p.battery.x).toBeGreaterThan(200);
    expect(p.battery.y).toBeGreaterThan(200);
    expect(p.grid.x).toBeLessThan(200);
    expect(p.grid.y).toBeGreaterThan(200);
  });

  it("triangle: PV, house, battery one above the other, grid left of the house; 400 x 560", () => {
    const g = geometryFor("triangle", "straight", true);
    expect(g.viewH).toBe(560);
    const p = g.nodePos;
    expect(p.solar.x).toBe(p.house.x);
    expect(p.house.x).toBe(p.battery.x);
    expect(p.solar.y).toBeLessThan(p.house.y);
    expect(p.house.y).toBeLessThan(p.battery.y);
    expect(p.grid.y).toBe(p.house.y);
    expect(p.grid.x).toBeLessThan(p.house.x);
  });

  it("triangle without a battery: its third gone, 400 x 350 (AN-1, B6)", () => {
    const g = geometryFor("triangle", "straight", false);
    expect(g.viewH).toBe(350);
    for (const key of ["solar", "house", "grid"] as NodeKey[]) {
      expect(g.nodePos[key].y + NODE_R).toBeLessThanOrEqual(350);
    }
  });

  it("triangle, battery centre: PV, battery, house one above the other, grid left of the battery", () => {
    const g = geometryFor("triangle_battery", "straight", true);
    expect(g.viewH).toBe(560);
    const p = g.nodePos;
    expect(p.solar.x).toBe(p.battery.x);
    expect(p.battery.x).toBe(p.house.x);
    expect(p.solar.y).toBeLessThan(p.battery.y);
    expect(p.battery.y).toBeLessThan(p.house.y);
    expect(p.grid.y).toBe(p.battery.y);
    expect(p.grid.x).toBeLessThan(p.battery.x);
  });

  it("triangle, battery centre, without a battery: the same drawing as the triangle", () => {
    for (const lines of ["curved", "straight"] as const) {
      const a = geometryFor("triangle_battery", lines, false);
      const b = geometryFor("triangle", lines, false);
      expect(a.viewH).toBe(b.viewH);
      expect(a.nodePos).toEqual(b.nodePos);
      expect(a.paths).toEqual(b.paths);
    }
  });

  it("every node inside the drawing, in every arrangement", () => {
    for (const layout of [
      "cross",
      "square_right",
      "square_left",
      "triangle",
      "triangle_battery",
    ] as const) {
      const g = geometryFor(layout, "straight", true);
      for (const p of Object.values(g.nodePos)) {
        expect(p.x - NODE_R).toBeGreaterThanOrEqual(0);
        expect(p.x + NODE_R).toBeLessThanOrEqual(g.viewW);
        expect(p.y - NODE_R).toBeGreaterThanOrEqual(0);
        expect(p.y + NODE_R).toBeLessThanOrEqual(g.viewH);
      }
    }
  });
});

describe("AN-2: the lines", () => {
  for (const layout of [
    "cross",
    "square_right",
    "square_left",
    "triangle",
    "triangle_battery",
  ] as const) {
    for (const lines of ["curved", "straight"] as const) {
      it(`${layout}, ${lines}: every line runs from the edge of one circle to the edge of the other`, () => {
        const g = geometryFor(layout, lines, true);
        for (const [id, from, to] of LINKS) {
          const { start, end } = ends(g.paths[id as keyof typeof g.paths]);
          expect(near(start, g.nodePos[from])).toBeCloseTo(NODE_R, 0);
          expect(near(end, g.nodePos[to])).toBeCloseTo(NODE_R, 0);
        }
        expect(g.paths.battery_grid).toBe(g.paths.grid_battery);
      });
    }
  }

  it("triangle: PV to battery passes the house on its left, straight lines or not", () => {
    for (const lines of ["curved", "straight"] as const) {
      const g = geometryFor("triangle", lines, true);
      const house = g.nodePos.house;
      for (const pt of samplePath(g.paths.solar_battery)) {
        expect(near(pt, house)).toBeGreaterThan(NODE_R);
      }
    }
  });

  it("triangle, battery centre: PV to house passes the battery on its left, straight lines or not", () => {
    for (const lines of ["curved", "straight"] as const) {
      const g = geometryFor("triangle_battery", lines, true);
      const battery = g.nodePos.battery;
      for (const pt of samplePath(g.paths.solar_house)) {
        expect(near(pt, battery)).toBeGreaterThan(NODE_R);
      }
    }
  });

  // The bow from PV to the lower node: radial at both ends, as if it came from
  // the circle's middle, and clear of the grid and the middle node alike (27.10.2026).
  const bows = [
    ["triangle", "solar_battery", "battery", "house"],
    ["triangle_battery", "solar_house", "house", "battery"],
  ] as const;
  for (const [layout, id, to, mid] of bows) {
    it(`${layout}: the bow leaves PV and meets the ${to} radially`, () => {
      const g = geometryFor(layout, "curved", true);
      const n = (g.paths[id].match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      const [s, c1, c2, e] = [0, 2, 4, 6].map((i) => ({ x: n[i], y: n[i + 1] }));
      const radial = (centre: { x: number; y: number }, at: typeof s, towards: typeof s) => {
        const r = { x: at.x - centre.x, y: at.y - centre.y };
        const t = { x: towards.x - at.x, y: towards.y - at.y };
        const cross = (r.x * t.y - r.y * t.x) / (Math.hypot(r.x, r.y) * Math.hypot(t.x, t.y));
        expect(Math.abs(cross)).toBeLessThan(0.01);
        expect(r.x * t.x + r.y * t.y).toBeGreaterThan(0);
      };
      radial(g.nodePos.solar, s, c1);
      radial(g.nodePos[to], e, c2);
    });

    it(`${layout}: the bow keeps clear of the grid and the ${mid} alike`, () => {
      const g = geometryFor(layout, "curved", true);
      const gap = (k: NodeKey) =>
        Math.min(...samplePath(g.paths[id]).map((pt) => near(pt, g.nodePos[k]))) - NODE_R;
      expect(gap("grid")).toBeGreaterThan(40);
      expect(gap(mid)).toBeGreaterThan(40);
      expect(Math.abs(gap("grid") - gap(mid))).toBeLessThan(10);
    });
  }

  it("triangle, battery centre, curved: the slants to the grid bow outwards, grid to battery straight", () => {
    const g = geometryFor("triangle_battery", "curved", true);
    expect(g.paths.solar_grid).toContain(" Q");
    expect(g.paths.grid_house).toContain(" Q");
    expect(g.paths.grid_battery).toMatch(/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+$/);
  });

  it("straight means straight: one segment between two circles", () => {
    const g = geometryFor("square_right", "straight", true);
    expect(g.paths.solar_house).toMatch(/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+$/);
  });

  it("square and curved: the cross's own curves, turned with the nodes", () => {
    const g = geometryFor("square_right", "curved", true);
    expect(g.paths.solar_house).toContain(" C");
  });
});

describe("AN-5: labels stand outside", () => {
  const above = (
    layout: "cross" | "square_right" | "square_left" | "triangle" | "triangle_battery",
  ) =>
    (Object.entries(geometryFor(layout, "straight", true).labelAbove) as [NodeKey, boolean][])
      .filter(([, up]) => up)
      .map(([key]) => key)
      .sort();

  it("cross: PV above, all others below - as it always was", () => {
    expect(above("cross")).toEqual(["solar"]);
  });

  it("square, solar right: the upper row above (PV, grid)", () => {
    expect(above("square_right")).toEqual(["grid", "solar"]);
  });

  it("square, solar left: the upper row above (PV, house)", () => {
    expect(above("square_left")).toEqual(["house", "solar"]);
  });

  it("triangle: only PV above; the house's label below, over the lines", () => {
    expect(above("triangle")).toEqual(["solar"]);
  });

  it("triangle, battery centre: only PV above", () => {
    expect(above("triangle_battery")).toEqual(["solar"]);
  });

  it("the middle node's label lies on the lines - house or battery, nothing beside the triangles", () => {
    expect(geometryFor("triangle", "straight", true).ground).toBe("house");
    expect(geometryFor("triangle_battery", "straight", true).ground).toBe("battery");
    expect(geometryFor("triangle_battery", "straight", false).ground).toBe("house");
    for (const layout of ["cross", "square_right", "square_left"] as const) {
      expect(geometryFor(layout, "curved", true).ground).toBeNull();
    }
  });
});

describe("AN-1, AN-2: the options", () => {
  const base = { type: "custom:enerlens-card", entities: { solar: "sensor.pv", grid: "sensor.g" } };

  it("the cross with curved lines by default", async () => {
    const { normalizeConfig } = await import("../src/config");
    const config = normalizeConfig(base);
    expect(config.layout).toBe("cross");
    expect(config.flow.lines).toBe("curved");
  });

  it("the other arrangements straight by default, switchable", async () => {
    const { normalizeConfig } = await import("../src/config");
    for (const layout of ["square_right", "square_left", "triangle", "triangle_battery"] as const) {
      expect(normalizeConfig({ ...base, layout }).flow.lines).toBe("straight");
      expect(normalizeConfig({ ...base, layout, flow: { lines: "curved" } }).flow.lines).toBe(
        "curved",
      );
    }
  });

  it("an unknown arrangement or line form: a warning and the default, never an error card", async () => {
    const { normalizeConfig } = await import("../src/config");
    const warn = console.warn;
    const said: unknown[] = [];
    console.warn = (...a: unknown[]) => said.push(a);
    try {
      const config = normalizeConfig({
        ...base,
        layout: "spiral",
        flow: { lines: "wavy" },
      } as unknown as RawConfig);
      expect(config.layout).toBe("cross");
      expect(config.flow.lines).toBe("curved");
      expect(said).toHaveLength(2);
    } finally {
      console.warn = warn;
    }
  });
});

describe("AN-4: the energy mode's arrows per arrangement", () => {
  it("import and discharge point to the middle of the drawing, their counterparts away", async () => {
    const { arrowsFor } = await import("../src/render/cross");
    expect(arrowsFor("cross")).toEqual({ import: "→", export: "←", discharge: "↑", charge: "↓" });
    expect(arrowsFor("triangle")).toEqual(arrowsFor("cross"));
    expect(arrowsFor("triangle_battery")).toEqual(arrowsFor("cross"));
    expect(arrowsFor("square_right")).toEqual({
      import: "↘",
      export: "↖",
      discharge: "↗",
      charge: "↙",
    });
    expect(arrowsFor("square_left")).toEqual({
      import: "↗",
      export: "↙",
      discharge: "↖",
      charge: "↘",
    });
  });

  it("every arrow has a drawing of its own - none falls back to '→'", async () => {
    const { ARROWS, arrowsFor } = await import("../src/render/cross");
    const used = new Set(
      (["cross", "square_right", "square_left", "triangle", "triangle_battery"] as const).flatMap(
        (l) => Object.values(arrowsFor(l)),
      ),
    );
    expect(used.size).toBe(8);
    const drawings = new Set<string>();
    for (const arrow of used) {
      expect(ARROWS[arrow], arrow).toBeDefined();
      drawings.add(ARROWS[arrow].d);
    }
    expect(drawings.size).toBe(8);
  });
});
