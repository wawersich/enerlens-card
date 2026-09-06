/**
 * Number formatting that follows the user's Home Assistant profile.
 * Owner: agent 4. REQ K-7, K-4.
 */
import type { HassEntity, HomeAssistant } from "./types";

/**
 * Watts as "x,xx kW" - always kW, always two decimals, commercial rounding
 * via Intl (1525 W becomes "1,53 kW"). Separators follow `hass.locale`,
 * all seven `number_format` values. Never renders negative zero (REQ K-7).
 */
export function formatKW(_w: number, _hass: HomeAssistant): string {
  throw new Error("TODO: agent 4");
}

/** Maps `hass.locale` onto an Intl locale argument, mirroring HA's numberFormatToLocale. */
export function localeFor(_hass: HomeAssistant): string | string[] | undefined {
  throw new Error("TODO: agent 4");
}

/**
 * State of charge as the user's HA would render it, including the language
 * dependent space before "%" (REQ K-4). Uses `hass.formatEntityState` when
 * available, otherwise falls back to own formatting.
 */
export function formatSoc(_stateObj: HassEntity | undefined, _hass: HomeAssistant): string {
  throw new Error("TODO: agent 4");
}
