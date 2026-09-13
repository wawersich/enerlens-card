/**
 * Palette, state-of-charge gradient, CSS variable resolution.
 * Owner: agent 4. REQ 4.7, C-1 - C-4.
 */
import type { ColorKey, Config, SocStop } from "./types";

/**
 * Node colours out of the box. Theme variables rather than fixed values, so the
 * card follows the dashboard and Home Assistant's own energy colours; the hex
 * behind the comma is what a theme without those variables falls back to (REQ C-1).
 */
export const DEFAULT_COLORS: Record<ColorKey, string> = {
  solar: "var(--energy-solar-color, #ff9800)",
  house: "var(--primary-color)",
  grid_import: "var(--energy-grid-consumption-color, #488fc2)",
  grid_export: "var(--energy-grid-return-color, #8353d1)",
  battery_charge: "var(--energy-battery-in-color, #f06292)",
  battery_discharge: "var(--energy-battery-out-color, #4db6ac)",
  rest: "#7d7d7d",
};

/** The state-of-charge gradient out of the box: empty is red, full is green. */
export const DEFAULT_SOC_STOPS: readonly SocStop[] = Object.freeze([
  { at: 0, color: "#e53935" },
  { at: 50, color: "#fdd835" },
  { at: 100, color: "#43a047" },
]);

/** Assigned to consumers without an explicit colour, in configuration order (REQ C-4). */
export const DEFAULT_CONSUMER_PALETTE: readonly string[] = Object.freeze([
  "#7e57c2",
  "#26a69a",
  "#ec407a",
  "#8d6e63",
  "#5c6bc0",
  "#ffca28",
  "#66bb6a",
  "#78909c",
  "#ab47bc",
  "#29b6f6",
]);

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_SHORT = /^#([\da-f])([\da-f])([\da-f])$/i;
const HEX_LONG = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
const RGB_FUNC = /^rgba?\(([^)]*)\)$/i;

/** Parses the notations a theme may hand us; anything else (var(), named colours) is null. */
function parseColor(value: string): Rgba | null {
  const text = value.trim();

  const short = HEX_SHORT.exec(text);
  if (short) {
    const [, r, g, b] = short;
    return {
      r: Number.parseInt(r + r, 16),
      g: Number.parseInt(g + g, 16),
      b: Number.parseInt(b + b, 16),
      a: 1,
    };
  }

  const long = HEX_LONG.exec(text);
  if (long) {
    const [, r, g, b] = long;
    return {
      r: Number.parseInt(r, 16),
      g: Number.parseInt(g, 16),
      b: Number.parseInt(b, 16),
      a: 1,
    };
  }

  const func = RGB_FUNC.exec(text);
  if (func) {
    // Both the legacy "r, g, b, a" and the modern "r g b / a" syntax.
    const parts = func[1]
      .replace(/\//g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  return null;
}

function toCss({ r, g, b, a }: Rgba): string {
  const channel = (n: number) => Math.min(255, Math.max(0, Math.round(n)));
  const rgb = `${channel(r)}, ${channel(g)}, ${channel(b)}`;
  return a >= 1 ? `rgb(${rgb})` : `rgba(${rgb}, ${a})`;
}

function mix(a: Rgba, b: Rgba, t: number): Rgba {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  };
}

/**
 * Colour for a state of charge, mixing the two neighbouring stops in RGB (REQ 4.7).
 * Two stops sharing an `at` produce a hard edge. `resolve` turns a CSS value into
 * something mixable - pass a getComputedStyle-based resolver for `var(--x)` colours;
 * without it, var() stops are returned unmixed.
 */
export function socColor(
  soc: number,
  stops: SocStop[],
  resolve?: (cssColor: string) => string,
): string {
  if (stops.length === 0) return "";
  const sorted = [...stops].sort((x, y) => x.at - y.at);
  if (sorted.length === 1 || !Number.isFinite(soc)) return sorted[0].color;

  // Last segment whose lower stop is still at or below `soc`; duplicated `at`
  // values leave the pair on the upper stop, which is the hard edge (REQ 4.7).
  let i = 0;
  while (i < sorted.length - 2 && sorted[i + 1].at <= soc) i++;
  const lower = sorted[i];
  const upper = sorted[i + 1];

  const span = upper.at - lower.at;
  const t = span === 0 ? 0 : Math.min(1, Math.max(0, (soc - lower.at) / span));
  // Outside the range and exactly on a stop the configured value is kept
  // verbatim, so var() and the author's notation survive.
  if (t <= 0) return lower.color;
  if (t >= 1) return upper.color;

  const a = parseColor(resolve ? resolve(lower.color) : lower.color);
  const b = parseColor(resolve ? resolve(upper.color) : upper.color);
  // An unmixable stop (var() without `resolve`) wins its half of the segment
  // rather than being guessed at.
  if (!a || !b) return t < 0.5 ? lower.color : upper.color;
  return toCss(mix(a, b, t));
}

/** Colour of one consumer: explicit config wins, else palette by index (REQ C-4). */
export function consumerColor(index: number, config: Config): string {
  const explicit = config.consumers?.[index]?.color;
  if (explicit) return explicit;

  const configured = config.colors?.consumerPalette;
  const palette = configured && configured.length > 0 ? configured : DEFAULT_CONSUMER_PALETTE;
  const position = ((Math.trunc(index) % palette.length) + palette.length) % palette.length;
  return palette[position];
}

/**
 * Resolves `var(--x)` against the document so the gradient can mix real colours.
 * Only the variable name, not its fallback - the browser is the one that knows
 * whether the theme defines it (see `swatchHex` for the fallback path).
 */
export function resolveCssColor(value: string): string {
  const match = /^var\((--[^,)]+)/.exec(value.trim());
  if (!match || typeof getComputedStyle === "undefined") return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || value;
}

/** `var(--x, #ff9800)` -> `#ff9800`; no fallback, or no var() at all, is null. */
function varFallback(value: string): string | null {
  const match = /^var\(\s*--[^,)]+,([\s\S]+)\)$/.exec(value.trim());
  const fallback = match?.[1].trim();
  return fallback ? fallback : null;
}

/**
 * A colour as `#rrggbb`, which is all `<input type="color">` understands.
 *
 * `probe` is the browser's own answer - hand it a function that puts the value
 * on a real element and reads the computed colour back, and named colours,
 * theme variables and every other notation resolve in one step. Without it, or
 * when the probe comes back unusable, the written notation is parsed directly
 * and a `var()` falls back to the value behind its comma - which is the colour
 * the browser would paint anyway. Null when nothing can be made of the value:
 * the caller decides what an unreadable colour looks like.
 */
export function swatchHex(value: string, probe?: (cssColor: string) => string): string | null {
  const text = value.trim();
  if (text === "") return null;

  const rgba = probe ? parseColor(probe(text)) : null;
  const direct = rgba ?? parseColor(text);
  if (direct) {
    const channel = (n: number) =>
      Math.min(255, Math.max(0, Math.round(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${channel(direct.r)}${channel(direct.g)}${channel(direct.b)}`;
  }

  const fallback = varFallback(text);
  return fallback ? swatchHex(fallback, probe) : null;
}

/** A colour on the wheel: hue 0-360, saturation and value 0-1. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** `#rrggbb` -> HSV. Grey has no hue of its own, so it keeps the one passed in. */
export function hexToHsv(hex: string, fallbackHue = 0): Hsv {
  const rgb = parseColor(hex);
  if (!rgb) return { h: fallbackHue, s: 0, v: 0 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const span = max - min;

  let h = fallbackHue;
  if (span > 0) {
    if (max === r) h = 60 * (((g - b) / span) % 6);
    else if (max === g) h = 60 * ((b - r) / span + 2);
    else h = 60 * ((r - g) / span + 4);
  }
  return { h: (h + 360) % 360, s: max === 0 ? 0 : span / max, v: max };
}

/** HSV -> `#rrggbb`, the notation the colour field is written in. */
export function hsvToHex({ h, s, v }: Hsv): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(1, Math.max(0, s));
  const val = Math.min(1, Math.max(0, v));
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  const sector = Math.floor(hue / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector];
  const channel = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** The same colour as the wheel holds it, in the notation CSS calls hsl(). */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** HSV -> HSL. Same hue, different way of splitting the rest. */
export function hsvToHsl({ h, s, v }: Hsv): Hsl {
  const l = v * (1 - s / 2);
  const edge = Math.min(l, 1 - l);
  return { h, s: edge === 0 ? 0 : (v - l) / edge, l };
}

/** HSL -> HSV, so the wheel can go on working in one model. */
export function hslToHsv({ h, s, l }: Hsl): Hsv {
  const v = l + s * Math.min(l, 1 - l);
  return { h, s: v === 0 ? 0 : 2 * (1 - l / v), v };
}
