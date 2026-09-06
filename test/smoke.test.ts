import { describe, expect, it } from "vitest";
import { CARD_VERSION } from "../src/const";
import { POWER_UNITS } from "../src/model";

describe("scaffold", () => {
  it("exposes a version", () => {
    expect(CARD_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("knows the SI power units case-sensitively (REQ 4.1)", () => {
    expect(POWER_UNITS.mW).toBe(1e-3);
    expect(POWER_UNITS.MW).toBe(1e6);
  });
});
