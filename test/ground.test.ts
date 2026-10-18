import { describe, expect, it } from "vitest";
import { brightness, onDarkGround, seeThrough } from "../src/render/ground";

describe("a fill that lets the lines show through (K-16)", () => {
  it("is anything with less than full alpha", () => {
    expect(seeThrough("rgba(0, 0, 0, 0)")).toBe(true);
    expect(seeThrough("rgba(255, 255, 255, 0.5)")).toBe(true);
    expect(seeThrough("transparent")).toBe(true);
    expect(seeThrough("color(srgb 1 1 1 / 0.5)")).toBe(true);
    expect(seeThrough("oklch(0.5 0.1 200 / 50%)")).toBe(true);
  });

  it("is not an opaque colour, nor one it cannot read", () => {
    expect(seeThrough("rgb(255, 255, 255)")).toBe(false);
    expect(seeThrough("rgba(28, 28, 28, 1)")).toBe(false);
    expect(seeThrough("oklch(0.5 0.1 200)")).toBe(false);
    expect(seeThrough("color(srgb 1 1 1 / 100%)")).toBe(false);
    // Unreadable counts as opaque: the card then draws as it always has.
    expect(seeThrough("")).toBe(false);
    expect(seeThrough("not a colour")).toBe(false);
  });
});

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
