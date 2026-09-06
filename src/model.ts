/**
 * Reads Home Assistant state into a `Model`: watts, resolved signs, availability,
 * and the one derived balance quantity.
 * Owner: agent 2. REQ 4.1 - 4.3, K-8, K-9, A-1 - A-6.
 */
import type { Config, HomeAssistant, Model } from "./types";

/** Case-sensitive SI factors for `device_class: power` (REQ 4.1). */
export const POWER_UNITS: Readonly<Record<string, number>> = Object.freeze({
  mW: 1e-3,
  W: 1,
  kW: 1e3,
  MW: 1e6,
  GW: 1e9,
  TW: 1e12,
});

/** Builds the model for the current instant. Never throws (REQ N-5). */
export function buildModel(_hass: HomeAssistant, _config: Config): Model {
  throw new Error("TODO: agent 2");
}

/**
 * Same as `buildModel`, but every power value is supplied by `valueOf` instead of
 * read from `hass`. This is how the averaged view modes reuse the whole pipeline:
 * the caller hands in window means (REQ V-4). `valueOf` returns watts, or null
 * when unavailable. The state of charge is always read live (REQ V-5).
 */
export function buildModelFrom(
  _hass: HomeAssistant,
  _config: Config,
  _valueOf: (entityId: string) => number | null,
): Model {
  throw new Error("TODO: agent 2");
}
