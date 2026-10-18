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
