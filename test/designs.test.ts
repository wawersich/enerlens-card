import { describe, expect, it } from "vitest";
import { NO_DESIGN, designName, flowDesign, flowDesigns } from "../src/designs";
import type { HomeAssistant } from "../src/types";

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
      expect(design.shape.caps).toBeGreaterThanOrEqual(0);
      expect(design.shape.bias).toBeGreaterThanOrEqual(0);
      for (const ground of [design.dark, design.light]) {
        expect(ground.dot).toBeGreaterThan(0);
        expect(ground.core).toBeGreaterThanOrEqual(0);
        expect(ground.coreLight).toBeGreaterThanOrEqual(0);
        expect(ground.glow).toBeGreaterThanOrEqual(0);
        expect(ground.glowStrength).toBeGreaterThanOrEqual(0);
        expect(ground.line).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("names a design for the language the interface speaks", () => {
    const withBoth = flowDesigns().find((entry) => entry.name_en);
    if (!withBoth) throw new Error("no design carries a second name any more");
    const speaking = (language: string) => ({ language }) as HomeAssistant;
    expect(designName(withBoth, speaking("de"))).toBe(withBoth.name);
    expect(designName(withBoth, speaking("de-CH"))).toBe(withBoth.name);
    expect(designName(withBoth, speaking("en"))).toBe(withBoth.name_en);
    // The card falls back to English for a language it does not speak, so an
    // Italian reads an English interface - and must not meet a German name.
    expect(designName(withBoth, speaking("it"))).toBe(withBoth.name_en);
    expect(designName(withBoth, undefined)).toBe(withBoth.name_en);
  });

  it("stands in with the one name when a design has only one", () => {
    const single = flowDesigns().find((entry) => !entry.name_en);
    if (!single) return; // every design carries both - nothing to check
    for (const language of ["de", "en", "it"]) {
      expect(designName(single, { language } as HomeAssistant)).toBe(single.name);
    }
  });

  it("has unique names in both languages, or the list cannot be read", () => {
    for (const language of ["de", "en"]) {
      const hass = { language } as HomeAssistant;
      const names = flowDesigns().map((entry) => designName(entry, hass).toLowerCase());
      expect(new Set(names).size, `duplicate name in ${language}`).toBe(names.length);
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
