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
  /** "local" = the browser's zone, "server" = Home Assistant's (config.time_zone). */
  time_zone?: string;
  /** "language" or a weekday name; the energy week starts there (REQ EM-1). */
  first_weekday?: string;
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
  /** Home Assistant's own time zone (REQ EM-1). */
  config?: { time_zone?: string };
  connected?: boolean;
  /** Only compared: a new object means the theme or dark mode changed (REQ T-3). */
  themes?: unknown;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Configuration (REQ section 3) - raw shape as it arrives from YAML
// ---------------------------------------------------------------------------

export type ViewMode = "current" | "avg_short" | "avg_long";

/** Calendar periods of the energy mode (REQ EM-1). */
export type EnergyPeriod = "today" | "24h" | "week" | "7d" | "month" | "30d";
/** What the quick button power/energy offers: the power view or a period (REQ QB-2). */
export type EnergyChoice = "power" | EnergyPeriod;
/** What the quick button list scope offers (REQ QB-2, L-12). */
export type ListScope = "filtered" | "full";
/** What the quick button PV scale offers (REQ PV-5, PV-6): the ring always
 *  full, or measured against the peak power of all sources. */
export type PvScale = "share" | "peak";
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
/** How the ring changes when the list reorders or its values change (REQ R-4). */
export type RingAnimation = "overtake" | "fade" | "jump";
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

/** One PV source of a list under `entities.solar` (REQ PV-1). */
export interface SolarSourceConfig {
  entity: string;
  name?: string;
  /** Peak power in kWp (REQ PV-5). */
  kwp?: number;
  icon?: string;
  color?: string;
  invert?: boolean;
  /** "excluded": not part of the measured house value (REQ PV-3). */
  house?: "excluded";
}

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
  /** A state of charge that belongs to this consumer - an EV at its wallbox (REQ L-15). */
  charge?: ChargeConfig;
}

/** When a consumer with a state of charge is listed (REQ L-15). */
export type ChargeShow = "charging" | "plugged" | "always";

export interface ChargeConfig {
  soc?: string;
  show?: ChargeShow;
  plugged?: string;
  /** States of an enum `plugged` entity that mean "not plugged in". */
  unplugged?: string[];
}

export interface SocStop {
  at: number;
  color: string;
}

/** The arrangement of the four nodes (REQ AN-1). */
export type LayoutName = "cross" | "square_right" | "square_left" | "triangle";
/** How the lines between the nodes run (REQ AN-2). */
export type LineForm = "curved" | "straight";
/** How the quick buttons look (REQ QB-9). */
export type QuickStyle = "segment" | "segment_compact" | "single";
/** A quick button, named after the key of its values (REQ QB-10). */
export type QuickName = "modes" | "energy_periods" | "pv_scales" | "scope";

export interface RawConfig extends LovelaceCardConfig {
  /** The arrangement (AN-1); unknown values fall back to the cross. */
  layout?: LayoutName;
  /** What the card remembers is kept under this id (REQ V-12). */
  memory_id?: string;
  title?: string;
  entities?: {
    /** One entity, or a list of sources whose sum is the PV (REQ PV-1). */
    solar?: EntityRef | (string | SolarSourceConfig)[];
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
  list?: {
    enabled?: boolean;
    rest_label?: string;
    title?: string;
    always_below?: boolean;
    /** The PV rows (REQ PV-7). */
    solar?: boolean;
    /** The list scopes the quick button offers; one = fixed (REQ QB-2). */
    scope?: ListScope[];
    default_scope?: ListScope;
  };
  ring?: { enabled?: boolean; animation?: RingAnimation; solar?: boolean };
  /** Which half of a flow design applies (REQ P-10). */
  appearance?: Appearance;
  /** How every power figure is written: kW with 1-3 decimals, or whole watts (REQ K-7). */
  power?: { unit?: PowerUnit; decimals?: number; digits?: number };
  view?: {
    /** The means the quick button smoothing offers; one = fixed (REQ QB-2). */
    modes?: ViewMode[];
    default_mode?: ViewMode;
    avg_short_minutes?: number;
    avg_long_minutes?: number;
    /** Deprecated: false fixes every quick button on its start value (REQ QB-7). */
    show_selector?: boolean;
    remember?: boolean;
    /** Power and the periods the quick button power/energy offers (REQ QB-2, EM-1). */
    energy_periods?: EnergyChoice[];
    default_energy?: EnergyChoice;
    /** The PV scales the quick button offers; one = fixed (REQ PV-6). */
    pv_scales?: PvScale[];
    default_pv_scale?: PvScale;
    /** Segment buttons, compact, or single buttons (REQ QB-9). */
    quick_style?: QuickStyle;
    /** The quick buttons showing all their values (REQ QB-10). */
    expanded?: QuickName[] | QuickName;
  };
  flow?: {
    /** Curved or straight lines (AN-2); the default depends on the arrangement. */
    lines?: LineForm;
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
    /** Dot size in percent of the base size, 40-150 (K-12). */
    dot_size?: number;
    /** Line width in percent of the base width, 30-150 (K-12). */
    line_width?: number;
  };
  colors?: Partial<Record<ColorKey | ExtraColorKey, string>> & {
    soc_stops?: SocStop[];
    consumer_palette?: string[];
  };
  icons?: Partial<Record<IconKey, string>>;
  /** Extra values and label switches per node (REQ Z-1 to Z-10). */
  nodes?: Partial<Record<NodeKey, RawNodeOptions>>;
}

/** One extra field as written in YAML (REQ Z-2, Z-3, Z-5, Z-6). */
export interface RawExtraField {
  entity?: string;
  position?: ExtraPosition;
  prefix?: string;
  decimals?: ExtraDecimals | string;
  size?: number;
  weight?: ExtraWeight;
}

export interface RawNodeOptions {
  show_name?: boolean;
  show_state?: boolean;
  inside?: RawExtraField;
  label?: RawExtraField;
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
  | { kind: "absent" }
  /** The PV as the sum of `Config.solarSources` (REQ PV-2). */
  | { kind: "sum" };

/** One PV source after normalization (REQ PV-1). */
export interface NormalizedSolarSource {
  /** Stable identity for rows and ring segments - the entity id. */
  key: string;
  entity: string;
  /** Configured name; undefined falls back to friendly_name at render time. */
  name?: string;
  kwp?: number;
  icon?: string;
  color: string;
  invert: boolean;
  /** Not part of the measured house value; added to it (REQ PV-3). */
  excluded: boolean;
}

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
  charge?: NormalizedCharge;
}

export interface NormalizedCharge {
  soc: string;
  show: ChargeShow;
  plugged?: string;
  /** Lower-case; empty means the entity is on/off. */
  unplugged: string[];
}

/**
 * What the card knows about a consumer's state of charge right now (REQ L-15).
 * `soc` is undefined when no value was ever seen; `stale` marks the last known
 * one, kept while the sensor is unavailable, with the time it was measured.
 */
export interface ChargeState {
  soc?: number;
  stale: boolean;
  since?: number;
  plugged: boolean;
}

export interface Config {
  /** The arrangement (AN-1). */
  layout: LayoutName;
  /** Remembered values are this card's own (REQ V-12); unset = shared per browser. */
  memoryId?: string;
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
  /** The PV sources when `entities.solar` is a list; empty for one entity (REQ PV-1). */
  solarSources: NormalizedSolarSource[];
  consumers: NormalizedConsumer[];
  minConsumerW: number;
  maxConsumers: number;
  updateIntervalS: number;
  list: {
    enabled: boolean;
    restLabel?: string;
    title?: string;
    alwaysBelow: boolean;
    /** The PV rows (REQ PV-7). */
    solar: boolean;
    /** Offered scopes in their fixed order, never empty (REQ QB-2). */
    scope: ListScope[];
    /** One of `scope` (REQ QB-4). */
    defaultScope: ListScope;
  };
  ring: { enabled: boolean; animation: RingAnimation; solar: boolean };
  view: {
    /** Offered means in their fixed order, never empty; only "current"
     *  without power, as nothing is averaged then (REQ QB-2, QB-5). */
    modes: ViewMode[];
    /** One of `modes` (REQ QB-4). */
    defaultMode: ViewMode;
    avgShortMinutes: number;
    avgLongMinutes: number;
    remember: boolean;
    /** The power view is offered (REQ QB-2). Without a period it always is. */
    power: boolean;
    /** Offered periods; empty = energy mode off, also when its prerequisite
     *  is missing (EM-3). */
    energyPeriods: EnergyPeriod[];
    /** The periods are the default and wait for the statistics check (QB-8). */
    energyDefault: boolean;
    /** "power" or one of `energyPeriods` (REQ QB-4). */
    defaultEnergy: EnergyChoice;
    /** Scales of the PV ring on offer, in their fixed order; empty = no ring (REQ PV-6). */
    pvScales: PvScale[];
    /** One of `pvScales` when there are any (REQ PV-6). */
    defaultPvScale: PvScale;
    /** How the quick buttons look (REQ QB-9). */
    quickStyle: QuickStyle;
    /** The quick buttons showing all their values, each once (REQ QB-10). */
    expanded: QuickName[];
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
    /** Curved or straight, by default after the arrangement (AN-2). */
    lines: LineForm;
    /**
     * One colour for every dot on the card, whatever the connection (P-13).
     * Unset - and that is the default - a dot carries the colour of the flow
     * it belongs to, which is what names the source it comes from.
     */
    dotColor?: string;
    design: string;
    /** Dots and lines in percent of their base size at full node size (K-12). */
    dotSize: number;
    lineWidth: number;
  };
  /** Which half of a flow design applies (REQ P-10). */
  appearance: Appearance;
  colors: Record<ColorKey, string> & { socStops: SocStop[]; consumerPalette: string[] };
  icons: Partial<Record<IconKey, string>>;
  power: PowerFormat;
  /** Only while the energy mode shows a period (REQ EM-5, EM-11). */
  energy?: EnergyMarks;
  /** Extra values and label switches, one entry per node (REQ Z-1 to Z-6). */
  nodes: Record<NodeKey, NodeOptions>;
  /** Text colour of each extra field (REQ Z-6). */
  extraColors: Record<ExtraColorKey, string>;
  /**
   * The card-mod block, passed through untouched and never read by the card.
   * card-mod looks for it on the card's `_config` - see normalizeConfig.
   */
  card_mod?: unknown;
}

/**
 * How a power figure is written (REQ K-7). "auto" lets every value pick for
 * itself: watts below a kilowatt, kilowatts above, written to a fixed number
 * of *significant* digits rather than a fixed number of decimals.
 */
export type PowerUnit = "kW" | "W" | "auto";

/** One format for every power figure on the card (REQ K-7). */
export interface PowerFormat {
  unit: PowerUnit;
  /** Decimal places, for the fixed kilowatt unit. */
  decimals: number;
  /**
   * Significant digits, for "auto". A decimal place means something different
   * at 1,23 kW than at 123 kW; what should stay the same is how much the
   * number actually says.
   */
  digits: number;
  /** Set in the energy mode: figures are mean watts over this many hours and
   *  are written as kWh (REQ EM-5). */
  energyHours?: number;
}

/** How sure an energy figure is (REQ EM-11): 0 normal, 1 muted, 2 amber. */
export interface EnergyMark {
  tier: 0 | 1 | 2;
  /** Tooltip with the details; empty when there is nothing to say. */
  note: string;
}

/** What the energy mode tells the drawing beyond the figures themselves. */
export interface EnergyMarks {
  /** Per balance role (solar, import, export, discharge, charge, house). */
  roles: Record<string, EnergyMark>;
  /** Per consumer entity. */
  consumers: Record<string, EnergyMark>;
  rest: EnergyMark;
}

/**
 * How an extra value is written (REQ Z-5): as Home Assistant shows it, with a
 * fixed number of decimals, or to a number of significant digits.
 */
export type ExtraDecimals = "ha" | 0 | 1 | 2 | 3 | "sig2" | "sig3" | "sig4";
export type ExtraWeight = "normal" | "medium" | "bold";
export type ExtraPosition = "above" | "below";

/** One extra field, defaults filled in (REQ Z-1). */
export interface ExtraField {
  entity: string;
  decimals: ExtraDecimals;
  /** Percent of the neighbouring text, 60-150 (REQ Z-6). */
  size: number;
  weight: ExtraWeight;
}

/** Inside the circle: number and unit only, above the icon or under the value. */
export interface InsideField extends ExtraField {
  position: ExtraPosition;
}

/** With the label: an optional prefix in front of the value. */
export interface LabelField extends ExtraField {
  prefix?: string;
}

export interface NodeOptions {
  showName: boolean;
  /** Only the grid and the battery have a state word (REQ Z-4). */
  showState: boolean;
  /** Never on the battery, which already shows two values (REQ Z-2). */
  inside?: InsideField;
  label?: LabelField;
}

/** Colour keys of the extra fields; the battery has no inside field. */
export type ExtraColorKey =
  | "solar_inside"
  | "solar_label"
  | "grid_inside"
  | "grid_label"
  | "house_inside"
  | "house_label"
  | "battery_label";

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
  | {
      available: true;
      w: number;
      entity?: string;
      derived: boolean;
      /** Sources that were delivering and are gone - a partial sum (REQ PV-2). */
      missing?: string[];
      /** A measured house with sources outside it added (REQ PV-3). */
      corrected?: boolean;
    }
  | {
      available: false;
      entity?: string;
      derived: boolean;
      missing?: string[];
      corrected?: boolean;
    };

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
      /** Derived from a partial PV sum (REQ PV-2). */
      missing?: string[];
    }
  | {
      available: false;
      entityPositive?: string;
      entityNegative?: string;
      derived: boolean;
      missing?: string[];
    };

export interface ConsumerReading {
  key: string;
  entity: string;
  name: string;
  color: string;
  minW?: number;
  icon?: string;
  reading: Reading;
  charge?: ChargeState & { entity: string; show: ChargeShow };
}

/** One PV source as read now (REQ PV-2). */
export interface SolarSourceReading {
  key: string;
  entity: string;
  name: string;
  color: string;
  icon?: string;
  kwp?: number;
  excluded: boolean;
  reading: Reading;
}

export interface Model {
  solar: Reading;
  /** The sources behind `solar`; empty for one entity (REQ PV-2). */
  solarSources: SolarSourceReading[];
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
  /**
   * The power at which this row earns a place of its own - its own `min_w`,
   * or the global `min_consumer_w`. Carried along because it decides more
   * than the selection: below it a row is only on screen because the filter
   * was lifted, and then its line stays grey and it gets no ring segment.
   * Kept on the entry so a live value between ticks is judged by the same
   * number the selection used.
   */
  threshold: number;
  isRest: boolean;
  /** State of charge shown with the row (REQ L-15). */
  charge?: { entity: string; soc?: number; stale: boolean; since?: number };
  /**
   * False for a row kept by its charge while its power is unavailable: `w` is
   * then 0 for sorting and the rest, but no figure may be shown for it (rule 8).
   */
  powerUnknown?: boolean;
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
