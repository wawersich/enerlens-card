/**
 * The cross: PV top, grid left, house right, battery bottom (REQ K-1).
 *
 * Coordinates are viewBox units. The SVG scales with the card; the HTML nodes
 * on top of it keep their size in CSS pixels (REQ K-12, ENT-20), so `SPREAD`
 * only moves the circles apart, it does not resize them.
 */
import type { ConnectionId, NodeKey } from "../types";

export const VIEW_W = 400;
export const VIEW_H = 400;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
/** Distance from the centre to each node - the knob for how tight the cross sits. */
const SPREAD = 142;
/**
 * Node radius in viewBox units - the same for all four (REQ K-14); the drawn
 * size comes from CSS (--el-node-size). Connections end here: always under the
 * circle, never short of it. The consumer ring lives inside the house node.
 */
export const NODE_R = 56;

export const NODE_POS: Record<NodeKey, { x: number; y: number }> = {
  solar: { x: CX, y: CY - SPREAD },
  grid: { x: CX - SPREAD, y: CY },
  house: { x: CX + SPREAD, y: CY },
  battery: { x: CX, y: CY + SPREAD },
};

// Where a connection meets a node: at the circle's edge, not its centre.
const TOP = CY - SPREAD + NODE_R;
const BOTTOM = CY + SPREAD - NODE_R;
const LEFT = CX - SPREAD + NODE_R;
const RIGHT = CX + SPREAD - NODE_R;
/** Control point offset - larger values bow the curves further out. */
const BOW = 54;

/**
 * Path per connection. Curves through the middle for the diagonals, straight
 * lines for grid-house and solar-battery. `battery_grid` shares the
 * grid-battery path; direction is carried by the dots, not the geometry.
 */
export const PATHS: Record<ConnectionId, string> = {
  solar_house: `M${CX},${TOP} C${CX},${TOP + BOW} ${RIGHT - BOW},${CY} ${RIGHT},${CY}`,
  solar_grid: `M${CX},${TOP} C${CX},${TOP + BOW} ${LEFT + BOW},${CY} ${LEFT},${CY}`,
  solar_battery: `M${CX},${TOP} L${CX},${BOTTOM}`,
  grid_house: `M${LEFT},${CY} L${RIGHT},${CY}`,
  grid_battery: `M${LEFT},${CY} C${LEFT + BOW},${CY} ${CX},${BOTTOM - BOW} ${CX},${BOTTOM}`,
  battery_grid: `M${LEFT},${CY} C${LEFT + BOW},${CY} ${CX},${BOTTOM - BOW} ${CX},${BOTTOM}`,
  battery_house: `M${CX},${BOTTOM} C${CX},${BOTTOM - BOW} ${RIGHT - BOW},${CY} ${RIGHT},${CY}`,
};

/** Which connections exist as drawn lines - battery_grid shares a path. */
export const DRAWN_CONNECTIONS: ConnectionId[] = [
  "solar_house",
  "solar_grid",
  "solar_battery",
  "grid_house",
  "grid_battery",
  "battery_house",
];

/**
 * The cut-out for everything drawn under the nodes (REQ K-16): a frame well
 * around the viewBox and one circle of radius `r` per node, filled even-odd,
 * so a clip with it keeps all but the insides of the circles. The lines run
 * on under each circle so that no gap can open; the card measures `r` to the
 * inner edge of the border, so the cut lies under the border and a node
 * without an opaque fill (card-mod, issue #8) shows nothing of them inside.
 */
export function holesPath(r: number): string {
  const frame = `M${-VIEW_W},${-VIEW_H}H${2 * VIEW_W}V${2 * VIEW_H}H${-VIEW_W}Z`;
  return (
    frame +
    Object.values(NODE_POS)
      .map(({ x, y }) => circlePath(x, y, r))
      .join("")
  );
}

/** A full circle as a closed path, two half arcs - for the cut-outs. */
export function circlePath(x: number, y: number, r: number): string {
  const f = (v: number) => Number(v.toFixed(3));
  const a = `A${f(r)},${f(r)} 0 1 0`;
  return `M${f(x - r)},${f(y)}${a} ${f(x + r)},${f(y)}${a} ${f(x - r)},${f(y)}Z`;
}

/** Position as a percentage of the viewBox, for absolutely placed HTML nodes. */
export function nodePercent(key: NodeKey): { left: string; top: string } {
  const p = NODE_POS[key];
  return { left: `${(100 * p.x) / VIEW_W}%`, top: `${(100 * p.y) / VIEW_H}%` };
}

// ---------------------------------------------------------------------------
// The arrangements (REQ AN-1, AN-2, AN-5)
// ---------------------------------------------------------------------------

export type Layout = "cross" | "square_right" | "square_left" | "triangle";
export type LineForm = "curved" | "straight";

interface Point {
  x: number;
  y: number;
}

/** One arrangement: where the nodes stand, the lines between them, the labels. */
export interface Geometry {
  layout: Layout;
  viewW: number;
  viewH: number;
  nodePos: Record<NodeKey, Point>;
  paths: Record<ConnectionId, string>;
  /** A label above its node - the upper row's - or below it (AN-5). */
  labelAbove: Record<NodeKey, boolean>;
}

const r2 = (v: number) => v.toFixed(2);

/** A point at the edge of a node's circle, towards `to`. */
function edge(from: Point, to: Point): Point {
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return {
    x: from.x + ((to.x - from.x) / len) * NODE_R,
    y: from.y + ((to.y - from.y) / len) * NODE_R,
  };
}

/** Straight from one circle's edge to the other's. */
function straight(a: Point, b: Point): string {
  const s = edge(a, b);
  const e = edge(b, a);
  return `M${r2(s.x)},${r2(s.y)} L${r2(e.x)},${r2(e.y)}`;
}

/** Turned by 45 degrees about the middle: clockwise for 1, the other way for -1. */
function turn(p: Point, sign: 1 | -1): Point {
  const c = Math.SQRT1_2;
  const dx = p.x - CX;
  const dy = p.y - CY;
  return { x: CX + dx * c - sign * dy * c, y: CY + sign * dx * c + dy * c };
}

/** The cross's curves, turned with the nodes: Beziers stay Beziers when turned. */
function turnPath(d: string, sign: 1 | -1): string {
  return d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_m, xs: string, ys: string) => {
    const p = turn({ x: Number(xs), y: Number(ys) }, sign);
    return `${r2(p.x)},${r2(p.y)}`;
  });
}

const COLUMN_X = 305;
const COLUMN_GRID_X = 95;

const cache = new Map<string, Geometry>();

/**
 * The geometry of an arrangement (AN-1). The cross is the one the card always
 * drew; turned right or left it is the same cross turned by 45 degrees; the
 * triangle stands PV, house and battery in a line with the grid beside the
 * house - 400 x 560, or 400 x 350 without a battery (decided 24.10.2026).
 * Lines `curved` are the cross's curves (turned with it), `straight` run edge
 * to edge (AN-2). In the triangle PV to battery always bows left past the house:
 * straight it would run through it.
 */
export function geometryFor(layout: Layout, lines: LineForm, withBattery: boolean): Geometry {
  const key = `${layout}|${lines}|${withBattery}`;
  const known = cache.get(key);
  if (known) return known;

  let nodePos: Record<NodeKey, Point> = { ...NODE_POS };
  let viewH = VIEW_H;
  if (layout === "square_right" || layout === "square_left") {
    const sign = layout === "square_right" ? 1 : -1;
    nodePos = {
      solar: turn(NODE_POS.solar, sign),
      grid: turn(NODE_POS.grid, sign),
      house: turn(NODE_POS.house, sign),
      battery: turn(NODE_POS.battery, sign),
    };
  } else if (layout === "triangle") {
    viewH = withBattery ? 560 : 350;
    nodePos = {
      solar: { x: COLUMN_X, y: 70 },
      house: { x: COLUMN_X, y: 280 },
      battery: { x: COLUMN_X, y: 490 },
      grid: { x: COLUMN_GRID_X, y: 280 },
    };
  }

  const line = (a: NodeKey, b: NodeKey) => straight(nodePos[a], nodePos[b]);
  let paths: Record<ConnectionId, string>;
  if (layout === "cross" && lines === "curved") {
    paths = { ...PATHS };
  } else if ((layout === "square_right" || layout === "square_left") && lines === "curved") {
    const sign = layout === "square_right" ? 1 : -1;
    paths = Object.fromEntries(
      Object.entries(PATHS).map(([id, d]) => [id, turnPath(d, sign)]),
    ) as Record<ConnectionId, string>;
  } else {
    const gridBattery =
      layout === "triangle" && lines === "curved"
        ? outward(nodePos, "grid", "battery")
        : line("grid", "battery");
    paths = {
      solar_house: line("solar", "house"),
      solar_grid:
        layout === "triangle" && lines === "curved"
          ? outward(nodePos, "solar", "grid")
          : line("solar", "grid"),
      solar_battery: layout === "triangle" ? bow(nodePos) : line("solar", "battery"),
      grid_house: line("grid", "house"),
      grid_battery: gridBattery,
      battery_grid: gridBattery,
      battery_house: line("battery", "house"),
    };
  }

  // Outside: the upper row's labels above, all others below (AN-5).
  const middle = viewH / 2;
  const labelAbove = Object.fromEntries(
    (Object.keys(nodePos) as NodeKey[]).map((k) => [
      k,
      layout === "triangle" ? k === "solar" : nodePos[k].y < middle - 1,
    ]),
  ) as Record<NodeKey, boolean>;

  const geometry: Geometry = { layout, viewW: VIEW_W, viewH, nodePos, paths, labelAbove };
  cache.set(key, geometry);
  return geometry;
}

/** Triangle: PV leaves down-left, passes between grid and house, enters the
 *  battery from the upper left - never through the house. */
function bow(p: Record<NodeKey, Point>): string {
  const s = { x: p.solar.x - 0.6 * NODE_R, y: p.solar.y + 0.8 * NODE_R };
  const e = { x: p.battery.x - 0.6 * NODE_R, y: p.battery.y - 0.8 * NODE_R };
  const cx = p.house.x - 128;
  return `M${r2(s.x)},${r2(s.y)} C${r2(cx)},${r2(s.y + 70)} ${r2(cx)},${r2(e.y - 70)} ${r2(e.x)},${r2(e.y)}`;
}

/** Triangle, curved: a slanted line to the grid bows outwards, away from the house. */
function outward(p: Record<NodeKey, Point>, a: NodeKey, b: NodeKey): string {
  const from = p[a];
  const to = p[b];
  const h = p.house;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dl = Math.hypot(mx - h.x, my - h.y) || 1;
  const c = { x: mx + ((mx - h.x) / dl) * 90, y: my + ((my - h.y) / dl) * 90 };
  const s = edge(from, c);
  const e = edge(to, c);
  return `M${r2(s.x)},${r2(s.y)} Q${r2(c.x)},${r2(c.y)} ${r2(e.x)},${r2(e.y)}`;
}

/** The cut-out of an arrangement's circles (K-16), as `holesPath` for the cross. */
export function holesPathOf(g: Geometry, r: number): string {
  const frame = `M${-g.viewW},${-g.viewH}H${2 * g.viewW}V${2 * g.viewH}H${-g.viewW}Z`;
  return (
    frame +
    Object.values(g.nodePos)
      .map(({ x, y }) => circlePath(x, y, r))
      .join("")
  );
}

/** A node's position as a percentage of its arrangement's viewBox. */
export function nodePercentOf(g: Geometry, key: NodeKey): { left: string; top: string } {
  const p = g.nodePos[key];
  return { left: `${(100 * p.x) / g.viewW}%`, top: `${(100 * p.y) / g.viewH}%` };
}
