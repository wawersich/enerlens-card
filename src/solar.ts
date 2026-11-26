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
import { SOLAR_PALETTE } from "./config";
import { carries } from "./consumers";
import type {
  Config,
  ListEntry,
  Model,
  NormalizedSolarSource,
  PvScale,
  Segment,
  SolarSourceReading,
} from "./types";

/** The grey rest of the ring under "% kWp" - never an entity (PV-5). */
export const FREE_KEY = "__pv_free__";

/** Colour of that rest; styles.ts defines it for both grounds. */
const FREE_COLOR = "var(--el-pv-free)";

/** The sources behind the PV rows: the list, or the one entity (PV-11). */
export function rowReadings(model: Model): SolarSourceReading[] {
  if (model.solarSources.length > 0) return model.solarSources;
  return model.solarRow ? [model.solarRow] : [];
}

/** The same from the configuration alone: what a row's key stands for (PV-11). */
export function rowSources(config: Config): NormalizedSolarSource[] {
  if (config.solarSources.length > 0) return config.solarSources;
  const solar = config.sources.solar;
  if (solar.kind !== "single") return [];
  return [
    {
      key: solar.entity,
      entity: solar.entity,
      color: SOLAR_PALETTE[0],
      invert: solar.invert === true,
      excluded: false,
    },
  ];
}

/** A reading as a row's figure: its power, or no figure at all. */
function figureOf(reading: Model["solar"]): { w: number; powerUnknown?: true } {
  return reading.available ? { w: reading.w } : { w: 0, powerUnknown: true };
}

/**
 * What a row of this source shows. One source shows what the node shows -
 * the node's own reading, so night and gaps read alike (PV-11). Several: its
 * power, 0 W when it counts 0 for the night (PV-2) - live only: a period has
 * its own gap rules (EM-10) - or no figure.
 */
function rowFigure(
  source: SolarSourceReading,
  model: Model,
  single: boolean,
  inPeriod: boolean,
): { w: number; powerUnknown?: true } {
  if (single) return figureOf(model.solar);
  if (source.reading.available) return { w: source.reading.w };
  return source.quiet && !inPeriod ? { w: 0 } : { w: 0, powerUnknown: true };
}

/**
 * The PV rows (PV-7, PV-8, PV-11).
 *
 * One source - a list of one or a plain entity - always has its row, whatever
 * the filter: it carries what the node cannot (history line, later extra
 * values), and it shows what the node shows - 0 W, or no figure when it is
 * gone. Several: filtered like the consumers, unless `list.solar_always`
 * keeps every one; a source off for the night then stands at 0 W. One gone
 * while delivering, or never seen, is left out (L-3, L-12). A derived PV has
 * no row: no entity stands behind it.
 */
export function buildSolarRows(model: Model, config: Config, showAll: boolean): ListEntry[] {
  const sources = rowReadings(model);
  const single = sources.length === 1;
  const always = config.list.solarAlways === true;
  const inPeriod = config.energy !== undefined;
  const rows: ListEntry[] = [];
  for (const source of sources) {
    const figure = rowFigure(source, model, single, inPeriod);
    if (!single) {
      if (figure.powerUnknown) continue;
      // Filtered like the consumers - one off for the night only when every one stays.
      if (!source.reading.available && !always) continue;
      if (!showAll && !always && figure.w < config.minConsumerW) continue;
    }
    rows.push({
      key: source.key,
      name: source.name,
      ...figure,
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
  const live = new Map<string, { w: number; powerUnknown?: true }>();
  const sources = rowReadings(model);
  const single = sources.length === 1;
  for (const source of sources) {
    // One source shows what the node shows, "—" included; several keep their
    // last figure until the tick takes a gone one out (L-7).
    const figure = rowFigure(source, model, single, false);
    if (single || !figure.powerUnknown) live.set(source.key, figure);
  }
  return rows.map((row) => {
    const figure = live.get(row.key);
    if (!figure) return row;
    const { powerUnknown: _, ...rest } = row;
    return { ...rest, ...figure };
  });
}

/**
 * The ring's segments (PV-4, PV-5).
 *
 * "100 %": every source that carries something gets its share of their sum -
 * negative ones (an inverter drawing at night) carry nothing and are left out.
 * "% kWp": each such source a part as long as its power against the peak of
 * all sources together; a plant above its peak (bright haze) is squeezed onto
 * the full ring, below it the rest of the ring is a free grey part - but only
 * next to at least one source: with none, no ring at all, as under "100 %"
 * (PV-5, 03.11.2026: a ring all grey made the PV look switched off).
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
  if (scale === "peak" && segments.length > 0) {
    const used = segments.reduce((total, segment) => total + segment.share, 0);
    const free = 1 - used;
    if (free > 1e-9) {
      segments.push({ key: FREE_KEY, share: free, color: FREE_COLOR, isRest: true });
    }
  }
  return segments;
}
