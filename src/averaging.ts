/**
 * Time-weighted moving averages for the view modes.
 * Owner: agent 5. REQ 4.8, V-4 - V-10.
 */
import type { AveragingStatus, HomeAssistant, Sample } from "./types";

/**
 * Per-entity sample cap (REQ V-10).
 *
 * Samples are kept in two parallel Float64Arrays, so one sample costs exactly
 * 16 bytes: 512 x 16 B = 8 KiB per entity, and 100 consumers stay below 1 MB.
 * Spread over the 15 min long window that is one sample every 1.76 s - far more
 * than a 5 s sensor (REQ ENT-8, ~180 samples) ever produces. Past the cap the
 * oldest samples are dropped, so a pathologically chatty entity shortens its own
 * covered window (visible through `status`) instead of growing without bound.
 */
const MAX_SAMPLES = 512;

/** Buffers start small and double up to MAX_SAMPLES; most entities stay tiny. */
const INITIAL_CAPACITY = 32;

/** An unavailable stretch (REQ V-7) - NaN keeps the storage flat and numeric. */
const GAP = Number.NaN;

/** One entity's samples, sorted ascending by timestamp, timestamps unique. */
class EntitySeries {
  private ts: Float64Array = new Float64Array(INITIAL_CAPACITY);
  private vs: Float64Array = new Float64Array(INITIAL_CAPACITY);
  private count = 0;

  get length(): number {
    return this.count;
  }

  oldest(): number | undefined {
    return this.count > 0 ? this.ts[0] : undefined;
  }

  push(t: number, v: number | null): void {
    if (!Number.isFinite(t)) return;
    const value = v === null || !Number.isFinite(v) ? GAP : v;
    // Fast path: the common case is a live value newer than everything held.
    if (this.count === 0 || t > this.ts[this.count - 1]) {
      this.insertAt(this.count, t, value);
      return;
    }
    const i = this.lowerBound(t);
    if (i < this.count && this.ts[i] === t) {
      this.vs[i] = value; // same timestamp must never weigh twice
      return;
    }
    this.insertAt(i, t, value);
  }

  /**
   * Time-weighted mean over `(from, to]` with step-hold semantics: the sample in
   * effect at `from` - the last one at or before it - covers the start of the
   * window, every later sample holds until the next, the last until `to`.
   * Stretches whose value is a gap contribute neither weight nor sum (REQ V-7).
   */
  mean(from: number, to: number): number | null {
    if (this.count === 0 || to <= from) return null;
    let i = this.upperBound(from);
    let held = i > 0 ? this.vs[i - 1] : GAP;
    let last = from;
    let sum = 0;
    let weight = 0;
    for (; i < this.count && this.ts[i] <= to; i++) {
      const t = this.ts[i];
      if (!Number.isNaN(held)) {
        sum += held * (t - last);
        weight += t - last;
      }
      held = this.vs[i];
      last = t;
    }
    if (!Number.isNaN(held)) {
      sum += held * (to - last);
      weight += to - last;
    }
    return weight > 0 ? sum / weight : null;
  }

  /** Keeps the newest sample at or before `cutoff` - it covers the window start. */
  prune(cutoff: number): void {
    const keepFrom = this.upperBound(cutoff) - 1;
    if (keepFrom > 0) this.dropOldest(keepFrom);
  }

  private insertAt(at: number, t: number, v: number): void {
    let index = at;
    if (this.count === this.ts.length) {
      if (this.count < MAX_SAMPLES) {
        this.grow();
      } else {
        // Full: the oldest sample makes room. A sample older than that one has
        // nowhere to go and is dropped.
        if (index === 0) return;
        this.dropOldest(1);
        index--;
      }
    }
    if (index < this.count) {
      this.ts.copyWithin(index + 1, index, this.count);
      this.vs.copyWithin(index + 1, index, this.count);
    }
    this.ts[index] = t;
    this.vs[index] = v;
    this.count++;
  }

  private grow(): void {
    const capacity = Math.min(MAX_SAMPLES, this.ts.length * 2);
    const ts = new Float64Array(capacity);
    const vs = new Float64Array(capacity);
    ts.set(this.ts.subarray(0, this.count));
    vs.set(this.vs.subarray(0, this.count));
    this.ts = ts;
    this.vs = vs;
  }

  private dropOldest(n: number): void {
    this.ts.copyWithin(0, n, this.count);
    this.vs.copyWithin(0, n, this.count);
    this.count -= n;
  }

  /** First index whose timestamp is >= t. */
  private lowerBound(t: number): number {
    let lo = 0;
    let hi = this.count;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ts[mid] < t) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** First index whose timestamp is > t. */
  private upperBound(t: number): number {
    let lo = 0;
    let hi = this.count;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ts[mid] <= t) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
}

/**
 * Ring buffer per entity plus the window mean over it.
 *
 * Values are held step-wise: a sample is in effect from its timestamp until the
 * next one, the last one until `now`. Unavailable stretches carry no weight
 * (REQ V-7) - they are not interpolated over.
 */
export class AveragingBuffer {
  private readonly windowMs: number;
  private readonly series = new Map<string, EntitySeries>();

  /** `windowMs` is the long window; older samples are dropped (REQ V-10). */
  constructor(windowMs: number) {
    this.windowMs = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 0;
  }

  /** Records a value for one entity. `null` marks unavailable. */
  push(entityId: string, t: number, v: number | null): void {
    let series = this.series.get(entityId);
    if (series === undefined) {
      series = new EntitySeries();
      this.series.set(entityId, series);
    }
    series.push(t, v);
  }

  /**
   * Time-weighted mean over (now - windowMs, now], or null when nothing in the
   * window was available (REQ 4.8).
   */
  mean(entityId: string, windowMs: number, now: number): number | null {
    const series = this.series.get(entityId);
    if (series === undefined) return null;
    return series.mean(now - windowMs, now);
  }

  status(now: number): AveragingStatus {
    const cutoff = now - this.windowMs;
    let since: number | undefined;
    // Conservative: the window counts as covered only once *every* entity
    // reaches back past it, so a consumer added late is not silently averaged
    // over a shorter span than the others.
    //
    // `since` is therefore the *newest* first sample, not the oldest: the mean
    // is valid from the moment the last entity joined. A sensor that has not
    // changed since yesterday holds a sample from yesterday - the value is
    // known all along, and that timestamp says nothing about coverage.
    let complete = this.series.size > 0;
    for (const series of this.series.values()) {
      const oldest = series.oldest();
      if (oldest === undefined) {
        complete = false;
        continue;
      }
      if (since === undefined || oldest > since) since = oldest;
      if (oldest > cutoff) complete = false;
    }
    if (since === undefined) return { complete: false };
    return { complete, since };
  }

  /** Drops everything older than the window - called on every tick. */
  prune(now: number): void {
    const cutoff = now - this.windowMs;
    for (const series of this.series.values()) series.prune(cutoff);
  }

  /** Samples currently held for one entity. Exposed for the memory bound (V-10). */
  sampleCount(entityId: string): number {
    return this.series.get(entityId)?.length ?? 0;
  }
}

/** One point of a `history/history_during_period` response, minimal_response. */
interface HistoryPoint {
  /** State as a string, in the entity's own unit. */
  s?: unknown;
  /** last_updated in SECONDS since the epoch - not milliseconds. */
  lu?: unknown;
}

function toValue(state: unknown): number | null {
  if (typeof state !== "string") return null;
  const n = Number.parseFloat(state);
  // Covers "unavailable", "unknown" and anything else non-numeric (REQ V-7).
  return Number.isFinite(n) ? n : null;
}

function toSample(raw: unknown): Sample | null {
  if (raw === null || typeof raw !== "object") return null;
  const { s, lu } = raw as HistoryPoint;
  if (typeof lu !== "number" || !Number.isFinite(lu)) return null;
  return { t: Math.round(lu * 1000), v: toValue(s) };
}

/**
 * Fetches recent history for all entities in one call and returns it per entity.
 * Rejects after `timeoutMs` so a slow recorder cannot hold up the card (REQ V-6).
 *
 * The returned values are the raw numbers of the recorder, i.e. in each entity's
 * own unit of measurement. Normalising them to watts is the model's job (REQ 4.1,
 * K-8); this function deliberately does not know about units.
 *
 * Entities the recorder does not answer for are simply missing from the result -
 * a single unknown entity must not fail the whole prefill.
 */
export async function fetchHistory(
  hass: HomeAssistant,
  entityIds: string[],
  minutes: number,
  timeoutMs = 5000,
): Promise<Record<string, Sample[]>> {
  const result: Record<string, Sample[]> = {};
  if (entityIds.length === 0) return result;

  const endTime = Date.now();
  const startTime = endTime - minutes * 60_000;
  const request = hass.callWS<unknown>({
    type: "history/history_during_period",
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    entity_ids: entityIds,
    minimal_response: true,
    no_attributes: true,
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          `EnerLens: history/history_during_period did not answer within ${timeoutMs} ms ` +
            `(${entityIds.length} entities, ${minutes} min) - falling back to live buffering`,
        ),
      );
    }, timeoutMs);
  });

  let response: unknown;
  try {
    response = await Promise.race([request, timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }

  if (response === null || typeof response !== "object") return result;
  const byEntity = response as Record<string, unknown>;
  for (const entityId of entityIds) {
    const points = byEntity[entityId];
    if (!Array.isArray(points)) continue;
    const samples: Sample[] = [];
    for (const raw of points) {
      const sample = toSample(raw);
      if (sample !== null) samples.push(sample);
    }
    samples.sort((a, b) => a.t - b.t);
    result[entityId] = samples;
  }
  return result;
}
