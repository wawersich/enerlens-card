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
const ENERGY_PERIODS: readonly EnergyPeriod[] = ["day", "week", "month"];
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

function atLeast(value: number, min: number, field: string, hass?: HomeAssistant): number {
  if (value < min) throw fail("error.config.min", field, hass, { min });
  return value;
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

/**
 * A value outside its range is drawn to the nearer limit with a warning, not
 * refused: the editor's slider has a text field beside it, and on the way to
 * "100" it reports "1" (E-1).
 */
function clamped(
  value: number,
  min: number,
  max: number,
  field: string,
  hass?: HomeAssistant,
): number {
  if (value >= min && value <= max) return value;
  const fixed = Math.min(max, Math.max(min, value));
  console.warn(localize("error.config.clamped", hass, { field, min, max, value: fixed }));
  return fixed;
}

function greaterThanZero(value: number, field: string, hass?: HomeAssistant): number {
  if (value <= 0) throw fail("error.config.positive", field, hass);
  return value;
}

/**
 * Two thresholds in the wrong order are repaired, not refused: the second is
 * raised to `a + step` with a warning. Both values are reachable from the GUI
 * (avg_short_minutes, flow.min_w), where a card that dies on "30 is not less
 * than 15" would leave the user stranded (REQ E-1). The label shows the value
 * actually used, so nothing is hidden.
 */
function fixOrder(
  a: number,
  b: number,
  step: number,
  first: string,
  second: string,
  hass?: HomeAssistant,
): number {
  if (a < b) return b;
  const fixed = a + step;
  console.warn(localize("error.config.order_fixed", hass, { first, second, value: fixed }));
  return fixed;
}

/** Like fixOrder, but equality is fine (flow.min_w may equal slow_below_w). */
function fixOrderAtMost(a: number, b: number, first: string, second: string, hass?: HomeAssistant) {
  return a <= b ? b : fixOrder(a, b, 0, first, second, hass);
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
 * The energy chip's periods, in calendar order (REQ EM-1). Any sensor form
 * will do - a signed one shows its balance (EM-3) - but a derived grid or
 * battery would need a balance of balances; the mode is then off with a
 * warning, never an error card (E-1).
 */
function readEnergyPeriods(
  value: unknown,
  grid: SourceSpec,
  battery: SourceSpec,
  hass?: HomeAssistant,
): EnergyPeriod[] {
  if (isUnset(value)) return [];
  const field = "view.energy_periods";
  if (!Array.isArray(value)) throw fail("error.config.list", field, hass);
  for (const entry of value) readEnum(entry, ENERGY_PERIODS, field, "day", hass);
  const periods = ENERGY_PERIODS.filter((p) => value.includes(p));
  if (periods.length === 0) return [];
  if (grid.kind === "derived" || battery.kind === "derived") {
    console.warn(localize("error.config.energy_derived", hass, { field }));
    return [];
  }
  return periods;
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
    size: clamped(readNumber(raw.size, `${field}.size`, 100, hass), 60, 150, `${field}.size`, hass),
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
        : atLeast(readNumber(entry.min_w, `${field}.min_w`, 0, hass), 0, `${field}.min_w`, hass),
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
export function normalizeConfig(raw: RawConfig, hass?: HomeAssistant): Config {
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

  const minConsumerW = atLeast(
    readNumber(rawRecord.min_consumer_w, "min_consumer_w", 10, hass),
    0,
    "min_consumer_w",
    hass,
  );
  // No limit configured means no limit at all (REQ section 3, L-4).
  const maxConsumers = isUnset(rawRecord.max_consumers)
    ? Number.POSITIVE_INFINITY
    : atLeast(
        readInteger(rawRecord.max_consumers, "max_consumers", 1, hass),
        1,
        "max_consumers",
        hass,
      );
  const updateIntervalS = atLeast(
    readNumber(rawRecord.update_interval_s, "update_interval_s", 5, hass),
    1,
    "update_interval_s",
    hass,
  );

  const rawList = readBlock(rawRecord.list, "list", hass);
  const rawRing = readBlock(rawRecord.ring, "ring", hass);
  const hasConsumers = consumers.length > 0;

  const rawView = readBlock(rawRecord.view, "view", hass);
  const avgShortMinutes = inRange(
    readInteger(rawView.avg_short_minutes, "view.avg_short_minutes", 2, hass),
    1,
    120,
    "view.avg_short_minutes",
    hass,
  );
  const avgLongMinutes = inRange(
    readInteger(rawView.avg_long_minutes, "view.avg_long_minutes", 15, hass),
    2,
    240,
    "view.avg_long_minutes",
    hass,
  );
  const avgLongFixed = fixOrder(
    avgShortMinutes,
    avgLongMinutes,
    1,
    "view.avg_short_minutes",
    "view.avg_long_minutes",
    hass,
  );

  const rawFlow = readBlock(rawRecord.flow, "flow", hass);
  const minW = atLeast(readNumber(rawFlow.min_w, "flow.min_w", 10, hass), 0, "flow.min_w", hass);
  // peak_w sets the whole step rule at once - the three thresholds keep the
  // ratios of the defaults (500 / 2000 / 6000). An explicit threshold wins.
  const peakW = greaterThanZero(
    readNumber(rawFlow.peak_w, "flow.peak_w", 6000, hass),
    "flow.peak_w",
    hass,
  );
  const slowBelowW = readNumber(rawFlow.slow_below_w, "flow.slow_below_w", peakW / 12, hass);
  const moreDotsAboveW = readNumber(
    rawFlow.more_dots_above_w,
    "flow.more_dots_above_w",
    peakW / 3,
    hass,
  );
  const maxDotsAtW = readNumber(rawFlow.max_dots_at_w, "flow.max_dots_at_w", peakW, hass);
  const maxDots = inRange(
    readInteger(rawFlow.max_dots, "flow.max_dots", 5, hass),
    2,
    10,
    "flow.max_dots",
    hass,
  );
  const slowS = greaterThanZero(
    readNumber(rawFlow.slow_s, "flow.slow_s", 5, hass),
    "flow.slow_s",
    hass,
  );
  const fastS = greaterThanZero(
    readNumber(rawFlow.fast_s, "flow.fast_s", 1.8, hass),
    "flow.fast_s",
    hass,
  );
  // The step rule needs S1 <= S2 < S3 < S4; a broken chain is pushed upwards.
  const slowBelowFixed = fixOrderAtMost(minW, slowBelowW, "flow.min_w", "flow.slow_below_w", hass);
  const moreDotsFixed = fixOrder(
    slowBelowFixed,
    moreDotsAboveW,
    1,
    "flow.slow_below_w",
    "flow.more_dots_above_w",
    hass,
  );
  const maxDotsAtFixed = fixOrder(
    moreDotsFixed,
    maxDotsAtW,
    1,
    "flow.more_dots_above_w",
    "flow.max_dots_at_w",
    hass,
  );
  const slowSFixed = fixOrder(fastS, slowS, 1, "flow.fast_s", "flow.slow_s", hass);
  // Full speed and the second dot fall together unless told otherwise - and
  // the default follows the repaired value, so one wrong input warns once.
  const fullSpeedFixed = isUnset(rawFlow.full_speed_w)
    ? moreDotsFixed
    : fixOrder(
        slowBelowFixed,
        readNumber(rawFlow.full_speed_w, "flow.full_speed_w", moreDotsFixed, hass),
        1,
        "flow.slow_below_w",
        "flow.full_speed_w",
        hass,
      );

  return {
    title: readString(rawRecord.title, "title", hass),
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
    },
    ring: {
      enabled: readBoolean(rawRing.enabled, "ring.enabled", hasConsumers, hass),
      animation: readEnum(rawRing.animation, RING_ANIMATIONS, "ring.animation", "overtake", hass),
    },
    view: {
      defaultMode: readEnum(rawView.default_mode, VIEW_MODES, "view.default_mode", "current", hass),
      avgShortMinutes,
      avgLongMinutes: avgLongFixed,
      showSelector: readBoolean(rawView.show_selector, "view.show_selector", true, hass),
      remember: readBoolean(rawView.remember, "view.remember", true, hass),
      energyPeriods: readEnergyPeriods(rawView.energy_periods, grid, battery, hass),
    },
    flow: {
      minW,
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
      design: typeof rawFlow.design === "string" ? rawFlow.design : "none",
      // An empty field in the editor means "no colour of its own", not the
      // empty string - which would paint every dot with nothing.
      dotColor:
        typeof rawFlow.dot_color === "string" && rawFlow.dot_color.trim()
          ? rawFlow.dot_color.trim()
          : undefined,
      dotSize: clamped(
        readNumber(rawFlow.dot_size, "flow.dot_size", 100, hass),
        40,
        150,
        "flow.dot_size",
        hass,
      ),
      lineWidth: clamped(
        readNumber(rawFlow.line_width, "flow.line_width", 100, hass),
        30,
        150,
        "flow.line_width",
        hass,
      ),
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
