import { describe, expect, it } from "vitest";
import {
  STEP_MS,
  fromReadings,
  fromRows,
  joinLines,
  restLine,
  shapeLine,
  windowStart,
  zeroGaps,
} from "../src/history-line";

/*
 * The history line's data (REQ LZ-18): a grid of five minutes in UTC, HA's
 * five-minute statistics, readings where those are missing or late, the rest
 * as the detail window has it (DF-18), PV sources at 0 without a value.
 */

const T0 = Date.UTC(2026, 10, 17, 9, 0, 0);

describe("the grid", () => {
  it("hours × 12 five-minute steps, the running one last, on HA's UTC grid", () => {
    const now = T0 + 2 * 60_000 + 7_000; // 09:02:07
    const start = windowStart(now, 12);
    expect(start % STEP_MS).toBe(0);
    expect((T0 - start) / STEP_MS).toBe(143);
    expect(windowStart(now, 3)).toBe(T0 - 35 * STEP_MS);
  });
});

describe("HA's five-minute rows", () => {
  it("land on their step, in watts as given; missing steps stay empty", () => {
    const start = T0;
    const line = fromRows(
      [
        { start: T0, mean: 100 },
        { start: T0 + 2 * STEP_MS, mean: 300 },
        { start: T0 - STEP_MS, mean: 999 }, // before the window
      ],
      start,
      4,
    );
    expect(line).toEqual([100, null, 300, null]);
  });
});

describe("readings", () => {
  it("are averaged over each step by time, holding a value until the next", () => {
    // 0 W from the start, 600 W from the middle of the first step.
    const line = fromReadings(
      [
        { t: T0, v: 0 },
        { t: T0 + STEP_MS / 2, v: 600 },
      ],
      T0,
      2,
      T0,
      T0 + 2 * STEP_MS,
    );
    expect(line[0]).toBeCloseTo(300);
    expect(line[1]).toBeCloseTo(600);
  });

  it("a stretch without a value weighs nothing; a step with none stays empty", () => {
    const line = fromReadings(
      [
        { t: T0, v: 200 },
        { t: T0 + STEP_MS / 2, v: null },
        { t: T0 + 2 * STEP_MS, v: 400 },
      ],
      T0,
      3,
      T0,
      T0 + 3 * STEP_MS,
    );
    expect(line[0]).toBeCloseTo(200);
    expect(line[1]).toBeNull();
    expect(line[2]).toBeCloseTo(400);
  });

  it("fill only from where they are asked for, and the running step up to now", () => {
    const now = T0 + STEP_MS + 60_000;
    const line = fromReadings([{ t: T0 - STEP_MS, v: 50 }], T0, 2, T0 + STEP_MS, now);
    expect(line[0]).toBeNull();
    expect(line[1]).toBeCloseTo(50);
  });
});

describe("joining", () => {
  it("HA's rows first, readings where they have none", () => {
    expect(joinLines([1, null, null], [9, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe("the rest (DF-18)", () => {
  it("house minus the consumers shown; a consumer without a value counts 0", () => {
    const rest = restLine(
      [1000, 800, null],
      [
        [300, null, 100],
        [200, 200, 200],
      ],
      [],
    );
    expect(rest).toEqual([500, 600, null]);
  });

  it("PV fed in past the house meter adds to the house (PV-3)", () => {
    expect(restLine([1000], [[300]], [[200]])).toEqual([900]);
  });
});

describe("PV rows (DF-17)", () => {
  it("a source without a value is 0 - from its first value on", () => {
    expect(zeroGaps([null, 5, null, 7])).toEqual([null, 5, 0, 7]);
  });

  it("a source without any value has no line", () => {
    expect(zeroGaps([null, null])).toBeUndefined();
  });
});

describe("the shape", () => {
  it("own scale from 0 to the highest step; negative counts as 0", () => {
    const s = shapeLine([0, 500, 1000, -50], 10);
    expect(s.max).toBe(1000);
    expect(s.segments).toHaveLength(1);
    expect(s.segments[0].map(([, y]) => y)).toEqual([0, 0.5, 1, 0]);
    expect(s.segments[0][0][0]).toBe(0);
    expect(s.segments[0].at(-1)?.[0]).toBe(1);
  });

  it("flat on zero while nothing ran above the row's threshold", () => {
    const s = shapeLine([2, 5, 3], 25);
    expect(s.flat).toBe(true);
    expect(s.segments[0].every(([, y]) => y === 0)).toBe(true);
  });

  it("gaps part the line; it begins at its first value, not stretched", () => {
    const s = shapeLine([null, null, 100, null, 200], 10);
    expect(s.segments).toHaveLength(2);
    expect(s.segments[0][0][0]).toBe(0.5);
    expect(s.segments[1][0][0]).toBe(1);
  });

  it("nothing at all: no segments", () => {
    expect(shapeLine([null, null], 10).segments).toHaveLength(0);
  });
});
