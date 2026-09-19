/**
 * Light ground or dark one.
 *
 * A design carries a set of values for each (P-10) and the card picks by the
 * theme, without an option of its own. Home Assistant has no "is this a dark
 * theme" flag, so it is read off the card: the background if the theme paints
 * one, otherwise the text colour, whose brightness is the inverse of the
 * ground it has to be legible on.
 */
import type { Appearance } from "../types";

/** Perceived brightness 0..1 of a CSS colour, or undefined if unreadable. */
export function brightness(colour: string): number | undefined {
  const match = colour.match(/rgba?\(([^)]+)\)/i);
  if (!match) return undefined;
  const parts = match[1].split(/[,\s/]+/).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some((n) => !Number.isFinite(n))) return undefined;
  // A fully transparent background says nothing about the ground behind it.
  if (parts.length >= 4 && Number.isFinite(parts[3]) && parts[3] < 0.1) return undefined;
  const [r, g, b] = parts;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Which ground applies, with the setting having the last word.
 *
 * Reading the theme is a guess, and a good one - but a theme that paints no
 * background, or one whose background says something different from how it
 * actually looks, leaves the card picking the wrong half of a design. The
 * setting is there for those, and for simply preferring the other set.
 */
export function groundIsDark(el: Element, appearance: Appearance): boolean {
  if (appearance === "dark") return true;
  if (appearance === "light") return false;
  return onDarkGround(el);
}

/**
 * What a CSS colour actually is, as the browser sees it.
 *
 * The card's colours are theme variables - `var(--energy-solar-color, #ff9800)`
 * is the normal case - and no arithmetic can be done on that string. Put on a
 * real element and read back computed, it comes out as rgb(), fallback behind
 * the comma and all. Returns the input unchanged where that cannot be done, so
 * the caller always has something to paint with.
 */
export function resolveColour(host: Element, colour: string): string {
  if (typeof getComputedStyle !== "function" || typeof document === "undefined") return colour;
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = colour;
  // A value CSS cannot parse leaves the property alone, and the computed
  // colour would then be the inherited one - an answer to another question.
  if (probe.style.color === "") return colour;
  host.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  return computed || colour;
}

/** True when the card sits on a dark ground. Falls back to dark. */
export function onDarkGround(el: Element): boolean {
  if (typeof getComputedStyle !== "function") return true;
  const style = getComputedStyle(el);
  const ground = brightness(style.backgroundColor);
  if (ground !== undefined) return ground < 0.5;
  // No usable background: the text has to contrast with whatever is behind it,
  // so bright text means a dark ground.
  const text = brightness(style.color);
  return text === undefined ? true : text > 0.5;
}
