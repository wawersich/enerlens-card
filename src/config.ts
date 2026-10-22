/**
 * Turns the YAML the user wrote into a `Config` with every default filled in.
 * Owner: agent 1. REQ section 3, E-1, E-2, A-1.
 */
import { DEFAULT_COLORS, DEFAULT_CONSUMER_PALETTE, DEFAULT_SOC_STOPS } from "./colors";
import { localize } from "./localize";
import { normalizeState, warnUnusable } from "./outage";
import {
  type AnimationMode,
  type Appearance,
  type ChargeShow,
  type ColorKey,
  type Config,
  ConfigError,
  type EnergyChoice,
  type EnergyPeriod,
  type ExtraColorKey,
  type ExtraDecimals,
  type ExtraField,
  type ExtraPosition,
  type ExtraWeight,
  type GridStatusSpec,
  type HomeAssistant,
  type IconKey,
  type InactiveLines,
  type InsideField,
  type LabelField,
  type ListScope,
  type NodeKey,
  type NodeOptions,
  type NormalizedCharge,
  type NormalizedConsumer,
  type PowerFormat,
  type PowerUnit,
  type RawConfig,
  type RingAnimation,
  type SocStop,
  type SourceSpec,
  type ViewMode,
} from "./types";

const COLOR_KEYS: readonly ColorKey[] = [
  "solar",
  "house",
  "grid_import",
  "grid_export",
  "battery_charge",
  "battery_discharge",
  "rest",
];

/** `battery` is deliberately absent: without a value it follows the state of charge. */
const DEFAULT_ICONS: Partial<Record<NodeKey, string>> = {
  solar: "mdi:white-balance-sunny",
  grid: "mdi:transmission-tower",
  house: "mdi:home",
};

const VIEW_MODES: readonly ViewMode[] = ["current", "avg_short", "avg_long"];
const ENERGY_PERIODS: readonly EnergyPeriod[] = ["today", "24h", "week", "7d", "month", "30d"];
const ENERGY_CHOICES: readonly EnergyChoice[] = ["power", ...ENERGY_PERIODS];
/** Offered without any configuration, once the statistics are there (QB-8). */
const ENERGY_DEFAULT: readonly EnergyChoice[] = ["power", "today", "24h", "week"];
const LIST_SCOPES: readonly ListScope[] = ["filtered", "full"];
const ANIMATION_MODES: readonly AnimationMode[] = ["auto", "on", "off"];
const INACTIVE_LINES: readonly InactiveLines[] = ["show", "dim", "hide"];
const RING_ANIMATIONS: readonly RingAnimation[] = ["overtake", "fade", "jump"];
const APPEARANCES: readonly Appearance[] = ["auto", "light", "dark"];

export const KNOWN_KEYS: ReadonlySet<string> = new Set([
  "type",
  "title",
  "entities",
  "consumers",
  "min_consumer_w",
  "max_consumers",
  "update_interval_s",
  "list",
  "ring",
  "view",
  "flow",
  "colors",
  "icons",
  "power",
  "appearance",
  "nodes",
  "memory_id",
]);

/**
 * Keys Lovelace itself puts on a card config, and card_mod from the card-mod
 * plugin - ours to ignore, never to warn about.
 */
const HOST_KEYS: ReadonlySet<string> = new Set([
  "view_layout",
  "layout_options",
  "grid_options",
  "visibility",
  "card_mod",
]);

/** Key names of the two-entity form per REQ E-2; `positive` is always the positive direction. */
interface SplitKeys {
  positive: string;
  negative: string;
}

const GRID_SPLIT: SplitKeys = { positive: "import", negative: "export" };
const BATTERY_SPLIT: SplitKeys = { positive: "discharge", negative: "charge" };

// ---------------------------------------------------------------------------
// Small validation helpers - every failure is a structural error (REQ E-1)
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(
  key: string,
  field: string,
  hass?: HomeAssistant,
  params?: Record<string, string | number>,
): ConfigError {
  return new ConfigError(localize(key, hass, { field, ...params }), field);
}

function requireRecord(
  value: unknown,
  field: string,
  hass?: HomeAssistant,
): Record<string, unknown> {
  if (!isRecord(value)) throw fail("error.config.object", field, hass);
  return value;
}

function requireString(value: unknown, field: string, hass?: HomeAssistant): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw fail("error.config.string", field, hass);
  }
  return value;
}

/**
 * "Not set" has three spellings once a GUI is involved: undefined from YAML,
 * `null` from a cleared number or boolean field or a YAML key left without a
 * value, `""` from a cleared text or select - and text of nothing but spaces
 * is no more than that. None of them is a configuration error - it is the
 * absence of one (REQ E-1, issue #15). Every optional reader below goes
 * through this.
 */
const isUnset = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "");

/** Optional text. */
function readString(value: unknown, field: string, hass?: HomeAssistant): string | undefined {
  if (isUnset(value)) return undefined;
  return requireString(value, field, hass);
}

/**
 * Optional block. A YAML key left without a value is `null` - the block is
 * not set, not broken (issue #15).
 */
function readBlock(value: unknown, field: string, hass?: HomeAssistant): Record<string, unknown> {
  return isUnset(value) ? {} : requireRecord(value, field, hass);
}

function readBoolean(
  value: unknown,
  field: string,
  fallback: boolean,
  hass?: HomeAssistant,
): boolean {
  if (isUnset(value)) return fallback;
  if (typeof value !== "boolean") throw fail("error.config.boolean", field, hass);
  return value;
}

function readNumber(value: unknown, field: string, fallback: number, hass?: HomeAssistant): number {
  if (isUnset(value)) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw fail("error.config.number", field, hass);
  }
  return value;
}

function readInteger(
  value: unknown,
  field: string,
  fallback: number,
  hass?: HomeAssistant,
): number {
  const n = readNumber(value, field, fallback, hass);
  if (!Number.isInteger(n)) throw fail("error.config.integer", field, hass);
  return n;
}

/** A number the card uses instead of the one configured - for the editor to
 *  say so under the field (E-1, 22.10.2026). */
export interface ConfigNote {
  field: string;
  used: number;
  reason: "min" | "max" | "integer" | "order";
}

/** Collects the notes of the normalizeConfig call running, if asked for. */
let notes: ConfigNote[] | undefined;

/**
 * The limits of every number the editor offers, in one place for card and
 * editor (E-1). Outside them a value is drawn to the limit, never refused.
 */
export const NUMBER_LIMITS: Readonly<
  Record<string, { min: number; max?: number; integer?: boolean }>
> = {
  min_consumer_w: { min: 0 },
  max_consumers: { min: 1, integer: true },
  update_interval_s: { min: 1 },
  "view.avg_short_minutes": { min: 1, max: 120, integer: true },
  "view.avg_long_minutes": { min: 2, max: 240, integer: true },
  "flow.min_w": { min: 0 },
  "flow.peak_w": { min: 1 },
  "flow.slow_below_w": { min: 0 },
  "flow.more_dots_above_w": { min: 0 },
  "flow.max_dots_at_w": { min: 0 },
  "flow.full_speed_w": { min: 0 },
  "flow.max_dots": { min: 2, max: 10, integer: true },
  "flow.slow_s": { min: 0.1 },
  "flow.fast_s": { min: 0.1 },
  "flow.dot_size": { min: 40, max: 150 },
  "flow.line_width": { min: 30, max: 150 },
  "consumers.min_w": { min: 0 },
  "nodes.size": { min: 60, max: 150 },
};

/**
 * A number within its limits: a fraction in a whole-number field rounded, a
 * value outside drawn to the nearer limit - with a warning and a note, never
 * an error card. Typing passes "1" on the way to "15" and "0" on the way to
 * "0.5" (E-1, Markus 22.10.2026). Text where a number belongs still fails:
 * only YAML can write that.
 */
function readLimited(
  value: unknown,
  field: string,
  fallback: number,
  hass?: HomeAssistant,
  limits = NUMBER_LIMITS[field],
): number {
  let n = readNumber(value, field, fallback, hass);
  if (limits.integer && !Number.isInteger(n)) {
    n = Math.round(n);
    console.warn(localize("error.config.rounded", hass, { field, value: n }));
    notes?.push({ field, used: n, reason: "integer" });
  }
  const { min, max } = limits;
  if (n < min || (max !== undefined && n > max)) {
    const reason = n < min ? "min" : "max";
    n = n < min ? min : (max as number);
    console.warn(
      max === undefined
        ? localize("error.config.clamped_min", hass, { field, min, value: n })
        : localize("error.config.clamped", hass, { field, min, max, value: n }),
    );
    notes?.push({ field, used: n, reason });
  }
  return n;
}

/**
 * Values that must rise along a chain, each at least `gap` above the one
 * before. Those someone set are sorted among themselves - two windows typed
 * the wrong way round are swapped (Markus 22.10.2026: "einfach tauschen");
 * a default gives way and is raised. Every value moved is noted (E-1).
 */
function ordered(
  chain: readonly { field: string; value: number; set: boolean; gap: number }[],
  hass?: HomeAssistant,
): number[] {
  const setAt = chain.flatMap((c, i) => (c.set ? [i] : []));
  const sorted = setAt.map((i) => chain[i].value).sort((a, b) => a - b);
  const out = chain.map((c) => c.value);
  setAt.forEach((i, k) => {
    out[i] = sorted[k];
  });
  // A default before a value someone set steps down below it, as far as its
  // own lower limit allows; whatever is still out of order is then raised.
  for (let i = out.length - 1; i > 0; i--) {
    // Only before a value someone set: defaults among themselves keep their order.
    if (!chain[i].set || chain[i - 1].set || out[i] >= out[i - 1] + chain[i].gap) continue;
    const min = NUMBER_LIMITS[chain[i - 1].field]?.min ?? Number.NEGATIVE_INFINITY;
    // Only where that settles it: otherwise the default stays and the value
    // after it is raised - one change, not two.
    if (out[i] - chain[i].gap >= min) out[i - 1] = out[i] - chain[i].gap;
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i] < out[i - 1] + chain[i].gap) out[i] = out[i - 1] + chain[i].gap;
  }
  const moved = chain.map((c, i) => out[i] !== c.value);
  chain.forEach((c, i) => {
    if (moved[i]) {
      console.warn(localize("error.config.order_used", hass, { field: c.field, value: out[i] }));
    }
  });
  // An order is a matter of both: the note stands at every value someone set
  // and at every one moved, a default included (Markus 22.10.2026: "dann bei
  // beiden Werten"). A default nothing happened to stays without one.
  if (moved.some(Boolean)) {
    chain.forEach((c, i) => {
      if (c.set || moved[i]) notes?.push({ field: c.field, used: out[i], reason: "order" });
    });
  }
  return out;
}

function inRange(
  value: number,
  min: number,
  max: number,
  field: string,
  hass?: HomeAssistant,
): number {
  if (value < min || value > max) throw fail("error.config.range", field, hass, { min, max });
  return value;
}

function readEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  fallback: T,
  hass?: HomeAssistant,
): T {
  if (isUnset(value)) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw fail("error.config.enum", field, hass, { allowed: allowed.join(", ") });
  }
  return value as T;
}

/**
 * The values a quick button offers, in their fixed order, each once (QB-2).
 * Undefined = not set; an empty list counts as not set too, with a warning
 * rather than an error card (QB-6, E-1).
 */
function readChoices<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  hass?: HomeAssistant,
): T[] | undefined {
  if (isUnset(value)) return undefined;
  if (!Array.isArray(value)) throw fail("error.config.list", field, hass);
  for (const entry of value) readEnum(entry, allowed, field, allowed[0], hass);
  const picked = allowed.filter((v) => value.includes(v));
  if (picked.length === 0) {
    console.warn(localize("error.config.empty_choice", hass, { field }));
    return undefined;
  }
  return picked;
}

/**
 * The three quick buttons (REQ 2.16): what each offers and where it starts.
 * One value offered = fixed. The deprecated `show_selector: false` fixes
 * every button not configured anew on its start value (QB-7).
 */
function readQuickButtons(
  rawView: Record<string, unknown>,
  rawList: Record<string, unknown>,
  grid: SourceSpec,
  battery: SourceSpec,
  hass?: HomeAssistant,
) {
  const fixed = !readBoolean(rawView.show_selector, "view.show_selector", true, hass);
  const startMode = readEnum(
    rawView.default_mode,
    VIEW_MODES,
    "view.default_mode",
    "current",
    hass,
  );
  const startEnergy = readEnum(
    rawView.default_energy,
    ENERGY_CHOICES,
    "view.default_energy",
    "power",
    hass,
  );
  const startScope = readEnum(
    rawList.default_scope,
    LIST_SCOPES,
    "list.default_scope",
    "filtered",
    hass,
  );

  let modes =
    readChoices(rawView.modes, VIEW_MODES, "view.modes", hass) ??
    (fixed ? [startMode] : [...VIEW_MODES]);
  const field = "view.energy_periods";
  let energy = readChoices(rawView.energy_periods, ENERGY_CHOICES, field, hass);
  // Not set: the bar switched off on purpose keeps to power; otherwise the
  // default, which the card still checks against the statistics (QB-8).
  const energyDefault = energy === undefined && !fixed;
  energy ??= fixed ? [startEnergy] : [...ENERGY_DEFAULT];
  if (
    energy.some((e) => e !== "power") &&
    (grid.kind === "derived" || battery.kind === "derived")
  ) {
    console.warn(localize("error.config.energy_derived", hass, { field }));
    energy = ["power"];
  }
  const power = energy.includes("power");
  // Means exist only for power: without it nothing is averaged (QB-5).
  if (!power) modes = ["current"];
  const scope =
    readChoices(rawList.scope, LIST_SCOPES, "list.scope", hass) ??
    (fixed ? [startScope] : [...LIST_SCOPES]);

  return {
    modes,
    defaultMode: modes.includes(startMode) ? startMode : modes[0],
    power,
    energyPeriods: energy.filter((e): e is EnergyPeriod => e !== "power"),
    energyDefault: energyDefault && energy.length > 1,
    defaultEnergy: energy.includes(startEnergy) ? startEnergy : energy[0],
    scope,
    defaultScope: scope.includes(startScope) ? startScope : scope[0],
  };
}

// ---------------------------------------------------------------------------
// Balance quantities (REQ E-2, A-1)
// ---------------------------------------------------------------------------

/**
 * `split` is undefined for quantities that have no two-entity form: solar and
 * house have no defined key pair, so an object with `import`/`export` there is
 * a structural error rather than a silent guess.
 */
function parseSource(
  value: unknown,
  field: string,
  split: SplitKeys | undefined,
  hass?: HomeAssistant,
): SourceSpec {
  // Empty text is no reference either; a required quantity still fails in
  // requireConfigured, with the message that says what is missing (E-1).
  if (isUnset(value)) return { kind: "absent" };

  if (typeof value === "string") {
    if (value === "derived") return { kind: "derived" };
    return { kind: "single", entity: value, invert: false };
  }

  if (!isRecord(value)) throw fail("error.config.mixed_form", field, hass);

  const keys = Object.keys(value);
  const hasEntity = "entity" in value;
  const hasSplit = split !== undefined && (split.positive in value || split.negative in value);
  // A mixture of the forms is never allowed (REQ section 3).
  if (hasEntity && hasSplit) throw fail("error.config.mixed_form", field, hass);

  if (hasEntity) {
    if (keys.some((k) => k !== "entity" && k !== "invert")) {
      throw fail("error.config.mixed_form", field, hass);
    }
    const entity = value.entity;
    if (typeof entity !== "string" || entity.trim() === "") {
      throw fail("error.config.mixed_form", field, hass);
    }
    const invert = value.invert;
    if (!isUnset(invert) && typeof invert !== "boolean") {
      throw fail("error.config.boolean", `${field}.invert`, hass);
    }
    return { kind: "single", entity, invert: invert === true };
  }

  if (split && hasSplit) {
    if (keys.some((k) => k !== split.positive && k !== split.negative)) {
      throw fail("error.config.mixed_form", field, hass);
    }
    const positive = value[split.positive];
    const negative = value[split.negative];
    if (
      typeof positive !== "string" ||
      positive.trim() === "" ||
      typeof negative !== "string" ||
      negative.trim() === ""
    ) {
      throw fail("error.config.mixed_form", field, hass);
    }
    return { kind: "split", positive, negative };
  }

  throw fail("error.config.mixed_form", field, hass);
}

/**
 * State names of a status entity, lower-cased and de-duplicated. Cleared chips
 * in the editor arrive as empty strings and are dropped (REQ E-1).
 */
function readStateList(value: unknown, field: string, hass?: HomeAssistant): string[] {
  if (isUnset(value)) return [];
  if (!Array.isArray(value)) throw fail("error.config.list", field, hass);
  const states: string[] = [];
  for (const entry of value) {
    if (isUnset(entry)) continue;
    if (typeof entry !== "string") throw fail("error.config.string", field, hass);
    const normalized = normalizeState(entry);
    if (normalized !== "" && !states.includes(normalized)) states.push(normalized);
  }
  return states;
}

/**
 * The optional grid status entity together with the states that mean something.
 * Both lists belong to the user: every integration names its states
 * differently, and a default guessed from one vendor would be wrong more often
 * than right (REQ NS-1).
 *
 * Without usable outage states the feature stays off and says so in the
 * console. Silently accepting half a configuration would be the worse trap -
 * it looks complete and does nothing.
 */
function readGridStatus(
  value: unknown,
  field: string,
  hass?: HomeAssistant,
): GridStatusSpec | undefined {
  if (isUnset(value)) return undefined;
  if (typeof value === "string") {
    warnUnusable(field, hass);
    return undefined;
  }
  const raw = requireRecord(value, field, hass);
  const entity = requireString(raw.entity, `${field}.entity`, hass);
  const outage = readStateList(raw.outage, `${field}.outage`, hass);
  const ok = readStateList(raw.ok, `${field}.ok`, hass);
  if (outage.length === 0) {
    warnUnusable(field, hass);
    return undefined;
  }
  return { entity, outage, ok };
}

function requireConfigured(spec: SourceSpec, field: string, hass?: HomeAssistant): void {
  if (spec.kind === "absent") throw fail("error.config.missing_entities", field, hass);
}

// ---------------------------------------------------------------------------
// Sub-sections
// ---------------------------------------------------------------------------

function readSocStops(value: unknown, hass?: HomeAssistant): SocStop[] {
  const field = "colors.soc_stops";
  if (!Array.isArray(value)) throw fail("error.config.list", field, hass);
  if (value.length < 2) throw fail("error.config.soc_stops", field, hass);

  const stops: SocStop[] = [];
  for (let i = 0; i < value.length; i++) {
    const entry: unknown = value[i];
    if (
      !isRecord(entry) ||
      typeof entry.at !== "number" ||
      !Number.isFinite(entry.at) ||
      typeof entry.color !== "string" ||
      entry.color.trim() === ""
    ) {
      throw fail("error.config.soc_stop_entry", `${field}[${i}]`, hass, { index: i });
    }
    stops.push({ at: entry.at, color: entry.color });
  }

  for (let i = 1; i < stops.length; i++) {
    // Equal `at` is allowed on purpose: it produces a hard edge (REQ C-3).
    if (stops[i].at < stops[i - 1].at) throw fail("error.config.soc_stops", field, hass);
  }
  if (stops[0].at !== 0) throw fail("error.config.soc_stops", field, hass);
  if (stops[stops.length - 1].at !== 100) throw fail("error.config.soc_stops", field, hass);
  return stops;
}

function readPalette(value: unknown, hass?: HomeAssistant): string[] {
  const field = "colors.consumer_palette";
  if (!Array.isArray(value)) throw fail("error.config.list", field, hass);
  if (value.length === 0) throw fail("error.config.non_empty", field, hass);
  return value.map((entry: unknown, i) => requireString(entry, `${field}[${i}]`, hass));
}

const EXTRA_COLOR_KEYS: readonly ExtraColorKey[] = [
  "solar_inside",
  "solar_label",
  "grid_inside",
  "grid_label",
  "house_inside",
  "house_label",
  "battery_label",
];

/** Grey by default: the main values keep the text colour, these step back (REQ Z-6, C-5). */
const DEFAULT_EXTRA_COLOR = "var(--secondary-text-color)";

/** Every extra field grey - what a configuration without colours gets. */
export function defaultExtraColors(): Record<ExtraColorKey, string> {
  return Object.fromEntries(EXTRA_COLOR_KEYS.map((key) => [key, DEFAULT_EXTRA_COLOR])) as Record<
    ExtraColorKey,
    string
  >;
}

/**
 * Text colours of the extra fields (REQ Z-6). An emptied colour field is no
 * colour of its own, as everywhere in the editor (E-1); a colour for the
 * battery's inside field, which does not exist, is dropped with a word.
 */
function readExtraColors(value: unknown, hass?: HomeAssistant): Record<ExtraColorKey, string> {
  const colors = defaultExtraColors();
  if (!isRecord(value)) return colors;
  for (const key of EXTRA_COLOR_KEYS) {
    const colour = readString(value[key], `colors.${key}`, hass);
    if (colour) colors[key] = colour;
  }
  if (!isUnset(value.battery_inside)) {
    console.warn(localize("error.config.not_for_node", hass, { field: "colors.battery_inside" }));
  }
  return colors;
}

function readColors(value: unknown, hass?: HomeAssistant): Config["colors"] {
  const colors: Config["colors"] = {
    ...DEFAULT_COLORS,
    socStops: DEFAULT_SOC_STOPS.map((stop) => ({ ...stop })),
    consumerPalette: [...DEFAULT_CONSUMER_PALETTE],
  };
  const raw = readBlock(value, "colors", hass);
  for (const key of COLOR_KEYS) {
    const colour = readString(raw[key], `colors.${key}`, hass);
    if (colour) colors[key] = colour;
  }
  if (!isUnset(raw.soc_stops)) colors.socStops = readSocStops(raw.soc_stops, hass);
  if (!isUnset(raw.consumer_palette)) {
    colors.consumerPalette = readPalette(raw.consumer_palette, hass);
  }
  return colors;
}

const POWER_UNITS_DISPLAY: readonly PowerUnit[] = ["kW", "W", "auto"];

/** kW with 1-3 decimals (default 2), or whole watts (REQ K-7). */
function readPower(value: unknown, hass?: HomeAssistant): PowerFormat {
  const raw = readBlock(value, "power", hass);
  return {
    // The default stays kW: an installation that never touched this should
    // not change its look because a new option appeared.
    unit: readEnum(raw.unit, POWER_UNITS_DISPLAY, "power.unit", "kW", hass),
    decimals: inRange(
      readInteger(raw.decimals, "power.decimals", 2, hass),
      1,
      3,
      "power.decimals",
      hass,
    ),
    // Two is the fewest that still tells 2,6 kW from 2,5 kW; four writes out
    // more than a house meter knows.
    digits: inRange(readInteger(raw.digits, "power.digits", 3, hass), 2, 4, "power.digits", hass),
  };
}

function readIcons(value: unknown, hass?: HomeAssistant): Partial<Record<IconKey, string>> {
  // The rest has no default: unset it stays the plain colour dot it has always
  // been, and only a configured icon replaces it.
  const icons: Partial<Record<IconKey, string>> = { ...DEFAULT_ICONS };
  const raw = readBlock(value, "icons", hass);
  for (const key of ["solar", "grid", "house", "battery", "rest"] as const) {
    const icon = readString(raw[key], `icons.${key}`, hass);
    if (icon) icons[key] = icon;
  }
  return icons;
}

const CHARGE_SHOWS: readonly ChargeShow[] = ["charging", "plugged", "always"];

/**
 * A consumer's state of charge (REQ L-15). Half-filled forms are ordinary
 * editor states (E-1): without `soc` there is nothing to show, and `plugged`
 * display without a plugged entity cannot decide - both are dropped back to
 * something that works, with a word in the console, never an error card.
 */
function readCharge(
  value: unknown,
  field: string,
  hass?: HomeAssistant,
): NormalizedCharge | undefined {
  if (isUnset(value)) return undefined;
  const raw = requireRecord(value, field, hass);
  const soc = readString(raw.soc, `${field}.soc`, hass);
  if (!soc) {
    console.warn(localize("error.config.charge_no_soc", hass, { field }));
    return undefined;
  }
  let show = readEnum(raw.show, CHARGE_SHOWS, `${field}.show`, "charging", hass);
  const plugged = readString(raw.plugged, `${field}.plugged`, hass);
  if (show === "plugged" && !plugged) {
    console.warn(localize("error.config.charge_no_plugged", hass, { field }));
    show = "charging";
  }
  return {
    soc,
    show,
    plugged,
    // An on/off plug answers on or off; states listed for it would turn every
    // "off" into "plugged in" (REQ L-15).
    unplugged: /^(binary_sensor|input_boolean)\./.test(plugged ?? "")
      ? []
      : readStateList(raw.unplugged, `${field}.unplugged`, hass),
  };
}

/** Entities the charge display reads; watched for changes, never averaged (REQ L-15). */
export function collectChargeIds(config: Config): string[] {
  const ids: string[] = [];
  for (const consumer of config.consumers) {
    const charge = consumer.charge;
    if (!charge) continue;
    for (const id of [charge.soc, charge.plugged]) if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

const NODE_KEYS: readonly NodeKey[] = ["solar", "grid", "house", "battery"];
const EXTRA_POSITIONS: readonly ExtraPosition[] = ["above", "below"];
const EXTRA_WEIGHTS: readonly ExtraWeight[] = ["normal", "medium", "bold"];
const DECIMAL_WORDS: readonly string[] = ["ha", "sig2", "sig3", "sig4"];
const NODE_OPTION_KEYS: ReadonlySet<string> = new Set([
  "show_name",
  "show_state",
  "inside",
  "label",
]);
const FIELD_KEYS: Record<"inside" | "label", ReadonlySet<string>> = {
  inside: new Set(["entity", "position", "decimals", "size", "weight"]),
  label: new Set(["entity", "prefix", "decimals", "size", "weight"]),
};

/**
 * `ha`, a word for significant digits, or 0-3 decimals - as a number from
 * YAML or as the text a select field reports (REQ Z-5, Z-10).
 */
function readDecimals(value: unknown, field: string, hass?: HomeAssistant): ExtraDecimals {
  if (isUnset(value)) return "ha";
  if (typeof value === "string" && DECIMAL_WORDS.includes(value)) return value as ExtraDecimals;
  const n = typeof value === "string" && /^\d$/.test(value) ? Number(value) : value;
  if (n === 0 || n === 1 || n === 2 || n === 3) return n;
  throw fail("error.config.enum", field, hass, { allowed: "ha, 0, 1, 2, 3, sig2, sig3, sig4" });
}

function warnUnknownIn(
  raw: Record<string, unknown>,
  known: ReadonlySet<string>,
  field: string,
  hass?: HomeAssistant,
): void {
  for (const key of Object.keys(raw)) {
    if (!known.has(key)) {
      console.warn(localize("error.config.unknown_key", hass, { field: `${field}.${key}` }));
    }
  }
}

/**
 * One extra field. A field without an entity is an ordinary editor state - the
 * entity picker cleared, or a size set first - and is dropped with a word,
 * never an error card (REQ E-1).
 */
function readExtraField(
  value: unknown,
  place: "inside" | "label",
  field: string,
  hass?: HomeAssistant,
): InsideField | LabelField | undefined {
  if (isUnset(value)) return undefined;
  const raw = requireRecord(value, field, hass);
  warnUnknownIn(raw, FIELD_KEYS[place], field, hass);
  const entity = typeof raw.entity === "string" ? raw.entity.trim() : "";
  if (!entity) {
    console.warn(localize("error.config.extra_no_entity", hass, { field }));
    return undefined;
  }
  const common: ExtraField = {
    entity,
    decimals: readDecimals(raw.decimals, `${field}.decimals`, hass),
    size: readLimited(raw.size, `${field}.size`, 100, hass, NUMBER_LIMITS["nodes.size"]),
    weight: readEnum(raw.weight, EXTRA_WEIGHTS, `${field}.weight`, "normal", hass),
  };
  if (place === "inside") {
    return {
      ...common,
      position: readEnum(raw.position, EXTRA_POSITIONS, `${field}.position`, "above", hass),
    };
  }
  if (!isUnset(raw.prefix) && typeof raw.prefix !== "string") {
    throw fail("error.config.string", `${field}.prefix`, hass);
  }
  // Free text: a stray space from the editor must not refuse the card.
  const prefix = typeof raw.prefix === "string" ? raw.prefix.trim() : "";
  return { ...common, prefix: prefix || undefined };
}

/** Names and state words on, no extra fields - the card as it always was. */
export function defaultNodes(): Record<NodeKey, NodeOptions> {
  return Object.fromEntries(
    NODE_KEYS.map((key) => [key, { showName: true, showState: true }]),
  ) as Record<NodeKey, NodeOptions>;
}

/**
 * Label switches and extra fields per node (REQ Z-1 to Z-6). What does not
 * exist - a field inside the battery, a state word for solar or house - is
 * dropped with a warning: the editor can produce it on the way (E-1).
 */
function readNodes(value: unknown, hass?: HomeAssistant): Record<NodeKey, NodeOptions> {
  const nodes = defaultNodes();
  if (isUnset(value)) return nodes;
  const raw = requireRecord(value, "nodes", hass);
  warnUnknownIn(raw, new Set(NODE_KEYS), "nodes", hass);
  for (const key of NODE_KEYS) {
    if (isUnset(raw[key])) continue;
    const field = `nodes.${key}`;
    const entry = requireRecord(raw[key], field, hass);
    warnUnknownIn(entry, NODE_OPTION_KEYS, field, hass);
    const options = nodes[key];
    options.showName = readBoolean(entry.show_name, `${field}.show_name`, true, hass);
    const showState = readBoolean(entry.show_state, `${field}.show_state`, true, hass);
    if (key === "grid" || key === "battery") options.showState = showState;
    else if (!isUnset(entry.show_state)) {
      console.warn(localize("error.config.not_for_node", hass, { field: `${field}.show_state` }));
    }
    if (key !== "battery") {
      options.inside = readExtraField(entry.inside, "inside", `${field}.inside`, hass) as
        | InsideField
        | undefined;
    } else if (!isUnset(entry.inside)) {
      console.warn(localize("error.config.not_for_node", hass, { field: `${field}.inside` }));
    }
    options.label = readExtraField(entry.label, "label", `${field}.label`, hass) as
      | LabelField
      | undefined;
  }
  return nodes;
}

/** Entities the extra fields show; watched for changes, never averaged (REQ Z-9). */
export function collectExtraIds(config: Config): string[] {
  const ids: string[] = [];
  for (const key of NODE_KEYS) {
    // Without a battery there is no node to show its field.
    if (key === "battery" && config.sources.battery.kind === "absent") continue;
    const { inside, label } = config.nodes[key];
    for (const id of [inside?.entity, label?.entity]) if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

function readConsumers(
  value: unknown,
  palette: string[],
  hass?: HomeAssistant,
): NormalizedConsumer[] {
  if (isUnset(value)) return [];
  if (!Array.isArray(value)) throw fail("error.config.list", "consumers", hass);

  const seen = new Set<string>();
  const consumers: NormalizedConsumer[] = [];
  for (let i = 0; i < value.length; i++) {
    const entry: unknown = value[i];
    const field = `consumers[${i}]`;
    // A row without an entity (picker cleared) or a sensor picked twice are
    // ordinary editor states; the entry is dropped with a warning (REQ E-1).
    if (!isRecord(entry) || typeof entry.entity !== "string" || entry.entity.trim() === "") {
      console.warn(localize("error.config.consumer_entity", hass, { field, index: i }));
      continue;
    }
    const entity = entry.entity;
    if (seen.has(entity)) {
      console.warn(localize("error.config.duplicate_consumer", hass, { field, entity }));
      continue;
    }
    seen.add(entity);
    consumers.push({
      key: entity,
      entity,
      name: readString(entry.name, `${field}.name`, hass),
      // Palette wraps so that even 100 consumers get a colour (REQ C-4, L-11).
      color: readString(entry.color, `${field}.color`, hass) ?? palette[i % palette.length],
      icon: readString(entry.icon, `${field}.icon`, hass),
      minW: isUnset(entry.min_w)
        ? undefined
        : readLimited(entry.min_w, `${field}.min_w`, 0, hass, NUMBER_LIMITS["consumers.min_w"]),
      charge: readCharge(entry.charge, `${field}.charge`, hass),
    });
  }
  return consumers;
}

function warnUnknownKeys(raw: Record<string, unknown>, hass?: HomeAssistant): void {
  for (const key of Object.keys(raw)) {
    if (KNOWN_KEYS.has(key) || HOST_KEYS.has(key)) continue;
    console.warn(localize("error.config.unknown_key", hass, { field: key }));
  }
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

/**
 * Validates and normalizes. Throws `ConfigError` for structural problems only
 * (REQ E-1 path 1) - never for runtime issues like a missing entity.
 *
 * `hass` may be undefined: HA calls setConfig before assigning hass. It is
 * passed only so error messages can be localized (REQ E-1).
 */
export function normalizeConfig(
  raw: RawConfig,
  hass?: HomeAssistant,
  /** Filled with every number used instead of the one configured (E-1). */
  collect?: ConfigNote[],
): Config {
  notes = collect;
  // Asked for notes, the editor reads the configuration on every render;
  // the card itself has said all of it in the console already.
  const warn = console.warn;
  if (collect) console.warn = () => undefined;
  try {
    return readConfig(raw, hass);
  } finally {
    notes = undefined;
    console.warn = warn;
  }
}

function readConfig(raw: RawConfig, hass?: HomeAssistant): Config {
  const rawRecord = requireRecord(raw, "config", hass);
  warnUnknownKeys(rawRecord, hass);

  if (isUnset(rawRecord.entities)) {
    throw fail("error.config.missing_entities", "entities", hass);
  }
  const rawEntities = requireRecord(rawRecord.entities, "entities", hass);

  const solar = parseSource(rawEntities.solar, "entities.solar", undefined, hass);
  const grid = parseSource(rawEntities.grid, "entities.grid", GRID_SPLIT, hass);
  const battery = parseSource(rawEntities.battery, "entities.battery", BATTERY_SPLIT, hass);
  const parsedHouse = parseSource(rawEntities.house, "entities.house", undefined, hass);
  // A missing house is derived silently - the most common setup (REQ A-1).
  const house: SourceSpec = parsedHouse.kind === "absent" ? { kind: "derived" } : parsedHouse;

  requireConfigured(solar, "entities.solar", hass);
  requireConfigured(grid, "entities.grid", hass);

  // An absent battery is not derived, it simply does not exist (REQ A-5).
  const derived = (
    [
      ["entities.solar", solar],
      ["entities.grid", grid],
      ["entities.battery", battery],
      ["entities.house", house],
    ] as const
  )
    .filter(([, spec]) => spec.kind === "derived")
    .map(([field]) => field);
  if (derived.length > 1) {
    throw fail("error.config.two_derived", derived[1], hass);
  }

  let batterySoc: string | undefined;
  batterySoc = readString(rawEntities.battery_soc, "entities.battery_soc", hass);
  if (batterySoc !== undefined) {
    if (battery.kind === "absent") {
      // Reachable from the editor: the SoC picked before the battery entity.
      // Not an error worth a dead card - the value is simply not shown (REQ A-5).
      console.warn(
        localize("error.config.soc_without_battery", hass, { field: "entities.battery_soc" }),
      );
      batterySoc = undefined;
    }
  }

  const gridStatus = readGridStatus(rawEntities.grid_status, "entities.grid_status", hass);

  const colors = readColors(rawRecord.colors, hass);
  const consumers = readConsumers(rawRecord.consumers, colors.consumerPalette, hass);

  const minConsumerW = readLimited(rawRecord.min_consumer_w, "min_consumer_w", 10, hass);
  // No limit configured means no limit at all (REQ section 3, L-4).
  const maxConsumers = isUnset(rawRecord.max_consumers)
    ? Number.POSITIVE_INFINITY
    : readLimited(rawRecord.max_consumers, "max_consumers", 1, hass);
  const updateIntervalS = readLimited(rawRecord.update_interval_s, "update_interval_s", 5, hass);

  const rawList = readBlock(rawRecord.list, "list", hass);
  const rawRing = readBlock(rawRecord.ring, "ring", hass);
  const hasConsumers = consumers.length > 0;

  const rawView = readBlock(rawRecord.view, "view", hass);
  const [avgShortMinutes, avgLongFixed] = ordered(
    [
      {
        field: "view.avg_short_minutes",
        value: readLimited(rawView.avg_short_minutes, "view.avg_short_minutes", 2, hass),
        set: !isUnset(rawView.avg_short_minutes),
        gap: 0,
      },
      {
        field: "view.avg_long_minutes",
        value: readLimited(rawView.avg_long_minutes, "view.avg_long_minutes", 15, hass),
        set: !isUnset(rawView.avg_long_minutes),
        gap: 1,
      },
    ],
    hass,
  );

  const rawFlow = readBlock(rawRecord.flow, "flow", hass);
  const minW = readLimited(rawFlow.min_w, "flow.min_w", 10, hass);
  // peak_w sets the whole step rule at once - the three thresholds keep the
  // ratios of the defaults (500 / 2000 / 6000). An explicit threshold wins.
  const peakW = readLimited(rawFlow.peak_w, "flow.peak_w", 6000, hass);
  const maxDots = readLimited(rawFlow.max_dots, "flow.max_dots", 5, hass);
  // The step rule needs S1 <= S2 < S3 < S4.
  const flowChain = (
    [
      ["flow.min_w", minW, rawFlow.min_w, 0],
      ["flow.slow_below_w", peakW / 12, rawFlow.slow_below_w, 0],
      ["flow.more_dots_above_w", peakW / 3, rawFlow.more_dots_above_w, 1],
      ["flow.max_dots_at_w", peakW, rawFlow.max_dots_at_w, 1],
    ] as const
  ).map(([field, fallback, raw, gap]) => ({
    field,
    value: field === "flow.min_w" ? minW : readLimited(raw, field, fallback, hass),
    set: !isUnset(raw),
    gap,
  }));
  const [minWFixed, slowBelowFixed, moreDotsFixed, maxDotsAtFixed] = ordered(flowChain, hass);
  const [fastS, slowSFixed] = ordered(
    [
      {
        field: "flow.fast_s",
        value: readLimited(rawFlow.fast_s, "flow.fast_s", 1.8, hass),
        set: !isUnset(rawFlow.fast_s),
        gap: 0,
      },
      {
        field: "flow.slow_s",
        value: readLimited(rawFlow.slow_s, "flow.slow_s", 5, hass),
        set: !isUnset(rawFlow.slow_s),
        gap: 1,
      },
    ],
    hass,
  );
  // Full speed and the second dot fall together unless told otherwise; set,
  // it lies above the slow threshold, which stays as the chain left it.
  let fullSpeedFixed = moreDotsFixed;
  if (!isUnset(rawFlow.full_speed_w)) {
    fullSpeedFixed = readLimited(rawFlow.full_speed_w, "flow.full_speed_w", moreDotsFixed, hass);
    if (fullSpeedFixed <= slowBelowFixed) {
      fullSpeedFixed = slowBelowFixed + 1;
      console.warn(
        localize("error.config.order_used", hass, {
          field: "flow.full_speed_w",
          value: fullSpeedFixed,
        }),
      );
      notes?.push({ field: "flow.full_speed_w", used: fullSpeedFixed, reason: "order" });
    }
  }

  const buttons = readQuickButtons(rawView, rawList, grid, battery, hass);

  return {
    title: readString(rawRecord.title, "title", hass),
    // A number is a name too ("memory_id: 1" in YAML).
    memoryId:
      typeof rawRecord.memory_id === "number"
        ? String(rawRecord.memory_id)
        : readString(rawRecord.memory_id, "memory_id", hass),
    sources: { solar, grid, battery, house, batterySoc },
    gridStatus,
    consumers,
    minConsumerW,
    maxConsumers,
    updateIntervalS,
    list: {
      enabled: readBoolean(rawList.enabled, "list.enabled", hasConsumers, hass),
      restLabel: readString(rawList.rest_label, "list.rest_label", hass),
      title: readString(rawList.title, "list.title", hass),
      alwaysBelow: readBoolean(rawList.always_below, "list.always_below", false, hass),
      scope: buttons.scope,
      defaultScope: buttons.defaultScope,
    },
    ring: {
      enabled: readBoolean(rawRing.enabled, "ring.enabled", hasConsumers, hass),
      animation: readEnum(rawRing.animation, RING_ANIMATIONS, "ring.animation", "overtake", hass),
    },
    view: {
      modes: buttons.modes,
      defaultMode: buttons.defaultMode,
      avgShortMinutes,
      avgLongMinutes: avgLongFixed,
      remember: readBoolean(rawView.remember, "view.remember", true, hass),
      power: buttons.power,
      energyPeriods: buttons.energyPeriods,
      energyDefault: buttons.energyDefault,
      defaultEnergy: buttons.defaultEnergy,
    },
    flow: {
      minW: minWFixed,
      slowBelowW: slowBelowFixed,
      fullSpeedW: fullSpeedFixed,
      moreDotsAboveW: moreDotsFixed,
      maxDotsAtW: maxDotsAtFixed,
      maxDots,
      slowS: slowSFixed,
      fastS,
      animation: readEnum(rawFlow.animation, ANIMATION_MODES, "flow.animation", "auto", hass),
      // Deliberately not readEnum: an id that is not in this build - because a
      // design was renamed or dropped - falls back to the plain dots instead of
      // making the card refuse its own configuration (P-10).
      design:
        typeof rawFlow.design === "string" && rawFlow.design.trim()
          ? rawFlow.design.trim()
          : "none",
      // An empty field in the editor means "no colour of its own", not the
      // empty string - which would paint every dot with nothing.
      dotColor:
        typeof rawFlow.dot_color === "string" && rawFlow.dot_color.trim()
          ? rawFlow.dot_color.trim()
          : undefined,
      dotSize: readLimited(rawFlow.dot_size, "flow.dot_size", 100, hass),
      lineWidth: readLimited(rawFlow.line_width, "flow.line_width", 100, hass),
      inactiveLines: readEnum(
        rawFlow.inactive_lines,
        INACTIVE_LINES,
        "flow.inactive_lines",
        "show",
        hass,
      ),
    },
    appearance: readEnum(rawRecord.appearance, APPEARANCES, "appearance", "auto", hass),
    colors,
    icons: readIcons(rawRecord.icons, hass),
    nodes: readNodes(rawRecord.nodes, hass),
    extraColors: readExtraColors(rawRecord.colors, hass),
    power: readPower(rawRecord.power, hass),
    /*
     * Not ours, but it has to survive normalizing (issue #8). card-mod does
     * not read the config Lovelace hands to setConfig: it walks up from the
     * card's ha-card and takes the card's `config` or `_config` property -
     * which here is this normalized object. Without the block in it, every
     * card_mod style was silently ignored.
     */
    ...(rawRecord.card_mod === undefined ? {} : { card_mod: rawRecord.card_mod }),
  };
}

/** Entity ids the card depends on - for change detection (REQ T-3) and prefill (V-6). */
export function collectEntityIds(config: Config): string[] {
  const ids: string[] = [];
  const add = (id?: string) => {
    if (id && !ids.includes(id)) ids.push(id);
  };

  for (const spec of [
    config.sources.solar,
    config.sources.grid,
    config.sources.battery,
    config.sources.house,
  ]) {
    if (spec.kind === "single") add(spec.entity);
    else if (spec.kind === "split") {
      add(spec.positive);
      add(spec.negative);
    }
  }
  add(config.sources.batterySoc);
  add(config.gridStatus?.entity);
  for (const consumer of config.consumers) add(consumer.entity);
  return ids;
}

/**
 * A short random id for what a card remembers (REQ V-12): eight letters and
 * digits. Not crypto.randomUUID(), which plain http does not offer.
 */
export function newMemoryId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

/** The card configs a part of a dashboard holds, stacks and sections included. */
export function dashboardCards(node: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const visit = (n: unknown) => {
    if (Array.isArray(n)) for (const each of n) visit(each);
    else if (isRecord(n)) {
      if (typeof n.type === "string") out.push(n);
      for (const key of ["sections", "cards", "card"]) visit(n[key]);
    }
  };
  visit(node);
  return out;
}

/** A memory_id as the card reads it; undefined when there is none (V-12). */
export function memoryIdOf(value: unknown): string | undefined {
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() ? value : undefined;
}
