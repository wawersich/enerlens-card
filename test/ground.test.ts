import { describe, expect, it } from "vitest";
import { brightness, onDarkGround } from "../src/render/ground";

describe("light ground or dark (P-10)", () => {
  it("reads the brightness of a colour", () => {
    expect(brightness("rgb(0, 0, 0)")).toBe(0);
    expect(brightness("rgb(255, 255, 255)")).toBeCloseTo(1);
    expect(brightness("rgb(28, 28, 28)")).toBeLessThan(0.5);
    expect(brightness("not a colour")).toBeUndefined();
  });

  it("ignores a background that is as good as transparent", () => {
    expect(brightness("rgba(255, 255, 255, 0)")).toBeUndefined();
    expect(brightness("rgba(255, 255, 255, 0.9)")).toBeCloseTo(1);
  });

  it("falls back to the text colour when the card paints no background", () => {
    const el = (background: string, colour: string) =>
      ({ style: { backgroundColor: background, color: colour } }) as unknown as Element;
    const original = globalThis.getComputedStyle;
    globalThis.getComputedStyle = ((node: unknown) =>
      (node as { style: CSSStyleDeclaration }).style) as typeof getComputedStyle;
    try {
      expect(onDarkGround(el("rgb(28, 28, 28)", "rgb(255,255,255)"))).toBe(true);
      expect(onDarkGround(el("rgb(255, 255, 255)", "rgb(0,0,0)"))).toBe(false);
      // Transparent card: bright text means the ground behind it is dark.
      expect(onDarkGround(el("rgba(0, 0, 0, 0)", "rgb(240,240,240)"))).toBe(true);
      expect(onDarkGround(el("rgba(0, 0, 0, 0)", "rgb(20,20,20)"))).toBe(false);
    } finally {
      globalThis.getComputedStyle = original;
    }
  });
});
