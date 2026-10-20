/**
 * Number formatting that follows the user's Home Assistant profile.
 * Owner: agent 4. REQ K-7, K-4.
 */
import { localize } from "./localize";
import type { ExtraDecimals, HassEntity, HomeAssistant, PowerFormat } from "./types";

const DEFAULT_FORMAT: PowerFormat = { unit: "kW", decimals: 2, digits: 3 };

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
 * The unit a value picks for itself (REQ K-7).
 *
 * "auto" decides the unit and nothing else: whole watts below a kilowatt,
 * kilowatts above. How many decimals those kilowatts get stays the user's
 * choice - the two questions only look like one. A fixed kilowatt column
 * writes a fridge at 30 W as "0,0 kW", which is the part no number of decimals
 * can fix; the decimals themselves are a matter of taste and better left set.
 *
 * The step is decided on the *rounded* number, so 999.6 W comes out as
 * "1,0 kW" rather than as "1000 W".
 */
function autoUnit(w: number): "W" | "kW" {
  return Math.round(Math.abs(w)) < 1000 ? "W" : "kW";
}

/**
 * Decimal places for a kilowatt figure written to `digits` significant ones.
 *
 * A decimal place says something different at every size: at 1,23 kW two of
 * them are a tenth of a percent, at 123 kW they would be a thousandth - and
 * "123,46 kW" claims a precision no house meter has. Significant digits keep
 * what the number actually tells constant: 1,23 kW, 12,3 kW, 123 kW.
 *
 * Rounding can carry a value into the next decade (9,996 -> 10,00), where it
 * would gain a digit it has not earned; asking again on the rounded value
 * takes it back off.
 */
function significantDecimals(kw: number, digits: number): number {
  const places = (value: number) => Math.max(digits - 1 - Math.floor(Math.log10(value)), 0);
  const abs = Math.abs(kw);
  if (!(abs > 0)) return Math.max(digits - 1, 0);
  const first = places(abs);
  const rounded = Number(abs.toFixed(first));
  return rounded > 0 ? Math.min(first, places(rounded)) : first;
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
  if (format.energyHours !== undefined) return formatEnergy(w * format.energyHours, hass);
  const unit = format.unit === "auto" ? autoUnit(w) : format.unit;
  // Watts are always whole: a tenth of a watt is noise, not a reading.
  const digits =
    unit === "W"
      ? 0
      : format.unit === "auto"
        ? significantDecimals(w / 1000, format.digits)
        : format.decimals;
  const formatter = new Intl.NumberFormat(localeFor(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...(hass?.locale?.number_format === "none" ? { useGrouping: false } : {}),
  });
  const value = unit === "W" ? w : w / 1000;
  // A value that rounds to zero must not keep its sign (REQ K-7). Decided on
  // the number: the text may be written in digits other than 0-9 (Persian,
  // Bengali, Marathi), where a test for "1-9" took every value for zero.
  return `${formatter.format(roundsToZero(value, digits) ? 0 : value)} ${unit}`;
}

/**
 * Energy is always kWh with one decimal (REQ EM-5): a day, a week and a month
 * then read alike. Less than a tenth that is not nothing says so rather than
 * claiming 0,0 kWh.
 */
export function formatEnergy(wh: number, hass: HomeAssistant): string {
  const formatter = new Intl.NumberFormat(localeFor(hass), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...(hass?.locale?.number_format === "none" ? { useGrouping: false } : {}),
  });
  const kwh = wh / 1000;
  if (kwh > 0 && kwh < 0.05) return `< ${formatter.format(0.1)} kWh`;
  return `${formatter.format(roundsToZero(kwh, 1) ? 0 : kwh)} kWh`;
}

/** Whether `value` is zero once written with `digits` decimals - "-0,00" is not a reading. */
function roundsToZero(value: number, digits: number): boolean {
  return Number(value.toFixed(digits)) === 0;
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

/**
 * A state of charge read off a consumer row (REQ L-15): whole percent, with
 * the space before "%" the language asks for (K-4). Whole numbers because the
 * value column has no room to spare and a car reports in whole percent anyway.
 */
export function formatPercent(value: number, hass: HomeAssistant): string {
  const number = new Intl.NumberFormat(localeFor(hass), { maximumFractionDigits: 0 }).format(
    Math.round(value),
  );
  const language = baseLanguage(hass?.locale?.language ?? hass?.language);
  return `${number}${BLANK_BEFORE_PERCENT.has(language) ? " " : ""}%`;
}

/** When a value was measured, for "as of 14:05" - with the date unless it is today. */
export function formatClock(t: number, hass: HomeAssistant, now = Date.now()): string {
  const when = new Date(t);
  const time = when.toLocaleTimeString(localeFor(hass), { hour: "2-digit", minute: "2-digit" });
  if (when.toDateString() === new Date(now).toDateString()) return time;
  const date = when.toLocaleDateString(localeFor(hass), { day: "numeric", month: "numeric" });
  return `${date} ${time}`;
}

/**
 * Device classes Home Assistant writes in its own way - a currency symbol, a
 * duration in hours and minutes, a date. A chosen number of digits would only
 * get in the way there (REQ Z-5).
 */
const OWN_FORMAT_CLASSES = new Set(["monetary", "duration", "timestamp", "date"]);

/** Home Assistant's rule: a space before every unit but "°", and before "%" by language. */
function blankBeforeUnit(unit: string, hass: HomeAssistant): string {
  if (unit === "°") return "";
  if (unit === "%") {
    return BLANK_BEFORE_PERCENT.has(baseLanguage(hass?.locale?.language ?? hass?.language))
      ? " "
      : "";
  }
  return " ";
}

/**
 * The state of any entity for an extra field (REQ Z-5): as Home Assistant
 * shows it, or with a chosen number of decimals or significant digits. The
 * unit stays the entity's own - nothing is converted, nothing computed (Z-1).
 */
export function formatExtra(
  stateObj: HassEntity | undefined,
  hass: HomeAssistant,
  decimals: ExtraDecimals,
): string {
  if (!stateObj || stateObj.state === "unavailable" || stateObj.state === "unknown") {
    return localize("state.unavailable", hass);
  }
  const unit = stateObj.attributes.unit_of_measurement;
  const value = Number(stateObj.state);
  // Numeric the way Home Assistant decides it: a unit or a state class, and a number.
  const numeric =
    (Boolean(unit) || Boolean(stateObj.attributes.state_class)) &&
    stateObj.state.trim() !== "" &&
    Number.isFinite(value);
  const own = OWN_FORMAT_CLASSES.has(String(stateObj.attributes.device_class ?? ""));
  if (decimals === "ha" || !numeric || own) {
    if (hass?.formatEntityState) return hass.formatEntityState(stateObj);
    return unit ? `${stateObj.state}${blankBeforeUnit(unit, hass)}${unit}` : stateObj.state;
  }
  const significant = typeof decimals === "number" ? 0 : Number(decimals.slice(3));
  const wanted = typeof decimals === "number" ? decimals : significantDecimals(value, significant);
  // Intl takes at most 20 fraction digits on older engines; a value that small
  // is a zero for any display, and written as one.
  const digits = wanted > 20 ? significantDecimals(0, significant) : wanted;
  const formatter = new Intl.NumberFormat(localeFor(hass), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...(hass?.locale?.number_format === "none" ? { useGrouping: false } : {}),
  });
  const number = formatter.format(roundsToZero(value, digits) ? 0 : value);
  return unit ? `${number}${blankBeforeUnit(unit, hass)}${unit}` : number;
}
