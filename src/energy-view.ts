/**
 * The energy mode between Home Assistant and the drawing (REQ 2.15): asks the
 * recorder for the statistics of a period, hands them to the pure integration
 * in energy.ts and turns the result into what the card already draws - mean
 * watts over the period, which the model, the list, the ring and the dots
 * take as they are.
 */
import {
  type EnergyResult,
  type EnergyRole,
  type StatRow,
  integrateEnergy,
  periodStart,
  warnTier,
} from "./energy";
import { localize } from "./localize";
import type {
  Config,
  EnergyMark,
  EnergyMarks,
  EnergyPeriod,
  Flows,
  HomeAssistant,
  PowerUnit,
  SourceSpec,
} from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** One period as the card shows it. */
export interface EnergyView {
  period: EnergyPeriod;
  /** Start actually counted (EM-9) and end of the statistics. */
  from: number;
  to: number;
  lateStart: boolean;
  /** Length of the counted period; figures are means over it. */
  hours: number;
  /** Mean power of an entity over the period, in its own sign; null = no statistics. */
  meanW: (entityId: string) => number | null;
  /** Energy per connection as a mean over the period (EM-8). */
  flowsW: Flows;
  marks: EnergyMarks;
  /** When this view was fetched, for the five-minute refresh (EM-4). */
  fetchedAt: number;
  /** The calendar start it was fetched for; a new day makes it stale. */
  start: number;
}

interface Roles {
  roles: Partial<Record<EnergyRole, string>>;
  /** Single sensors with `invert`: their rows are turned before integrating. */
  inverted: Set<string>;
}

function rolesOf(config: Config): Roles {
  const roles: Partial<Record<EnergyRole, string>> = {};
  const inverted = new Set<string>();
  const single = (role: EnergyRole, spec: SourceSpec) => {
    if (spec.kind !== "single") return;
    roles[role] = spec.entity;
    if (spec.invert) inverted.add(spec.entity);
  };
  const { solar, grid, battery, house } = config.sources;
  single("solar", solar);
  single("house", house);
  if (grid.kind === "split") {
    roles.import = grid.positive;
    roles.export = grid.negative;
  }
  if (battery.kind === "split") {
    roles.discharge = battery.positive;
    roles.charge = battery.negative;
  }
  return { roles, inverted };
}

/** What a fetched period depends on; a different key means a new fetch (EM-14). */
export function energyKey(config: Config): string {
  const { roles, inverted } = rolesOf(config);
  return JSON.stringify([
    roles,
    [...inverted],
    config.consumers.map((c) => c.entity),
    config.flow.minW,
  ]);
}

/** Every entity a period needs, in a stable order - a new list means a new fetch. */
export function energyEntities(config: Config): string[] {
  const { roles } = rolesOf(config);
  const ids = [...Object.values(roles), ...config.consumers.map((c) => c.entity)];
  return [...new Set(ids)];
}

function rowsOf(
  response: unknown,
  ids: string[],
  inverted: Set<string>,
): Record<string, StatRow[]> {
  const out: Record<string, StatRow[]> = {};
  if (!response || typeof response !== "object") return out;
  const byId = response as Record<string, unknown>;
  for (const id of ids) {
    const rows = byId[id];
    if (!Array.isArray(rows)) continue;
    const sign = inverted.has(id) ? -1 : 1;
    out[id] = rows.flatMap((row) => {
      const r = row as { start?: unknown; mean?: unknown };
      const start = typeof r.start === "number" ? r.start : Date.parse(String(r.start));
      const mean = typeof r.mean === "number" ? sign * r.mean : null;
      return Number.isFinite(start) ? [{ start, mean }] : [];
    });
  }
  return out;
}

async function statistics(
  hass: HomeAssistant,
  period: "hour" | "5minute" | "day",
  start: number,
  ids: string[],
  timeoutMs: number,
): Promise<unknown> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () =>
        reject(new Error(`EnerLens: statistics (${period}) did not answer within ${timeoutMs} ms`)),
      timeoutMs,
    );
  });
  try {
    return await Promise.race([
      hass.callWS<unknown>({
        type: "recorder/statistics_during_period",
        start_time: new Date(start).toISOString(),
        statistic_ids: ids,
        period,
        types: ["mean"],
        units: { power: "W" },
      }),
      timeout,
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** HA's first weekday as 0 = Sunday … 6 = Saturday; "language" asks the locale. */
export function firstWeekday(hass: HomeAssistant): number {
  const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const set = hass.locale?.first_weekday;
  const index = set ? names.indexOf(set) : -1;
  if (index >= 0) return index;
  try {
    const info = new Intl.Locale(hass.locale?.language ?? hass.language ?? "en") as unknown as {
      weekInfo?: { firstDay: number };
      getWeekInfo?: () => { firstDay: number };
    };
    const day = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (day) return day % 7;
  } catch {
    // Older browsers: Monday, as most of the world.
  }
  return 1;
}

/** The zone Home Assistant shows times in, as its own frontend resolves it. */
export function timeZoneOf(hass: HomeAssistant): string {
  const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (hass.locale?.time_zone === "local") return browser;
  return hass.config?.time_zone ?? browser;
}

/** How far back a sensor's daily rows are looked at to tell a gap from a start. */
const SINCE_DAYS = 32;

/**
 * Sensors with a daily row before the hourly window are older than it: hours
 * they miss there are gaps, not a late start (EM-9, EM-10). Only the first row
 * counts, and only when it lies before the window.
 */
function sinceOf(daily: Record<string, StatRow[]>, windowStart: number): Record<string, number> {
  const since: Record<string, number> = {};
  for (const [id, rows] of Object.entries(daily)) {
    const first = Math.min(...rows.map((r) => r.start));
    if (first < windowStart) since[id] = first;
  }
  return since;
}

/**
 * Fetches and integrates one period: hourly rows from a day before its start
 * (late start, the day before for gaps), five-minute rows from a day before
 * the running hour, and daily rows from a month before, to tell a sensor that
 * had a day off from one that is new.
 */
export async function fetchEnergy(
  hass: HomeAssistant,
  config: Config,
  period: EnergyPeriod,
  now = Date.now(),
  timeoutMs = 10_000,
): Promise<EnergyView> {
  const { roles, inverted } = rolesOf(config);
  const ids = energyEntities(config);
  const from = periodStart(period, now, timeZoneOf(hass), firstWeekday(hass));
  const hourStart = Math.floor(now / HOUR) * HOUR;
  const [hourly, fiveMin, daily] = await Promise.all([
    statistics(hass, "hour", from - DAY, ids, timeoutMs),
    statistics(hass, "5minute", hourStart - DAY, ids, timeoutMs),
    statistics(hass, "day", from - SINCE_DAYS * DAY, ids, timeoutMs),
  ]);
  const result = integrateEnergy({
    from,
    to: now,
    roles,
    consumers: config.consumers.map((c) => c.entity),
    hourly: rowsOf(hourly, ids, inverted),
    fiveMin: rowsOf(fiveMin, ids, inverted),
    pvZeroBelowW: config.flow.minW,
    since: sinceOf(rowsOf(daily, ids, inverted), from - DAY),
  });
  return toView(result, period, roles, inverted, hass, now, from);
}

function percent(share: number, hass: HomeAssistant): string {
  return new Intl.NumberFormat(hass.locale?.language ?? hass.language, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(Math.max(share, 0.01));
}

export function formatDay(t: number, hass: HomeAssistant, withTime = false): string {
  return new Intl.DateTimeFormat(hass.locale?.language ?? hass.language, {
    timeZone: timeZoneOf(hass),
    day: "numeric",
    month: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(t);
}

export function toView(
  result: EnergyResult,
  period: EnergyPeriod,
  roles: Partial<Record<EnergyRole, string>>,
  inverted: Set<string>,
  hass: HomeAssistant,
  now: number,
  start = result.from,
): EnergyView {
  // Right after midnight a period is minutes long; a floor keeps the means sane.
  const hours = Math.max((result.to - result.from) / HOUR, 1 / 12);
  const wh = new Map<string, number | null>();
  for (const [role, id] of Object.entries(roles) as [EnergyRole, string][]) {
    const value = result.main[role]?.wh;
    // An inverted sensor's rows were turned; the model turns them back.
    wh.set(id, value === undefined ? null : inverted.has(id) ? -value : value);
  }
  for (const [id, value] of Object.entries(result.consumers)) wh.set(id, value?.wh ?? null);

  const filled = (share: number): EnergyMark => {
    const tier = warnTier(share);
    return {
      tier,
      note: tier > 0 ? localize("energy.filled", hass, { percent: percent(share, hass) }) : "",
    };
  };
  const roleMarks: Record<string, EnergyMark> = {};
  for (const role of Object.keys(result.main) as EnergyRole[]) {
    const r = result.main[role];
    roleMarks[role] = r ? filled(r.filledShare) : { tier: 0, note: "" };
  }
  const consumers: Record<string, EnergyMark> = {};
  const restNotes: string[] = [];
  let restTier = roleMarks.house?.tier ?? 0;
  for (const [id, r] of Object.entries(result.consumers)) {
    let mark: EnergyMark;
    if (!r) mark = { tier: 2, note: localize("energy.none", hass) };
    else if (r.since !== undefined) {
      mark = { tier: 2, note: localize("energy.since", hass, { date: formatDay(r.since, hass) }) };
    } else mark = filled(r.filledShare);
    consumers[id] = mark;
    restTier = Math.max(restTier, mark.tier) as 0 | 1 | 2;
    if (mark.tier === 2) restNotes.push(id);
  }
  // A consumer counted only in part, or not at all, leaves its share in the
  // remainder (EM-12).
  const rest: EnergyMark = {
    tier: restTier,
    note: restTier > 0 ? localize("energy.rest", hass) : "",
  };

  const flowsW: Flows = {};
  for (const [id, value] of Object.entries(result.flows) as [keyof Flows, number][]) {
    flowsW[id] = value / hours;
  }
  return {
    period,
    from: result.from,
    to: result.to,
    lateStart: result.lateStart,
    hours,
    meanW: (id) => {
      const value = wh.get(id);
      return value === undefined || value === null ? null : value / hours;
    },
    flowsW,
    marks: { roles: roleMarks, consumers, rest },
    fetchedAt: now,
    start,
  };
}

/**
 * The configuration as the energy mode draws it: figures as kWh, and the list
 * filter taken as W x 1 h (EM-7) - over a period of `hours`, a mean of
 * W / hours. The dots keep their thresholds as they are: they run on the mean
 * power over the period, energy divided by the time it took, which is what
 * those thresholds were made for (EM-8, Markus 20.10.2026).
 */
export function energyConfig(config: Config, view: EnergyView | undefined): Config {
  const hours = view?.hours ?? 1;
  const k = 1 / hours;
  return {
    ...config,
    power: { ...config.power, energyHours: hours },
    minConsumerW: config.minConsumerW * k,
    consumers: config.consumers.map((c) => (c.minW === undefined ? c : { ...c, minW: c.minW * k })),
    energy: view?.marks ?? { roles: {}, consumers: {}, rest: { tier: 0, note: "" } },
  };
}

/**
 * Chip text: the period, with "from <date>" after a late start (EM-9). The
 * power view is named by its unit - "W" where the card writes whole watts,
 * "kW" otherwise, also for "auto", whose figures mix both (EM-2).
 */
export function energyChipLabel(
  period: EnergyPeriod | null,
  view: EnergyView | undefined,
  hass: HomeAssistant,
  unit: PowerUnit = "kW",
): string {
  if (!period) return unit === "W" ? "W" : "kW";
  const name = localize(`energy.${period}`, hass);
  if (!view?.lateStart || view.period !== period) return name;
  return localize("energy.from", hass, {
    period: name,
    date: formatDay(view.from, hass, period === "day"),
  });
}
