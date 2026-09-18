import { describe, expect, it } from "vitest";
import { NO_DESIGN, flowDesign, flowDesigns } from "../src/designs";

describe("flow designs (P-10, P-11)", () => {
  it("ships the designs from the design file", () => {
    const all = flowDesigns();
    expect(all.length).toBeGreaterThan(0);
    for (const design of all) {
      expect(typeof design.id).toBe("string");
      expect(design.id).not.toBe(NO_DESIGN);
      expect(typeof design.name).toBe("string");
    }
  });

  it("gives every design a full set of values for both grounds", () => {
    for (const design of flowDesigns()) {
      expect(typeof design.shape.circle).toBe("boolean");
      expect(typeof design.shape.solidFront).toBe("boolean");
      expect(design.shape.caps).toBeGreaterThanOrEqual(0);
      expect(design.shape.heat).toBeGreaterThanOrEqual(0);
      expect(design.spur.steps).toBeGreaterThan(0);
      for (const ground of [design.dark, design.light]) {
        expect(ground.dot).toBeGreaterThan(0);
        expect(ground.glow).toBeGreaterThanOrEqual(0);
        expect(ground.glowStrength).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("has unique ids, because the config points at them by id", () => {
    const ids = flowDesigns().map((design) => design.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves an id, and nothing else", () => {
    const first = flowDesigns()[0];
    expect(flowDesign(first.id)).toBe(first);
    expect(flowDesign(NO_DESIGN)).toBeUndefined();
    expect(flowDesign(undefined)).toBeUndefined();
    expect(flowDesign("no-such-design")).toBeUndefined();
  });
});
