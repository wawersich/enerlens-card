/**
 * The history line's data (REQ LZ-18): a small picture of a row's power over
 * the last hours, a mini preview, not a measurement. Pure functions on a grid
 * of five minutes in UTC - the grid HA writes its statistics on - so time
 * zone and daylight saving change nothing: the hours are a duration.
 *
 * A line is one value per step in watts, the oldest first, the running step
 * last; null is a step without a value.
 */
import type { HistoryHours } from "./types";

export const STEP_MS = 5 * 60_000;

export type Line = (number | null)[];

/** The first step of a window of `hours` that ends with the running step. */
export function windowStart(now: number, hours: HistoryHours): number {
  return Math.floor(now / STEP_MS) * STEP_MS - (hours * 12 - 1) * STEP_MS;
}

/** HA's five-minute rows on the grid, in watts as given; steps without a row stay empty. */
export function fromRows(
  rows: readonly { start: number; mean: number | null }[],
  start: number,
  count: number,
): Line {
  const line: Line = new Array(count).fill(null);
  for (const row of rows) {
    const i = Math.round((row.start - start) / STEP_MS);
    if (i < 0 || i >= count || row.mean === null || !Number.isFinite(row.mean)) continue;
    line[i] = row.mean;
  }
  return line;
}

/**
 * Readings as the mean of each step by time, from `from` up to `until`: a
 * reading holds until the next, a stretch without a value weighs nothing, a
 * step with no weight at all stays empty (4.8). Steps before `from` are left
 * empty for HA's rows to fill.
 */
export function fromReadings(
  samples: readonly { t: number; v: number | null }[],
  start: number,
  count: number,
  from: number,
  until: number,
): Line {
  const line: Line = new Array(count).fill(null);
  // One sweep: the readings in time order, a pointer walking along the steps.
  const sorted = samples.every((s, i) => i === 0 || samples[i - 1].t <= s.t)
    ? samples
    : [...samples].sort((a, b) => a.t - b.t);
  let k = -1;
  for (let i = 0; i < count; i++) {
    const a = Math.max(start + i * STEP_MS, from);
    const b = Math.min(start + (i + 1) * STEP_MS, until);
    if (b <= a) continue;
    // The value in effect at a.
    while (k + 1 < sorted.length && sorted[k + 1].t <= a) k++;
    let sum = 0;
    let weight = 0;
    let at = a;
    let value = k >= 0 ? sorted[k].v : null;
    let j = k + 1;
    for (;;) {
      const next = j < sorted.length && sorted[j].t < b ? sorted[j].t : b;
      if (next > at && value !== null && Number.isFinite(value)) {
        sum += value * (next - at);
        weight += next - at;
      }
      if (next >= b) break;
      at = next;
      value = sorted[j].v;
      j++;
    }
    line[i] = weight > 0 ? sum / weight : null;
  }
  return line;
}

/** HA's rows first, readings where they have none. */
export function joinLines(rows: Line, readings: Line): Line {
  return rows.map((v, i) => v ?? readings[i] ?? null);
}

/**
 * The rest as the detail window has it (DF-18): the house - with what is fed
 * in past its meter (PV-3) - minus the consumers shown; a consumer or source
 * without a value counts 0, a house without one is a gap.
 */
export function restLine(house: Line, consumers: readonly Line[], excluded: readonly Line[]): Line {
  return house.map((h, i) => {
    if (h === null) return null;
    const plus = excluded.reduce<number>((sum, line) => sum + (line[i] ?? 0), 0);
    const minus = consumers.reduce<number>((sum, line) => sum + (line[i] ?? 0), 0);
    return h + plus - minus;
  });
}

/**
 * A PV source without a value is 0, as at the node (DF-17, PV-2): at night
 * the line lies on zero whether zeros came or nothing (Markus 17.11.2026),
 * also when nothing came in the whole window.
 */
export function zeroGaps(line: Line): Line {
  return line.map((v) => v ?? 0);
}

export interface LineShape {
  /** Runs of points, parted at gaps: x 0 (oldest) to 1 (now), y 0 to 1 of the scale. */
  segments: [number, number][][];
  /** The highest step, in watts - what the tooltip names. */
  max: number;
  /** Nothing ran above the row's threshold: a flat line on zero. */
  flat: boolean;
}

/**
 * The line on its own scale, 0 to its highest step; negative counts as 0.
 * Below the row's own threshold nothing is said to have run: flat on zero.
 */
export function shapeLine(line: Line, threshold: number): LineShape {
  const n = line.length;
  const values = line.map((v) => (v === null || !Number.isFinite(v) ? null : Math.max(0, v)));
  const max = values.reduce<number>((m, v) => (v !== null && v > m ? v : m), 0);
  const flat = max < threshold || max <= 0;
  const segments: [number, number][][] = [];
  let run: [number, number][] | undefined;
  values.forEach((v, i) => {
    if (v === null) {
      run = undefined;
      return;
    }
    if (!run) {
      run = [];
      segments.push(run);
    }
    run.push([n > 1 ? i / (n - 1) : 1, flat ? 0 : v / max]);
  });
  return { segments, max, flat };
}
