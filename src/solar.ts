/**
 * Several PV sources: the rows of the PV list and the segments of the ring at
 * the PV node (REQ PV-4 to PV-8).
 *
 * The rows follow the consumers' rules - filter, sort, values live and order
 * on the tick (L-3, L-6, L-7) - but have no rest: the PV is the sum of its
 * sources, there is nothing left over. The ring takes its own selection: every
 * source that carries something, whether the rows are shown or not, since
 * the PV list is off by default (PV-7) while the ring is on.
 */
import { carries } from "./consumers";
import type { Config, ListEntry, Model, PvScale, Segment } from "./types";

/** The grey rest of the ring under "% kWp" - never an entity (PV-5). */
export const FREE_KEY = "__pv_free__";

/** Colour of that rest; styles.ts defines it for both grounds. */
const FREE_COLOR = "var(--el-pv-free)";

/**
 * The PV rows (PV-7, PV-8): only with two sources or more - one row would
 * repeat the node. Unavailable sources are left out in both scopes (L-3,
 * L-12); with the filter on, those below `min_consumer_w` too.
 */
export function buildSolarRows(model: Model, config: Config, showAll: boolean): ListEntry[] {
  if (model.solarSources.length < 2) return [];
  const rows: ListEntry[] = [];
  for (const source of model.solarSources) {
    if (!source.reading.available) continue;
    const w = source.reading.w;
    if (!showAll && w < config.minConsumerW) continue;
    rows.push({
      key: source.key,
      name: source.name,
      w,
      color: source.color,
      entity: source.entity,
      icon: source.icon,
      threshold: config.minConsumerW,
      isRest: false,
    });
  }
  // Stable, so sources of equal power keep their configured order (L-6).
  return rows.sort((a, b) => b.w - a.w);
}

/** The rows' figures from a newer model, their order and selection kept (L-7). */
export function refreshSolarRows(rows: ListEntry[], model: Model): ListEntry[] {
  const live = new Map<string, number>();
  for (const source of model.solarSources) {
    if (source.reading.available) live.set(source.key, source.reading.w);
  }
  return rows.map((row) => ({ ...row, w: live.get(row.key) ?? row.w }));
}

/**
 * The ring's segments (PV-4, PV-5).
 *
 * "100 %": every source that carries something gets its share of their sum -
 * negative ones (an inverter drawing at night) carry nothing and are left out.
 * "% kWp": each such source a part as long as its power against the peak of
 * all sources together; a plant above its peak (bright haze) is squeezed onto
 * the full ring, below it the rest of the ring is a free grey part.
 *
 * `order` keeps the segments in the rows' order from the last tick, so the
 * ring does not reshuffle between ticks (L-7); without it, by power.
 */
export function solarSegments(
  model: Model,
  config: Config,
  scale: PvScale,
  order?: readonly string[],
): Segment[] {
  const active = model.solarSources.filter(
    (source) =>
      source.reading.available &&
      source.reading.w > 0 &&
      carries({ w: source.reading.w, threshold: config.minConsumerW }, config),
  );
  const rank = (key: string) => {
    const at = order?.indexOf(key) ?? -1;
    return at === -1 ? Number.POSITIVE_INFINITY : at;
  };
  const watts = (source: (typeof active)[number]) =>
    source.reading.available ? source.reading.w : 0;
  active.sort((a, b) =>
    order ? rank(a.key) - rank(b.key) || watts(b) - watts(a) : watts(b) - watts(a),
  );

  const sum = active.reduce((total, source) => total + watts(source), 0);
  const peakW = model.solarSources.reduce((total, source) => total + (source.kwp ?? 0) * 1000, 0);
  const base = scale === "peak" ? Math.max(peakW, sum) : sum;
  const segments: Segment[] = active.map((source) => ({
    key: source.key,
    share: base > 0 ? watts(source) / base : 0,
    color: source.color,
    entity: source.entity,
    isRest: false,
  }));
  if (scale === "peak") {
    const used = segments.reduce((total, segment) => total + segment.share, 0);
    const free = 1 - used;
    if (free > 1e-9) {
      segments.push({ key: FREE_KEY, share: free, color: FREE_COLOR, isRest: true });
    }
  }
  return segments;
}
