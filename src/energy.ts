/**
 * Energy per calendar period from Home Assistant's statistics (REQ 2.15).
 *
 * The card integrates the power sensors it already has: an hourly mean times
 * an hour is that hour's energy, exactly. Everything here is pure - fetching
 * and drawing live elsewhere - so the rules for late starts and gaps can be
 * tested on invented rows (EM-4, EM-8 - EM-12).
 */
import { splitFlows } from "./flow";
import type { EnergyPeriod, Flows } from "./types";

export type { EnergyPeriod } from "./types";

/** The six balance quantities (4.5). Battery roles are absent without a battery. */
export type EnergyRole = "solar" | "import" | "export" | "discharge" | "charge" | "house";

/** One statistics row: start of its interval in ms, mean power in W. */
export interface StatRow {
  start: number;
  mean: number | null;
}

export interface EnergyQuery {
  /** Start of the calendar period (periodStart). */
  from: number;
  /** Now; the result ends at the last statistics row before it. */
  to: number;
  /** Entity per role. Solar or house left out = derived from the balance (A-1). */
  roles: Partial<Record<EnergyRole, string>>;
  consumers: string[];
  /** Hourly rows from a day before `from`, for late starts and gap filling. */
  hourly: Record<string, StatRow[]>;
  /** Five-minute rows of the running hour (and further back while kept). */
  fiveMin: Record<string, StatRow[]>;
  /** A PV gap after an hour below this counts as dark: zero, not filled (EM-10). */
  pvZeroBelowW: number;
  /**
   * When each entity's statistics begin, as far as known - the first monthly
   * row. A sensor that had a day off before the period is no late start: its
   * missing hours are gaps (EM-9, EM-10). Without it, the window decides.
   */
  since?: Record<string, number>;
}

export interface SeriesEnergy {
  wh: number;
  /** Share of the counted time that was filled in rather than measured (EM-11). */
  filledShare: number;
  /** Set when a consumer's statistics begin inside the period (EM-12). */
  since?: number;
}

export interface EnergyResult {
  /** Start actually counted: later than asked when a main sensor starts late (EM-9). */
  from: number;
  to: number;
  lateStart: boolean;
  main: Record<EnergyRole, SeriesEnergy | null>;
  consumers: Record<string, SeriesEnergy | null>;
  /** Energy per connection in Wh (EM-8). */
  flows: Flows;
}

const HOUR = 3_600_000;
const FIVE_MIN = 300_000;
const DAY = 24 * HOUR;
const ROLES: EnergyRole[] = ["solar", "import", "export", "discharge", "charge", "house"];
const SOURCES: ReadonlySet<EnergyRole> = new Set(["solar", "import", "discharge"]);
const ZERO: Readonly<Record<EnergyRole, number>> = {
  solar: 0,
  import: 0,
  export: 0,
  discharge: 0,
  charge: 0,
  house: 0,
};

// ---------------------------------------------------------------------------
// Calendar (EM-1)
// ---------------------------------------------------------------------------

/** Offset of `tz` from UTC at instant `t`, in ms. */
function zoneOffset(t: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(t);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return wall - Math.floor(t / 1000) * 1000;
}

/** The instant of local midnight at the start of a calendar date in `tz`. */
function localMidnight(year: number, month: number, day: number, tz: string): number {
  const guess = Date.UTC(year, month, day);
  // Twice: the offset at the guess can differ from the one at midnight when
  // the clocks change in between.
  const first = guess - zoneOffset(guess, tz);
  return guess - zoneOffset(first, tz);
}

/** Rolling periods: their length in hours. */
const ROLLING: Partial<Record<EnergyPeriod, number>> = { "24h": 24, "7d": 7 * 24, "30d": 30 * 24 };

/** Whether a period rolls with the clock rather than starting on the calendar. */
export function isRolling(period: EnergyPeriod): boolean {
  return ROLLING[period] !== undefined;
}

/**
 * Start of the period that ends now. Calendar periods start at local midnight
 * in Home Assistant's time zone (`firstWeekday`: 0 = Sunday … 6 = Saturday);
 * rolling ones go back their length, up to the next five minutes - exact to
 * what the five-minute statistics hold. Those are kept about ten days, so 30
 * days start on the next full hour: up to an hour short, never made up (EM-1).
 */
export function periodStart(
  period: EnergyPeriod,
  now: number,
  tz: string,
  firstWeekday: number,
): number {
  const hours = ROLLING[period];
  if (hours !== undefined) {
    const step = period === "30d" ? HOUR : FIVE_MIN;
    return Math.ceil((now - hours * HOUR) / step) * step;
  }
  const local = new Date(now + zoneOffset(now, tz));
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  if (period === "month") return localMidnight(year, month, 1, tz);
  if (period === "week") {
    const back = (local.getUTCDay() - firstWeekday + 7) % 7;
    return localMidnight(year, month, day - back, tz);
  }
  return localMidnight(year, month, day, tz);
}

/** 0 normal, 1 muted, 2 amber - by the share of filled time (EM-11). */
export function warnTier(filledShare: number): 0 | 1 | 2 {
  if (filledShare <= 0.02) return 0;
  if (filledShare <= 0.1) return 1;
  return 2;
}

// ---------------------------------------------------------------------------
// Integration
// ---------------------------------------------------------------------------

interface Slot {
  start: number;
  end: number;
  hourly: boolean;
}

type RowIndex = Map<number, number>;

function index(rows: StatRow[] | undefined): RowIndex {
  const map: RowIndex = new Map();
  for (const row of rows ?? []) {
    if (row.mean !== null && Number.isFinite(row.mean)) map.set(row.start, row.mean);
  }
  return map;
}

/**
 * Hours where the hourly statistics reach, five-minute blocks after that up
 * to the last block written (EM-4). A start off the full hour (a time zone
 * like +05:30) is covered by five-minute blocks too.
 */
function slots(from: number, to: number, hourlyEnd: number): Slot[] {
  const out: Slot[] = [];
  let t = from;
  while (t < to) {
    if (t % HOUR === 0 && t + HOUR <= Math.min(to, hourlyEnd)) {
      out.push({ start: t, end: t + HOUR, hourly: true });
      t += HOUR;
    } else {
      const end = Math.min(to, (Math.floor(t / FIVE_MIN) + 1) * FIVE_MIN);
      out.push({ start: t, end, hourly: false });
      t = end;
    }
  }
  return out;
}

class Series {
  readonly hourly: RowIndex;
  readonly fiveMin: RowIndex;
  readonly first: number;

  constructor(hourly: StatRow[] | undefined, fiveMin: StatRow[] | undefined, since?: number) {
    this.hourly = index(hourly);
    this.fiveMin = index(fiveMin);
    this.first = Math.min(
      ...this.hourly.keys(),
      ...this.fiveMin.keys(),
      since ?? Number.POSITIVE_INFINITY,
    );
  }

  get exists(): boolean {
    return Number.isFinite(this.first);
  }

  /** The measured mean of a slot. A five-minute slot without its own row
   *  takes the mean of its hour, which counts as filled. */
  at(slot: Slot): { w: number; filled: boolean } | undefined {
    if (slot.hourly) {
      const w = this.hourly.get(slot.start);
      return w === undefined ? undefined : { w, filled: false };
    }
    const w = this.fiveMin.get(slot.start);
    if (w !== undefined) return { w, filled: false };
    const hour = this.hourly.get(Math.floor(slot.start / HOUR) * HOUR);
    return hour === undefined ? undefined : { w: hour, filled: true };
  }

  /** The mean just before a slot, for the first slot of a period. */
  before(slot: Slot): number | undefined {
    // The hour before - for a five-minute slot off the hour, the hour before
    // the one it lies in (a rolling start, EM-1).
    const hourBefore = Math.floor(slot.start / HOUR) * HOUR - HOUR;
    return slot.hourly
      ? this.hourly.get(slot.start - HOUR)
      : (this.fiveMin.get(slot.start - FIVE_MIN) ?? this.hourly.get(hourBefore));
  }

  /** Same slot a day earlier, else a day later, else zero (EM-10 (2)). */
  neighbour(slot: Slot, to: number): number {
    const map = slot.hourly ? this.hourly : this.fiveMin;
    // A five-minute slot whose neighbours were not fetched (the head of 7
    // days) takes the mean of the neighbouring days' hour.
    const hourOf = (t: number) => this.hourly.get(Math.floor(t / HOUR) * HOUR);
    const before =
      map.get(slot.start - DAY) ?? (slot.hourly ? undefined : hourOf(slot.start - DAY));
    if (before !== undefined) return before;
    if (slot.start + DAY >= to) return 0;
    const after = map.get(slot.start + DAY) ?? (slot.hourly ? undefined : hourOf(slot.start + DAY));
    return after ?? 0;
  }
}

/** The role missing from the balance: sources = sinks (A-1). Unclamped - see the caller. */
function fromBalance(role: EnergyRole, values: Record<EnergyRole, number>): number {
  let sources = 0;
  let sinks = 0;
  for (const r of ROLES) {
    if (r === role) continue;
    if (SOURCES.has(r)) sources += values[r];
    else sinks += values[r];
  }
  return SOURCES.has(role) ? sinks - sources : sources - sinks;
}

export function integrateEnergy(q: EnergyQuery): EnergyResult {
  const series = new Map<string, Series>();
  const get = (id: string): Series => {
    let s = series.get(id);
    if (!s) {
      s = new Series(q.hourly[id], q.fiveMin[id], q.since?.[id]);
      series.set(id, s);
    }
    return s;
  };

  const measured = ROLES.filter((r) => q.roles[r] !== undefined);
  // Solar or house without a sensor comes from the balance (A-1).
  const derived = (["solar", "house"] as EnergyRole[]).find((r) => q.roles[r] === undefined);
  const withData = measured.filter((r) => get(q.roles[r] as string).exists);
  const complete = withData.length === measured.length;

  // The statistics end where the last row ends; later time is not written yet.
  let dataEnd = Number.NEGATIVE_INFINITY;
  let hourlyEnd = Number.NEGATIVE_INFINITY;
  for (const s of [...measured.map((r) => get(q.roles[r] as string)), ...q.consumers.map(get)]) {
    for (const start of s.hourly.keys()) hourlyEnd = Math.max(hourlyEnd, start + HOUR);
    for (const start of s.fiveMin.keys()) dataEnd = Math.max(dataEnd, start + FIVE_MIN);
  }
  dataEnd = Math.max(dataEnd, hourlyEnd);
  const to = Math.max(q.from, Math.min(q.to, dataEnd));

  // The youngest main sensor sets the start, so the balance holds (EM-9).
  const youngest = Math.max(q.from, ...withData.map((r) => get(q.roles[r] as string).first));
  const from = Math.min(youngest, to);
  const span = to - from;
  const list = slots(from, to, hourlyEnd);

  const wh: Record<EnergyRole, number> = { ...ZERO };
  const filledMs: Record<EnergyRole, number> = { ...ZERO };
  const flows: Flows = {};
  let lastSolar: number | undefined;

  for (const slot of list) {
    const hours = (slot.end - slot.start) / HOUR;
    const values: Record<EnergyRole, number> = { ...ZERO };
    const filled = new Set<EnergyRole>();
    const missing: EnergyRole[] = [];

    for (const role of withData) {
      const s = get(q.roles[role] as string);
      const hit = s.at(slot);
      if (hit) {
        values[role] = hit.w;
        if (hit.filled) filled.add(role);
      } else if (
        role === "solar" &&
        (lastSolar ?? s.before(slot) ?? q.pvZeroBelowW) < q.pvZeroBelowW
      ) {
        // Inverters that switch off at night leave no rows: dark, not missing.
        // Only after a dark hour that is known - an unknown one is a gap.
        values.solar = 0;
      } else {
        missing.push(role);
      }
    }

    if (missing.length === 1 && !derived && complete) {
      values[missing[0]] = Math.max(0, fromBalance(missing[0], values));
      filled.add(missing[0]);
    } else {
      for (const role of missing) {
        values[role] = get(q.roles[role] as string).neighbour(slot, to);
        filled.add(role);
      }
    }

    // The derived quantity adds up unclamped, as the card derives it from the
    // period's totals and clamps once (A-2, ENT-4) - node and ring then agree.
    // The flows take the hour as it was, never below zero.
    let derivedRaw = 0;
    if (derived) {
      derivedRaw = fromBalance(derived, values);
      values[derived] = Math.max(0, derivedRaw);
      if (filled.size > 0) filled.add(derived);
    }
    lastSolar = values.solar;

    for (const role of ROLES) {
      wh[role] += (role === derived ? derivedRaw : values[role]) * hours;
      if (filled.has(role)) filledMs[role] += slot.end - slot.start;
    }

    if (complete) {
      const split = splitFlows(
        values.solar,
        values.import,
        values.export,
        values.discharge,
        values.charge,
        values.house,
      );
      for (const [id, w] of Object.entries(split) as [keyof Flows, number][]) {
        flows[id] = (flows[id] ?? 0) + w * hours;
      }
    }
  }

  const main = {} as Record<EnergyRole, SeriesEnergy | null>;
  for (const role of ROLES) {
    const has = role === derived ? complete : withData.includes(role);
    main[role] = has ? { wh: wh[role], filledShare: span > 0 ? filledMs[role] / span : 0 } : null;
  }

  const consumers: Record<string, SeriesEnergy | null> = {};
  for (const id of q.consumers) consumers[id] = consumerEnergy(get(id), list, from, to);

  return { from, to, lateStart: from > q.from, main, consumers, flows };
}

/** A consumer counts from its own start and never shortens the period (EM-12). */
function consumerEnergy(s: Series, list: Slot[], from: number, to: number): SeriesEnergy | null {
  if (!s.exists) return null;
  let wh = 0;
  let filledMs = 0;
  let counted = 0;
  for (const slot of list) {
    if (slot.start < s.first) continue;
    const hit = s.at(slot);
    const w = hit ? hit.w : s.neighbour(slot, to);
    if (!hit || hit.filled) filledMs += slot.end - slot.start;
    wh += (w * (slot.end - slot.start)) / HOUR;
    counted += slot.end - slot.start;
  }
  const result: SeriesEnergy = { wh, filledShare: counted > 0 ? filledMs / counted : 0 };
  if (s.first > from) result.since = s.first;
  return result;
}
