/**
 * Turns the YAML the user wrote into a `Config` with every default filled in.
 * Owner: agent 1. REQ section 3, E-1, E-2, A-1.
 */
import type { Config, HomeAssistant, RawConfig } from "./types";

/**
 * Validates and normalizes. Throws `ConfigError` for structural problems only
 * (REQ E-1 path 1) - never for runtime issues like a missing entity.
 *
 * `hass` may be undefined: HA calls setConfig before assigning hass. It is
 * passed only so error messages can be localized (REQ E-1).
 */
export function normalizeConfig(_raw: RawConfig, _hass?: HomeAssistant): Config {
  throw new Error("TODO: agent 1");
}

/** Entity ids the card depends on - for change detection (REQ T-3) and prefill (V-6). */
export function collectEntityIds(_config: Config): string[] {
  throw new Error("TODO: agent 1");
}
