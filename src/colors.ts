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

/**
 * Colour for a state of charge, mixing the two neighbouring stops in RGB (REQ 4.7).
 * Two stops sharing an `at` produce a hard edge. `resolve` turns a CSS value into
 * something mixable - pass a getComputedStyle-based resolver for `var(--x)` colours;
 * without it, var() stops are returned unmixed.
 */
export function socColor(
  _soc: number,
  _stops: SocStop[],
  _resolve?: (cssColor: string) => string,
): string {
  throw new Error("TODO: agent 4");
}

/** Colour of one consumer: explicit config wins, else palette by index (REQ C-4). */
export function consumerColor(_index: number, _config: Config): string {
  throw new Error("TODO: agent 4");
}
