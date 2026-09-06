/**
 * Card and editor strings in German and English.
 * Owner: agent 4. REQ N-7, E-6, E-1.
 */
import type { HomeAssistant } from "./types";

/**
 * Looks up a dotted key, e.g. "node.grid.import".
 *
 * The language chain is `hass?.language ?? document.documentElement.lang ?? "en"`:
 * setConfig runs before hass exists, and its error messages must still be
 * translated (REQ E-1). Unknown keys return the key itself.
 * `params` fills `{placeholders}`, e.g. { minutes: 15 }.
 */
export function localize(
  _key: string,
  _hass?: HomeAssistant,
  _params?: Record<string, string | number>,
): string {
  throw new Error("TODO: agent 4");
}
