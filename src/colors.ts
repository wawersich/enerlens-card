/**
 * Palette, state-of-charge gradient, CSS variable resolution.
 * Owner: agent 4. REQ 4.7, C-1 - C-4.
 */
import type { Config, SocStop } from "./types";

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
