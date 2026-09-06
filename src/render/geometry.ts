/**
 * The cross: PV top, grid left, house right, battery bottom (REQ K-1).
 * Coordinates are viewBox units; the SVG scales, the HTML nodes on top of it
 * do not (REQ K-12, ENT-20).
 */
import type { ConnectionId, NodeKey } from "../types";

export const VIEW_W = 440;
export const VIEW_H = 452;
/** Node radius - also the reference for the HTML node boxes. */
export const NODE_R = 44;
/** Ring radius around the house node (REQ R-2). */
export const RING_R = 56;

export const NODE_POS: Record<NodeKey, { x: number; y: number }> = {
  solar: { x: 220, y: 68 },
  grid: { x: 64, y: 220 },
  house: { x: 376, y: 220 },
  battery: { x: 220, y: 380 },
};

/**
 * Path per connection. Curves through the middle for the diagonal pairs, straight
 * lines for grid-house and solar-battery, matching the approved mockup.
 * `battery_grid` reuses the grid_battery path; direction is expressed by the dots.
 */
export const PATHS: Record<ConnectionId, string> = {
  solar_house: "M220,112 C220,182 262,220 316,220",
  solar_grid: "M220,112 C220,182 178,220 108,220",
  solar_battery: "M220,112 L220,336",
  grid_house: "M108,220 L316,220",
  grid_battery: "M108,220 C180,220 220,262 220,336",
  battery_grid: "M108,220 C180,220 220,262 220,336",
  battery_house: "M220,336 C220,262 262,220 316,220",
};

/** Which connections exist as drawn lines - `battery_grid` shares a path with `grid_battery`. */
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
