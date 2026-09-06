/**
 * Distributes power onto the six connections and turns that into dot parameters.
 * Owner: agent 3. REQ 4.5, 4.6, P-1 - P-4.
 */
import type { ColorKey, Config, ConnectionId, DotPlan, Flows, Model } from "./types";

/** Dot colour per connection (REQ P-4). Also fixes the order of `planDots`. */
const CONNECTION_COLORS: Record<ConnectionId, ColorKey> = {
  solar_battery: "battery_charge",
  solar_grid: "grid_export",
  battery_grid: "grid_export",
  grid_battery: "grid_import",
  solar_house: "solar",
  battery_house: "battery_discharge",
  grid_house: "grid_import",
};

const CONNECTION_ORDER = Object.keys(CONNECTION_COLORS) as ConnectionId[];

/**
 * Priority order per REQ 4.5, each step `min(source left, sink left)`.
 * At most one direction per connection; no flow out of an empty source.
 */
export function computeFlows(model: Model): Flows {
  // Unavailable quantities enter with 0 (REQ 4.5, K-9).
  let pv = model.solar.available ? model.solar.w : 0;
  let gridImport = model.grid.available ? model.grid.positive : 0;
  let gridExport = model.grid.available ? model.grid.negative : 0;
  let discharge = model.battery?.available ? model.battery.positive : 0;
  let charge = model.battery?.available ? model.battery.negative : 0;
  let house = model.house.available ? model.house.w : 0;

  const flows: Flows = {};
  const take = (id: ConnectionId, w: number): number => {
    if (w > 0) flows[id] = w;
    return w;
  };

  const pvBat = take("solar_battery", Math.min(pv, charge));
  pv -= pvBat;
  charge -= pvBat;

  const pvGrid = take("solar_grid", Math.min(pv, gridExport));
  pv -= pvGrid;
  gridExport -= pvGrid;

  const batGrid = take("battery_grid", Math.min(discharge, gridExport));
  discharge -= batGrid;
  gridExport -= batGrid;

  const gridBat = take("grid_battery", Math.min(gridImport, charge));
  gridImport -= gridBat;
  charge -= gridBat;

  const pvHouse = take("solar_house", Math.min(pv, house));
  pv -= pvHouse;
  house -= pvHouse;

  const batHouse = take("battery_house", Math.min(discharge, house));
  discharge -= batHouse;
  house -= batHouse;

  take("grid_house", Math.min(gridImport, house));

  return flows;
}

/** Dot count and speed per connection (REQ 4.6). Connections below `flow.minW` are omitted. */
/**
 * The step rule of REQ 4.6 for a single power figure: how many dots travel a
 * path, and how long one lap takes. Shared so the consumer rows animate by the
 * same rule as the connections - one place to change the feel.
 *
 * Returns null below `flow.min_w`, where nothing moves at all.
 */
export function dotParams(w: number, config: Config): { count: number; durationS: number } | null {
  const { minW, slowBelowW, moreDotsAboveW, maxDotsAtW, maxDots, slowS, fastS } = config.flow;
  if (!Number.isFinite(w) || w < minW) return null;

  if (w < slowBelowW) return { count: 1, durationS: slowS };

  if (w < moreDotsAboveW) {
    const ramp = (w - slowBelowW) / (moreDotsAboveW - slowBelowW);
    return { count: 1, durationS: slowS - ramp * (slowS - fastS) };
  }

  const grown = (w - moreDotsAboveW) / (maxDotsAtW - moreDotsAboveW);
  return { count: Math.min(maxDots, 2 + Math.floor(grown * (maxDots - 2))), durationS: fastS };
}

export function planDots(flows: Flows, config: Config): DotPlan[] {
  const plans: DotPlan[] = [];

  for (const connection of CONNECTION_ORDER) {
    const w = flows[connection];
    if (w === undefined) continue;
    const params = dotParams(w, config);
    if (!params) continue;
    plans.push({
      connection,
      w,
      count: params.count,
      durationS: params.durationS,
      colorKey: CONNECTION_COLORS[connection],
    });
  }

  return plans;
}
