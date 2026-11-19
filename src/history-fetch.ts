/**
 * Where the history line's data comes from (REQ LZ-18): HA's five-minute
 * statistics, the readings where a sensor has none, and the readings after
 * HA's latest five minutes, which it writes 5-10 minutes late (DF-22).
 *
 * Kept per entity and fetched incrementally: the whole window once, then
 * every five minutes only what is new. One request at a time; an answer for
 * an older set of entities or hours is dropped.
 */
import { fetchHistory } from "./averaging";
import { type Line, STEP_MS, fromReadings, fromRows, joinLines, windowStart } from "./history-line";
import { POWER_UNITS, readPowerW } from "./model";
import type { HistoryHours, HomeAssistant } from "./types";

/** The readings after HA's latest row reach back at most this far (DF-22). */
const LIVE_MAX_MS = 15 * 60_000;
/** Asked again this long after a five-minute boundary, when HA may have written it. */
export const REFRESH_DELAY_MS = 30_000;
const TIMEOUT_MS = 10_000;

interface Held {
  /** HA's rows: step start → mean in watts. */
  rows: Map<number, number | null>;
  /** Readings in watts, oldest first. */
  readings: { t: number; v: number | null }[];
}

/** A reading's factor to watts, as the card reads the value (K-8); undefined: no power. */
export function wattsFactor(hass: HomeAssistant, entity: string): number | undefined {
  const attrs = hass.states?.[entity]?.attributes;
  const unit = attrs?.unit_of_measurement;
  if (typeof unit === "string" && unit !== "") return POWER_UNITS[unit];
  return attrs?.device_class === "power" ? 1 : undefined;
}

function keyOf(ids: string[], hours: HistoryHours): string {
  return `${hours}|${[...ids].sort().join(",")}`;
}

function withTimeout<T>(request: Promise<T>, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`EnerLens: ${what} did not answer within ${TIMEOUT_MS} ms`)),
      TIMEOUT_MS,
    );
  });
  return Promise.race([request, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

export class HistoryLines {
  private held = new Map<string, Held>();
  /** Entities with statistics (mean, power), and every one asked about. */
  private withRows = new Set<string>();
  private asked = new Set<string>();
  private key = "";
  private hours: HistoryHours = 12;
  private busy = false;
  /** When the last fetch finished - the next one starts from there. */
  private fetchedAt = 0;
  /** After a failure: not again before this, waiting longer each time. */
  private retryAt = 0;
  private retryMs = 0;
  /** Something new arrived, or all was dropped: the lines must be drawn again. */
  version = 0;

  /** Fetched at least once for exactly these entities and hours. */
  has(ids: string[], hours: HistoryHours): boolean {
    return this.fetchedAt > 0 && keyOf(ids, hours) === this.key;
  }

  /**
   * Whether a fetch is due: for other entities or hours, never fetched, or
   * not since HA's latest five minutes were written - and not while waiting
   * after a failure.
   */
  due(now: number, ids?: string[], hours?: HistoryHours): boolean {
    if (ids && hours && keyOf(ids, hours) !== this.key) return true;
    if (now < this.retryAt) return false;
    if (this.fetchedAt === 0) return true;
    const boundary = Math.floor((now - REFRESH_DELAY_MS) / STEP_MS) * STEP_MS + REFRESH_DELAY_MS;
    return this.fetchedAt < boundary;
  }

  /**
   * Fetches what is missing for `ids` over `hours`. A new set of entities or
   * hours starts over; otherwise only what came since the last fetch.
   */
  async refresh(
    hass: HomeAssistant,
    ids: string[],
    hours: HistoryHours,
    now: number,
  ): Promise<void> {
    if (typeof hass.callWS !== "function") return;
    const key = keyOf(ids, hours);
    if (key !== this.key) {
      this.key = key;
      this.hours = hours;
      this.held = new Map();
      this.withRows = new Set();
      this.asked = new Set();
      this.fetchedAt = 0;
      this.retryAt = 0;
      this.retryMs = 0;
      this.version++;
    }
    if (this.busy || ids.length === 0 || now < this.retryAt) return;
    this.busy = true;
    const asked = key;
    try {
      // Only what reads as power gets a line (readPowerW).
      const power = ids.filter((id) => wattsFactor(hass, id) !== undefined);
      // Metadata for every power sensor not asked about yet - also one that
      // only turned up after the first fetch.
      const fresh = power.filter((id) => !this.asked.has(id));
      if (fresh.length) {
        const meta = await this.metadata(hass, fresh);
        if (asked !== this.key) return;
        for (const id of fresh) {
          this.asked.add(id);
          if (meta.has(id)) this.withRows.add(id);
        }
      }
      const start = windowStart(now, hours);
      const first = this.fetchedAt === 0;
      const stats = power.filter((id) => this.withRows.has(id));
      const plain = power.filter((id) => !this.withRows.has(id));
      // HA's rows: the window once, then from a little before the latest row.
      const latest = this.latestRow();
      const rowsFrom = first
        ? start
        : Math.max(start, latest > 0 ? latest - LIVE_MAX_MS - STEP_MS : this.fetchedAt - STEP_MS);
      const rows = stats.length ? await this.rows(hass, stats, rowsFrom, now) : {};
      if (asked !== this.key) return;
      // Readings: for the sensors with rows only after their latest row (at
      // most 15 minutes, DF-22); for the others the window once, then since
      // the last fetch.
      const plainFrom = first ? start : this.fetchedAt - STEP_MS;
      const tailFrom = now - LIVE_MAX_MS - STEP_MS;
      const minutes = (from: number) => Math.ceil((now - from) / 60_000) + 1;
      const [tail, own] = await Promise.all([
        stats.length
          ? withTimeout(fetchHistory(hass, stats, minutes(tailFrom), TIMEOUT_MS), "history")
          : Promise.resolve({} as Record<string, { t: number; v: number | null }[]>),
        plain.length
          ? withTimeout(fetchHistory(hass, plain, minutes(plainFrom), TIMEOUT_MS), "history")
          : Promise.resolve({} as Record<string, { t: number; v: number | null }[]>),
      ]);
      if (asked !== this.key) return;
      for (const id of power) {
        const held = this.held.get(id) ?? { rows: new Map(), readings: [] };
        for (const r of rows[id] ?? []) held.rows.set(r.start, r.mean);
        const factor = wattsFactor(hass, id) ?? 1;
        const got = (tail[id] ?? own[id] ?? [])
          .map((s) => ({ t: s.t, v: s.v === null ? null : s.v * factor }))
          .sort((a, b) => a.t - b.t);
        const since = got.length ? got[0].t : Number.POSITIVE_INFINITY;
        held.readings = [...held.readings.filter((s) => s.t < since), ...got];
        // What fell out of the window goes; the reading in effect at its start stays.
        for (const t of held.rows.keys()) if (t < start) held.rows.delete(t);
        const keep = held.readings.findIndex((s) => s.t >= start);
        if (keep > 1) held.readings = held.readings.slice(keep - 1);
        this.held.set(id, held);
      }
      this.fetchedAt = now;
      this.retryMs = 0;
      this.version++;
    } catch (error) {
      // Not on every tick: a minute, then twice as long each time, up to five.
      this.retryMs = Math.min(5 * 60_000, Math.max(60_000, this.retryMs * 2));
      this.retryAt = now + this.retryMs;
      console.warn(error);
    } finally {
      this.busy = false;
    }
  }

  /**
   * The entity's line over the window ending now, its live state the last
   * reading. `invert`: the sensor counts the other way round, as its live
   * value is read (a PV source with `invert`). A sensor with rows gets the
   * readings after them only while those rows are recent (DF-22): rows that
   * stopped long ago end in a gap, not in a held value.
   */
  line(hass: HomeAssistant, id: string, now: number, invert = false): Line | undefined {
    const held = this.held.get(id);
    if (!held) return undefined;
    const start = windowStart(now, this.hours);
    const count = this.hours * 12;
    const rows = fromRows(
      [...held.rows].map(([s, mean]) => ({ start: s, mean })),
      start,
      count,
    );
    let line = rows;
    const live = hass.states?.[id];
    const at = Date.parse(live?.last_changed ?? "");
    const readings =
      Number.isFinite(at) && live
        ? [
            ...held.readings.filter((s) => s.t < at),
            { t: Math.min(at, now), v: readPowerW(hass, id) },
          ]
        : held.readings;
    if (this.withRows.has(id)) {
      const rowsEnd = Math.max(start, ...[...held.rows.keys()].map((s) => s + STEP_MS));
      if (rowsEnd >= now - LIVE_MAX_MS)
        line = joinLines(rows, fromReadings(readings, start, count, rowsEnd, now));
    } else {
      line = fromReadings(readings, start, count, start, now);
    }
    return invert ? line.map((v) => (v === null ? null : -v)) : line;
  }

  private latestRow(): number {
    let latest = 0;
    for (const held of this.held.values())
      for (const t of held.rows.keys()) if (t > latest) latest = t;
    return latest;
  }

  private async metadata(hass: HomeAssistant, ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows = await withTimeout(
      hass.callWS<unknown>({ type: "recorder/get_statistics_metadata", statistic_ids: ids }),
      "statistics metadata",
    );
    if (!Array.isArray(rows)) return new Set();
    return new Set(
      rows
        .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
        .filter((r) => (r.mean_type === 1 || r.has_mean === true) && r.unit_class === "power")
        .map((r) => String(r.statistic_id)),
    );
  }

  private async rows(
    hass: HomeAssistant,
    ids: string[],
    from: number,
    now: number,
  ): Promise<Record<string, { start: number; mean: number | null }[]>> {
    const response = await withTimeout(
      hass.callWS<unknown>({
        type: "recorder/statistics_during_period",
        start_time: new Date(from).toISOString(),
        end_time: new Date(now).toISOString(),
        statistic_ids: ids,
        period: "5minute",
        types: ["mean"],
        units: { power: "W" },
      }),
      "statistics",
    );
    const out: Record<string, { start: number; mean: number | null }[]> = {};
    if (!response || typeof response !== "object") return out;
    for (const id of ids) {
      const list = (response as Record<string, unknown>)[id];
      if (!Array.isArray(list)) continue;
      out[id] = list.flatMap((row) => {
        const r = row as { start?: unknown; mean?: unknown };
        const start = typeof r.start === "number" ? r.start : Date.parse(String(r.start));
        const mean = typeof r.mean === "number" ? r.mean : null;
        return Number.isFinite(start) ? [{ start, mean }] : [];
      });
    }
    return out;
  }
}
