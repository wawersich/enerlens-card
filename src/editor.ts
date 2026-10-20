/**
 * <enerlens-card-editor> - the GUI editor (REQ E-3 to E-6).
 *
 * Built on ha-form, which Home Assistant registers itself: passing it a schema
 * yields native pickers, translated labels and the look of every other card
 * editor. The consumers are a list of our own (REQ E-4): one unfoldable entry
 * each with an ha-form inside, because the object selector could neither
 * unfold a section in an entry nor react to the entity chosen in it.
 *
 * Every form a balance quantity can take in YAML (REQ A-1, ENT-16) is
 * editable here: a single entity with optional sign inversion, the split
 * two-entity form for grid and battery, derived, or - for the battery - none.
 * Each quantity has a source selector and only the fields for the chosen
 * source appear beneath it, so the form never has to guess what a half-filled
 * set of pickers means.
 */
import { type CSSResultGroup, LitElement, type TemplateResult, css, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import {
  DEFAULT_COLORS,
  DEFAULT_CONSUMER_PALETTE,
  DEFAULT_SOC_STOPS,
  type Hsv,
  hexToHsv,
  hslToHsv,
  hsvToHex,
  hsvToHsl,
  swatchHex,
} from "./colors";
import { EDITOR_NAME } from "./const";
import { NO_DESIGN, designName, flowDesigns } from "./designs";
import { localize } from "./localize";
import type {
  ColorKey,
  EntityRef,
  HomeAssistant,
  RawConfig,
  RingAnimation,
  SocStop,
} from "./types";

/** Power sensors, plus anything measured in W or kW - many template sensors
 *  carry no device_class and would otherwise be unpickable (REQ E-3). */
const POWER_FILTER = [
  { domain: "sensor", device_class: "power" },
  { domain: "sensor", unit_of_measurement: ["W", "kW", "mW", "MW"] },
];

const BATTERY_FILTER = [
  { domain: "sensor", device_class: "battery" },
  { domain: "sensor", unit_of_measurement: "%" },
];

const QUANTITIES = ["solar", "grid", "house", "battery"] as const;

/** Where the consumer panel goes between the form pieces (REQ E-4). */
const CONSUMERS_SLOT = "consumers_slot";

/** An entity that answers on/off rather than with states of its own. */
function isOnOff(entityId: string): boolean {
  const domain = entityId.split(".")[0];
  return domain === "binary_sensor" || domain === "input_boolean";
}

/** What can say whether a car is plugged in: on/off, or a state among several. */
const PLUGGED_FILTER = [
  { domain: "binary_sensor" },
  { domain: "input_boolean" },
  { domain: "sensor" },
  { domain: "input_select" },
];

/**
 * The form of one consumer, built per entry: the plugged field only where the
 * display waits for the plug, and the unplugged states only for an entity that
 * has states rather than on/off - offered from its own options (REQ E-4, L-15).
 */
function consumerSchema(hass: HomeAssistant, entry: Record<string, unknown>) {
  const t = (key: string) => localize(`editor.${key}`, hass);
  const charge = isRecord(entry.charge) ? entry.charge : {};
  const plugged = typeof charge.plugged === "string" ? charge.plugged : "";
  const onOff = isOnOff(plugged);
  const options = hass.states?.[plugged]?.attributes?.options;
  const choices = (Array.isArray(options) ? options : [])
    .filter((option): option is string => typeof option === "string")
    .map((option) => ({ value: option, label: option }));
  const chargeFields: Record<string, unknown>[] = [
    { name: "soc", selector: { entity: { filter: BATTERY_FILTER } } },
    {
      name: "show",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "charging", label: t("charge_show_charging") },
            { value: "plugged", label: t("charge_show_plugged") },
            { value: "always", label: t("charge_show_always") },
          ],
        },
      },
    },
  ];
  if (charge.show === "plugged") {
    chargeFields.push({ name: "plugged", selector: { entity: { filter: PLUGGED_FILTER } } });
    if (plugged && !onOff) {
      chargeFields.push({
        name: "unplugged",
        selector: {
          select: { multiple: true, custom_value: true, mode: "list", options: choices },
        },
      });
    }
  }
  return [
    { name: "entity", required: true, selector: { entity: { filter: POWER_FILTER } } },
    { name: "name", selector: { text: {} } },
    // No colour here: it has a row with a swatch under "Colours", and two
    // places to set one thing is one place too many.
    { name: "icon", selector: { icon: {} } },
    { name: "min_w", selector: { number: { min: 0, max: 10000, mode: "box" } } },
    { name: "charge", type: "expandable", title: t("charge"), schema: chargeFields },
  ];
}
type Quantity = (typeof QUANTITIES)[number];
/** The four nodes plus the rest row, which has an icon but no entity. */
const ICON_KEYS = [...QUANTITIES, "rest"] as const;

/** How a quantity gets its value. "none" exists only for the battery (REQ A-5). */
type Source = "entity" | "split" | "derived" | "none";

const SOURCES: Record<Quantity, Source[]> = {
  solar: ["entity", "derived"],
  grid: ["entity", "split", "derived"],
  house: ["entity", "derived"],
  battery: ["none", "entity", "split", "derived"],
};

/** Field names of the two-entity form, positive direction first (ENT-16). */
const SPLIT_FIELDS: Partial<Record<Quantity, [string, string]>> = {
  grid: ["grid_import", "grid_export"],
  battery: ["battery_discharge", "battery_charge"],
};

/** The YAML keys behind SPLIT_FIELDS, in the same order. */
const SPLIT_KEYS: Partial<Record<Quantity, [string, string]>> = {
  grid: ["import", "export"],
  battery: ["discharge", "charge"],
};

/** ha-form works on a flat object; the card config is nested. */
interface FlatConfig {
  title?: string;
  solar_source?: Source;
  solar?: string;
  solar_invert?: boolean;
  grid_source?: Source;
  grid?: string;
  grid_invert?: boolean;
  grid_import?: string;
  grid_export?: string;
  house_source?: Source;
  house?: string;
  house_invert?: boolean;
  battery_source?: Source;
  battery?: string;
  battery_invert?: boolean;
  battery_discharge?: string;
  battery_charge?: string;
  battery_soc?: string;
  grid_status?: string;
  grid_status_outage?: string[];
  grid_status_ok?: string[];
  consumers?: unknown[];
  max_consumers?: number;
  min_consumer_w?: number;
  update_interval_s?: number;
  rest_label?: string;
  appearance?: string;
  list_enabled?: boolean;
  list_always_below?: boolean;
  ring_enabled?: boolean;
  ring_animation?: string;
  power_unit?: string;
  power_decimals?: number;
  power_digits?: number;
  default_mode?: string;
  avg_short_minutes?: number;
  avg_long_minutes?: number;
  show_selector?: boolean;
  energy_periods?: string[];
  inactive_lines?: string;
  animation?: string;
  design?: string;
  dot_color?: string;
  dot_size?: number;
  line_width?: number;
  min_w?: number;
  peak_w?: number;
  slow_below_w?: number;
  full_speed_w?: number;
  more_dots_above_w?: number;
  max_dots_at_w?: number;
  max_dots?: number;
  slow_s?: number;
  fast_s?: number;
  color_solar?: string;
  color_house?: string;
  color_grid_import?: string;
  color_grid_export?: string;
  color_battery_charge?: string;
  color_battery_discharge?: string;
  color_rest?: string;
  icon_solar?: string;
  icon_grid?: string;
  icon_house?: string;
  icon_battery?: string;
  icon_rest?: string;
  /** Label switches and extra fields per node, `node_<node>_<setting>` (REQ Z-10). */
  [key: `node_${string}`]: unknown;
}

const COLOR_KEYS: readonly ColorKey[] = [
  "solar",
  "house",
  "grid_import",
  "grid_export",
  "battery_charge",
  "battery_discharge",
  "rest",
];

type FlatRecord = Record<string, unknown>;

/** Shown when neither the browser nor our parser makes sense of a value - the
 *  text field still holds it, so nothing is lost, the swatch just says nothing. */
const UNREADABLE = "#888888";
/**
 * What the dot colour starts at when it is switched on.
 *
 * The switch has to mean something the moment it is flipped, so it cannot
 * leave the field empty - empty is the other state. The theme's text colour is
 * the one colour that is readable on either ground without knowing which one
 * the card sits on, which makes it a starting point rather than a choice.
 */
const DOT_COLOR_SEED = "var(--primary-text-color)";

// ---------------------------------------------------------------------------
// Config <-> flat form data
// ---------------------------------------------------------------------------

/** Which source a YAML entry represents. Absent means "derived" for the house
 *  (REQ A-1), "none" for the battery (A-5) and an empty entity picker otherwise.
 *  A YAML key left empty (null, "") is absent too, as for the card (issue #15). */
const isAbsent = (ref: EntityRef | null | undefined): ref is undefined =>
  ref === undefined || ref === null || (typeof ref === "string" && ref.trim() === "");

function sourceOf(quantity: Quantity, ref: EntityRef | undefined): Source {
  if (ref === "derived") return "derived";
  if (typeof ref === "string" && !isAbsent(ref)) return "entity";
  if (isRecord(ref) && "entity" in ref) return "entity";
  const keys = SPLIT_KEYS[quantity];
  if (isRecord(ref) && keys && (keys[0] in ref || keys[1] in ref)) return "split";
  // Absent - or something hand-typed the form cannot show (false, 5, a
  // misspelt key): the empty choice, and fromFlat keeps the YAML as it is
  // until this quantity is edited (issue #19).
  return quantity === "house" ? "derived" : quantity === "battery" ? "none" : "entity";
}

function flattenQuantity(quantity: Quantity, ref: EntityRef | undefined, out: FlatRecord): void {
  const source = sourceOf(quantity, ref);
  out[`${quantity}_source`] = source;
  if (typeof ref === "string") {
    if (source === "entity") out[quantity] = ref;
    return;
  }
  const record: unknown = ref;
  if (!isRecord(record)) return;
  const text = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
  if (source === "entity") {
    out[quantity] = text(record.entity);
    out[`${quantity}_invert`] = record.invert === true;
    return;
  }
  const fields = SPLIT_FIELDS[quantity];
  const keys = SPLIT_KEYS[quantity];
  if (source !== "split" || !fields || !keys) return;
  out[fields[0]] = text(record[keys[0]]);
  out[fields[1]] = text(record[keys[1]]);
}

/** Where an extra field lives: inside the circle (not the battery), or with the label. */
const PLACES = ["inside", "label"] as const;
type Place = (typeof PLACES)[number];

const hasPlace = (quantity: Quantity, place: Place): boolean =>
  place === "label" || quantity !== "battery";

/** Only grid and battery have a state word to switch off (REQ Z-4). */
const hasStateWord = (quantity: Quantity): boolean => quantity === "grid" || quantity === "battery";

/**
 * Every setting of the nodes block as a flat form field, defaults filled in:
 * a switch has to show "on" and a slider needs a position even when the YAML
 * says nothing - and the defaults go back out of it in fromFlat (REQ Z-10).
 */
function flattenNodes(config: RawConfig, out: FlatRecord): void {
  const colors = (config.colors ?? {}) as Record<string, unknown>;
  for (const quantity of QUANTITIES) {
    const node = (config.nodes?.[quantity] ?? {}) as Record<string, unknown>;
    const p = `node_${quantity}_`;
    out[`${p}show_name`] = node.show_name !== false;
    if (hasStateWord(quantity)) out[`${p}show_state`] = node.show_state !== false;
    for (const place of PLACES) {
      if (!hasPlace(quantity, place)) continue;
      const field = (isRecord(node[place]) ? node[place] : {}) as Record<string, unknown>;
      const f = `${p}${place}_`;
      out[`${f}entity`] = field.entity;
      if (place === "inside") out[`${f}position`] = field.position ?? "above";
      else out[`${f}prefix`] = field.prefix;
      // Select fields speak text: 2 from the YAML is "2" in the form.
      // A bare `decimals:` is null in YAML - unset, like an absent one.
      out[`${f}decimals`] =
        field.decimals === undefined || field.decimals === null || field.decimals === ""
          ? "ha"
          : String(field.decimals);
      out[`${f}size`] = field.size ?? 100;
      out[`${f}weight`] = field.weight ?? "normal";
      out[`color_${quantity}_${place}`] = colors[`${quantity}_${place}`];
    }
  }
}

/**
 * What a record holds beyond the keys the form knows. Kept, so a misspelt key
 * survives the first edit and the card can still warn about it.
 */
function unknownKeys(value: unknown, known: readonly string[]): Record<string, unknown> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key]) => !known.includes(key)));
}

/** What each field knows, as the card reads it: no prefix inside, no position with the label. */
const FIELD_KEYS: Record<Place, readonly string[]> = {
  inside: ["entity", "position", "decimals", "size", "weight"],
  label: ["entity", "prefix", "decimals", "size", "weight"],
};
const NODE_KEYS = ["show_name", "show_state", "inside", "label"];

/** One extra field for the YAML; nothing at all without its entity (REQ E-1, Z-10). */
function buildField(
  f: FlatRecord,
  quantity: Quantity,
  place: Place,
  previous: unknown,
): Record<string, unknown> | undefined {
  const p = `node_${quantity}_${place}_`;
  const entity = f[`${p}entity`];
  if (!nonEmpty(entity)) return undefined;
  const decimals = f[`${p}decimals`];
  const prefix = f[`${p}prefix`];
  const weight = f[`${p}weight`];
  return prune({
    ...unknownKeys(previous, FIELD_KEYS[place]),
    entity,
    // Each field writes only its own keys - the other one's stay as found.
    ...(place === "inside"
      ? { position: f[`${p}position`] === "below" ? "below" : undefined }
      : // As typed - the card trims; correcting here would fight the keystrokes.
        { prefix: nonEmpty(prefix) ? prefix : undefined }),
    decimals:
      !nonEmpty(decimals) || decimals === "ha"
        ? undefined
        : /^\d$/.test(decimals)
          ? Number(decimals)
          : decimals,
    size: percent(f[`${p}size`]),
    weight: nonEmpty(weight) && weight !== "normal" ? weight : undefined,
  });
}

/** The nodes block: only what differs from the defaults, nothing for a missing battery. */
function buildNodes(f: FlatRecord, withBattery: boolean, previous: unknown): RawConfig["nodes"] {
  const out: Record<string, unknown> = unknownKeys(previous, QUANTITIES);
  for (const quantity of QUANTITIES) {
    if (quantity === "battery" && !withBattery) continue;
    const p = `node_${quantity}_`;
    const before = isRecord(previous) ? previous[quantity] : undefined;
    const old = isRecord(before) ? before : {};
    const node = prune({
      ...unknownKeys(old, NODE_KEYS),
      show_name: f[`${p}show_name`] === false ? false : undefined,
      show_state: hasStateWord(quantity) && f[`${p}show_state`] === false ? false : undefined,
      inside: hasPlace(quantity, "inside")
        ? buildField(f, quantity, "inside", old.inside)
        : undefined,
      label: buildField(f, quantity, "label", old.label),
    });
    if (node) out[quantity] = node;
  }
  return prune(out) as RawConfig["nodes"];
}

/** A field's colour goes with its entity: no colour left behind that no row shows. */
function extraColors(f: FlatRecord, withBattery: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const quantity of QUANTITIES) {
    for (const place of PLACES) {
      if (!hasPlace(quantity, place)) continue;
      const keep =
        (quantity !== "battery" || withBattery) && nonEmpty(f[`node_${quantity}_${place}_entity`]);
      out[`${quantity}_${place}`] = keep ? f[`color_${quantity}_${place}`] : undefined;
    }
  }
  // The battery has no inside field, so no row could ever show this colour.
  out.battery_inside = undefined;
  return out;
}

function toFlat(config: RawConfig): FlatConfig {
  const e = config.entities ?? {};
  // The status entity comes as a bare id or as a block with its state names.
  const status = e.grid_status;
  const statusRecord = typeof status === "object" && status !== null ? status : undefined;
  const out: FlatRecord = {
    title: config.title,
    battery_soc: e.battery_soc,
    grid_status: typeof status === "string" ? status : statusRecord?.entity,
    grid_status_outage: statusRecord?.outage,
    grid_status_ok: statusRecord?.ok,
    consumers: config.consumers,
    max_consumers: config.max_consumers,
    min_consumer_w: config.min_consumer_w,
    update_interval_s: config.update_interval_s,
    rest_label: config.list?.rest_label,
    appearance: config.appearance,
    list_enabled: config.list?.enabled,
    list_always_below: config.list?.always_below,
    ring_enabled: config.ring?.enabled,
    ring_animation: config.ring?.animation,
    power_unit: config.power?.unit,
    power_decimals: config.power?.decimals,
    power_digits: config.power?.digits,
    default_mode: config.view?.default_mode,
    avg_short_minutes: config.view?.avg_short_minutes,
    avg_long_minutes: config.view?.avg_long_minutes,
    show_selector: config.view?.show_selector,
    // Only a list of names can be shown; anything else stays as written (#19).
    energy_periods: Array.isArray(config.view?.energy_periods)
      ? (config.view?.energy_periods as unknown[]).filter((p): p is string => typeof p === "string")
      : undefined,
    inactive_lines: config.flow?.inactive_lines,
    animation: config.flow?.animation,
    design: config.flow?.design,
    dot_color: config.flow?.dot_color,
    // A slider needs a position; 100 % is what an absent value means (K-12).
    dot_size: config.flow?.dot_size ?? 100,
    line_width: config.flow?.line_width ?? 100,
    min_w: config.flow?.min_w,
    peak_w: config.flow?.peak_w,
    slow_below_w: config.flow?.slow_below_w,
    full_speed_w: config.flow?.full_speed_w,
    more_dots_above_w: config.flow?.more_dots_above_w,
    max_dots_at_w: config.flow?.max_dots_at_w,
    max_dots: config.flow?.max_dots,
    slow_s: config.flow?.slow_s,
    fast_s: config.flow?.fast_s,
  };
  for (const quantity of QUANTITIES) flattenQuantity(quantity, e[quantity], out);
  const colors = (config.colors ?? {}) as Record<string, unknown>;
  for (const key of COLOR_KEYS) out[`color_${key}`] = colors[key];
  out.soc_stops = colors.soc_stops;
  flattenNodes(config, out);
  const icons = (config.icons ?? {}) as Record<string, unknown>;
  for (const key of ICON_KEYS) out[`icon_${key}`] = icons[key];
  return out as FlatConfig;
}

const nonEmpty = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/**
 * The YAML entry for one quantity. Returns undefined while the chosen source
 * is not filled in yet - a half-configured split stays in the form state, not
 * in the config, so the preview reports "missing" rather than "mixed form".
 */
function buildRef(quantity: Quantity, flat: FlatRecord): EntityRef | undefined {
  const source =
    (flat[`${quantity}_source`] as Source | undefined) ?? sourceOf(quantity, undefined);
  switch (source) {
    case "none":
      return undefined;
    case "derived":
      // The house is derived by leaving it out (REQ A-1); the others say so.
      return quantity === "house" ? undefined : "derived";
    case "entity": {
      const entity = flat[quantity];
      if (!nonEmpty(entity)) return undefined;
      return flat[`${quantity}_invert`] === true ? { entity, invert: true } : entity;
    }
    case "split": {
      const fields = SPLIT_FIELDS[quantity];
      const keys = SPLIT_KEYS[quantity];
      if (!fields || !keys) return undefined;
      const positive = flat[fields[0]];
      const negative = flat[fields[1]];
      if (!nonEmpty(positive) || !nonEmpty(negative)) return undefined;
      return { [keys[0]]: positive, [keys[1]]: negative } as EntityRef;
    }
  }
}

/** "" and null from a cleared field read as unset. */
const opt = <T>(v: T | null | ""): T | undefined => (v === null || v === "" ? undefined : v);

/** A number box hands back undefined, null or "" when cleared - never NaN, but
 *  be safe about that too. */
function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** A size in percent: 100 is the default and stays out of the YAML (K-12). */
function percent(v: unknown): number | undefined {
  const n = num(v);
  return n === 100 ? undefined : n;
}

/** Chips from a multi-select: cleared entries dropped, an empty list omitted. */
function states(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const list = v.filter(
    (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
  );
  return list.length ? list : undefined;
}

/**
 * The object selector leaves "" or null when a field is cleared, keeps a row
 * whose entity picker was emptied, and lets the same sensor be picked twice.
 * None of that belongs in the YAML (REQ E-4): empty fields go, a row without an
 * entity goes, a duplicate keeps its first appearance.
 */
function cleanConsumers(value: unknown): RawConfig["consumers"] {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  const list: Record<string, unknown>[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const cleaned = prune<Record<string, unknown>>({ ...entry, charge: cleanCharge(entry.charge) });
    const entity = cleaned?.entity;
    if (!cleaned || typeof entity !== "string" || seen.has(entity)) continue;
    seen.add(entity);
    list.push(cleaned);
  }
  return list.length ? (list as unknown as RawConfig["consumers"]) : undefined;
}

/**
 * A consumer's state of charge as the YAML should hold it (REQ L-15, E-4):
 * empty fields gone, the unplugged list only with entries, and nothing at all
 * until a state-of-charge entity is chosen - the form keeps the half-filled
 * section, the configuration does not need it.
 */
function cleanCharge(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;
  // What the form hides is not written either: the plug only matters for
  // show: plugged, and an on/off plug has no "unplugged" states - a list left
  // over from a status sensor would otherwise read every "off" as plugged in.
  const waits = value.show === "plugged";
  const text = (v: unknown): string | undefined => (nonEmpty(v) ? v : undefined);
  const plugged = waits ? text(value.plugged) : undefined;
  const charge = prune({
    soc: text(value.soc),
    show: text(value.show),
    plugged,
    unplugged: plugged && !isOnOff(plugged) ? states(value.unplugged) : undefined,
  });
  return charge && nonEmpty(charge.soc) ? charge : undefined;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Undefined values are dropped so removing an option clears it from the YAML
 *  instead of leaving a null behind. */
function prune<T extends Record<string, unknown>>(obj: T): T | undefined {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return Object.keys(out).length ? (out as T) : undefined;
}

/** The ticked periods in calendar order; none ticked is no key at all (E-1). */
function energyPeriods(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const periods = ENERGY_PERIODS.filter((p) => value.includes(p));
  return periods.length > 0 ? periods : undefined;
}

/** Grid in two sensors, battery in two or none: what the energy mode needs (EM-3). */
function energyReady(flat: FlatConfig): boolean {
  return (
    flat.grid_source === "split" &&
    (flat.battery_source === "split" || flat.battery_source === "none")
  );
}

// ---------------------------------------------------------------------------
// What an edit touched (issue #19)
// ---------------------------------------------------------------------------

const FLOW_FIELDS = [
  "inactive_lines",
  "animation",
  "design",
  "dot_color",
  "dot_size",
  "line_width",
  "min_w",
  "peak_w",
  "slow_below_w",
  "full_speed_w",
  "more_dots_above_w",
  "max_dots_at_w",
  "max_dots",
  "slow_s",
  "fast_s",
];
const VIEW_FIELDS = [
  "default_mode",
  "avg_short_minutes",
  "avg_long_minutes",
  "show_selector",
  "energy_periods",
];
/** Calendar order, whatever order they were ticked in (REQ EM-1). */
const ENERGY_PERIODS = ["day", "week", "month"];
const OWN_GROUP = ["title", "max_consumers", "min_consumer_w", "update_interval_s", "appearance"];

/**
 * The part of the YAML a form field writes: a top-level key, a block, or one
 * entry of `entities`. Undefined for a name that is no field of the form -
 * test/editor-malformed.test.ts holds every field to having an owner.
 */
export function fieldOwner(name: string): string | undefined {
  if (OWN_GROUP.includes(name) || name === "consumers") return name;
  if (name === "battery_soc") return "entities.battery_soc";
  if (name.startsWith("grid_status")) return "entities.grid_status";
  for (const quantity of QUANTITIES) {
    const split: readonly string[] = SPLIT_FIELDS[quantity] ?? [];
    if (
      name === quantity ||
      name === `${quantity}_source` ||
      name === `${quantity}_invert` ||
      split.includes(name)
    )
      return `entities.${quantity}`;
  }
  if (name === "rest_label" || name.startsWith("list_")) return "list";
  if (name.startsWith("ring_")) return "ring";
  if (name.startsWith("power_")) return "power";
  if (VIEW_FIELDS.includes(name)) return "view";
  if (FLOW_FIELDS.includes(name)) return "flow";
  if (name.startsWith("color_") || name === "soc_stops") return "colors";
  if (name.startsWith("node_")) return "nodes";
  if (name.startsWith("icon_")) return "icons";
  return undefined;
}

/** Parts the editor writes from another part as well: the state of charge and
 *  the extra fields go with the battery, the extra colours with their fields. */
const DEPENDS: Record<string, readonly string[]> = {
  "entities.battery_soc": ["entities.battery"],
  nodes: ["entities.battery"],
  colors: ["entities.battery", "nodes"],
};

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, i) => same(value, b[i]));
  }
  if (isRecord(a) && isRecord(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((key) => same(a[key], b[key]));
  }
  return false;
}

/** The parts of the YAML whose fields differ from what the YAML itself gives. */
function touchedParts(flat: FlatRecord, before: FlatRecord): Set<string> {
  const touched = new Set<string>();
  for (const name of new Set([...Object.keys(flat), ...Object.keys(before)])) {
    const owner = fieldOwner(name);
    if (owner && !same(flat[name], before[name])) touched.add(owner);
  }
  for (const [part, on] of Object.entries(DEPENDS)) {
    if (on.some((other) => touched.has(other))) touched.add(part);
  }
  return touched;
}

/**
 * A part nobody edited, as the YAML has it - whatever its shape. Only empty
 * values go, as everywhere the editor writes (REQ E-1, issue #15).
 */
function kept(value: unknown): unknown {
  if (value === null || (typeof value === "string" && value.trim() === "")) return undefined;
  if (Array.isArray(value)) {
    const list = value.map(kept).filter((entry) => entry !== undefined);
    return list.length ? list : undefined;
  }
  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const k = kept(entry);
      if (k !== undefined) out[key] = k;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value;
}

/** A block that is not a block - text, a list - contributes nothing to spread. */
const rec = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

function fromFlat(flat: FlatConfig, previous: RawConfig): RawConfig {
  const f = flat as FlatRecord;
  // Only what an edit touched is rebuilt from the form. The rest goes back as
  // the YAML has it, so a shape the form cannot show - a hand-typed `false`, a
  // misspelt key, text where a block belongs - survives an edit elsewhere
  // (REQ E-1, issue #19).
  const touched = touchedParts(f, toFlat(previous) as FlatRecord);
  const raw = previous as Record<string, unknown>;
  const rawEntities = rec(previous.entities);
  const part = (name: string, build: () => unknown, before: unknown): unknown =>
    touched.has(name) ? build() : kept(before);

  const entities: Record<string, unknown> = { ...rawEntities };
  for (const quantity of QUANTITIES) {
    entities[quantity] = part(
      `entities.${quantity}`,
      () => buildRef(quantity, f),
      rawEntities[quantity],
    );
  }
  const withBattery = entities.battery !== undefined;
  // No battery (none, or not picked yet), no state of charge in the YAML - the
  // form keeps the choice and writes it once the battery is there (REQ A-5).
  entities.battery_soc = part(
    "entities.battery_soc",
    () => (withBattery ? opt(flat.battery_soc) : undefined),
    rawEntities.battery_soc,
  );
  // Always the long form, so the YAML never depends on guessed state names
  // (REQ NS-1). Without an entity the whole block goes.
  entities.grid_status = part(
    "entities.grid_status",
    () => {
      const statusEntity = opt(flat.grid_status);
      return statusEntity
        ? prune({
            entity: statusEntity,
            outage: states(flat.grid_status_outage),
            ok: states(flat.grid_status_ok),
          })
        : undefined;
    },
    rawEntities.grid_status,
  );
  const entityParts = [...(QUANTITIES as readonly string[]), "battery_soc", "grid_status"].map(
    (q) => `entities.${q}`,
  );
  // Entities that are no block at all stay as typed until one of them is set.
  const entitiesOut =
    isRecord(previous.entities) || entityParts.some((name) => touched.has(name))
      ? prune(entities)
      : kept(previous.entities);

  // Numbers are written as typed. Relations between fields (short < long
  // window, the threshold chain) are NOT enforced here: ha-form reports every
  // keystroke, and a correction fired on "1" on the way to "1000" locks the
  // field. The card repairs a wrong order at runtime with a warning (E-1).

  return {
    ...previous,
    type: previous.type,
    title: part("title", () => opt(flat.title), raw.title),
    entities: entitiesOut,
    consumers: part("consumers", () => cleanConsumers(flat.consumers), raw.consumers),
    max_consumers: part("max_consumers", () => num(flat.max_consumers), raw.max_consumers),
    min_consumer_w: part("min_consumer_w", () => num(flat.min_consumer_w), raw.min_consumer_w),
    update_interval_s: part(
      "update_interval_s",
      () => num(flat.update_interval_s),
      raw.update_interval_s,
    ),
    appearance: part("appearance", () => opt(flat.appearance), raw.appearance),
    // A rebuilt block keeps the keys the form has no field for - list.title,
    // view.remember and whatever comes next (issue #19).
    list: part(
      "list",
      () =>
        prune({
          ...unknownKeys(raw.list, ["enabled", "rest_label", "always_below"]),
          enabled: flat.list_enabled,
          rest_label: flat.rest_label,
          always_below: flat.list_always_below,
        }),
      raw.list,
    ),
    ring: part(
      "ring",
      () =>
        prune({
          ...unknownKeys(raw.ring, ["enabled", "animation"]),
          enabled: flat.ring_enabled,
          animation: opt(flat.ring_animation) as RingAnimation | undefined,
        }),
      raw.ring,
    ),
    power: part(
      "power",
      () =>
        prune({
          ...unknownKeys(raw.power, ["unit", "decimals", "digits"]),
          unit: opt(flat.power_unit),
          decimals: num(flat.power_decimals),
          digits: num(flat.power_digits),
        }),
      raw.power,
    ),
    view: part(
      "view",
      () =>
        prune({
          ...unknownKeys(raw.view, [
            "default_mode",
            "avg_short_minutes",
            "avg_long_minutes",
            "show_selector",
            "energy_periods",
          ]),
          default_mode: flat.default_mode,
          avg_short_minutes: num(flat.avg_short_minutes),
          avg_long_minutes: num(flat.avg_long_minutes),
          show_selector: flat.show_selector,
          energy_periods: energyPeriods(flat.energy_periods),
        }),
      raw.view,
    ),
    flow: part(
      "flow",
      () =>
        prune({
          ...rec(previous.flow),
          inactive_lines: flat.inactive_lines,
          animation: flat.animation,
          design: flat.design,
          dot_color: opt(flat.dot_color),
          dot_size: percent(flat.dot_size),
          line_width: percent(flat.line_width),
          min_w: num(flat.min_w),
          peak_w: num(flat.peak_w),
          slow_below_w: num(flat.slow_below_w),
          full_speed_w: num(flat.full_speed_w),
          more_dots_above_w: num(flat.more_dots_above_w),
          max_dots_at_w: num(flat.max_dots_at_w),
          max_dots: num(flat.max_dots),
          slow_s: num(flat.slow_s),
          fast_s: num(flat.fast_s),
        }),
      raw.flow,
    ),
    // consumer_palette has no fields of its own; it rides along untouched.
    colors: part(
      "colors",
      () =>
        prune({
          ...rec(previous.colors),
          ...Object.fromEntries(COLOR_KEYS.map((key) => [key, f[`color_${key}`]])),
          // Only once they have been touched - an absent key must not overwrite
          // what the YAML already says.
          ...(f.soc_stops !== undefined ? { soc_stops: f.soc_stops } : {}),
          ...extraColors(f, withBattery),
        }),
      raw.colors,
    ),
    nodes: part("nodes", () => buildNodes(f, withBattery, previous.nodes), raw.nodes),
    icons: part(
      "icons",
      () =>
        prune({
          ...unknownKeys(raw.icons, ICON_KEYS),
          ...Object.fromEntries(ICON_KEYS.map((key) => [key, f[`icon_${key}`]])),
        }),
      raw.icons,
    ),
  } as RawConfig;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/** The fields for one balance quantity: its source selector plus whatever the
 *  chosen source needs. `derivedElsewhere` hides the derived option once another
 *  quantity has taken it - exactly one may be derived (REQ A-1). */
function quantitySchema(
  quantity: Quantity,
  flat: FlatRecord,
  derivedElsewhere: boolean,
  t: (key: string) => string,
) {
  const source =
    (flat[`${quantity}_source`] as Source | undefined) ?? sourceOf(quantity, undefined);
  const options = SOURCES[quantity]
    .filter((s) => s !== "derived" || !derivedElsewhere || source === "derived")
    .map((s) => ({
      value: s,
      label: t(s === "split" ? `source_split_${quantity}` : `source_${s}`),
    }));

  const fields: unknown[] = [
    { name: `${quantity}_source`, selector: { select: { mode: "dropdown", options } } },
  ];
  if (source === "entity") {
    fields.push({
      type: "grid",
      name: "",
      schema: [
        { name: quantity, selector: { entity: { filter: POWER_FILTER } } },
        { name: `${quantity}_invert`, selector: { boolean: {} } },
      ],
    });
  } else if (source === "split") {
    for (const name of SPLIT_FIELDS[quantity] ?? []) {
      fields.push({ name, selector: { entity: { filter: POWER_FILTER } } });
    }
  }
  return fields;
}

/** Choices for how an extra value is written (REQ Z-5); select values are text. */
function decimalsSelector(t: (key: string) => string) {
  return {
    select: {
      mode: "dropdown",
      options: ["ha", "0", "1", "2", "3", "sig2", "sig3", "sig4"].map((value) => ({
        value,
        label: t(`decimals_${value}`),
      })),
    },
  };
}

function weightSelector(t: (key: string) => string) {
  return {
    select: {
      mode: "dropdown",
      options: ["normal", "medium", "bold"].map((value) => ({
        value,
        label: t(`weight_${value}`),
      })),
    },
  };
}

/**
 * One node's section in "Beschriftung & Zusatzwerte" (REQ Z-10): the two switches, then each field
 * with its entity first - its other settings appear once the entity is there,
 * because a field without one is dropped and would take them along (E-1).
 */
function nodeSchema(
  quantity: Quantity,
  flat: FlatRecord,
  hass: HomeAssistant,
  t: (key: string) => string,
) {
  const p = `node_${quantity}_`;
  const fields: Record<string, unknown>[] = [{ name: `${p}show_name`, selector: { boolean: {} } }];
  if (hasStateWord(quantity)) fields.push({ name: `${p}show_state`, selector: { boolean: {} } });
  for (const place of PLACES) {
    if (!hasPlace(quantity, place)) continue;
    const f = `${p}${place}_`;
    fields.push({ name: `${f}entity`, selector: { entity: {} } });
    if (!nonEmpty(flat[`${f}entity`])) continue;
    if (place === "inside") {
      fields.push({
        name: `${f}position`,
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "above", label: t("position_above") },
              { value: "below", label: t("position_below") },
            ],
          },
        },
      });
    } else {
      fields.push({ name: `${f}prefix`, selector: { text: {} } });
    }
    fields.push(
      { name: `${f}decimals`, selector: decimalsSelector(t) },
      {
        name: `${f}size`,
        selector: {
          number: { min: 60, max: 150, step: 5, mode: "slider", unit_of_measurement: "%" },
        },
      },
      { name: `${f}weight`, selector: weightSelector(t) },
    );
  }
  return {
    name: `node_${quantity}`,
    type: "expandable",
    flatten: true,
    title: localize(`node.${quantity}`, hass),
    schema: fields,
  };
}

/**
 * A line of text at the end of a group: the colours of what it sets up are
 * further down, under "Farben" - on a phone that was not to be found (Z-10).
 */
const COLORS_HINT = { name: "colors_hint", type: "constant" };

function schema(hass: HomeAssistant, flat: FlatRecord) {
  const t = (key: string) => localize(`editor.${key}`, hass);
  const derivedBy = QUANTITIES.filter((q) => flat[`${q}_source`] === "derived");
  // One closed section per node, as in "Beschriftung & Zusatzwerte" (E-3):
  // without them the four quantities ran into each other, and what each was
  // about stood only in the small title of its select.
  const entitySections = QUANTITIES.map((q) => {
    const fields = quantitySchema(
      q,
      flat,
      derivedBy.some((d) => d !== q),
      t,
    );
    if (q === "battery" && flat.battery_source !== "none") {
      fields.push({ name: "battery_soc", selector: { entity: { filter: BATTERY_FILTER } } });
    }
    return {
      name: `entities_${q}`,
      type: "expandable",
      flatten: true,
      title: localize(`node.${q}`, hass),
      schema: fields,
    };
  });

  // Enum sensors and input_selects publish their own values, so the two lists
  // can be picked instead of typed - nobody has to know how their integration
  // spells "no grid" (REQ NS-7). Custom values stay allowed for the rest.
  const statusEntity = typeof flat.grid_status === "string" ? flat.grid_status : undefined;
  const statusOptions = statusEntity
    ? (hass.states?.[statusEntity]?.attributes.options as unknown)
    : undefined;
  const stateChoices = (Array.isArray(statusOptions) ? statusOptions : [])
    .filter((option): option is string => typeof option === "string")
    .map((option) => ({ value: option, label: option }));
  const stateSelector = {
    select: { multiple: true, custom_value: true, mode: "list", options: stateChoices },
  };

  return [
    { name: "title", selector: { text: {} } },
    {
      name: "entities",
      type: "expandable",
      flatten: true,
      title: t("entities"),
      schema: [...entitySections, COLORS_HINT],
    },
    {
      name: "nodes",
      type: "expandable",
      flatten: true,
      title: t("nodes"),
      // One section per node; the battery only when there is one (REQ Z-10).
      schema: [
        ...QUANTITIES.filter((q) => q !== "battery" || flat.battery_source !== "none").map((q) =>
          nodeSchema(q, flat, hass, t),
        ),
        COLORS_HINT,
      ],
    },
    // The consumers have a panel of their own, drawn between the form pieces
    // (REQ E-4): the object selector could not unfold a section inside an entry
    // or react to the entity chosen in it. Marked here so render() knows where.
    { name: CONSUMERS_SLOT, type: "constant" },
    {
      name: "grid_status",
      type: "expandable",
      flatten: true,
      title: t("grid_status_section"),
      schema: [
        { name: "grid_status", selector: { entity: {} } },
        { name: "grid_status_outage", selector: stateSelector },
        { name: "grid_status_ok", selector: stateSelector },
      ],
    },
    {
      name: "display",
      type: "expandable",
      flatten: true,
      title: t("display"),
      /*
       * "Ansicht" used to be a group of its own, next to this one. Both said
       * how the card looks, and nobody could tell which of the two held the
       * setting they were after - so they are one group, read top to bottom:
       * the card's own ground, what it shows at all, the list, how numbers are
       * written, the bar above it, and how often it refreshes.
       */
      schema: [
        {
          name: "appearance",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: t("appearance_auto") },
                { value: "light", label: t("appearance_light") },
                { value: "dark", label: t("appearance_dark") },
              ],
            },
          },
        },
        { name: "list_enabled", selector: { boolean: {} } },
        { name: "list_always_below", selector: { boolean: {} } },
        { name: "ring_enabled", selector: { boolean: {} } },
        {
          name: "ring_animation",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "overtake", label: t("ring_overtake") },
                { value: "fade", label: t("ring_fade") },
                { value: "jump", label: t("ring_jump") },
              ],
            },
          },
        },
        { name: "max_consumers", selector: { number: { min: 1, max: 50, mode: "box" } } },
        { name: "min_consumer_w", selector: { number: { min: 0, max: 1000, mode: "box" } } },
        { name: "rest_label", selector: { text: {} } },
        {
          name: "power_unit",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: t("power_auto") },
                { value: "kW", label: t("power_kw") },
                { value: "W", label: t("power_w") },
              ],
            },
          },
        },
        // Each unit is asked the one question it can answer: fixed kilowatts
        // how many decimals, "auto" how much the number should say. Whole
        // watts are whole watts and are asked nothing.
        ...(flat.power_unit === "auto"
          ? [
              {
                name: "power_digits",
                selector: {
                  select: {
                    mode: "dropdown",
                    options: [
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                    ],
                  },
                },
              },
            ]
          : []),
        ...(flat.power_unit === "W" || flat.power_unit === "auto"
          ? []
          : [
              {
                name: "power_decimals",
                selector: {
                  select: {
                    mode: "dropdown",
                    options: [
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                    ],
                  },
                },
              },
            ]),
        { name: "show_selector", selector: { boolean: {} } },
        {
          name: "default_mode",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "current", label: t("mode_current") },
                { value: "avg_short", label: t("mode_short") },
                { value: "avg_long", label: t("mode_long") },
              ],
            },
          },
        },
        { name: "avg_short_minutes", selector: { number: { min: 1, max: 120, mode: "box" } } },
        { name: "avg_long_minutes", selector: { number: { min: 2, max: 240, mode: "box" } } },
        {
          name: "energy_periods",
          // Locked, not hidden: the help text says what it waits for (EM-15).
          disabled: !energyReady(flat),
          selector: {
            select: {
              multiple: true,
              mode: "list",
              options: ENERGY_PERIODS.map((p) => ({ value: p, label: t(`energy_${p}`) })),
            },
          },
        },
        { name: "update_interval_s", selector: { number: { min: 1, max: 60, mode: "box" } } },
      ],
    },
    {
      name: "flow",
      type: "expandable",
      flatten: true,
      title: t("flow"),
      schema: [
        { name: "min_w", selector: { number: { min: 0, max: 1000, mode: "box" } } },
        { name: "peak_w", selector: { number: { min: 100, max: 100000, mode: "box" } } },
        {
          name: "inactive_lines",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "show", label: t("lines_show") },
                { value: "dim", label: t("lines_dim") },
                { value: "hide", label: t("lines_hide") },
              ],
            },
          },
        },
        {
          name: "animation",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "auto", label: t("anim_auto") },
                { value: "on", label: t("anim_on") },
                { value: "off", label: t("anim_off") },
              ],
            },
          },
        },
        {
          name: "design",
          selector: {
            select: {
              mode: "dropdown",
              // Built from the designs this build carries, so the editor can
              // never offer one the card would not find (E-1).
              options: [
                { value: NO_DESIGN, label: t("design_none") },
                ...flowDesigns().map((design) => ({
                  value: design.id,
                  label: designName(design, hass),
                })),
              ],
            },
          },
        },
        // Sliders over the card's own range. Their number field can still be
        // typed into; the card draws a value outside to the limit (E-1, K-12).
        {
          name: "dot_size",
          selector: {
            number: { min: 40, max: 150, step: 1, mode: "slider", unit_of_measurement: "%" },
          },
        },
        {
          name: "line_width",
          selector: {
            number: { min: 30, max: 150, step: 1, mode: "slider", unit_of_measurement: "%" },
          },
        },
        {
          name: "flow_fine",
          type: "expandable",
          flatten: true,
          title: t("flow_fine"),
          schema: [
            { name: "slow_below_w", selector: { number: { min: 1, max: 100000, mode: "box" } } },
            { name: "full_speed_w", selector: { number: { min: 2, max: 100000, mode: "box" } } },
            {
              name: "more_dots_above_w",
              selector: { number: { min: 2, max: 100000, mode: "box" } },
            },
            { name: "max_dots_at_w", selector: { number: { min: 3, max: 100000, mode: "box" } } },
            { name: "max_dots", selector: { number: { min: 2, max: 10, mode: "box" } } },
            { name: "slow_s", selector: { number: { min: 0.5, max: 60, step: 0.1, mode: "box" } } },
            { name: "fast_s", selector: { number: { min: 0.2, max: 30, step: 0.1, mode: "box" } } },
          ],
        },
      ],
    },
    {
      name: "icons",
      type: "expandable",
      flatten: true,
      title: t("icons"),
      schema: ICON_KEYS.map((key) => ({ name: `icon_${key}`, selector: { icon: {} } })),
    },
  ];
}

// ---------------------------------------------------------------------------
// Element
// ---------------------------------------------------------------------------

class EnerLensCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _flat: { state: true },
    _openColors: { state: true },
    _picker: { state: true },
    _pickerMode: { state: true },
    _openConsumers: { state: true },
    _builtSections: { state: true },
    _builtConsumers: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: RawConfig;
  /** The form's own state. It outlives the config because a chosen source or a
   *  half-filled split has no YAML representation yet (see buildRef). */
  private _flat?: FlatConfig;
  /** What we last emitted, to tell our own echo from an outside edit. */
  private _emitted?: string;
  /** Colour rows with their CSS field folded out. Every keystroke re-renders the
   *  list, so this cannot live in the DOM - it would fold shut mid-word. */
  private _openColors: ReadonlySet<string> = new Set();
  /**
   * The dot colour as it was before the switch cleared it.
   *
   * Only for as long as the dialog is open, and deliberately not part of the
   * configuration: ticking the box off and on again is how one looks at the
   * card without the colour, and losing the colour over that would make the
   * switch a trap. Nothing renders from this, so it needs no reactivity.
   */
  private _lastDotColor?: string;
  /**
   * The open colour wheel, if any. It lives in our own shadow root rather than
   * in <input type="color">: that one opens an operating-system popup outside
   * the document, and every pointer event in it reaches the card editor's
   * ha-dialog as a click on nothing, which closes the dialog mid-pick.
   */
  private _picker?: { id: string; hsv: Hsv };
  /** Which notation the wheel is being read in. It outlives a single pick, so
   *  someone who works in RGB is not put back on hex at every row. */
  private _pickerMode: "hex" | "rgb" | "hsl" = "hex";
  /**
   * A key per consumer entry, in step with the list, so an unfolded entry stays
   * unfolded - and stays the same entry - when the list is sorted or one above
   * it is removed. Not part of the configuration; rebuilt when the list arrives
   * from outside with a different length.
   */
  private _consumerKeys: number[] = [];
  private _nextConsumerKey = 0;
  /** Keys of the unfolded consumer entries. */
  private _openConsumers: ReadonlySet<number> = new Set();
  /**
   * Sections and consumer entries that have been unfolded at least once. Only
   * these carry their ha-form (REQ E-3, EL-I2): ha-form builds the fields of
   * folded groups too, and every entity picker walks all entities of the
   * installation - 47 of them made a cold first open take 1.6 s in Firefox,
   * with only the consumers and colours on screen for the first second. Once
   * built, a form stays, so focus and a half-typed value survive folding.
   */
  private _builtSections: ReadonlySet<string> = new Set();
  private _builtConsumers: ReadonlySet<number> = new Set();

  setConfig(config: RawConfig): void {
    this._config = config;
    // HA hands every config-changed back through setConfig. Only a config we
    // did not produce ourselves - a YAML edit, a fresh open - resets the form.
    if (this._flat === undefined || JSON.stringify(config) !== this._emitted) {
      this._flat = toFlat(config);
      // A list from outside is a list of its own: fresh keys, all folded.
      this._consumerKeys = [];
      this._openConsumers = new Set();
    }
  }

  private _label = (item: { name: string }): string => {
    const name = item.name;
    // node_<node>_<setting>: one label per setting, the node is the section (Z-10).
    const nodeSetting = /^node_(?:solar|grid|house|battery)_(.+)$/.exec(name);
    if (nodeSetting) return localize(`editor.node_${nodeSetting[1]}`, this.hass);
    if (name === "grid_status") return localize("editor.grid_status", this.hass);
    if (name.endsWith("_source"))
      return localize(`editor.${name.replace(/_source$/, "")}`, this.hass);
    if (name.endsWith("_invert")) return localize("editor.invert", this.hass);
    if (name.startsWith("icon_")) return localize(`editor.${name.slice(5)}`, this.hass);
    if (QUANTITIES.includes(name as Quantity)) return localize("editor.entity", this.hass);
    return localize(`editor.${name}`, this.hass);
  };

  /** Helper text under a field. Empty for the self-explanatory ones - localize
   *  returns the key itself when there is no entry. */
  private _helper = (item: { name: string }): string => {
    // The outage section says it once, above its fields; under the entity
    // picker it only repeated itself (Markus, 18.10.2026).
    if (item.name === "grid_status") return "";
    if (item.name === "energy_periods" && !energyReady((this._flat ?? {}) as FlatConfig)) {
      return localize("editor_help.energy_periods_locked", this.hass);
    }
    let key = `editor_help.${item.name.replace(/^node_(?:solar|grid|house|battery)_/, "node_")}`;
    if (item.name.startsWith("color_")) key = "editor_help.color";
    if (item.name.endsWith("_source")) {
      const flat = (this._flat ?? {}) as FlatRecord;
      if (flat[item.name] !== "derived") return "";
      key = "editor_help.derived";
    }
    const text = localize(key, this.hass);
    return text === key ? "" : text;
  };

  private _valueChanged(ev: CustomEvent<{ value: FlatConfig }>): void {
    // The form keeps exactly what was typed - never a value the editor made up
    // mid-keystroke (see fromFlat).
    this._emit(ev.detail.value);
  }

  private _emit(flat: FlatConfig): void {
    if (!this._config) return;
    this._flat = flat;
    const config = fromFlat(flat, this._config);
    this._emitted = JSON.stringify(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  /** One colour changed. An empty field is no colour at all, not an empty one -
   *  that is what puts the default, theme variable and all, back in charge. */
  private _setColor(key: ColorKey, value: string): void {
    if (!this._flat) return;
    const next = value.trim() === "" ? undefined : value;
    this._emit({ ...(this._flat as FlatRecord), [`color_${key}`]: next } as FlatConfig);
  }

  /**
   * The browser's own reading of a CSS colour: put on a real element, read back
   * computed. Named colours and theme variables resolve in one step that way,
   * including the fallback behind the comma - no parser of ours would know
   * whether the theme defines --energy-solar-color.
   */
  private _probe = (cssColor: string): string => {
    const root = this.shadowRoot;
    if (!root || typeof getComputedStyle === "undefined") return "";
    const probe = document.createElement("span");
    probe.style.display = "none";
    probe.style.color = cssColor;
    // A value CSS cannot parse leaves the property untouched, and the computed
    // colour would then be the inherited one - an answer to a different question.
    if (probe.style.color === "") return "";
    root.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return computed;
  };

  /**
   * Every colour the card has, in one panel: the seven nodes, the extra values
   * (Z-6), the dots, one row per consumer, and the state-of-charge gradient.
   * ha-form has no row that carries a swatch next to the text a theme variable
   * needs, and dropping the text would cost var(--energy-solar-color) (REQ C-1)
   * - so the colours are gathered here instead of being spread across editors.
   */
  private _renderColors(): TemplateResult {
    const t = (key: string) => localize(`editor.${key}`, this.hass);
    return html`
      <ha-expansion-panel outlined>
        <div slot="header" role="heading" aria-level="3">${t("colors")}</div>
        <div class="colors">
          ${
            this._picker
              ? html`<div
                  class="scrim"
                  @pointerdown=${(ev: Event) => {
                    ev.stopPropagation();
                    this._picker = undefined;
                  }}
                ></div>`
              : ""
          }
          <p class="hint">${localize("editor_help.color", this.hass)}</p>
          ${COLOR_KEYS.map((key) => this._renderNodeColor(key))}
          ${this._renderExtraColors()}
          ${this._renderDotColor()} ${this._renderConsumerColors()} ${this._renderSocStops()}
        </div>
      </ha-expansion-panel>
    `;
  }

  /**
   * Text colours of the extra fields, one row per field that has an entity -
   * with all the other colours, as every colour of the card is (REQ Z-6, Z-10).
   */
  private _renderExtraColors(): TemplateResult | string {
    const flat = (this._flat ?? {}) as FlatRecord;
    const rows: TemplateResult[] = [];
    for (const quantity of QUANTITIES) {
      if (quantity === "battery" && flat.battery_source === "none") continue;
      for (const place of PLACES) {
        if (!hasPlace(quantity, place) || !nonEmpty(flat[`node_${quantity}_${place}_entity`]))
          continue;
        const name = `color_${quantity}_${place}`;
        const raw = flat[name];
        const label = localize(`editor.color_extra_${place}`, this.hass, {
          node: localize(`node.${quantity}`, this.hass),
        });
        rows.push(
          this._colorRow({
            id: `flat:${name}`,
            label,
            name: label,
            value: typeof raw === "string" ? raw : "",
            preset: "var(--secondary-text-color)",
          }),
        );
      }
    }
    if (!rows.length) return "";
    return html`${this._group(localize("editor.colors_extras", this.hass))}${rows}`;
  }

  private _group(title: string): TemplateResult {
    return html`<p class="group">${title}</p>`;
  }

  private _renderNodeColor(key: ColorKey): TemplateResult {
    const raw = (this._flat as FlatRecord | undefined)?.[`color_${key}`];
    const label = localize(`editor.color_${key}`, this.hass);
    return this._colorRow({
      id: `node:${key}`,
      label,
      name: label,
      value: typeof raw === "string" ? raw : "",
      preset: DEFAULT_COLORS[key],
    });
  }

  /**
   * The dots, which may have one colour of their own (P-13).
   *
   * Here rather than under the design, where it belongs by subject: every
   * colour of the card is in this panel, and a colour outside it would be the
   * only one without a swatch and a wheel - ha-form has no row that carries
   * both those and the text field a theme variable needs (C-1).
   */
  private _renderDotColor(): TemplateResult {
    const raw = (this._flat as FlatRecord | undefined)?.dot_color;
    const own = typeof raw === "string" && raw.trim() !== "";
    const label = localize("editor.dot_color", this.hass);
    return html`
      ${this._group(localize("editor.colors_dots", this.hass))}
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!own}
          @change=${(ev: Event) => {
            const follow = (ev.target as HTMLInputElement).checked;
            if (follow && own) this._lastDotColor = raw as string;
            this._setFlat("dot_color", follow ? "" : (this._lastDotColor ?? DOT_COLOR_SEED));
          }}
        />
        <span>${localize("editor.dot_color_follow", this.hass)}</span>
      </label>
      ${
        own
          ? this._colorRow({
              id: "flat:dot_color",
              label,
              name: label,
              value: raw as string,
              // Only ever shown with a colour set, so the empty state the
              // preset stands for cannot come up here.
              preset: DOT_COLOR_SEED,
            })
          : nothing
      }
    `;
  }

  /** One row per configured consumer. The preset is the palette colour that
   *  consumer would get anyway, so the swatch shows the list as it looks now. */
  private _renderConsumerColors(): TemplateResult {
    // A cleared list comes back as "" from the object selector, not as [] (REQ E-1).
    const raw = (this._flat as FlatRecord | undefined)?.consumers;
    const rows = (Array.isArray(raw) ? raw : []).filter((entry) => isRecord(entry));
    if (rows.length === 0) return html``;
    const palette = DEFAULT_CONSUMER_PALETTE;
    return html`
      ${this._group(localize("editor.colors_consumers", this.hass))}
      ${rows.map((entry, index) => {
        const name =
          (typeof entry.name === "string" && entry.name.trim()) ||
          (typeof entry.entity === "string" ? entry.entity : `#${index + 1}`);
        return this._colorRow({
          id: `consumer:${index}`,
          label: name,
          name,
          value: typeof entry.color === "string" ? entry.color : "",
          preset: palette[index % palette.length],
        });
      })}
    `;
  }

  /**
   * The gradient behind the battery's fill. The card refuses a list that does
   * not run from 0 to 100 (REQ C-3), so the two ends are fixed here: their
   * colour is editable, their percentage is not, and neither can be removed.
   */
  private _renderSocStops(): TemplateResult {
    const stops = this._socStops();
    if (!stops) {
      // Rows for stops that are not stops would show colours the card does not
      // paint, and the first edit would overwrite what the YAML says (issue #19).
      return html`
        ${this._group(localize("editor.colors_soc", this.hass))}
        <p class="hint">${localize("editor.yaml_only", this.hass)}</p>
      `;
    }
    const last = stops.length - 1;
    return html`
      ${this._group(localize("editor.colors_soc", this.hass))}
      ${stops.map((stop, index) => {
        const fixed = index === 0 || index === last;
        return this._colorRow({
          id: `stop:${index}`,
          label: `${stop.at} %`,
          name: html`
            <span class="at">
              ${
                fixed
                  ? html`<span class="fixed">${stop.at}</span>`
                  : html`<input
                      class="percent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      .value=${String(stop.at)}
                      aria-label=${localize("editor.color_at", this.hass)}
                      @change=${(ev: Event) =>
                        this._setStopAt(index, Number((ev.target as HTMLInputElement).value))}
                    />`
              }
              <span class="unit">%</span>
            </span>
          `,
          value: stop.color,
          preset: stop.color,
          trail: fixed
            ? undefined
            : html`<button
                class="reset"
                title=${localize("editor.color_remove", this.hass)}
                aria-label=${localize("editor.color_remove", this.hass)}
                @click=${() => this._removeStop(index)}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>`,
        });
      })}
      <button class="add" @click=${this._addStop}>
        <ha-icon icon="mdi:plus"></ha-icon>${localize("editor.color_add_stop", this.hass)}
      </button>
    `;
  }

  /** The shared row: swatch, what it belongs to, the value, and the CSS field
   *  folded away underneath. */
  private _colorRow(opts: {
    id: string;
    label: string;
    name: string | TemplateResult;
    value: string;
    preset: string;
    trail?: TemplateResult;
  }): TemplateResult {
    const { id, label, name, value, preset, trail } = opts;
    const open = this._openColors.has(id);
    const picking = this._picker?.id === id;
    const fieldId = `color-field-${id.replace(":", "-")}`;
    // The swatch shows what the card paints: the configured value where there is
    // one, otherwise the default the empty field stands for. While the wheel is
    // being dragged it shows that instead, so the colour follows the thumb.
    const hex = picking
      ? hsvToHex((this._picker as { hsv: Hsv }).hsv)
      : (swatchHex(value || preset, this._probe) ?? UNREADABLE);
    return html`
      <div class="color ${open ? "open" : ""} ${picking ? "picking" : ""}">
        <div class="head">
          <button
            class="swatch"
            data-key=${id}
            style="background:${hex}"
            aria-label=${`${label} - ${localize("editor.color_pick", this.hass)}`}
            aria-haspopup="dialog"
            aria-expanded=${picking ? "true" : "false"}
            @click=${() => this._togglePicker(id, hex)}
          ></button>
          <span class="name">${name}</span>
          <span class="css">${value || localize("editor.color_default", this.hass)}</span>
          <button
            class="more"
            aria-expanded=${open ? "true" : "false"}
            aria-controls=${fieldId}
            @click=${() => this._toggleColor(id)}
          >
            ${localize("editor.color_css", this.hass)} ${open ? "\u25b4" : "\u25be"}
          </button>
          ${trail ?? ""}
        </div>
        ${picking ? this._renderPicker(hex) : ""}
        <div class="body" id=${fieldId} ?hidden=${!open}>
          <ha-textfield
            .label=${label}
            .value=${value}
            .placeholder=${preset}
            @input=${(ev: Event) => this._applyColor(id, (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
          <button
            class="reset"
            ?disabled=${value === ""}
            title=${localize("editor.color_reset", this.hass)}
            aria-label=${localize("editor.color_reset", this.hass)}
            @click=${() => this._applyColor(id, "")}
          >
            <ha-icon icon="mdi:backup-restore"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  /** The wheel itself: a saturation/value field over a hue strip. */
  private _renderPicker(hex: string): TemplateResult {
    const { h, s: sat, v } = (this._picker as { hsv: Hsv }).hsv;
    return html`
      <div
        class="picker"
        role="dialog"
        aria-label=${localize("editor.color_pick", this.hass)}
        @keydown=${this._pickerKeydown}
      >
        <div
          class="sv"
          tabindex="0"
          role="group"
          aria-label=${localize("editor.color_sv", this.hass)}
          style="--hue:${h}"
          @pointerdown=${(ev: PointerEvent) => this._drag(ev, "sv")}
        >
          <span class="knob" style="left:${sat * 100}%;top:${(1 - v) * 100}%"></span>
        </div>
        <div
          class="hue"
          tabindex="0"
          role="slider"
          aria-label=${localize("editor.color_hue", this.hass)}
          aria-valuemin="0"
          aria-valuemax="360"
          aria-valuenow=${Math.round(h)}
          @pointerdown=${(ev: PointerEvent) => this._drag(ev, "hue")}
        >
          <span class="knob" style="left:${(h / 360) * 100}%"></span>
        </div>
        <div class="foot">
          <span class="chip" style="background:${hex}"></span>
          ${
            this._pickerMode === "hex"
              ? html`<input
                  class="hex"
                  type="text"
                  spellcheck="false"
                  .value=${hex}
                  aria-label=${localize("editor.color_hex", this.hass)}
                  @change=${this._hexTyped}
                />`
              : html`<code class="reading">${hex}</code>`
          }
          <div class="modes" role="group" aria-label=${localize("editor.color_mode", this.hass)}>
            ${(["hex", "rgb", "hsl"] as const).map(
              (mode) => html`<button
                class="mode"
                aria-pressed=${this._pickerMode === mode ? "true" : "false"}
                @click=${() => {
                  this._pickerMode = mode;
                }}
              >
                ${mode.toUpperCase()}
              </button>`,
            )}
          </div>
        </div>
        ${this._pickerMode === "hex" ? "" : this._renderChannels()}
        ${this._renderInUse()}
      </div>
    `;
  }

  /**
   * One slider and one number per channel - the other way people reach for a
   * colour, and the one the native picker offered before it had to go.
   */
  private _renderChannels(): TemplateResult {
    const hsv = (this._picker as { hsv: Hsv }).hsv;
    const rgb = this._pickerMode === "rgb";
    const hsl = hsvToHsl(hsv);
    const channels: Array<{ key: string; label: string; value: number; max: number }> = rgb
      ? (() => {
          const parsed = /^#(..)(..)(..)$/.exec(hsvToHex(hsv));
          const [r, g, b] = parsed
            ? [1, 2, 3].map((i) => Number.parseInt(parsed[i], 16))
            : [0, 0, 0];
          return [
            { key: "r", label: "R", value: r, max: 255 },
            { key: "g", label: "G", value: g, max: 255 },
            { key: "b", label: "B", value: b, max: 255 },
          ];
        })()
      : [
          { key: "h", label: "H", value: Math.round(hsl.h), max: 360 },
          { key: "s", label: "S", value: Math.round(hsl.s * 100), max: 100 },
          { key: "l", label: "L", value: Math.round(hsl.l * 100), max: 100 },
        ];

    return html`
      <div class="channels">
        ${channels.map(
          (channel) => html`
            <label class="channel">
              <span class="tag">${channel.label}</span>
              <input
                class="range"
                type="range"
                min="0"
                max=${channel.max}
                step="1"
                .value=${String(channel.value)}
                @input=${(ev: Event) =>
                  this._setChannel(
                    channel.key,
                    Number((ev.target as HTMLInputElement).value),
                    false,
                  )}
                @change=${(ev: Event) =>
                  this._setChannel(
                    channel.key,
                    Number((ev.target as HTMLInputElement).value),
                    true,
                  )}
              />
              <input
                class="number"
                type="number"
                min="0"
                max=${channel.max}
                step="1"
                .value=${String(channel.value)}
                @change=${(ev: Event) =>
                  this._setChannel(
                    channel.key,
                    Number((ev.target as HTMLInputElement).value),
                    true,
                  )}
              />
            </label>
          `,
        )}
      </div>
    `;
  }

  /** `commit` separates dragging from letting go: the wheel repaints all the
   *  way along, the configuration is written once at the end. */
  private _setChannel(key: string, value: number, commit: boolean): void {
    if (!this._picker || !Number.isFinite(value)) return;
    const hsv = this._picker.hsv;
    let next: Hsv;
    if (key === "r" || key === "g" || key === "b") {
      const parsed = /^#(..)(..)(..)$/.exec(hsvToHex(hsv));
      const rgb = parsed ? [1, 2, 3].map((i) => Number.parseInt(parsed[i], 16)) : [0, 0, 0];
      rgb["rgb".indexOf(key)] = Math.min(255, Math.max(0, Math.round(value)));
      const hex = `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      // Keep the hue on screen: #000000 and #ffffff carry none of their own.
      next = hexToHsv(hex, hsv.h);
    } else {
      const hsl = hsvToHsl(hsv);
      const clamped = Math.max(0, value);
      if (key === "h") hsl.h = Math.min(360, clamped) % 360;
      if (key === "s") hsl.s = Math.min(100, clamped) / 100;
      if (key === "l") hsl.l = Math.min(100, clamped) / 100;
      next = { ...hslToHsv(hsl), h: hsl.h };
    }
    this._picker = { id: this._picker.id, hsv: next };
    if (commit) this._commitPicker();
  }

  /**
   * The colours this card already uses, as one click each. Two air conditioners
   * are meant to share a blue, and typing the same value twice is how they end
   * up almost sharing one.
   */
  private _renderInUse(): TemplateResult {
    const used = this._coloursInUse();
    if (used.length === 0) return html``;
    return html`
      <div class="used">
        <span class="cap">${localize("editor.color_used", this.hass)}</span>
        <div class="chips">
          ${used.map(
            (entry) => html`<button
              class="chip"
              style="background:${entry.hex}"
              title=${entry.value}
              aria-label=${entry.value}
              @click=${() => this._takeColour(entry.value, entry.hex)}
            ></button>`,
          )}
        </div>
      </div>
    `;
  }

  /** Deduplicated by what they resolve to - five greys that look alike are one
   *  suggestion, and the notation of the first one wins. */
  private _coloursInUse(): Array<{ value: string; hex: string }> {
    const flat = (this._flat ?? {}) as FlatRecord;
    const out: Array<{ value: string; hex: string }> = [];
    const seen = new Set<string>();
    const add = (value: unknown): void => {
      if (typeof value !== "string" || value.trim() === "") return;
      const hex = swatchHex(value, this._probe);
      if (!hex || seen.has(hex)) return;
      seen.add(hex);
      out.push({ value, hex });
    };

    for (const key of COLOR_KEYS) add(flat[`color_${key}`] ?? DEFAULT_COLORS[key]);
    const consumers = Array.isArray(flat.consumers) ? flat.consumers : [];
    consumers.forEach((entry, index) => {
      if (!isRecord(entry)) return;
      add(entry.color ?? DEFAULT_CONSUMER_PALETTE[index % DEFAULT_CONSUMER_PALETTE.length]);
    });
    for (const stop of this._socStops() ?? []) add(stop.color);
    // No cut: a card with a dozen consumers pushed the last of them out of a
    // list that claims to show what the card uses. Repeats are already gone,
    // and the palette cycles, so the list stays short by itself; an extreme
    // configuration scrolls (.used .chips) instead of losing colours.
    return out;
  }

  /** A suggestion is taken as written, so a theme variable stays one. */
  private _takeColour(value: string, hex: string): void {
    if (!this._picker) return;
    this._picker = { id: this._picker.id, hsv: hexToHsv(hex, this._picker.hsv.h) };
    this._applyColor(this._picker.id, value);
  }

  private _hexTyped = (ev: Event): void => {
    const input = ev.target as HTMLInputElement;
    const hex = swatchHex(input.value);
    if (!hex || !this._picker) {
      // Put back by hand, not by re-rendering: lit compares against the value it
      // last wrote, which has not changed, so it would leave the typed text
      // standing there looking accepted.
      if (this._picker) input.value = hsvToHex(this._picker.hsv);
      return;
    }
    this._picker = { id: this._picker.id, hsv: hexToHsv(hex, this._picker.hsv.h) };
    this._applyColor(this._picker.id, hex);
  };

  // -------------------------------------------------------------------------
  // Writing a colour back, wherever it belongs
  // -------------------------------------------------------------------------

  /** An empty value is no colour at all, not an empty one - that is what puts
   *  the default, theme variable and all, back in charge. */
  private _applyColor(id: string, value: string): void {
    const separator = id.indexOf(":");
    const kind = id.slice(0, separator);
    const rest = id.slice(separator + 1);
    if (kind === "flat") this._setFlat(rest, value);
    else if (kind === "node") this._setColor(rest as ColorKey, value);
    else if (kind === "consumer") this._setConsumerColor(Number(rest), value);
    else if (kind === "stop") this._setStopColor(Number(rest), value);
  }

  /** A colour that is a field of its own rather than one of the colour sets. */
  private _setFlat(name: string, value: string): void {
    if (!this._flat) return;
    const next = value.trim() === "" ? undefined : value;
    this._emit({ ...(this._flat as FlatRecord), [name]: next } as FlatConfig);
  }

  private _setConsumerColor(index: number, value: string): void {
    if (!this._flat) return;
    const flat = this._flat as FlatRecord;
    const list = Array.isArray(flat.consumers) ? [...(flat.consumers as unknown[])] : [];
    if (!isRecord(list[index])) return;
    // Rebuilt without the key rather than with an empty one: an empty colour is
    // a colour, and the palette would stop being the fallback (REQ C-4).
    const { color: _previous, ...rest } = list[index] as Record<string, unknown>;
    list[index] = value.trim() === "" ? rest : { ...rest, color: value };
    this._emit({ ...flat, consumers: list } as FlatConfig);
  }

  /** The stops as they are, or the built-in gradient while none are configured.
   *  Undefined for a hand-typed list the rows cannot show - an unquoted `#` in
   *  YAML leaves a colour null - which stays in the YAML as it is (issue #19). */
  private _socStops(): SocStop[] | undefined {
    const raw = (this._flat as FlatRecord | undefined)?.soc_stops;
    if (raw === undefined || raw === null || raw === "") {
      return DEFAULT_SOC_STOPS.map((stop) => ({ ...stop }));
    }
    const readable =
      Array.isArray(raw) &&
      raw.length >= 2 &&
      raw.every(
        (stop) =>
          isRecord(stop) &&
          typeof stop.at === "number" &&
          Number.isFinite(stop.at) &&
          nonEmpty(stop.color),
      );
    return readable ? (raw as SocStop[]) : undefined;
  }

  private _writeStops(stops: SocStop[]): void {
    if (!this._flat) return;
    this._emit({ ...(this._flat as FlatRecord), soc_stops: stops } as FlatConfig);
  }

  private _setStopColor(index: number, value: string): void {
    // A stop without a colour is not a stop the card accepts, so an emptied
    // field keeps the one it had rather than writing nothing.
    const stops = this._socStops();
    if (value.trim() === "" || !stops) return;
    this._writeStops(stops.map((s, i) => (i === index ? { ...s, color: value } : s)));
  }

  /** Percentages stay in order: the card refuses a list that runs backwards. */
  private _setStopAt(index: number, at: number): void {
    const stops = this._socStops();
    if (!stops || !Number.isFinite(at) || index <= 0 || index >= stops.length - 1) return;
    const low = stops[index - 1].at;
    const high = stops[index + 1].at;
    const clamped = Math.min(high, Math.max(low, Math.round(at)));
    this._writeStops(stops.map((s, i) => (i === index ? { ...s, at: clamped } : s)));
  }

  private _removeStop(index: number): void {
    const stops = this._socStops();
    // Two stops are the fewest a gradient can be made of (REQ C-3).
    if (!stops || stops.length <= 2 || index === 0 || index === stops.length - 1) return;
    this._writeStops(stops.filter((_, i) => i !== index));
  }

  private _addStop = (): void => {
    const stops = this._socStops();
    if (!stops) return;
    const last = stops.length - 1;
    // Halfway into the widest gap, so a new stop never lands on top of another.
    let at = 50;
    let index = last;
    let widest = -1;
    for (let i = 1; i <= last; i++) {
      const gap = stops[i].at - stops[i - 1].at;
      if (gap > widest) {
        widest = gap;
        index = i;
        at = Math.round((stops[i].at + stops[i - 1].at) / 2);
      }
    }
    const next = [...stops];
    next.splice(index, 0, { at, color: stops[index].color });
    this._writeStops(next);
  };

  private _togglePicker(id: string, hex: string): void {
    if (this._picker?.id === id) {
      this._picker = undefined;
      return;
    }
    // The hue of a grey is arbitrary; keeping the one on screen stops the strip
    // from jumping to red the moment someone drags the value down to black.
    this._picker = { id, hsv: hexToHsv(hex, this._picker?.hsv.h ?? 0) };
  }

  /**
   * Dragging on the field or the strip. The pointer is captured so the value
   * keeps following it outside the element, every event is kept to ourselves so
   * the surrounding dialog never sees a stray click, and the configuration is
   * written once on release rather than on every pixel.
   */
  private _drag(ev: PointerEvent, kind: "sv" | "hue"): void {
    const target = ev.currentTarget as HTMLElement;
    ev.preventDefault();
    ev.stopPropagation();
    target.setPointerCapture?.(ev.pointerId);

    const apply = (move: PointerEvent) => {
      if (!this._picker) return;
      const box = target.getBoundingClientRect();
      const x = box.width ? Math.min(1, Math.max(0, (move.clientX - box.left) / box.width)) : 0;
      const y = box.height ? Math.min(1, Math.max(0, (move.clientY - box.top) / box.height)) : 0;
      const hsv = this._picker.hsv;
      this._picker = {
        id: this._picker.id,
        // A grey has no hue to move and a black has no hue to show: dragging the
        // strip would do visibly nothing, which reads as a broken control. Asking
        // for a hue is asking for a colour, so the other two axes come along.
        hsv:
          kind === "hue"
            ? { h: x * 360, s: hsv.s || 1, v: hsv.v || 1 }
            : { ...hsv, s: x, v: 1 - y },
      };
    };

    const stop = () => {
      target.removeEventListener("pointermove", apply);
      target.removeEventListener("pointerup", stop);
      target.removeEventListener("pointercancel", stop);
      this._commitPicker();
    };
    target.addEventListener("pointermove", apply);
    target.addEventListener("pointerup", stop);
    target.addEventListener("pointercancel", stop);
    apply(ev);
  }

  /** Arrow keys move the same two axes; Escape puts the wheel away. */
  private _pickerKeydown(ev: KeyboardEvent): void {
    if (ev.key === "Escape") {
      this._picker = undefined;
      ev.stopPropagation();
      return;
    }
    if (!this._picker) return;
    const onHue = (ev.target as HTMLElement).classList.contains("hue");
    const step = ev.shiftKey ? 10 : 1;
    const hsv = { ...this._picker.hsv };
    switch (ev.key) {
      case "ArrowLeft":
        if (onHue) hsv.h -= step;
        else hsv.s -= step / 100;
        break;
      case "ArrowRight":
        if (onHue) hsv.h += step;
        else hsv.s += step / 100;
        break;
      case "ArrowUp":
        if (onHue) return;
        hsv.v += step / 100;
        break;
      case "ArrowDown":
        if (onHue) return;
        hsv.v -= step / 100;
        break;
      default:
        return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    this._picker = {
      id: this._picker.id,
      hsv: {
        h: ((hsv.h % 360) + 360) % 360,
        s: Math.min(1, Math.max(0, onHue ? hsv.s || 1 : hsv.s)),
        v: Math.min(1, Math.max(0, onHue ? hsv.v || 1 : hsv.v)),
      },
    };
    this._commitPicker();
  }

  private _commitPicker(): void {
    if (this._picker) this._applyColor(this._picker.id, hsvToHex(this._picker.hsv));
  }

  private _toggleColor(id: string): void {
    const next = new Set(this._openColors);
    if (!next.delete(id)) next.add(id);
    this._openColors = next;
  }

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config || !this._flat) return nothing;
    const all = schema(this.hass, this._flat as FlatRecord);
    // The consumers have their own panel where the object selector used to be,
    // and the colours keep the place they always had, between the flow
    // settings and the icons. All form pieces carry the same data, so any one
    // of them may report any field.
    const slot = all.findIndex((item) => item.name === CONSUMERS_SLOT);
    const head = slot === -1 ? all : all.slice(0, slot);
    const fields = slot === -1 ? [] : all.slice(slot + 1);
    const cut = fields.findIndex((item) => item.name === "icons");
    const split = cut === -1 ? fields.length : cut;
    return html`${this._renderPieces(head)}${this._renderConsumers()}${this._renderPieces(
      fields.slice(0, split),
    )}${this._renderColors()}${this._renderPieces(fields.slice(split))}`;
  }

  private _form(items: readonly Record<string, unknown>[]): TemplateResult {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._flat}
        .schema=${items}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  /**
   * A run of schema items: plain fields go into one ha-form, each top-level
   * group becomes a panel of our own that builds its form on first unfolding
   * (REQ E-3, EL-I2). The groups are flattened, so the form inside reads and
   * reports the same flat data the whole schema did.
   */
  private _renderPieces(items: readonly Record<string, unknown>[]): TemplateResult[] {
    const out: TemplateResult[] = [];
    let plain: Record<string, unknown>[] = [];
    for (const item of items) {
      if (item.type !== "expandable") {
        plain.push(item);
        continue;
      }
      if (plain.length) out.push(this._form(plain));
      plain = [];
      out.push(this._renderSection(item));
    }
    if (plain.length) out.push(this._form(plain));
    return out;
  }

  private _renderSection(item: Record<string, unknown>): TemplateResult {
    const name = String(item.name);
    const built = this._builtSections.has(name);
    // ha-form-expandable put the group's own help above its fields.
    const help = localize(`editor_help.${name}`, this.hass);
    const description = help === `editor_help.${name}` ? "" : help;
    return html`
      <ha-expansion-panel
        outlined
        class="section"
        data-section=${name}
        @expanded-will-change=${(ev: CustomEvent<{ expanded: boolean }>) => {
          // Before the panel measures its content, so it unfolds to full height.
          if (ev.target !== ev.currentTarget || !ev.detail.expanded || built) return;
          this._builtSections = new Set([...this._builtSections, name]);
        }}
      >
        <div slot="header" role="heading" aria-level="3">${item.title}</div>
        <div class="section-content">
          ${description ? html`<p class="section-description">${description}</p>` : nothing}
          ${built ? this._form(item.schema as Record<string, unknown>[]) : nothing}
        </div>
      </ha-expansion-panel>
    `;
  }

  // --- consumers (REQ E-4, L-15) -----------------------------------------------

  /** The entries as the form holds them, half-filled ones included. */
  private _consumerRows(): unknown[] {
    const raw = (this._flat as FlatRecord | undefined)?.consumers;
    return Array.isArray(raw) ? raw : [];
  }

  /** Keys in step with the rows; a list from outside starts a fresh set. */
  private _keysFor(count: number): number[] {
    while (this._consumerKeys.length < count) this._consumerKeys.push(this._nextConsumerKey++);
    if (this._consumerKeys.length > count) this._consumerKeys.length = count;
    return this._consumerKeys;
  }

  private _writeConsumers(rows: unknown[], keys: number[]): void {
    if (!this._flat) return;
    this._consumerKeys = keys;
    this._emit({ ...(this._flat as FlatRecord), consumers: rows } as FlatConfig);
  }

  private _renderConsumers(): TemplateResult {
    const t = (key: string) => localize(`editor.${key}`, this.hass);
    const rows = this._consumerRows();
    const keys = this._keysFor(rows.length);
    const items = rows.map((row, index) => ({ row, index, key: keys[index] }));
    return html`
      <ha-expansion-panel outlined class="consumers-panel">
        <div slot="header" role="heading" aria-level="3">${t("consumers")}</div>
        <div class="consumers">
          <p class="hint">${localize("editor_help.consumers_list", this.hass)}</p>
          <ha-sortable handle-selector=".handle" @item-moved=${this._moveConsumer}>
            <div class="consumer-list">
              ${repeat(
                items,
                (item) => item.key,
                (item) => this._renderConsumer(item.row, item.index, item.key),
              )}
            </div>
          </ha-sortable>
          <button class="add-consumer" type="button" @click=${this._addConsumer}>
            <ha-icon icon="mdi:plus"></ha-icon>${t("consumer_add")}
          </button>
          <p class="hint">${t("colors_hint")}</p>
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderConsumer(raw: unknown, index: number, key: number): TemplateResult {
    const t = (k: string) => localize(`editor.${k}`, this.hass);
    const row = isRecord(raw) ? raw : {};
    const entity = typeof row.entity === "string" ? row.entity : "";
    const friendly = this.hass?.states?.[entity]?.attributes?.friendly_name;
    const title =
      (typeof row.name === "string" && row.name.trim()) ||
      (typeof friendly === "string" && friendly) ||
      entity ||
      t("consumer_new");
    const charge = isRecord(row.charge) ? row.charge : undefined;
    const hasCharge = nonEmpty(charge?.soc);
    const palette = DEFAULT_CONSUMER_PALETTE;
    const colour =
      typeof row.color === "string" && row.color.trim() !== ""
        ? row.color
        : palette[index % palette.length];
    return html`
      <ha-expansion-panel
        outlined
        class="consumer"
        .expanded=${this._openConsumers.has(key)}
        @expanded-will-change=${(ev: CustomEvent<{ expanded: boolean }>) => {
          // Built before the panel measures its content (REQ E-3, EL-I2).
          if (ev.target !== ev.currentTarget || !ev.detail.expanded) return;
          if (this._builtConsumers.has(key)) return;
          this._builtConsumers = new Set([...this._builtConsumers, key]);
        }}
        @expanded-changed=${(ev: CustomEvent<{ expanded: boolean }>) => {
          // Nested panels bubble theirs too; only this entry's own counts.
          if (ev.target !== ev.currentTarget) return;
          const next = new Set(this._openConsumers);
          if (ev.detail.expanded) next.add(key);
          else next.delete(key);
          this._openConsumers = next;
        }}
      >
        <div slot="header" class="consumer-head">
          ${
            customElements.get("ha-sortable")
              ? html`<ha-icon
                  class="handle"
                  icon="mdi:drag"
                  @click=${(ev: Event) => ev.stopPropagation()}
                  @keydown=${(ev: Event) => ev.stopPropagation()}
                ></ha-icon>`
              : // HA loads its drag helper only for some views; without it the
                // entries move by buttons instead of silently not at all.
                html`<span class="move">
                  ${[-1, 1].map(
                    (step) => html`<button
                      type="button"
                      aria-label=${t(step < 0 ? "consumer_up" : "consumer_down")}
                      ?disabled=${index + step < 0 || index + step >= this._consumerRows().length}
                      @click=${(ev: Event) => {
                        ev.stopPropagation();
                        this._moveTo(index, index + step);
                      }}
                      @keydown=${(ev: Event) => ev.stopPropagation()}
                    >
                      <ha-icon icon=${step < 0 ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
                    </button>`,
                  )}
                </span>`
          }
          <ha-icon
            class="consumer-icon"
            icon=${typeof row.icon === "string" && row.icon ? row.icon : "mdi:flash"}
            style="color:${colour}"
          ></ha-icon>
          <span class="consumer-title">
            <span class="consumer-name">${title}</span>
            ${entity ? html`<small>${entity}</small>` : nothing}
          </span>
          ${
            hasCharge
              ? html`<span class="badge"><ha-icon icon="mdi:battery-charging-70"></ha-icon>${t(
                  "charge",
                )}</span>`
              : nothing
          }
          <button
            class="remove"
            type="button"
            aria-label=${t("consumer_remove")}
            title=${t("consumer_remove")}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              this._removeConsumer(index);
            }}
            @keydown=${(ev: Event) => {
              // The panel header treats Enter and Space as "toggle" and cancels
              // them; kept here they press the button instead.
              ev.stopPropagation();
            }}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${
          this._builtConsumers.has(key)
            ? html`<ha-form
                .hass=${this.hass}
                .data=${row}
                .schema=${consumerSchema(this.hass as HomeAssistant, row)}
                .computeLabel=${this._consumerLabel}
                .computeHelper=${this._consumerHelper}
                @value-changed=${(ev: CustomEvent<{ value: Record<string, unknown> }>) => {
                  ev.stopPropagation();
                  this._setConsumer(index, ev.detail.value);
                }}
              ></ha-form>`
            : nothing
        }
      </ha-expansion-panel>
    `;
  }

  private _consumerLabel = (item: { name: string }): string => {
    const own = `editor.consumer_${item.name}`;
    const text = localize(own, this.hass);
    return text === own ? localize(`editor.${item.name}`, this.hass) : text;
  };

  private _consumerHelper = (item: { name: string }): string => {
    const key = `editor_help.consumer_${item.name}`;
    const text = localize(key, this.hass);
    return text === key ? "" : text;
  };

  private _setConsumer(index: number, value: Record<string, unknown>): void {
    const rows = [...this._consumerRows()];
    rows[index] = value;
    this._writeConsumers(rows, [...this._consumerKeys]);
  }

  /** A new entry stays in the form until it has an entity; the YAML only gets it then (E-1). */
  private _addConsumer = (): void => {
    const rows = [...this._consumerRows(), {}];
    const keys = [...this._keysFor(rows.length - 1), this._nextConsumerKey++];
    this._openConsumers = new Set([...this._openConsumers, keys[keys.length - 1]]);
    // Opened from code, so the panel announces nothing: built here, and kept
    // when it is folded like any other (REQ E-3).
    this._builtConsumers = new Set([...this._builtConsumers, keys[keys.length - 1]]);
    this._writeConsumers(rows, keys);
  };

  private _removeConsumer(index: number): void {
    const rows = [...this._consumerRows()];
    const keys = [...this._consumerKeys];
    rows.splice(index, 1);
    keys.splice(index, 1);
    this._writeConsumers(rows, keys);
  }

  private _moveConsumer = (ev: CustomEvent<{ oldIndex: number; newIndex: number }>): void => {
    ev.stopPropagation();
    this._moveTo(ev.detail.oldIndex, ev.detail.newIndex);
  };

  private _moveTo(oldIndex: number, newIndex: number): void {
    const rows = [...this._consumerRows()];
    const keys = [...this._consumerKeys];
    if (oldIndex === newIndex || oldIndex >= rows.length) return;
    rows.splice(newIndex, 0, ...rows.splice(oldIndex, 1));
    keys.splice(newIndex, 0, ...keys.splice(oldIndex, 1));
    this._writeConsumers(rows, keys);
  }

  static styles: CSSResultGroup = css`
    /*
     * One gap between the panels, whoever draws them.
     *
     * The colours cannot live in the schema - ha-form has no row with a swatch
     * (C-1) - so the editor is three pieces: a form, the colours panel, a
     * second form for the icons. ha-form spaces its own rows and stops at the
     * last one, so the two seams between the pieces had no gap at all while
     * every other panel had one. 24 px is what ha-form puts between its rows.
     */
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    ha-form {
      display: block;
    }

    /* A top-level group, drawn as ha-form-expandable draws its own. */
    .section {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: var(--ha-border-radius-md);
      --ha-card-border-radius: var(--ha-border-radius-md);
    }

    .section-content {
      padding: 12px;
    }

    .section-description {
      margin: 0 0 24px;
    }

    /* The consumers (REQ E-4): one unfoldable entry each, its form inside. */
    .consumers {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0 4px;
    }

    .consumer-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .consumer {
      --expansion-panel-summary-padding: 0 8px 0 4px;
      --expansion-panel-content-padding: 4px 12px 12px;
    }

    .consumer-head {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      width: 100%;
    }

    .handle {
      cursor: grab;
      color: var(--secondary-text-color);
      padding: 4px;
    }

    .consumer-icon {
      flex: none;
    }

    .consumer-title {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }

    .consumer-name,
    .consumer-title small {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .consumer-title small {
      color: var(--secondary-text-color);
    }

    .badge {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.8em;
      padding: 2px 8px;
      border-radius: 10px;
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      --mdc-icon-size: 14px;
    }

    .move {
      display: flex;
      flex-direction: column;
    }

    .move button {
      background: none;
      border: 0;
      padding: 0;
      cursor: pointer;
      color: var(--secondary-text-color);
      display: flex;
      --mdc-icon-size: 18px;
    }

    .move button:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .remove,
    .add-consumer {
      background: none;
      border: 0;
      cursor: pointer;
      color: var(--secondary-text-color);
      font: inherit;
    }

    .remove {
      flex: none;
      padding: 6px;
      border-radius: 50%;
      display: flex;
    }

    .add-consumer {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 18px;
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      font-weight: 500;
    }

    .remove:focus-visible,
    .add-consumer:focus-visible {
      outline: 2px solid var(--primary-color);
    }

    .colors {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 0 4px;
    }

    /* A plain checkbox, because this one is not a form field but a choice
       about whether the field below it exists at all. */
    .switch {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 2px 0 6px;
      cursor: pointer;
      font-size: 0.95em;
    }

    .switch input {
      accent-color: var(--primary-color);
      width: 18px;
      height: 18px;
      margin: 0;
    }

    .hint {
      margin: 0 0 4px;
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }

    /* Name and colour first; the CSS field folds out under them. Seven text
       fields at once are a wall - and most of them are never touched. */
    /* Which of the three kinds of colour follows. */
    .group {
      margin: 14px 0 2px;
      color: var(--secondary-text-color);
      font-size: 0.8em;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .at {
      display: inline-flex;
      align-items: baseline;
      gap: 2px;
      font-variant-numeric: tabular-nums;
    }

    .at .percent {
      width: 3.4em;
      padding: 2px 4px;
      border: none;
      border-bottom: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 4px 4px 0 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font: inherit;
      font-variant-numeric: tabular-nums;
    }

    .at .fixed {
      display: inline-block;
      width: 3.4em;
      padding: 2px 4px;
      color: var(--secondary-text-color);
    }

    .at .unit {
      color: var(--secondary-text-color);
    }

    .add {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 6px 10px 6px 6px;
      border: none;
      border-radius: 16px;
      background: none;
      color: var(--primary-color);
      font: inherit;
      font-size: 0.9em;
      cursor: pointer;
    }

    .add:hover {
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
    }

    .add ha-icon {
      --mdc-icon-size: 18px;
    }

    .color {
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      padding-bottom: 6px;
    }

    .color:last-child {
      border-bottom: none;
    }

    .head {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .head .name {
      flex: 1;
      min-width: 0;
    }

    /* What is set, in the notation it was written in - so a theme variable is
       readable without folding the row out. */
    .head .css {
      max-width: 42%;
      color: var(--secondary-text-color);
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 0.8em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .more {
      flex: none;
      padding: 4px 2px;
      border: none;
      background: none;
      color: var(--primary-color);
      font: inherit;
      font-size: 0.8em;
      font-family: var(--code-font-family, ui-monospace, monospace);
      cursor: pointer;
      white-space: nowrap;
    }

    .body {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0 2px 40px;
    }

    /* Wins over the display above, which the UA rule alone would not. */
    .body[hidden] {
      display: none;
    }

    .body ha-textfield {
      flex: 1;
      min-width: 0;
    }

    /* The swatch is a button now: it opens the wheel below, in this shadow root,
       where the surrounding dialog can see what is going on. */
    .swatch {
      flex: none;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 7px;
      cursor: pointer;
    }

    .scrim {
      position: fixed;
      inset: 0;
      z-index: 1;
    }

    /* Only the row being picked is lifted over the scrim. */
    .color.picking {
      position: relative;
      z-index: 2;
    }

    .picker {
      margin: 8px 0 2px;
      padding: 10px;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 10px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      box-shadow: var(--ha-card-box-shadow, 0 4px 14px rgba(0, 0, 0, 0.22));
      display: flex;
      flex-direction: column;
      gap: 10px;
      touch-action: none;
    }

    .picker .sv {
      position: relative;
      height: 128px;
      border-radius: 7px;
      cursor: crosshair;
      background:
        linear-gradient(to top, #000, transparent),
        linear-gradient(to right, #fff, hsl(var(--hue) 100% 50%));
    }

    .picker .hue {
      position: relative;
      height: 15px;
      border-radius: 8px;
      cursor: ew-resize;
      background: linear-gradient(
        to right,
        #f00 0%,
        #ff0 17%,
        #0f0 33%,
        #0ff 50%,
        #00f 67%,
        #f0f 83%,
        #f00 100%
      );
    }

    .picker .knob {
      position: absolute;
      width: 13px;
      height: 13px;
      margin: -7px 0 0 -7px;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }

    .picker .hue .knob {
      top: 50%;
    }

    .picker :is(.sv, .hue):focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .picker .foot {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .picker .foot .chip {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1px solid var(--divider-color, #c8c8c8);
    }

    .picker .foot .hex {
      flex: 1;
      min-width: 0;
      padding: 4px 6px;
      border: none;
      border-bottom: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 4px 4px 0 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 0.85em;
    }

    .picker .foot .hex:focus {
      outline: none;
      border-bottom-color: var(--primary-color);
    }

    .picker .foot .reading {
      flex: 1;
      min-width: 0;
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }

    .modes {
      flex: none;
      display: flex;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 6px;
      overflow: hidden;
    }

    .mode {
      padding: 3px 7px;
      border: none;
      background: none;
      color: var(--secondary-text-color);
      font: inherit;
      font-size: 0.7em;
      letter-spacing: 0.04em;
      cursor: pointer;
    }

    .mode[aria-pressed="true"] {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .channels {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .channel {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .channel .tag {
      flex: none;
      width: 1.2em;
      color: var(--secondary-text-color);
      font-size: 0.85em;
      text-align: center;
    }

    .channel .range {
      flex: 1;
      min-width: 0;
      accent-color: var(--primary-color);
    }

    .channel .number {
      flex: none;
      width: 3.6em;
      padding: 2px 4px;
      border: none;
      border-bottom: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 4px 4px 0 0;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;
    }

    .used .cap {
      display: block;
      margin-bottom: 5px;
      color: var(--secondary-text-color);
      font-size: 0.75em;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .used .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      /* Five rows of 22 px chips plus their gaps - beyond that it scrolls,
         so the popup cannot grow past the dialog. */
      max-height: 140px;
      overflow-y: auto;
    }

    .used .chip {
      width: 22px;
      height: 22px;
      padding: 0;
      border: 1px solid var(--divider-color, #c8c8c8);
      border-radius: 6px;
      cursor: pointer;
    }

    .used .chip:hover {
      transform: scale(1.12);
    }

    .reset {
      flex: none;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }

    .reset:hover:not([disabled]) {
      background: var(--divider-color, rgba(0, 0, 0, 0.1));
    }

    .reset[disabled] {
      opacity: 0.3;
      cursor: default;
    }
  `;
}

if (!customElements.get(EDITOR_NAME)) {
  customElements.define(EDITOR_NAME, EnerLensCardEditor);
}
