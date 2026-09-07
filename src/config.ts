/**
 * Turns the YAML the user wrote into a `Config` with every default filled in.
 * Owner: agent 1. REQ section 3, E-1, E-2, A-1.
 */
import { DEFAULT_CONSUMER_PALETTE } from "./colors";
import { localize } from "./localize";
import {
  type AnimationMode,
  type ColorKey,
  type Config,
  ConfigError,
  type HomeAssistant,
  type InactiveLines,
  type NodeKey,
  type NormalizedConsumer,
  type RawConfig,
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

const DEFAULT_COLORS: Record<ColorKey, string> = {
  solar: "var(--energy-solar-color, #ff9800)",
  house: "var(--primary-color)",
  grid_import: "var(--energy-grid-consumption-color, #488fc2)",
  grid_export: "var(--energy-grid-return-color, #8353d1)",
  battery_charge: "var(--energy-battery-in-color, #f06292)",
  battery_discharge: "var(--energy-battery-out-color, #4db6ac)",
  rest: "#9e9e9e",
};

const DEFAULT_SOC_STOPS: readonly SocStop[] = [
  { at: 0, color: "#e53935" },
  { at: 50, color: "#fdd835" },
  { at: 100, color: "#43a047" },
];

/** `battery` is deliberately absent: without a value it follows the state of charge. */
const DEFAULT_ICONS: Partial<Record<NodeKey, string>> = {
  solar: "mdi:white-balance-sunny",
  grid: "mdi:transmission-tower",
  house: "mdi:home",
};

const VIEW_MODES: readonly ViewMode[] = ["current", "avg_short", "avg_long"];
const ANIMATION_MODES: readonly AnimationMode[] = ["auto", "on", "off"];
const INACTIVE_LINES: readonly InactiveLines[] = ["show", "dim", "hide"];

const KNOWN_KEYS: ReadonlySet<string> = new Set([
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
]);

/** Keys Lovelace itself puts on a card config - ours to ignore, never to warn about. */
const HOST_KEYS: ReadonlySet<string> = new Set([
  "view_layout",
  "layout_options",
  "grid_options",
  "visibility",
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

function readString(value: unknown, field: string, hass?: HomeAssistant): string | undefined {
  return value === undefined ? undefined : requireString(value, field, hass);
}

function readBoolean(
  value: unknown,
  field: string,
  fallback: boolean,
  hass?: HomeAssistant,
): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw fail("error.config.boolean", field, hass);
  return value;
}

function readNumber(value: unknown, field: string, fallback: number, hass?: HomeAssistant): number {
  if (value === undefined) return fallback;
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

function greaterThanZero(value: number, field: string, hass?: HomeAssistant): number {
  if (value <= 0) throw fail("error.config.positive", field, hass);
  return value;
}

function requireLess(a: number, b: number, first: string, second: string, hass?: HomeAssistant) {
  if (!(a < b)) {
    throw new ConfigError(localize("error.config.order", hass, { first, second }), first);
  }
}

function requireAtMost(a: number, b: number, first: string, second: string, hass?: HomeAssistant) {
  if (!(a <= b)) {
    throw new ConfigError(localize("error.config.order_le", hass, { first, second }), first);
  }
}

function readEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  fallback: T,
  hass?: HomeAssistant,
): T {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw fail("error.config.enum", field, hass, { allowed: allowed.join(", ") });
  }
  return value as T;
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
  if (value === undefined || value === null) return { kind: "absent" };

  if (typeof value === "string") {
    if (value === "derived") return { kind: "derived" };
    if (value.trim() === "") throw fail("error.config.mixed_form", field, hass);
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
    if (invert !== undefined && typeof invert !== "boolean") {
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

function readColors(value: unknown, hass?: HomeAssistant): Config["colors"] {
  const colors: Config["colors"] = {
    ...DEFAULT_COLORS,
    socStops: DEFAULT_SOC_STOPS.map((stop) => ({ ...stop })),
    consumerPalette: [...DEFAULT_CONSUMER_PALETTE],
  };
  if (value === undefined) return colors;

  const raw = requireRecord(value, "colors", hass);
  for (const key of COLOR_KEYS) {
    if (raw[key] !== undefined) colors[key] = requireString(raw[key], `colors.${key}`, hass);
  }
  if (raw.soc_stops !== undefined) colors.socStops = readSocStops(raw.soc_stops, hass);
  if (raw.consumer_palette !== undefined) {
    colors.consumerPalette = readPalette(raw.consumer_palette, hass);
  }
  return colors;
}

function readIcons(value: unknown, hass?: HomeAssistant): Partial<Record<NodeKey, string>> {
  const icons: Partial<Record<NodeKey, string>> = { ...DEFAULT_ICONS };
  if (value === undefined) return icons;

  const raw = requireRecord(value, "icons", hass);
  for (const key of ["solar", "grid", "house", "battery"] as const) {
    if (raw[key] !== undefined) icons[key] = requireString(raw[key], `icons.${key}`, hass);
  }
  return icons;
}

function readConsumers(
  value: unknown,
  palette: string[],
  hass?: HomeAssistant,
): NormalizedConsumer[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw fail("error.config.list", "consumers", hass);

  const seen = new Set<string>();
  const consumers: NormalizedConsumer[] = [];
  for (let i = 0; i < value.length; i++) {
    const entry: unknown = value[i];
    const field = `consumers[${i}]`;
    if (!isRecord(entry) || typeof entry.entity !== "string" || entry.entity.trim() === "") {
      throw fail("error.config.consumer_entity", field, hass, { index: i });
    }
    const entity = entry.entity;
    if (seen.has(entity)) {
      throw fail("error.config.duplicate_consumer", field, hass, { entity });
    }
    seen.add(entity);
    consumers.push({
      key: entity,
      entity,
      name: readString(entry.name, `${field}.name`, hass),
      // Palette wraps so that even 100 consumers get a colour (REQ C-4, L-11).
      color: readString(entry.color, `${field}.color`, hass) ?? palette[i % palette.length],
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

  if (rawRecord.entities === undefined) {
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
  if (rawEntities.battery_soc !== undefined) {
    batterySoc = requireString(rawEntities.battery_soc, "entities.battery_soc", hass);
    if (battery.kind === "absent") {
      throw fail("error.config.soc_without_battery", "entities.battery_soc", hass);
    }
  }

  const colors = readColors(rawRecord.colors, hass);
  const consumers = readConsumers(rawRecord.consumers, colors.consumerPalette, hass);

  const minConsumerW = atLeast(
    readNumber(rawRecord.min_consumer_w, "min_consumer_w", 10, hass),
    0,
    "min_consumer_w",
    hass,
  );
  // No limit configured means no limit at all (REQ section 3, L-4).
  const maxConsumers =
    rawRecord.max_consumers === undefined
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

  const rawList = rawRecord.list === undefined ? {} : requireRecord(rawRecord.list, "list", hass);
  const rawRing = rawRecord.ring === undefined ? {} : requireRecord(rawRecord.ring, "ring", hass);
  const hasConsumers = consumers.length > 0;

  const rawView = rawRecord.view === undefined ? {} : requireRecord(rawRecord.view, "view", hass);
  const avgShortMinutes = inRange(
    readInteger(rawView.avg_short_minutes, "view.avg_short_minutes", 5, hass),
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
  requireLess(
    avgShortMinutes,
    avgLongMinutes,
    "view.avg_short_minutes",
    "view.avg_long_minutes",
    hass,
  );

  const rawFlow = rawRecord.flow === undefined ? {} : requireRecord(rawRecord.flow, "flow", hass);
  const minW = atLeast(readNumber(rawFlow.min_w, "flow.min_w", 10, hass), 0, "flow.min_w", hass);
  const slowBelowW = readNumber(rawFlow.slow_below_w, "flow.slow_below_w", 500, hass);
  const moreDotsAboveW = readNumber(
    rawFlow.more_dots_above_w,
    "flow.more_dots_above_w",
    2000,
    hass,
  );
  const maxDotsAtW = readNumber(rawFlow.max_dots_at_w, "flow.max_dots_at_w", 6000, hass);
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
  requireAtMost(minW, slowBelowW, "flow.min_w", "flow.slow_below_w", hass);
  requireLess(slowBelowW, moreDotsAboveW, "flow.slow_below_w", "flow.more_dots_above_w", hass);
  requireLess(moreDotsAboveW, maxDotsAtW, "flow.more_dots_above_w", "flow.max_dots_at_w", hass);
  requireLess(fastS, slowS, "flow.fast_s", "flow.slow_s", hass);

  return {
    title: readString(rawRecord.title, "title", hass),
    sources: { solar, grid, battery, house, batterySoc },
    consumers,
    minConsumerW,
    maxConsumers,
    updateIntervalS,
    list: {
      enabled: readBoolean(rawList.enabled, "list.enabled", hasConsumers, hass),
      restLabel: readString(rawList.rest_label, "list.rest_label", hass),
      title: readString(rawList.title, "list.title", hass),
    },
    ring: { enabled: readBoolean(rawRing.enabled, "ring.enabled", hasConsumers, hass) },
    view: {
      defaultMode: readEnum(rawView.default_mode, VIEW_MODES, "view.default_mode", "current", hass),
      avgShortMinutes,
      avgLongMinutes,
      showSelector: readBoolean(rawView.show_selector, "view.show_selector", true, hass),
      remember: readBoolean(rawView.remember, "view.remember", true, hass),
    },
    flow: {
      minW,
      slowBelowW,
      moreDotsAboveW,
      maxDotsAtW,
      maxDots,
      slowS,
      fastS,
      animation: readEnum(rawFlow.animation, ANIMATION_MODES, "flow.animation", "auto", hass),
      inactiveLines: readEnum(
        rawFlow.inactive_lines,
        INACTIVE_LINES,
        "flow.inactive_lines",
        "show",
        hass,
      ),
    },
    colors,
    icons: readIcons(rawRecord.icons, hass),
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
  for (const consumer of config.consumers) add(consumer.entity);
  return ids;
}
