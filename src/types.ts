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

/**
 * A flow design: everything about how the dots look, and nothing about how they
 * move - speed and count come from the power (P-3). Designed in
 * tools/leuchtspur/ and kept in src/flow-designs.json (P-10, P-11).
 */
export interface FlowDesignShape {
  /** Lighter rings inside the dot, 0 for a plain circle. */
  caps: number;
  /** How far forward the bright core sits, in percent. */
  bias: number;
}

/** The values that depend on the ground the card sits on. */
export interface FlowDesignGround {
  /** Dot diameter in CSS pixels. */
  dot: number;
  /** Diameter of the innermost ring as a share of the dot, in percent. */
  core: number;
  /** How far the core is mixed towards white, in percent. */
  coreLight: number;
  /** 0 none, 1 blur filter, 2 drawn gradient. */
  glow: number;
  glowStrength: number;
  /**
   * Opacity of the connection line under the dots, in percent. Without this a
   * design cannot work: the card draws an active line in the flow colour, and a
   * dot of the same colour on top of it barely reads. 80 is what the card does
   * without a design (P-5).
   */
  line: number;
}

export interface FlowDesign {
  id: string;
  name: string;
  /**
   * The name for every interface that is not German - the card falls back to
   * English for any language it does not speak, and so does this. Left out,
   * the name above stands everywhere, which is right for one that is a name
   * rather than a word.
   */
  name_en?: string;
  /** The same on both grounds - a shape is not a matter of the theme. */
  shape: FlowDesignShape;
  dark: FlowDesignGround;
  light: FlowDesignGround;
}
/**
 * Which ground the card assumes for a flow design.
 *
 * "auto" reads it off the theme, which is what the card always did; the other
 * two settle it, for a theme whose background the card cannot read or simply
 * because one of the two sets looks better here.
 */
export type Appearance = "auto" | "light" | "dark";

/** How connections without flow are drawn (REQ P-9). */
export type InactiveLines = "show" | "dim" | "hide";
export type NodeKey = "solar" | "grid" | "house" | "battery";
/**
 * Everything that can carry an icon. The rest row is not a node - it has no
 * entity and no circle in the cross - but it is a row in the list like any
 * other, and one that looks odd as the only plain dot among icons.
 */
export type IconKey = NodeKey | "rest";
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

/**
 * Which entity reports whether the grid is there, and which of its states mean
 * what. Every integration names them differently, so both lists are the user's
 * to give - a shorthand with guessed defaults would be wrong more often than
 * right (REQ NS-1).
 */
export type GridStatusRef = string | { entity: string; outage?: string[]; ok?: string[] };

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
    /** Optional grid status entity; the state names are never guessed (REQ NS-1). */
    grid_status?: GridStatusRef;
  };
  consumers?: ConsumerConfig[];
  min_consumer_w?: number;
  max_consumers?: number;
  update_interval_s?: number;
  list?: { enabled?: boolean; rest_label?: string; title?: string; always_below?: boolean };
  ring?: { enabled?: boolean };
  /** Which half of a flow design applies (REQ P-10). */
  appearance?: Appearance;
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
    /** Id from flow-designs.json, or "none" for the plain dots (P-10). */
    design?: string;
    /** One colour for every dot on the card; unset each follows its line. */
    dot_color?: string;
  };
  colors?: Partial<Record<ColorKey, string>> & {
    soc_stops?: SocStop[];
    consumer_palette?: string[];
  };
  icons?: Partial<Record<IconKey, string>>;
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

/** Normalized grid status: state names lower-cased and trimmed (REQ NS-2). */
export interface GridStatusSpec {
  entity: string;
  outage: string[];
  /** Empty means: derive from the entity's own `options`, else "any other state". */
  ok: string[];
}

/** Latched outage: `undefined` until a real state has been seen (REQ NS-3). */
export type OutageState = boolean | undefined;

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
  /** Undefined = the feature is off, which is the case for most installations. */
  gridStatus?: GridStatusSpec;
  consumers: NormalizedConsumer[];
  minConsumerW: number;
  maxConsumers: number;
  updateIntervalS: number;
  list: { enabled: boolean; restLabel?: string; title?: string; alwaysBelow: boolean };
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
    /**
     * One colour for every dot on the card, whatever the connection (P-13).
     * Unset - and that is the default - a dot carries the colour of the flow
     * it belongs to, which is what names the source it comes from.
     */
    dotColor?: string;
    design: string;
  };
  /** Which half of a flow design applies (REQ P-10). */
  appearance: Appearance;
  colors: Record<ColorKey, string> & { socStops: SocStop[]; consumerPalette: string[] };
  icons: Partial<Record<IconKey, string>>;
  power: PowerFormat;
}

/**
 * How a power figure is written. "auto" lets every value pick for itself
 * (REQ K-7): watts below a kilowatt, kilowatts above, and as many decimals as
 * three significant digits need - no more, because the reading is not that
 * precise, and no fewer, because the small consumers would all read alike.
 */
export type PowerUnit = "kW" | "W" | "auto";

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
  /** Rows of the list. Follows the filter button (REQ L-12). */
  entries: ListEntry[];
  /** One per entry whose line carries something - the rest get none (REQ R-2). */
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
