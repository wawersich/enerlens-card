import { describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import type { RawConfig } from "../src/types";

/* The history line's settings (REQ LZ-18): list.history. */

const base = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.solar", grid: "sensor.grid" },
} as RawConfig;
const withHistory = (history: unknown) =>
  normalizeConfig({ ...base, list: { history } } as unknown as RawConfig);

describe("list.history (LZ-18)", () => {
  it("is off, automatic and 12 h unless set", () => {
    expect(normalizeConfig(base).list.history).toEqual({
      consumers: false,
      solar: false,
      place: "auto",
      hours: 12,
    });
  });

  it("reads both switches, the place and the hours", () => {
    expect(withHistory({ consumers: true, solar: true, place: "below", hours: 6 })).toBeDefined();
    expect(
      withHistory({ consumers: true, solar: true, place: "below", hours: 6 }).list.history,
    ).toEqual({
      consumers: true,
      solar: true,
      place: "below",
      hours: 6,
    });
  });

  it("takes any whole number of hours from 1 to 24, as a number or as text", () => {
    for (const h of [1, 3, 7, 12, 24]) expect(withHistory({ hours: h }).list.history.hours).toBe(h);
    expect(withHistory({ hours: "7" }).list.history.hours).toBe(7);
  });

  it("a number out of range is set to the limit, with a hint - no error card", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(withHistory({ hours: 48 }).list.history.hours).toBe(24);
    expect(withHistory({ hours: 0 }).list.history.hours).toBe(1);
    expect(withHistory({ hours: 7.6 }).list.history.hours).toBe(8);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("what is no number at all is an error, as for every number", () => {
    expect(() => withHistory({ hours: "lots" })).toThrow();
    expect(() => withHistory({ place: "left" })).toThrow();
    expect(() => withHistory({ consumers: "yes" })).toThrow();
    expect(() => withHistory("on")).toThrow();
  });

  it("names an unknown key in the block instead of dropping it silently", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    withHistory({ hourz: 6 });
    expect(warn.mock.calls.some(([m]) => String(m).includes("list.history.hourz"))).toBe(true);
    warn.mockRestore();
  });
});
