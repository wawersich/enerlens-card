import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONSUMER_PALETTE,
  consumerColor,
  hexToHsv,
  hslToHsv,
  hsvToHex,
  hsvToHsl,
  socColor,
  swatchHex,
} from "../src/colors";
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

describe("swatchHex (REQ C-1)", () => {
  it("normalises the notations a colour can be written in", () => {
    expect(swatchHex("#f90")).toBe("#ff9900");
    expect(swatchHex("#FF9900")).toBe("#ff9900");
    expect(swatchHex("rgb(255, 153, 0)")).toBe("#ff9900");
    expect(swatchHex("rgba(255 153 0 / 0.5)")).toBe("#ff9900");
  });

  it("has nothing to show for an empty or unreadable value", () => {
    expect(swatchHex("")).toBeNull();
    expect(swatchHex("   ")).toBeNull();
    expect(swatchHex("rebeccapurple")).toBeNull();
    expect(swatchHex("var(--primary-color)")).toBeNull();
  });

  it("falls back to the value behind the comma when nothing resolves var()", () => {
    expect(swatchHex("var(--energy-solar-color, #ff9800)")).toBe("#ff9800");
    expect(swatchHex("var(--a, var(--b, rgb(1, 2, 3)))")).toBe("#010203");
  });

  it("prefers what the browser computes, theme variable and all", () => {
    const probe = (css: string) => (css.startsWith("var(") ? "rgb(0, 128, 0)" : "");
    // The theme defines the variable, so its own colour wins over the fallback.
    expect(swatchHex("var(--energy-solar-color, #ff9800)", probe)).toBe("#008000");
    expect(swatchHex("rebeccapurple", () => "rgb(102, 51, 153)")).toBe("#663399");
  });

  it("reads the written value when the probe comes back empty", () => {
    expect(swatchHex("#abcdef", () => "")).toBe("#abcdef");
    expect(swatchHex("var(--x, #abcdef)", () => "")).toBe("#abcdef");
  });
});

describe("hexToHsv / hsvToHex (REQ E-3)", () => {
  it("round-trips the colours the palette is written in", () => {
    for (const hex of ["#ff9800", "#488fc2", "#f06292", "#7d7d7d", "#000000", "#ffffff"]) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });

  it("puts the primaries where they belong on the wheel", () => {
    expect(hexToHsv("#ff0000")).toEqual({ h: 0, s: 1, v: 1 });
    expect(hexToHsv("#00ff00")).toEqual({ h: 120, s: 1, v: 1 });
    expect(hexToHsv("#0000ff")).toEqual({ h: 240, s: 1, v: 1 });
    expect(hsvToHex({ h: 120, s: 1, v: 1 })).toBe("#00ff00");
    expect(hsvToHex({ h: 360, s: 1, v: 1 })).toBe("#ff0000");
  });

  it("keeps the hue of a grey rather than snapping it to red", () => {
    // A grey has no hue of its own; inventing one would make the strip jump the
    // moment someone drags the brightness to zero.
    expect(hexToHsv("#808080", 200).h).toBe(200);
    expect(hexToHsv("#000000", 200)).toEqual({ h: 200, s: 0, v: 0 });
  });

  it("stays inside the range whatever it is handed", () => {
    expect(hsvToHex({ h: -30, s: 2, v: 2 })).toBe("#ff0080");
    expect(hsvToHex({ h: 400, s: -1, v: 0.5 })).toBe("#808080");
    expect(hexToHsv("not a colour")).toEqual({ h: 0, s: 0, v: 0 });
  });
});

describe("hsvToHsl / hslToHsv (REQ E-3)", () => {
  it("round-trips through the other model", () => {
    for (const hex of ["#ff9800", "#1400ff", "#7d7d7d", "#ffffff", "#000000"]) {
      const hsv = hexToHsv(hex);
      expect(hsvToHex(hslToHsv(hsvToHsl(hsv)))).toBe(hex);
    }
  });

  it("agrees with what CSS means by hsl()", () => {
    // Pure red: full saturation, half lightness.
    expect(hsvToHsl({ h: 0, s: 1, v: 1 })).toEqual({ h: 0, s: 1, l: 0.5 });
    // White and black have no saturation left to speak of.
    expect(hsvToHsl({ h: 200, s: 0, v: 1 })).toEqual({ h: 200, s: 0, l: 1 });
    expect(hsvToHsl({ h: 200, s: 0, v: 0 })).toEqual({ h: 200, s: 0, l: 0 });
    expect(hslToHsv({ h: 120, s: 1, l: 0.5 })).toEqual({ h: 120, s: 1, v: 1 });
  });
});
