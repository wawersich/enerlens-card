import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { AveragingBuffer, fetchHistory } from "../src/averaging";
import type { HomeAssistant, Sample } from "../src/types";

const MIN = 60_000;
const T0 = Date.parse("2026-09-05T12:00:00Z");

/** Feeds `[t, v]` pairs relative to T0, in the order given. */
function fill(buffer: AveragingBuffer, entity: string, samples: [number, number | null][]): void {
  for (const [offset, v] of samples) buffer.push(entity, T0 + offset, v);
}

// ---------------------------------------------------------------------------
// Group 1 - hand-built cases, no reference data needed (REQ 5.1, N-9)
// ---------------------------------------------------------------------------

describe("AveragingBuffer.mean (REQ 4.8)", () => {
  it("holds a constant value, so the mean is exactly that value", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [[-20 * MIN, 1234.5]]);
    expect(buffer.mean("a", 5 * MIN, T0)).toBe(1234.5);
    expect(buffer.mean("a", 15 * MIN, T0)).toBe(1234.5);
  });

  it("step-holds the value that was in effect at the window start", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    // 100 W from long before the window, 300 W from the window's midpoint on.
    fill(buffer, "a", [
      [-30 * MIN, 100],
      [-2.5 * MIN, 300],
    ]);
    // Without the pre-window sample the first half would be missing entirely.
    expect(buffer.mean("a", 5 * MIN, T0)).toBe(200);
  });

  it("weights a mid-window step by its duration", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [
      [-10 * MIN, 0],
      // 4 of 5 minutes at 1000 W, the last minute at 0 W.
      [-5 * MIN, 1000],
      [-1 * MIN, 0],
    ]);
    expect(buffer.mean("a", 5 * MIN, T0)).toBeCloseTo(800, 9);
  });

  it("returns the single known value when only one sample exists", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [[-1 * MIN, 42]]);
    // Only the last minute carries weight; the four minutes before are unknown.
    expect(buffer.mean("a", 5 * MIN, T0)).toBe(42);
  });

  it("gives unavailable stretches no weight and does not bridge them (REQ V-7)", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [
      [-5 * MIN, 100],
      [-4 * MIN, null], // gap from -4 to -2 min
      [-2 * MIN, 400],
    ]);
    // Weighted over 1 min at 100 W and 2 min at 400 W - the gap is skipped, and
    // the 100 W value is NOT held across it.
    expect(buffer.mean("a", 5 * MIN, T0)).toBeCloseTo((100 * 1 + 400 * 2) / 3, 9);
  });

  it("returns null when the whole window is unavailable", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [
      [-30 * MIN, 500],
      [-6 * MIN, null],
    ]);
    expect(buffer.mean("a", 5 * MIN, T0)).toBeNull();
  });

  it("returns null for an entity that was never pushed", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    expect(buffer.mean("nobody", 5 * MIN, T0)).toBeNull();
  });

  it("ignores samples in the future and stops at `now`", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [
      [-5 * MIN, 100],
      [1 * MIN, 9999],
    ]);
    expect(buffer.mean("a", 5 * MIN, T0)).toBe(100);
  });

  it("accepts samples out of order, as prefill after live values does", () => {
    const live = new AveragingBuffer(15 * MIN);
    const prefilled = new AveragingBuffer(15 * MIN);
    fill(live, "a", [
      [-10 * MIN, 100],
      [-5 * MIN, 200],
      [-2 * MIN, 300],
    ]);
    // Same samples, newest first - the history arrives after the live values.
    fill(prefilled, "a", [
      [-2 * MIN, 300],
      [-5 * MIN, 200],
      [-10 * MIN, 100],
    ]);
    expect(prefilled.mean("a", 15 * MIN, T0)).toBe(live.mean("a", 15 * MIN, T0));
    expect(prefilled.sampleCount("a")).toBe(3);
  });

  it("never counts the same timestamp twice", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [
      [-10 * MIN, 100],
      [-5 * MIN, 200],
      [-5 * MIN, 500], // same timestamp again: replaces, does not duplicate
    ]);
    expect(buffer.sampleCount("a")).toBe(2);
    expect(buffer.mean("a", 10 * MIN, T0)).toBe((100 * 5 + 500 * 5) / 10);
  });
});

describe("AveragingBuffer.prune (REQ V-10)", () => {
  it("keeps the one sample that covers the window start", () => {
    const buffer = new AveragingBuffer(5 * MIN);
    fill(buffer, "a", [
      [-30 * MIN, 111], // dropped
      [-20 * MIN, 222], // dropped
      [-10 * MIN, 100], // in effect at the window start - must survive
      [-2 * MIN, 300],
    ]);
    buffer.prune(T0);
    expect(buffer.sampleCount("a")).toBe(2);
    // The mean is unchanged by pruning.
    expect(buffer.mean("a", 5 * MIN, T0)).toBe((100 * 3 + 300 * 2) / 5);
  });

  it("keeps a single old sample, because it still describes the whole window", () => {
    const buffer = new AveragingBuffer(5 * MIN);
    fill(buffer, "a", [[-60 * MIN, 777]]);
    buffer.prune(T0);
    expect(buffer.sampleCount("a")).toBe(1);
    expect(buffer.mean("a", 5 * MIN, T0)).toBe(777);
  });

  it("caps the samples per entity so memory stays bounded", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    // 5000 samples every 100 ms - far beyond anything a real sensor produces.
    for (let i = 0; i < 5000; i++) buffer.push("chatty", T0 - 5000 * 100 + i * 100, i);
    const count = buffer.sampleCount("chatty");
    expect(count).toBeLessThanOrEqual(512);
    // 100 consumers x 512 samples x 16 B (two Float64 slots) stays below 1 MB.
    expect(100 * count * 16).toBeLessThan(1_000_000);
    // The newest samples survive; the buffer's coverage shrinks instead.
    const status = buffer.status(T0);
    expect(status.since).toBe(T0 - count * 100);
    expect(status.complete).toBe(false);
  });
});

describe("AveragingBuffer.status (REQ V-6)", () => {
  it("reports nothing for an empty buffer", () => {
    expect(new AveragingBuffer(15 * MIN).status(T0)).toEqual({ complete: false });
  });

  it("is incomplete while the buffer is younger than the window", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [[-4 * MIN, 100]]);
    const status = buffer.status(T0);
    expect(status.complete).toBe(false);
    expect(status.since).toBe(T0 - 4 * MIN);
  });

  it("is complete once every entity reaches back past the window", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [[-20 * MIN, 100]]);
    fill(buffer, "b", [[-15 * MIN, 200]]);
    const status = buffer.status(T0);
    expect(status.complete).toBe(true);
    // The last entity to join decides from when the mean is valid.
    expect(status.since).toBe(T0 - 15 * MIN);
  });

  it("dates 'since' from the last entity to join, not from a stale hold sample", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    // A sensor that last changed 13 hours ago: known all along, one old sample.
    fill(buffer, "idle", [[-13 * 60 * MIN, 25]]);
    // A consumer whose first sample is 4 minutes old.
    fill(buffer, "fresh", [[-4 * MIN, 300]]);
    const status = buffer.status(T0);
    expect(status.complete).toBe(false);
    expect(status.since).toBe(T0 - 4 * MIN);
  });

  it("turns incomplete again when one entity joins late", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    fill(buffer, "a", [[-20 * MIN, 100]]);
    fill(buffer, "late", [[-1 * MIN, 5]]);
    expect(buffer.status(T0).complete).toBe(false);
  });
});

// ---------------------------------------------------------------------------

interface WsCall {
  type?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  entity_ids?: unknown;
  minimal_response?: unknown;
  no_attributes?: unknown;
}

function fakeHass(callWS: HomeAssistant["callWS"]): HomeAssistant {
  return {
    states: {},
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS,
  };
}

describe("fetchHistory (REQ V-6)", () => {
  it("asks for all entities in one call and converts the response", async () => {
    const calls: WsCall[] = [];
    const lu = 1_772_000_000; // seconds since the epoch, as HA sends them
    const hass = fakeHass(async (msg) => {
      calls.push(msg as WsCall);
      return {
        "sensor.house": [
          { s: "514", lu },
          { s: "527.5", lu: lu + 5 },
          { s: "unavailable", lu: lu + 10 },
          { s: "unknown", lu: lu + 15 },
          { s: "530", lu: lu + 20 },
        ],
        "sensor.washer": [{ s: "0.0", lu }],
      } as never;
    });

    const history = await fetchHistory(hass, ["sensor.house", "sensor.washer", "sensor.gone"], 15);

    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call.type).toBe("history/history_during_period");
    expect(call.entity_ids).toEqual(["sensor.house", "sensor.washer", "sensor.gone"]);
    expect(call.minimal_response).toBe(true);
    expect(call.no_attributes).toBe(true);
    expect(typeof call.start_time).toBe("string");
    const start = Date.parse(String(call.start_time));
    const end = Date.parse(String(call.end_time));
    expect(end - start).toBe(15 * MIN);

    // `lu` is seconds - the samples are milliseconds.
    expect(history["sensor.house"]).toEqual<Sample[]>([
      { t: lu * 1000, v: 514 },
      { t: (lu + 5) * 1000, v: 527.5 },
      { t: (lu + 10) * 1000, v: null },
      { t: (lu + 15) * 1000, v: null },
      { t: (lu + 20) * 1000, v: 530 },
    ]);
    expect(history["sensor.washer"]).toEqual<Sample[]>([{ t: lu * 1000, v: 0 }]);
    // An entity the recorder does not know is simply absent, not an error.
    expect(history["sensor.gone"]).toBeUndefined();
  });

  it("sorts samples and skips malformed points", async () => {
    const lu = 1_772_000_000;
    const hass = fakeHass(
      async () =>
        ({
          "sensor.a": [
            { s: "3", lu: lu + 20 },
            { s: "1", lu },
            null,
            { s: "no timestamp" },
            { s: "2", lu: lu + 10 },
          ],
        }) as never,
    );
    const history = await fetchHistory(hass, ["sensor.a"], 5);
    expect(history["sensor.a"]).toEqual<Sample[]>([
      { t: lu * 1000, v: 1 },
      { t: (lu + 10) * 1000, v: 2 },
      { t: (lu + 20) * 1000, v: 3 },
    ]);
  });

  it("does not call the recorder without entities", async () => {
    const callWS = vi.fn(async () => ({}) as never);
    expect(await fetchHistory(fakeHass(callWS), [], 15)).toEqual({});
    expect(callWS).not.toHaveBeenCalled();
  });

  it("rejects with a telling message once the timeout elapses", async () => {
    const hass = fakeHass(() => new Promise<never>(() => {}));
    await expect(fetchHistory(hass, ["sensor.a", "sensor.b"], 15, 20)).rejects.toThrow(
      /did not answer within 20 ms \(2 entities, 15 min\)/,
    );
  });

  it("propagates a recorder error", async () => {
    const hass = fakeHass(async () => {
      throw new Error("recorder is not running");
    });
    await expect(fetchHistory(hass, ["sensor.a"], 15)).rejects.toThrow("recorder is not running");
  });
});

// ---------------------------------------------------------------------------
// Group 2 - Abnahme V against the real reference data (REQ 5.1)
// The data lives outside the repository; without it these cases are skipped so
// the CI stays green (REQ N-9).
// ---------------------------------------------------------------------------

interface FixtureSeries {
  entity_id: string;
  points: { t: string; v: string }[];
}
interface Fixture {
  day: string;
  series: Record<string, FixtureSeries>;
}

const FIXTURE_DIR = process.env.ENERLENS_FIXTURES ?? "";
const FIXTURE_FILE = FIXTURE_DIR ? join(FIXTURE_DIR, "history-2026-09-05.json") : "";
const HAS_FIXTURE = FIXTURE_FILE !== "" && existsSync(FIXTURE_FILE);
const FIXTURE_HINT = FIXTURE_FILE || "<ENERLENS_FIXTURES unset>";
// The measurements stay outside the repository (REQ 5.1, N-9).
const SKIP_NOTE = `Abnahme V skipped: no reference data at ${FIXTURE_HINT}`;

const HOUSE_ROLE = "house_5s";
const CONSUMER_ROLES = [
  "heatpump",
  "ac",
  "ac_storage",
  "storage",
  "fridges",
  "dryer",
  "washer",
  "dishwasher",
];

// A plain `if`, not describe.runIf: runIf(false) still registers the block as
// skipped, so every run showed "1 skipped" although the reference tests ran.
if (!HAS_FIXTURE) {
  describe("Abnahme V (REQ 2.12)", () => {
    it.skip(SKIP_NOTE, () => {
      /* intentionally empty */
    });
  });
}

describe.skipIf(!HAS_FIXTURE)("Abnahme V - reference data (REQ 2.12, 5.1)", () => {
  const fixture: Fixture = JSON.parse(readFileSync(FIXTURE_FILE, "utf8"));
  const roles = [HOUSE_ROLE, ...CONSUMER_ROLES];

  function samplesOf(role: string): Sample[] {
    const points = fixture.series[role]?.points ?? [];
    return points.map((p) => {
      const v = Number.parseFloat(p.v);
      return { t: Date.parse(p.t), v: Number.isFinite(v) ? v : null };
    });
  }

  const LONG_MS = 15 * MIN;

  /**
   * Mirrors the prefill path: one `history_during_period` over the long window
   * plus the sample that was in effect when the window opened (REQ V-6).
   */
  function prefilled(now: number): AveragingBuffer {
    const buffer = new AveragingBuffer(LONG_MS);
    const from = now - LONG_MS;
    for (const role of roles) {
      const samples = samplesOf(role).filter((s) => s.t <= now);
      let carry: Sample | undefined;
      for (const s of samples) {
        if (s.t <= from) carry = s;
        else break;
      }
      if (carry) buffer.push(role, carry.t, carry.v);
      for (const s of samples) if (s.t > from) buffer.push(role, s.t, s.v);
    }
    return buffer;
  }

  /** Mirrors the live path: every sample of the day, pruned on every tick. */
  function livePushed(now: number): AveragingBuffer {
    const buffer = new AveragingBuffer(LONG_MS);
    const merged: { role: string; s: Sample }[] = [];
    for (const role of roles) {
      for (const s of samplesOf(role)) if (s.t <= now) merged.push({ role, s });
    }
    merged.sort((a, b) => a.s.t - b.s.t);
    let i = 0;
    for (const { role, s } of merged) {
      buffer.push(role, s.t, s.v);
      if (++i % 250 === 0) buffer.prune(s.t);
    }
    buffer.prune(now);
    return buffer;
  }

  function houseAndConsumers(buffer: AveragingBuffer, windowMs: number, now: number) {
    const house = buffer.mean(HOUSE_ROLE, windowMs, now);
    let consumers = 0;
    for (const role of CONSUMER_ROLES) {
      const w = buffer.mean(role, windowMs, now);
      if (w !== null) consumers += w;
    }
    return { house, consumers };
  }

  const cases = [
    { iso: "2026-09-05T15:40:18+02:00", minutes: 5, house: 1525, consumers: 1189 },
    { iso: "2026-09-05T15:40:18+02:00", minutes: 15, house: 1618, consumers: 1247 },
    { iso: "2026-09-05T15:10:42+02:00", minutes: 5, house: 3539, consumers: 3192 },
    { iso: "2026-09-05T15:10:42+02:00", minutes: 15, house: 2947, consumers: 2558 },
  ];

  for (const c of cases) {
    it(`${c.iso} / Ø ${c.minutes} min matches the table within 1 W`, () => {
      const now = Date.parse(c.iso);
      const { house, consumers } = houseAndConsumers(prefilled(now), c.minutes * MIN, now);
      expect(house).not.toBeNull();
      expect(Math.abs((house as number) - c.house)).toBeLessThanOrEqual(1);
      expect(Math.abs(consumers - c.consumers)).toBeLessThanOrEqual(1);
    });
  }

  it("live buffering with pruning gives the same means as the prefill", () => {
    const now = Date.parse("2026-09-05T15:40:18+02:00");
    for (const minutes of [5, 15]) {
      const a = houseAndConsumers(prefilled(now), minutes * MIN, now);
      const b = houseAndConsumers(livePushed(now), minutes * MIN, now);
      expect(b.house as number).toBeCloseTo(a.house as number, 6);
      expect(b.consumers).toBeCloseTo(a.consumers, 6);
    }
  });

  const ORACLE_FILE = join(FIXTURE_DIR, "expected.json");

  it.skipIf(!existsSync(ORACLE_FILE))("matches the independent oracle in expected.json", () => {
    const oracle: Record<string, { t: string; house: number; sum_all_consumers: number }> =
      JSON.parse(readFileSync(ORACLE_FILE, "utf8"));
    const pairs: [string, number][] = [
      ["V2", 5],
      ["V3", 15],
      ["V5", 5],
      ["V6", 15],
    ];
    for (const [id, minutes] of pairs) {
      const expectedCase = oracle[id];
      if (!expectedCase) continue;
      const now = Date.parse(expectedCase.t);
      const { house, consumers } = houseAndConsumers(prefilled(now), minutes * MIN, now);
      expect(house as number).toBeCloseTo(expectedCase.house, 6);
      expect(consumers).toBeCloseTo(expectedCase.sum_all_consumers, 6);
    }
  });
});
