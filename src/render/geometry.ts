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
/** House node radius in viewBox units; the drawn size comes from CSS. */
export const NODE_R = 44;
/** Ring radius around the house node (REQ R-2). */
export const RING_R = 56;
/**
 * Solar, grid and battery are drawn as large as the house plus its ring, so all
 * four have the same outer diameter (REQ K-13). Their connections end at the
 * ring radius - always under the circle, never short of it.
 */
export const NODE_R_LG = RING_R;

export const NODE_POS: Record<NodeKey, { x: number; y: number }> = {
  solar: { x: CX, y: CY - SPREAD },
  grid: { x: CX - SPREAD, y: CY },
  house: { x: CX + SPREAD, y: CY },
  battery: { x: CX, y: CY + SPREAD },
};

// Where a connection meets a node: at the circle's edge, not its centre. The
// house end stays at NODE_R so the line reaches the circle even without a ring.
const TOP = CY - SPREAD + NODE_R_LG;
const BOTTOM = CY + SPREAD - NODE_R_LG;
const LEFT = CX - SPREAD + NODE_R_LG;
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

/** Position as a percentage of the viewBox, for absolutely placed HTML nodes. */
export function nodePercent(key: NodeKey): { left: string; top: string } {
  const p = NODE_POS[key];
  return { left: `${(100 * p.x) / VIEW_W}%`, top: `${(100 * p.y) / VIEW_H}%` };
}
