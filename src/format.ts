/**
 * Number formatting that follows the user's Home Assistant profile.
 * Owner: agent 4. REQ K-7, K-4.
 */
import type { HassEntity, HomeAssistant, PowerFormat } from "./types";

const DEFAULT_FORMAT: PowerFormat = { unit: "kW", decimals: 2 };

/**
 * Languages that put a space between number and "%", as Home Assistant's
 * `blankBeforePercent` does. Only used by the fallback path of `formatSoc`.
 */
const BLANK_BEFORE_PERCENT = new Set(["cs", "de", "fi", "fr", "sk", "sv"]);

/** Primary subtag only: "de-CH" behaves like "de". */
function baseLanguage(language: string | undefined): string {
  return (language ?? "").split("-")[0].toLowerCase();
}

/**
 * Watts in the configured format: "x,xx kW" with a fixed number of decimals,
 * or whole watts ("1 525 W"). Commercial rounding via Intl (1525 W becomes
 * "1,53 kW"); separators follow `hass.locale`, all seven `number_format`
 * values. Never renders negative zero (REQ K-7).
 */
export function formatPower(
  w: number,
  hass: HomeAssistant,
  format: PowerFormat = DEFAULT_FORMAT,
): string {
  const digits = format.unit === "W" ? 0 : format.decimals;
  const formatter = new Intl.NumberFormat(localeFor(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...(hass?.locale?.number_format === "none" ? { useGrouping: false } : {}),
  });
  const text = formatter.format(format.unit === "W" ? w : w / 1000);
  // A value that rounds to zero must not keep its sign (REQ K-7); testing the
  // digits works for every locale, whereas comparing against "-0" does not.
  return `${/[1-9]/.test(text) ? text : formatter.format(0)} ${format.unit}`;
}

/** The default format - kW with two decimals. */
export function formatKW(w: number, hass: HomeAssistant): string {
  return formatPower(w, hass);
}

/** Maps `hass.locale` onto an Intl locale argument, mirroring HA's numberFormatToLocale. */
export function localeFor(hass: HomeAssistant): string | string[] | undefined {
  switch (hass?.locale?.number_format) {
    case "comma_decimal":
      return ["en-US", "en"];
    case "decimal_comma":
      return ["de", "es", "it"];
    case "space_comma":
      return ["fr", "sv", "cs"];
    case "quote_decimal":
      return ["de-CH"];
    case "none":
      return "en-US";
    case "system":
      return undefined;
    default:
      return hass?.locale?.language;
  }
}

/**
 * State of charge as the user's HA would render it, including the language
 * dependent space before "%" (REQ K-4). Uses `hass.formatEntityState` when
 * available, otherwise falls back to own formatting.
 */
export function formatSoc(stateObj: HassEntity | undefined, hass: HomeAssistant): string {
  if (!stateObj) return "—";
  const value = Number(stateObj.state);
  if (stateObj.state.trim() === "" || !Number.isFinite(value)) return "—";

  if (hass?.formatEntityState) return hass.formatEntityState(stateObj);

  const precision = hass?.entities?.[stateObj.entity_id]?.display_precision;
  // Without a registry precision HA keeps the decimals the state string carries.
  const digits =
    typeof precision === "number" ? precision : (stateObj.state.split(".")[1]?.length ?? 0);
  const number = new Intl.NumberFormat(localeFor(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...(hass?.locale?.number_format === "none" ? { useGrouping: false } : {}),
  }).format(value);
  const language = baseLanguage(hass?.locale?.language ?? hass?.language);
  return `${number}${BLANK_BEFORE_PERCENT.has(language) ? " " : ""}%`;
}
