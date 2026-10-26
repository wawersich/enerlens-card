/**
 * Energy mode statistics (REQ 2.15, EM-1, EM-4, EM-8 - EM-12). All figures are
 * invented; the card's own installation never appears here (N-9).
 */
import { describe, expect, it } from "vitest";
import {
  type EnergyQuery,
  type StatRow,
  integrateEnergy,
  periodStart,
  warnTier,
} from "../src/energy";

const H = 3_600_000;
const M5 = 300_000;
const iso = (s: string) => Date.parse(s);

describe("period start (EM-1)", () => {
  const now = iso("2026-10-19T19:00:00Z"); // a Monday, CEST

  it("starts the day at local midnight", () => {
    expect(periodStart("today", now, "Europe/Berlin", 1)).toBe(iso("2026-10-18T22:00:00Z"));
  });

  it("starts the week on Home Assistant's first weekday", () => {
    expect(periodStart("week", now, "Europe/Berlin", 1)).toBe(iso("2026-10-18T22:00:00Z"));
    expect(periodStart("week", now, "Europe/Berlin", 0)).toBe(iso("2026-10-17T22:00:00Z"));
    expect(periodStart("week", now, "Europe/Berlin", 6)).toBe(iso("2026-10-16T22:00:00Z"));
  });

  it("starts the month on the first at local midnight", () => {
    expect(periodStart("month", now, "Europe/Berlin", 1)).toBe(iso("2026-09-30T22:00:00Z"));
    // After the clocks went back, the month started in summer time anyway.
    expect(periodStart("month", iso("2026-11-01T12:00:00Z"), "Europe/Berlin", 1)).toBe(
      iso("2026-10-31T23:00:00Z"),
    );
  });

  it("starts the day in summer time on the day the clocks go back", () => {
    // 25 October 2026: 03:00 CEST becomes 02:00 CET; the day has 25 hours.
    expect(periodStart("today", iso("2026-10-25T12:00:00Z"), "Europe/Berlin", 1)).toBe(
      iso("2026-10-24T22:00:00Z"),
    );
    expect(periodStart("today", iso("2026-10-25T23:30:00Z"), "Europe/Berlin", 1)).toBe(
      iso("2026-10-25T23:00:00Z"),
    );
  });

  it("lets the rolling periods end now, from the next five minutes", () => {
    const at = iso("2026-10-19T19:03:20Z");
    expect(periodStart("24h", at, "Europe/Berlin", 1)).toBe(iso("2026-10-18T19:05:00Z"));
    expect(periodStart("7d", at, "Europe/Berlin", 1)).toBe(iso("2026-10-12T19:05:00Z"));
    // Five-minute statistics are kept about ten days: 30 days start on the hour.
    expect(periodStart("30d", at, "Europe/Berlin", 1)).toBe(iso("2026-09-19T20:00:00Z"));
    expect(periodStart("24h", iso("2026-10-19T19:05:00Z"), "UTC", 1)).toBe(
      iso("2026-10-18T19:05:00Z"),
    );
  });

  it("follows time zones off the full hour and west of Greenwich", () => {
    expect(periodStart("today", now, "Asia/Kolkata", 1)).toBe(iso("2026-10-19T18:30:00Z"));
    expect(periodStart("today", now, "America/New_York", 0)).toBe(iso("2026-10-19T04:00:00Z"));
  });
});

/** Hourly rows, one mean per hour from `start`. null = no row. */
function hours(start: number, means: (number | null)[]): StatRow[] {
  return means.flatMap((mean, i) => (mean === null ? [] : [{ start: start + i * H, mean }]));
}

const T0 = iso("2026-10-19T00:00:00Z");

/** Three hours with a day of lookback, all sensors steady; tests adjust. */
function query(patch: Partial<EnergyQuery> = {}): EnergyQuery {
  const day = (w: number) => hours(T0 - 24 * H, Array(27).fill(w));
  return {
    from: T0,
    to: T0 + 3 * H,
    roles: {
      solar: "pv",
      import: "imp",
      export: "exp",
      discharge: "dis",
      charge: "chg",
      house: "house",
    },
    consumers: [],
    hourly: {
      pv: day(0),
      imp: day(500),
      exp: day(0),
      dis: day(0),
      chg: day(0),
      house: day(500),
    },
    fiveMin: {},
    pvZeroBelowW: 10,
    ...patch,
  };
}

describe("integration (EM-4)", () => {
  it("adds mean times duration over the period", () => {
    const r = integrateEnergy(query());
    expect(r.main.import?.wh).toBe(1500);
    expect(r.main.house?.wh).toBe(1500);
    expect(r.main.solar?.wh).toBe(0);
    expect(r.from).toBe(T0);
    expect(r.lateStart).toBe(false);
  });

  it("takes the running hour from the five-minute statistics up to its last block", () => {
    const q = query({ to: T0 + 3 * H + 20 * M5 });
    const block = (w: number) => [0, 1, 2, 3].map((i) => ({ start: T0 + 3 * H + i * M5, mean: w }));
    q.fiveMin = {
      imp: block(1200),
      house: block(1200),
      pv: block(0),
      exp: block(0),
      dis: block(0),
      chg: block(0),
    };
    const r = integrateEnergy(q);
    // Three hours at 500 W, then 20 minutes at 1200 W. The time after the
    // last block is not there yet and is no gap (EM-4).
    expect(r.to).toBe(T0 + 3 * H + 4 * M5);
    expect(r.main.import?.wh).toBe(1500 + 400);
    expect(r.main.import?.filledShare).toBe(0);
  });

  it("derives a missing house from the balance hour by hour (A-1)", () => {
    const q = query({ roles: { ...query().roles, house: undefined } });
    q.hourly.pv = hours(T0 - 24 * H, [...Array(24).fill(0), 2000, 1000, 0]);
    q.hourly.chg = hours(T0 - 24 * H, [...Array(24).fill(0), 1500, 0, 0]);
    const r = integrateEnergy(q);
    // 500 + 2000 - 1500, 500 + 1000, 500
    expect(r.main.house?.wh).toBe(1000 + 1500 + 500);
  });

  it("adds a derived quantity up unclamped, like the card derives it from the totals", () => {
    const q = query({ roles: { ...query().roles, house: undefined } });
    // One hour exports more than it has: a balance of -200 W, then +500 W.
    q.hourly.exp = hours(T0 - 24 * H, [...Array(24).fill(0), 700, 0, 0]);
    const r = integrateEnergy(q);
    expect(r.main.house?.wh).toBe(-200 + 500 + 500);
  });

  it("shows no value for a sensor without statistics", () => {
    const q = query();
    const { house: _, ...rest } = q.hourly;
    q.hourly = rest;
    const r = integrateEnergy(q);
    expect(r.main.house).toBeNull();
  });
});

describe("rolling start (EM-1)", () => {
  it("counts the part-hour at the start from the five-minute statistics", () => {
    // From 00:40: twenty minutes of 00:00 from five-minute rows, then hours.
    const q = query({ from: T0 + 40 * 60_000 });
    q.fiveMin = Object.fromEntries(
      ["pv", "imp", "exp", "dis", "chg", "house"].map((id) => [
        id,
        [8, 9, 10, 11].map((i) => ({
          start: T0 + i * M5,
          mean: id === "imp" || id === "house" ? 1200 : 0,
        })),
      ]),
    );
    const r = integrateEnergy(q);
    expect(r.from).toBe(T0 + 40 * 60_000);
    expect(r.lateStart).toBe(false);
    // 20 minutes at 1200 W, then two hours at 500 W.
    expect(r.main.import?.wh).toBe(400 + 1000);
    expect(r.main.import?.filledShare).toBe(0);
  });
});

describe("late start (EM-9)", () => {
  it("counts the period from the youngest main sensor, never extrapolated", () => {
    const q = query();
    q.hourly.imp = hours(T0 + H, [500, 500]);
    const r = integrateEnergy(q);
    expect(r.lateStart).toBe(true);
    expect(r.from).toBe(T0 + H);
    expect(r.main.import?.wh).toBe(1000);
    expect(r.main.house?.wh).toBe(1000);
  });
});

describe("gap or new sensor (EM-9, EM-10)", () => {
  it("takes a sensor that was off the day before the period for a gap, not a start", () => {
    const q = query();
    q.hourly.imp = hours(T0 + H, [500, 500]);
    q.since = { imp: T0 - 20 * 24 * H };
    const r = integrateEnergy(q);
    expect(r.lateStart).toBe(false);
    expect(r.from).toBe(T0);
    // The first hour comes from the balance of the others: 500 W of house.
    expect(r.main.import?.wh).toBe(1500);
    expect(r.main.import?.filledShare).toBeCloseTo(1 / 3);
  });

  it("does not take PV with no hour known before a gap for dark", () => {
    const q = query();
    q.hourly.pv = [];
    q.hourly.exp = hours(T0 - 24 * H, Array(27).fill(1000));
    q.hourly.imp = hours(T0 - 24 * H, Array(27).fill(0));
    q.since = { pv: T0 - 20 * 24 * H };
    const r = integrateEnergy(q);
    // PV alone is missing: the balance gives 1000 W of export + 500 W of house.
    expect(r.main.solar?.wh).toBe(4500);
    expect(r.main.solar?.filledShare).toBe(1);
  });
});

describe("gaps (EM-10)", () => {
  it("computes a single missing balance series from the others", () => {
    const q = query();
    q.hourly.house = hours(T0 - 24 * H, [...Array(25).fill(500), null, 500]);
    q.hourly.imp = hours(T0 - 24 * H, [...Array(25).fill(500), 800, 500]);
    const r = integrateEnergy(q);
    expect(r.main.house?.wh).toBe(500 + 800 + 500);
    expect(r.main.house?.filledShare).toBeCloseTo(1 / 3);
  });

  it("takes the same hour of the day before when more is missing", () => {
    const q = query();
    q.hourly.house = hours(T0 - 24 * H, [500, 700, ...Array(23).fill(500), null, 500]);
    q.hourly.imp = hours(T0 - 24 * H, [500, 900, ...Array(23).fill(500), null, 500]);
    const r = integrateEnergy(q);
    expect(r.main.house?.wh).toBe(500 + 700 + 500);
    expect(r.main.import?.wh).toBe(500 + 900 + 500);
    expect(r.main.import?.filledShare).toBeCloseTo(1 / 3);
  });

  it("falls back to the day after", () => {
    const q = query({ from: T0 - 24 * H, to: T0 + 3 * H });
    // 01:00 is missing on the 17th and the 18th, the 19th has 600 W.
    const rows = [500, null, ...Array(23).fill(500), null, ...Array(23).fill(500), 600, 500];
    q.hourly.house = hours(T0 - 48 * H, rows);
    q.hourly.imp = hours(T0 - 48 * H, rows);
    const r = integrateEnergy(q);
    expect(r.main.house?.wh).toBe(25 * 500 + 600 + 600);
  });

  it("counts an hour with no neighbour at all as zero", () => {
    const q = query();
    q.hourly.house = hours(T0 - 24 * H, [...Array(24).fill(500), 500, null, 500]);
    q.hourly.imp = hours(T0 - 24 * H, [...Array(24).fill(500), 500, null, 500]);
    // The day before has a hole at the same hour; the day after is the future.
    q.hourly.house = q.hourly.house.filter((r) => r.start !== T0 - 23 * H);
    q.hourly.imp = q.hourly.imp.filter((r) => r.start !== T0 - 23 * H);
    const r = integrateEnergy(q);
    expect(r.main.house?.wh).toBe(1000);
    expect(r.main.house?.filledShare).toBeCloseTo(1 / 3);
  });

  it("counts a PV gap after a dark hour as zero, and not as filled", () => {
    const q = query();
    q.hourly.pv = hours(T0 - 24 * H, [...Array(24).fill(0), 0, null, 0]);
    const r = integrateEnergy(q);
    expect(r.main.solar?.wh).toBe(0);
    expect(r.main.solar?.filledShare).toBe(0);
  });

  it("looks at the hour before the period for a gap in its first hour", () => {
    const q = query();
    // Dark the evening before, the first hour of the period has no row.
    q.hourly.pv = hours(T0 - 24 * H, [...Array(24).fill(0), null, 0, 0]);
    expect(integrateEnergy(q).main.solar?.filledShare).toBe(0);
    // Bright before (a period starting at noon): a real gap.
    q.hourly.pv = hours(T0 - 24 * H, [...Array(23).fill(0), 2000, null, 0, 0]);
    q.hourly.exp = hours(T0 - 24 * H, [...Array(23).fill(0), 2000, null, 0, 0]);
    expect(integrateEnergy(q).main.solar?.filledShare).toBeCloseTo(1 / 3);
  });

  it("fills a PV gap in daylight like any other", () => {
    const q = query();
    q.hourly.pv = hours(T0 - 24 * H, [...Array(25).fill(2000), null, 2000]);
    q.hourly.exp = hours(T0 - 24 * H, [...Array(25).fill(2000), null, 2000]);
    const r = integrateEnergy(q);
    expect(r.main.solar?.wh).toBe(6000);
    expect(r.main.solar?.filledShare).toBeCloseTo(1 / 3);
  });
});

describe("consumers (EM-12)", () => {
  it("do not shorten the period; a late one counts from its start", () => {
    const q = query({ consumers: ["heat", "new", "none"] });
    q.hourly.heat = hours(T0 - 24 * H, Array(27).fill(200));
    q.hourly.new = hours(T0 + 2 * H, [100]);
    const r = integrateEnergy(q);
    expect(r.from).toBe(T0);
    expect(r.consumers.heat).toEqual({ wh: 600, filledShare: 0 });
    expect(r.consumers.new).toEqual({ wh: 100, filledShare: 0, since: T0 + 2 * H });
    expect(r.consumers.none).toBeNull();
  });

  it("fill a gap from the day before", () => {
    const q = query({ consumers: ["heat"] });
    q.hourly.heat = hours(T0 - 24 * H, [...Array(25).fill(200), null, 200]);
    const r = integrateEnergy(q);
    expect(r.consumers.heat?.wh).toBe(600);
    expect(r.consumers.heat?.filledShare).toBeCloseTo(1 / 3);
  });
});

describe("flow (EM-8)", () => {
  it("splits each hour with the card's flow rule and adds the energies", () => {
    const q = query({ to: T0 + 2 * H });
    const set = (id: string, a: number, b: number) => {
      q.hourly[id] = hours(T0 - 24 * H, [...Array(24).fill(0), a, b]);
    };
    set("pv", 2000, 0);
    set("chg", 1500, 0);
    set("dis", 0, 800);
    set("house", 500, 800);
    set("imp", 0, 0);
    const r = integrateEnergy(q);
    expect(r.flows).toEqual({ solar_battery: 1500, solar_house: 500, battery_house: 800 });
  });
});

describe("warning tiers (EM-11)", () => {
  it("are normal up to 2 %, muted up to 10 %, amber above", () => {
    expect(warnTier(0)).toBe(0);
    expect(warnTier(0.02)).toBe(0);
    expect(warnTier(0.021)).toBe(1);
    expect(warnTier(0.1)).toBe(1);
    expect(warnTier(0.11)).toBe(2);
  });
});

describe("several PV sources (PV-2, energy mode)", () => {
  /** Two sources instead of one PV series; the house takes what they give. */
  function sources(patch: Partial<EnergyQuery> = {}): EnergyQuery {
    const day = (w: number) => hours(T0 - 24 * H, Array(27).fill(w));
    const q = query(patch);
    return {
      ...q,
      roles: { ...q.roles, solar: "#pv" },
      solarSources: ["roof", "balcony"],
      hourly: {
        ...q.hourly,
        pv: [],
        roof: day(300),
        balcony: day(100),
        imp: day(100),
        house: day(500),
        ...patch.hourly,
      },
    };
  }

  it("the PV is the sum of the sources, each one counted on its own", () => {
    const r = integrateEnergy(sources());
    expect(r.main.solar?.wh).toBe(1200);
    expect(r.sources?.roof?.wh).toBe(900);
    expect(r.sources?.balcony?.wh).toBe(300);
    expect(r.main.solar?.filledShare).toBe(0);
  });

  it("a gap in one source is filled from the day before, never from the balance", () => {
    const day = hours(T0 - 24 * H, Array(27).fill(100));
    const gap = day.filter((row) => row.start !== T0 + H);
    // The day before at that hour: 250 W; the balance would say 100 W.
    const balcony = gap.map((row) => (row.start === T0 + H - 24 * H ? { ...row, mean: 250 } : row));
    const r = integrateEnergy(sources({ hourly: { balcony } as never }));
    expect(r.sources?.balcony?.wh).toBe(100 + 250 + 100);
    expect(r.sources?.balcony?.filledShare).toBeCloseTo(1 / 3);
    expect(r.main.solar?.wh).toBe(900 + 450);
  });

  it("a source dark the hour before counts 0 in its gap (night rule per source)", () => {
    const dark = hours(T0 - 24 * H, [...Array(24).fill(0), 0, null, 0]);
    const r = integrateEnergy(sources({ hourly: { balcony: dark } as never }));
    expect(r.sources?.balcony?.wh).toBe(0);
    expect(r.sources?.balcony?.filledShare).toBe(0);
  });

  it("a new source shortens nothing: it counts from its own start (like EM-12)", () => {
    const fresh = hours(T0 + H, [100, 100]);
    const r = integrateEnergy(sources({ hourly: { balcony: fresh } as never }));
    expect(r.from).toBe(T0);
    expect(r.lateStart).toBe(false);
    expect(r.sources?.balcony?.wh).toBe(200);
    expect(r.sources?.balcony?.since).toBe(T0 + H);
    expect(r.main.solar?.wh).toBe(900 + 200);
  });

  it("a source without any statistics is left out of the sum", () => {
    const r = integrateEnergy(sources({ hourly: { balcony: [] } as never }));
    expect(r.sources?.balcony).toBeNull();
    expect(r.main.solar?.wh).toBe(900);
  });
});
