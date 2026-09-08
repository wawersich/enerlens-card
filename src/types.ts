/**
 * Shared types for EnerLens.
 *
 * Everything the modules exchange is declared here. Modules own their internal
 * types, but anything crossing a module boundary lives in this file.
 *
 * Units: all power is watts (W) internally. Only `format.ts` turns watts into
 * the "x,xx kW" the user sees (REQ K-7).
 * Signs follow REQ E-2: grid positive = import, battery positive = discharging.
 */

// ---------------------------------------------------------------------------
// Home Assistant - the minimal surface we rely on
// ---------------------------------------------------------------------------

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
    [key: string]: unknown;
  };
  last_changed: string;
  last_updated: string;
}

/** Number formatting preferences from the user's profile. */
export interface HassLocale {
  language: string;
  number_format:
    | "language"
    | "system"
    | "comma_decimal"
    | "decimal_comma"
    | "space_comma"
    | "quote_decimal"
    | "none";
  time_format?: string;
  time_zone?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale: HassLocale;
  language: string;
  /** Registry entries; `display_precision` matters for formatting (REQ K-7). */
  entities?: Record<string, { display_precision?: number | null }>;
  /** Available since HA 2023.9; used for the state of charge (REQ K-4). */
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  callWS: <T>(msg: Record<string, unknown>) => Promise<T>;
  connected?: boolean;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Configuration (REQ section 3) - raw shape as it arrives from YAML
// ---------------------------------------------------------------------------

export type ViewMode = "current" | "avg_short" | "avg_long";
export type AnimationMode = "auto" | "on" | "off";
/** How connections without flow are drawn (REQ P-9). */
export type InactiveLines = "show" | "dim" | "hide";
export type NodeKey = "solar" | "grid" | "house" | "battery";
export type ColorKey =
  | "solar"
  | "house"
  | "grid_import"
  | "grid_export"
  | "battery_charge"
  | "battery_discharge"
  | "rest";

/** A balance quantity: plain entity, entity with inverted sign, split entities, or derived. */
export type EntityRef =
  | string
  | { entity: string; invert?: boolean }
  | { import: string; export: string }
  | { discharge: string; charge: string };

export interface ConsumerConfig {
  entity: string;
  name?: string;
  color?: string;
  /** Own threshold in W; overrides `min_consumer_w` for this consumer (REQ L-3). */
  min_w?: number;
  /** Optional mdi icon shown in front of the name (REQ L-2). */
  icon?: string;
}

export interface SocStop {
  at: number;
  color: string;
}

export interface RawConfig extends LovelaceCardConfig {
  title?: string;
  entities?: {
    solar?: EntityRef;
    grid?: EntityRef;
    battery?: EntityRef;
    battery_soc?: string;
    house?: EntityRef;
  };
  consumers?: ConsumerConfig[];
  min_consumer_w?: number;
  max_consumers?: number;
  update_interval_s?: number;
  list?: { enabled?: boolean; rest_label?: string; title?: string };
  ring?: { enabled?: boolean };
  /** How every power figure is written: kW with 1-3 decimals, or whole watts (REQ K-7). */
  power?: { unit?: PowerUnit; decimals?: number };
  view?: {
    default_mode?: ViewMode;
    avg_short_minutes?: number;
    avg_long_minutes?: number;
    show_selector?: boolean;
    remember?: boolean;
  };
  flow?: {
    min_w?: number;
    /** One knob for the whole step rule: the power at which the animation peaks.
     *  The three thresholds default to peak/12, peak/3 and peak (REQ P-3). */
    peak_w?: number;
    slow_below_w?: number;
    /** Where the single dot reaches fast_s; defaults to more_dots_above_w. */
    full_speed_w?: number;
    more_dots_above_w?: number;
    max_dots_at_w?: number;
    max_dots?: number;
    slow_s?: number;
    fast_s?: number;
    animation?: AnimationMode;
    inactive_lines?: InactiveLines;
  };
  colors?: Partial<Record<ColorKey, string>> & {
    soc_stops?: SocStop[];
    consumer_palette?: string[];
  };
  icons?: Partial<Record<NodeKey, string>>;
}

// ---------------------------------------------------------------------------
// Configuration after normalization - defaults filled in, shapes resolved
// ---------------------------------------------------------------------------

/**
 * How one balance quantity is sourced.
 * For "split", `positive` and `negative` name the entities in the direction
 * given by REQ E-2 (grid: import/export, battery: discharge/charge).
 */
export type SourceSpec =
  | { kind: "single"; entity: string; invert: boolean }
  | { kind: "split"; positive: string; negative: string }
  | { kind: "derived" }
  | { kind: "absent" };

export interface NormalizedConsumer {
  /** Stable identity for list and ring animations - the entity id. */
  key: string;
  entity: string;
  /** Configured name; undefined falls back to friendly_name at render time. */
  name?: string;
  color: string;
  /** Own threshold in W, undefined = the global `min_consumer_w` (REQ L-3). */
  minW?: number;
  icon?: string;
}

export interface Config {
  title?: string;
  sources: {
    solar: SourceSpec;
    grid: SourceSpec;
    battery: SourceSpec;
    house: SourceSpec;
    batterySoc?: string;
  };
  consumers: NormalizedConsumer[];
  minConsumerW: number;
  maxConsumers: number;
  updateIntervalS: number;
  list: { enabled: boolean; restLabel?: string; title?: string };
  ring: { enabled: boolean };
  view: {
    defaultMode: ViewMode;
    avgShortMinutes: number;
    avgLongMinutes: number;
    showSelector: boolean;
    remember: boolean;
  };
  flow: {
    minW: number;
    slowBelowW: number;
    fullSpeedW: number;
    moreDotsAboveW: number;
    maxDotsAtW: number;
    maxDots: number;
    slowS: number;
    fastS: number;
    animation: AnimationMode;
    inactiveLines: InactiveLines;
  };
  colors: Record<ColorKey, string> & { socStops: SocStop[]; consumerPalette: string[] };
  icons: Partial<Record<NodeKey, string>>;
  power: PowerFormat;
}

export type PowerUnit = "kW" | "W";

/** One format for every power figure on the card (REQ K-7). */
export interface PowerFormat {
  unit: PowerUnit;
  /** Decimals in kW; ignored for W, which is always whole numbers. */
  decimals: number;
}

/** Thrown by `normalizeConfig` for structural problems (REQ E-1, path 1). */
export class ConfigError extends Error {
  constructor(
    message: string,
    /** Config key the problem belongs to, e.g. "entities.grid". */
    readonly field?: string,
  ) {
    super(message);
    this.name = "ConfigError";
  }
}

// ---------------------------------------------------------------------------
// Model - measured values in watts, signs resolved (REQ 4.1 - 4.3)
// ---------------------------------------------------------------------------

/** A single measured quantity. `available: false` renders as an em dash (REQ K-9). */
export type Reading =
  | { available: true; w: number; entity?: string; derived: boolean }
  | { available: false; entity?: string; derived: boolean };

/**
 * A quantity that flows both ways. `positive`/`negative` are magnitudes (>= 0);
 * `net = positive - negative` drives label, colour and more-info target (REQ 4.2).
 * Grid: positive = import. Battery: positive = discharging.
 */
export type Signed =
  | {
      available: true;
      positive: number;
      negative: number;
      net: number;
      entityPositive?: string;
      entityNegative?: string;
      derived: boolean;
    }
  | {
      available: false;
      entityPositive?: string;
      entityNegative?: string;
      derived: boolean;
    };

export interface ConsumerReading {
  key: string;
  entity: string;
  name: string;
  color: string;
  minW?: number;
  icon?: string;
  reading: Reading;
}

export interface Model {
  solar: Reading;
  /** positive = import from grid, negative = export */
  grid: Signed;
  /** positive = discharging, negative = charging. `null` when no battery configured. */
  battery: Signed | null;
  /** Percent, never averaged (REQ V-5). */
  soc: Reading;
  house: Reading;
  consumers: ConsumerReading[];
}

// ---------------------------------------------------------------------------
// Consumer breakdown (REQ 4.4)
// ---------------------------------------------------------------------------

/** Key of the synthetic rest entry. Never an entity id. */
export const REST_KEY = "__rest__";

export interface ListEntry {
  /** Entity id, or REST_KEY. Stable across updates so FLIP can track rows. */
  key: string;
  name: string;
  w: number;
  color: string;
  /** Absent for the rest entry, which is not clickable (REQ I-4). */
  entity?: string;
  /** Configured icon, shown in front of the name in the entry's colour (REQ L-2). */
  icon?: string;
  isRest: boolean;
}

export interface Segment {
  key: string;
  /** Fraction of the ring, 0..1. Segments sum to 1 (REQ R-2, R-3). */
  share: number;
  color: string;
  entity?: string;
  isRest: boolean;
}

export interface Breakdown {
  entries: ListEntry[];
  segments: Segment[];
}

// ---------------------------------------------------------------------------
// Flows and dots (REQ 4.5, 4.6)
// ---------------------------------------------------------------------------

export type ConnectionId =
  | "solar_house"
  | "solar_grid"
  | "solar_battery"
  | "grid_house"
  | "grid_battery"
  | "battery_house"
  | "battery_grid";

/** Power in watts per connection, one direction only (REQ 4.5). */
export type Flows = Partial<Record<ConnectionId, number>>;

export interface DotPlan {
  connection: ConnectionId;
  /** Watts on this connection. */
  w: number;
  count: number;
  /** Seconds for one dot to travel the whole path. */
  durationS: number;
  colorKey: ColorKey;
}

// ---------------------------------------------------------------------------
// Averaging (REQ 4.8)
// ---------------------------------------------------------------------------

/** One recorded sample. `v === null` marks an unavailable stretch (REQ V-7). */
export interface Sample {
  /** Epoch milliseconds. */
  t: number;
  v: number | null;
}

export interface AveragingStatus {
  /** True once the buffer covers the full window. */
  complete: boolean;
  /** Epoch ms from which every entity has data - the "since hh:mm" hint (REQ V-6). */
  since?: number;
}
