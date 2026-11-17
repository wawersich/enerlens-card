import { describe, expect, it, vi } from "vitest";
import { HistoryLines } from "../src/history-fetch";
import { STEP_MS, windowStart } from "../src/history-line";
import type { HomeAssistant } from "../src/types";

/*
 * Fetching the history line's data (REQ LZ-18): statistics where HA keeps
 * them, readings where not and after HA's latest five minutes (DF-22), the
 * whole window once and then only what is new.
 */

const NOW = Date.UTC(2026, 10, 17, 9, 2, 0);
const T0 = Date.UTC(2026, 10, 17, 9, 0, 0);

function hassWith(calls: Record<string, unknown>[]) {
  const state = (id: string, w: string, unit = "W") => ({
    entity_id: id,
    state: w,
    attributes: { unit_of_measurement: unit, device_class: "power" },
    last_changed: new Date(T0 + 60_000).toISOString(),
    last_updated: new Date(T0 + 60_000).toISOString(),
  });
  const hass = {
    states: {
      "sensor.hp": state("sensor.hp", "1.5", "kW"),
      "sensor.tv": state("sensor.tv", "80"),
      "sensor.temp": {
        ...state("sensor.temp", "21", "°C"),
        attributes: { unit_of_measurement: "°C" },
      },
    },
    callWS: vi.fn(async (msg: Record<string, unknown>) => {
      calls.push(msg);
      if (msg.type === "recorder/get_statistics_metadata") {
        return [{ statistic_id: "sensor.hp", mean_type: 1, unit_class: "power" }];
      }
      if (msg.type === "recorder/statistics_during_period") {
        return {
          "sensor.hp": [
            { start: T0 - 2 * STEP_MS, mean: 2000 },
            { start: T0 - STEP_MS, mean: 1000 },
          ],
        };
      }
      if (msg.type === "history/history_during_period") {
        return {
          "sensor.hp": [{ s: "1.5", lu: (T0 - STEP_MS / 2) / 1000 }],
          "sensor.tv": [{ s: "100", lu: (T0 - 10 * STEP_MS) / 1000 }],
        };
      }
      return {};
    }),
  } as unknown as HomeAssistant;
  return hass;
}

describe("the history line's fetch", () => {
  it("asks for metadata, statistics and readings - only for power sensors", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp", "sensor.tv", "sensor.temp"], 12, NOW);
    const meta = calls.find((c) => c.type === "recorder/get_statistics_metadata");
    expect(meta?.statistic_ids).toEqual(["sensor.hp", "sensor.tv"]);
    const stats = calls.find((c) => c.type === "recorder/statistics_during_period");
    expect(stats?.statistic_ids).toEqual(["sensor.hp"]);
    expect(stats?.period).toBe("5minute");
    expect(Date.parse(String(stats?.start_time))).toBe(windowStart(NOW, 12));
    expect(lines.line(hass, "sensor.temp", NOW)).toBeUndefined();
  });

  it("HA's rows first, then the readings after them, the live value up to now", async () => {
    const hass = hassWith([]);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp", "sensor.tv"], 12, NOW);
    const hp = lines.line(hass, "sensor.hp", NOW) ?? [];
    expect(hp).toHaveLength(144);
    expect(hp.at(-3)).toBe(2000);
    expect(hp.at(-2)).toBe(1000);
    // The running step: 1.5 kW read before, held up to now.
    expect(hp.at(-1)).toBeCloseTo(1500);
    // Without statistics the readings carry the whole window.
    const tv = lines.line(hass, "sensor.tv", NOW) ?? [];
    expect(tv.at(-5)).toBeCloseTo(100);
  });

  it("then only what is new, every five minutes", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp"], 12, NOW);
    expect(lines.due(NOW + 60_000)).toBe(false);
    const later = NOW + 5 * 60_000;
    expect(lines.due(later)).toBe(true);
    calls.length = 0;
    await lines.refresh(hass, ["sensor.hp"], 12, later);
    expect(calls.some((c) => c.type === "recorder/get_statistics_metadata")).toBe(false);
    const stats = calls.find((c) => c.type === "recorder/statistics_during_period");
    expect(Date.parse(String(stats?.start_time))).toBeGreaterThan(windowStart(later, 12));
  });

  it("a new set of entities or hours starts over", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp"], 12, NOW);
    calls.length = 0;
    await lines.refresh(hass, ["sensor.hp"], 3, NOW + 1000);
    expect(calls.some((c) => c.type === "recorder/get_statistics_metadata")).toBe(true);
    expect(lines.line(hass, "sensor.hp", NOW + 1000)).toHaveLength(36);
  });

  it("one request at a time", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    const lines = new HistoryLines();
    await Promise.all([
      lines.refresh(hass, ["sensor.hp"], 12, NOW),
      lines.refresh(hass, ["sensor.hp"], 12, NOW),
    ]);
    expect(calls.filter((c) => c.type === "recorder/statistics_during_period")).toHaveLength(1);
  });

  it("a failing request keeps what was there", async () => {
    const hass = hassWith([]);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp"], 12, NOW);
    const before = lines.line(hass, "sensor.hp", NOW);
    (hass.callWS as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("down"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await lines.refresh(hass, ["sensor.hp"], 12, NOW + 5 * 60_000);
    warn.mockRestore();
    expect(lines.line(hass, "sensor.hp", NOW)).toEqual(before);
  });

  it("readings for sensors with rows only after them; the window only for the others", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp", "sensor.tv"], 12, NOW);
    const history = calls.filter((c) => c.type === "history/history_during_period");
    const span = (c: Record<string, unknown>) =>
      (Date.parse(String(c.end_time)) - Date.parse(String(c.start_time))) / 60_000;
    const forHp = history.find((c) => (c.entity_ids as string[]).includes("sensor.hp"));
    const forTv = history.find((c) => (c.entity_ids as string[]).includes("sensor.tv"));
    expect(forHp).not.toBe(forTv);
    expect(span(forHp as Record<string, unknown>)).toBeLessThanOrEqual(22);
    expect(span(forTv as Record<string, unknown>)).toBeGreaterThan(11.5 * 60);
  });

  it("without any statistics, later fetches are small too", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.tv"], 12, NOW);
    calls.length = 0;
    await lines.refresh(hass, ["sensor.tv"], 12, NOW + 5 * 60_000);
    const history = calls.find((c) => c.type === "history/history_during_period");
    const span =
      (Date.parse(String(history?.end_time)) - Date.parse(String(history?.start_time))) / 60_000;
    expect(span).toBeLessThanOrEqual(12);
  });

  it("after a failure it waits a minute, then longer - not on every tick", async () => {
    const hass = hassWith([]);
    (hass.callWS as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("down"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const lines = new HistoryLines();
    await lines.refresh(hass, ["sensor.hp"], 12, NOW);
    expect(lines.due(NOW + 5_000, ["sensor.hp"], 12)).toBe(false);
    expect(lines.due(NOW + 61_000, ["sensor.hp"], 12)).toBe(true);
    await lines.refresh(hass, ["sensor.hp"], 12, NOW + 61_000);
    expect(lines.due(NOW + 61_000 + 61_000, ["sensor.hp"], 12)).toBe(false);
    warn.mockRestore();
  });

  it("an answer for an older set of entities does not land in the new one", async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = hassWith(calls);
    let release: () => void = () => {};
    const slow = new Promise<void>((r) => {
      release = r;
    });
    const real = hass.callWS as unknown as (m: Record<string, unknown>) => Promise<unknown>;
    (hass as unknown as { callWS: unknown }).callWS = vi.fn(async (m: Record<string, unknown>) => {
      if (
        m.type === "recorder/get_statistics_metadata" &&
        (m.statistic_ids as string[]).includes("sensor.tv")
      ) {
        await slow;
        return [{ statistic_id: "sensor.tv", mean_type: 1, unit_class: "power" }];
      }
      return real(m);
    });
    const lines = new HistoryLines();
    const old = lines.refresh(hass, ["sensor.tv"], 12, NOW);
    await lines.refresh(hass, ["sensor.hp"], 12, NOW);
    release();
    await old;
    expect(lines.line(hass, "sensor.tv", NOW)).toBeUndefined();
  });
});
