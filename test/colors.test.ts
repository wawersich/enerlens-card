import { describe, expect, it } from "vitest";
import { DEFAULT_CONSUMER_PALETTE, consumerColor, socColor } from "../src/colors";
import type { Config, SocStop } from "../src/types";

const DEFAULT_STOPS: SocStop[] = [
  { at: 0, color: "#e53935" },
  { at: 50, color: "#fdd835" },
  { at: 100, color: "#43a047" },
];

function configWith(consumers: Array<{ color?: string }>, palette: string[] = []): Config {
  return {
    consumers: consumers.map((c, i) => ({ key: `c${i}`, entity: `sensor.c${i}`, ...c })),
    colors: { consumerPalette: palette },
  } as unknown as Config;
}

describe("socColor (REQ 4.7, C-3)", () => {
  it("returns the stop colour verbatim on a stop", () => {
    expect(socColor(0, DEFAULT_STOPS)).toBe("#e53935");
    expect(socColor(50, DEFAULT_STOPS)).toBe("#fdd835");
    expect(socColor(100, DEFAULT_STOPS)).toBe("#43a047");
  });

  it("mixes linearly between stops", () => {
    expect(socColor(25, DEFAULT_STOPS)).toBe("rgb(241, 137, 53)");
    expect(socColor(75, DEFAULT_STOPS)).toBe("rgb(160, 188, 62)");
    expect(socColor(10, DEFAULT_STOPS)).toBe("rgb(234, 89, 53)");
  });

  it("clamps below the first and above the last stop", () => {
    expect(socColor(-5, DEFAULT_STOPS)).toBe("#e53935");
    expect(socColor(120, DEFAULT_STOPS)).toBe("#43a047");
  });

  it("sorts stops by `at` before mixing", () => {
    const unsorted = [...DEFAULT_STOPS].reverse();
    expect(socColor(25, unsorted)).toBe(socColor(25, DEFAULT_STOPS));
  });

  it("makes a hard edge out of two stops sharing an `at`", () => {
    const stops: SocStop[] = [
      { at: 0, color: "#000000" },
      { at: 50, color: "#ff0000" },
      { at: 50, color: "#00ff00" },
      { at: 100, color: "#0000ff" },
    ];
    expect(socColor(49.9, stops)).toBe("rgb(254, 0, 0)");
    expect(socColor(50, stops)).toBe("#00ff00");
    expect(socColor(50.1, stops)).toBe("rgb(0, 254, 1)");
  });

  it("survives two stops with the same `at` and nothing else", () => {
    const stops: SocStop[] = [
      { at: 50, color: "#111111" },
      { at: 50, color: "#222222" },
    ];
    expect(socColor(50, stops)).toBe("#111111");
  });

  it("understands #rgb, #rrggbb, rgb() and rgba()", () => {
    expect(
      socColor(50, [
        { at: 0, color: "#f00" },
        { at: 100, color: "rgb(0, 0, 255)" },
      ]),
    ).toBe("rgb(128, 0, 128)");
    expect(
      socColor(50, [
        { at: 0, color: "#ff0000" },
        { at: 100, color: "rgb(0 0 255)" },
      ]),
    ).toBe("rgb(128, 0, 128)");
    expect(
      socColor(50, [
        { at: 0, color: "rgba(255, 0, 0, 0)" },
        { at: 100, color: "rgba(0, 0, 255, 1)" },
      ]),
    ).toBe("rgba(128, 0, 128, 0.5)");
  });

  it("keeps var() stops unmixed without a resolver", () => {
    const stops: SocStop[] = [
      { at: 0, color: "var(--red)" },
      { at: 100, color: "#0000ff" },
    ];
    expect(socColor(25, stops)).toBe("var(--red)");
    expect(socColor(75, stops)).toBe("#0000ff");
  });

  it("mixes var() stops once a resolver is given", () => {
    const stops: SocStop[] = [
      { at: 0, color: "var(--red)" },
      { at: 100, color: "#0000ff" },
    ];
    const resolve = (css: string) => (css === "var(--red)" ? "#ff0000" : css);
    expect(socColor(50, stops, resolve)).toBe("rgb(128, 0, 128)");
  });
});

describe("consumerColor (REQ C-4)", () => {
  it("prefers the configured colour", () => {
    expect(consumerColor(0, configWith([{ color: "#123456" }]))).toBe("#123456");
  });

  it("falls back to the built-in palette in configuration order", () => {
    const config = configWith([{}, {}, {}]);
    expect(consumerColor(0, config)).toBe(DEFAULT_CONSUMER_PALETTE[0]);
    expect(consumerColor(2, config)).toBe(DEFAULT_CONSUMER_PALETTE[2]);
  });

  it("cycles through the palette", () => {
    expect(consumerColor(DEFAULT_CONSUMER_PALETTE.length, configWith([{}]))).toBe(
      DEFAULT_CONSUMER_PALETTE[0],
    );
    const custom = configWith([{}], ["#aaaaaa", "#bbbbbb"]);
    expect(consumerColor(3, custom)).toBe("#bbbbbb");
  });
});
