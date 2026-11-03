/**
 * Distributes power onto the seven connections and turns that into dot parameters.
 * Owner: agent 3. REQ 4.5, 4.6, P-1 - P-4.
 */
import type { BatteryTask, ColorKey, Config, ConnectionId, DotPlan, Flows, Model } from "./types";

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

/** The flows of the current reading (REQ 4.5) for the battery's task (P-14). */
export function computeFlows(model: Model, task: BatteryTask = "zero_grid"): Flows {
  // Unavailable quantities enter with 0 (REQ 4.5, K-9).
  return splitFlows(
    model.solar.available ? model.solar.w : 0,
    model.grid.available ? model.grid.positive : 0,
    model.grid.available ? model.grid.negative : 0,
    model.battery?.available ? model.battery.positive : 0,
    model.battery?.available ? model.battery.negative : 0,
    model.house.available ? model.house.w : 0,
    { task },
  );
}

/** What a split is for (REQ 4.5). */
export interface SplitContext {
  /** The means of a block (energy mode, step 3) instead of an instant. */
  block?: boolean;
  /** What the battery is for (P-14); decides who trades with the grid. */
  task?: BatteryTask;
}

// Sources: 0 PV, 1 grid import, 2 battery discharge. Sinks: 0 house, 1 export, 2 charge.
const SOURCE: Record<ConnectionId, number> = {
  solar_house: 0,
  solar_grid: 0,
  solar_battery: 0,
  grid_house: 1,
  grid_battery: 1,
  battery_house: 2,
  battery_grid: 2,
};
const SINK: Record<ConnectionId, number> = {
  solar_house: 0,
  solar_grid: 1,
  solar_battery: 2,
  grid_house: 0,
  grid_battery: 2,
  battery_house: 0,
  battery_grid: 1,
};
/** The sinks each source may feed, as bits: PV all three, the grid house and battery, the battery house and grid. */
const ALL_OPEN: readonly number[] = [0b111, 0b101, 0b011];
const WITHOUT_BATTERY_GRID: readonly number[] = [0b111, 0b101, 0b001];
const WITHOUT_GRID_BATTERY: readonly number[] = [0b111, 0b001, 0b011];
const WITHOUT_EXCHANGE: readonly number[] = [0b111, 0b001, 0b001];

/**
 * The most the open connections can carry: the smallest cut, over the eight
 * sets K of sources, of (sources outside K) + (sinks K can reach).
 */
function maxFlow(src: readonly number[], snk: readonly number[], open: readonly number[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let set = 0; set < 8; set++) {
    let cut = 0;
    let reach = 0;
    for (let s = 0; s < 3; s++) {
      if (set & (1 << s)) reach |= open[s];
      else cut += src[s];
    }
    for (let t = 0; t < 3; t++) if (reach & (1 << t)) cut += snk[t];
    if (cut < best) best = cut;
  }
  return best;
}

/**
 * How little and how much one connection may carry so that the rest of the
 * network still reaches `flow` - exact, from the same cuts (REQ 4.5 step 1).
 */
function bounds(
  id: ConnectionId,
  src: readonly number[],
  snk: readonly number[],
  open: readonly number[],
  flow: number,
): [number, number] {
  const s = SOURCE[id];
  const t = SINK[id];
  if (!(open[s] & (1 << t))) return [0, 0];
  const rest = open.slice();
  rest[s] &= ~(1 << t);
  let lo = 0;
  let hi = Math.min(src[s], snk[t]);
  for (let set = 0; set < 8; set++) {
    let cut = 0;
    let reach = 0;
    for (let q = 0; q < 3; q++) {
      if (set & (1 << q)) reach |= rest[q];
      else cut += src[q];
    }
    for (let q = 0; q < 3; q++) if (reach & (1 << q)) cut += snk[q];
    // How the cut's room changes per watt on this connection.
    const slope = 1 - (set & (1 << s) ? 0 : 1) - (reach & (1 << t) ? 1 : 0);
    if (slope === 1) lo = Math.max(lo, flow - cut);
    else if (slope === -1) hi = Math.min(hi, cut - flow);
  }
  return [lo, hi];
}

type Step = readonly [ConnectionId, number];

/**
 * The steps in turn, each taking up to its target as much as it can without
 * lowering the total the rest can still reach (REQ 4.5 steps 1 and 2); its
 * connection takes nothing more afterwards.
 */
function guarded(src0: readonly number[], snk0: readonly number[], steps: readonly Step[]) {
  const src = src0.slice();
  const snk = snk0.slice();
  const open = ALL_OPEN.slice();
  let flow = maxFlow(src, snk, open);
  const out = new Map<ConnectionId, number>();
  for (const [id, target] of steps) {
    const s = SOURCE[id];
    const t = SINK[id];
    if (!(open[s] & (1 << t))) continue;
    const [lo, hi] = bounds(id, src, snk, open, flow);
    // Completeness wins over a target.
    const x = Math.max(0, Math.min(src[s], snk[t], Math.max(lo, Math.min(target, hi))));
    out.set(id, x);
    src[s] -= x;
    snk[t] -= x;
    flow -= x;
    open[s] &= ~(1 << t);
  }
  return out;
}

const INF = Number.POSITIVE_INFINITY;

/**
 * The order for the battery's task (REQ 4.5 step 2, P-14). zero_grid: PV feeds
 * the house first, and what the battery still trades with the grid runs
 * between battery and grid. supply_house: the battery feeds the house and
 * stores PV; PV and grid do the trading - the order the card had before.
 */
const ORDERS: Record<BatteryTask, ConnectionId[]> = {
  zero_grid: [
    "solar_house",
    "solar_battery",
    "solar_grid",
    "battery_house",
    "battery_grid",
    "grid_house",
    "grid_battery",
  ],
  supply_house: [
    "solar_battery",
    "solar_grid",
    "battery_grid",
    "grid_battery",
    "solar_house",
    "battery_house",
    "grid_house",
  ],
};

const nonNegative = (w: number) => (Number.isFinite(w) && w > 0 ? w : 0);

/**
 * One rule for an instant and for the means of a block (REQ 4.5, EM-8):
 * everything that can be assigned is; battery and grid exchange power only as
 * far as the readings prove it; everything else PV first, then battery, then
 * grid. The energy mode runs it once per block and adds the results up.
 */
export function splitFlows(
  solarW: number,
  importW: number,
  exportW: number,
  dischargeW: number,
  chargeW: number,
  houseW: number,
  ctx: SplitContext = {},
): Flows {
  const src = [nonNegative(solarW), nonNegative(importW), nonNegative(dischargeW)];
  const snk = [nonNegative(houseW), nonNegative(exportW), nonNegative(chargeW)];
  let steps: Step[] = ORDERS[ctx.task ?? "zero_grid"].map((id) => [id, INF]);
  if (ctx.block) {
    // Within a block, discharge and export (charge and import) mostly fall
    // into different phases: the exchange is only what the means force
    // (REQ 4.5 step 3), its open part shared by what each side can take.
    const flow = maxFlow(src, snk, ALL_OPEN);
    const forced = Math.max(0, flow - maxFlow(src, snk, WITHOUT_EXCHANGE));
    let toGrid = Math.max(0, flow - maxFlow(src, snk, WITHOUT_BATTERY_GRID));
    let toBattery = Math.max(0, flow - maxFlow(src, snk, WITHOUT_GRID_BATTERY));
    const open = forced - toGrid - toBattery;
    if (open > 0) {
      const roomGrid = Math.max(0, bounds("battery_grid", src, snk, ALL_OPEN, flow)[1] - toGrid);
      const roomBattery = Math.max(
        0,
        bounds("grid_battery", src, snk, ALL_OPEN, flow)[1] - toBattery,
      );
      if (roomGrid + roomBattery > 0) {
        toGrid += (open * roomGrid) / (roomGrid + roomBattery);
        toBattery += (open * roomBattery) / (roomGrid + roomBattery);
      }
    }
    steps = [["battery_grid", toGrid], ["grid_battery", toBattery], ...steps];
  }
  const split = guarded(src, snk, steps);
  // Rounding leaves crumbs where a step took everything; they carry nothing.
  const crumb = 1e-9 * Math.max(1, src[0] + src[1] + src[2] + snk[0] + snk[1] + snk[2]);
  const flows: Flows = {};
  for (const [id, w] of split) if (w > crumb) flows[id] = w;
  return flows;
}

/** How much slower than slow_s a dot runs at the bottom of the resting range (REQ P-3). */
const REST_SLOWDOWN = 0.3;
/** The resting range spans S1 / REST_RANGE to S1; below it the pace stays put. */
const REST_RANGE = 50;

/** Dot count and speed per connection (REQ 4.6). Connections below `flow.minW` are omitted. */
/**
 * The step rule of REQ 4.6 for a single power figure: how many dots travel a
 * path, and how long one lap takes. Shared so the consumer rows animate by the
 * same rule as the connections - one place to change the feel.
 *
 * Returns null below `flow.min_w`, where nothing moves at all.
 */
export function dotParams(w: number, config: Config): { count: number; durationS: number } | null {
  const { minW, slowBelowW, fullSpeedW, moreDotsAboveW, maxDotsAtW, maxDots, slowS, fastS } =
    config.flow;
  if (!Number.isFinite(w) || w < minW) return null;

  // Speed: resting pace at S1, ramping up to fast_s at full_speed_w.
  let durationS = slowS;
  if (w >= fullSpeedW) durationS = fastS;
  else if (w > slowBelowW) {
    const ramp = (w - slowBelowW) / (fullSpeedW - slowBelowW);
    durationS = slowS - ramp * (slowS - fastS);
  } else if (slowBelowW > 0) {
    // Below S1 the pace still follows the power, logarithmically: every
    // halving adds the same step, up to REST_SLOWDOWN at S1 / REST_RANGE.
    // Without it, small sources ran in exact lockstep (REQ P-3, 01.11.2026).
    const floor = slowBelowW / REST_RANGE;
    const share = Math.log(slowBelowW / Math.max(w, floor)) / Math.log(REST_RANGE);
    durationS = slowS * (1 + REST_SLOWDOWN * share);
  }

  // Count: one dot below more_dots_above_w, then growing to max_dots at S3.
  // The two thresholds are independent (REQ P-3); by default they coincide.
  let count = 1;
  if (w >= moreDotsAboveW) {
    const grown = (w - moreDotsAboveW) / (maxDotsAtW - moreDotsAboveW);
    count = Math.min(maxDots, 2 + Math.floor(grown * (maxDots - 2)));
  }
  return { count, durationS };
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
