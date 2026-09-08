/**
 * <enerlens-card-editor> - the GUI editor (REQ E-3 to E-6).
 *
 * Built on ha-form, which Home Assistant registers itself: passing it a schema
 * yields native pickers, translated labels and the look of every other card
 * editor. Consumers use the object selector with multiple: true, available
 * since HA 2025.7 (ENT-17) - that is what makes a list editable without a
 * hand-written sub-editor.
 *
 * Every form a balance quantity can take in YAML (REQ A-1, ENT-16) is
 * editable here: a single entity with optional sign inversion, the split
 * two-entity form for grid and battery, derived, or - for the battery - none.
 * Each quantity has a source selector and only the fields for the chosen
 * source appear beneath it, so the form never has to guess what a half-filled
 * set of pickers means.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { EDITOR_NAME } from "./const";
import { localize } from "./localize";
import type { EntityRef, HomeAssistant, RawConfig } from "./types";

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
type Quantity = (typeof QUANTITIES)[number];

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
  consumers?: unknown[];
  max_consumers?: number;
  min_consumer_w?: number;
  update_interval_s?: number;
  rest_label?: string;
  list_enabled?: boolean;
  ring_enabled?: boolean;
  default_mode?: string;
  avg_short_minutes?: number;
  avg_long_minutes?: number;
  show_selector?: boolean;
  inactive_lines?: string;
  animation?: string;
  min_w?: number;
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
}

const COLOR_KEYS = [
  "solar",
  "house",
  "grid_import",
  "grid_export",
  "battery_charge",
  "battery_discharge",
  "rest",
] as const;

type FlatRecord = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Config <-> flat form data
// ---------------------------------------------------------------------------

/** Which source a YAML entry represents. Absent means "derived" for the house
 *  (REQ A-1), "none" for the battery (A-5) and an empty entity picker otherwise. */
function sourceOf(quantity: Quantity, ref: EntityRef | undefined): Source {
  if (ref === undefined) {
    return quantity === "house" ? "derived" : quantity === "battery" ? "none" : "entity";
  }
  if (ref === "derived") return "derived";
  if (typeof ref === "string" || "entity" in ref) return "entity";
  return "split";
}

function flattenQuantity(quantity: Quantity, ref: EntityRef | undefined, out: FlatRecord): void {
  out[`${quantity}_source`] = sourceOf(quantity, ref);
  if (ref === undefined || ref === "derived") return;
  if (typeof ref === "string") {
    out[quantity] = ref;
    return;
  }
  if ("entity" in ref) {
    out[quantity] = ref.entity;
    out[`${quantity}_invert`] = ref.invert === true;
    return;
  }
  const fields = SPLIT_FIELDS[quantity];
  const keys = SPLIT_KEYS[quantity];
  if (!fields || !keys) return;
  const split = ref as Record<string, string>;
  out[fields[0]] = split[keys[0]];
  out[fields[1]] = split[keys[1]];
}

function toFlat(config: RawConfig): FlatConfig {
  const e = config.entities ?? {};
  const out: FlatRecord = {
    title: config.title,
    battery_soc: e.battery_soc,
    consumers: config.consumers,
    max_consumers: config.max_consumers,
    min_consumer_w: config.min_consumer_w,
    update_interval_s: config.update_interval_s,
    rest_label: config.list?.rest_label,
    list_enabled: config.list?.enabled,
    ring_enabled: config.ring?.enabled,
    default_mode: config.view?.default_mode,
    avg_short_minutes: config.view?.avg_short_minutes,
    avg_long_minutes: config.view?.avg_long_minutes,
    show_selector: config.view?.show_selector,
    inactive_lines: config.flow?.inactive_lines,
    animation: config.flow?.animation,
    min_w: config.flow?.min_w,
  };
  for (const quantity of QUANTITIES) flattenQuantity(quantity, e[quantity], out);
  const colors = (config.colors ?? {}) as Record<string, unknown>;
  for (const key of COLOR_KEYS) out[`color_${key}`] = colors[key];
  const icons = (config.icons ?? {}) as Record<string, unknown>;
  for (const key of QUANTITIES) out[`icon_${key}`] = icons[key];
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

/** The object selector leaves "" or null when a field is cleared; the YAML
 *  should not carry those, and the entity must survive (REQ E-4). */
function cleanConsumers(value: unknown): RawConfig["consumers"] {
  if (!Array.isArray(value)) return undefined;
  const list = value
    .map((entry) => (isRecord(entry) ? prune(entry) : undefined))
    .filter((entry): entry is Record<string, unknown> => entry !== undefined);
  return list.length ? (list as unknown as RawConfig["consumers"]) : undefined;
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

function fromFlat(flat: FlatConfig, previous: RawConfig): RawConfig {
  const f = flat as FlatRecord;
  const entities: Record<string, unknown> = { ...previous.entities };
  for (const quantity of QUANTITIES) entities[quantity] = buildRef(quantity, f);
  // No battery, no state of charge to show (REQ A-5).
  entities.battery_soc = f.battery_source === "none" ? undefined : flat.battery_soc;

  return {
    ...previous,
    type: previous.type,
    title: flat.title || undefined,
    entities: prune(entities) as RawConfig["entities"],
    consumers: cleanConsumers(flat.consumers),
    max_consumers: flat.max_consumers,
    min_consumer_w: flat.min_consumer_w,
    update_interval_s: flat.update_interval_s,
    list: prune({ enabled: flat.list_enabled, rest_label: flat.rest_label }),
    ring: prune({ enabled: flat.ring_enabled }),
    view: prune({
      default_mode: flat.default_mode,
      avg_short_minutes: flat.avg_short_minutes,
      avg_long_minutes: flat.avg_long_minutes,
      show_selector: flat.show_selector,
    }),
    flow: prune({
      ...previous.flow,
      inactive_lines: flat.inactive_lines,
      animation: flat.animation,
      min_w: flat.min_w,
    }),
    // soc_stops and consumer_palette have no fields; they ride along untouched.
    colors: prune({
      ...previous.colors,
      ...Object.fromEntries(COLOR_KEYS.map((key) => [key, f[`color_${key}`]])),
    }),
    icons: prune(Object.fromEntries(QUANTITIES.map((key) => [key, f[`icon_${key}`]]))),
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

function schema(hass: HomeAssistant, flat: FlatRecord) {
  const t = (key: string) => localize(`editor.${key}`, hass);
  const derivedBy = QUANTITIES.filter((q) => flat[`${q}_source`] === "derived");
  const entityFields = QUANTITIES.flatMap((q) =>
    quantitySchema(
      q,
      flat,
      derivedBy.some((d) => d !== q),
      t,
    ),
  );
  if (flat.battery_source !== "none") {
    entityFields.push({ name: "battery_soc", selector: { entity: { filter: BATTERY_FILTER } } });
  }

  return [
    { name: "title", selector: { text: {} } },
    {
      name: "entities",
      type: "expandable",
      flatten: true,
      expanded: true,
      title: t("entities"),
      schema: entityFields,
    },
    {
      name: "consumers",
      selector: {
        object: {
          multiple: true,
          label_field: "name",
          description_field: "entity",
          fields: {
            entity: {
              label: t("entity"),
              selector: { entity: { filter: POWER_FILTER } },
              required: true,
            },
            name: { label: t("name"), selector: { text: {} } },
            color: { label: t("color"), selector: { text: {} } },
            icon: { label: t("icon"), selector: { icon: {} } },
            min_w: { label: t("min_w"), selector: { number: { min: 0, max: 10000, mode: "box" } } },
          },
        },
      },
    },
    {
      name: "display",
      type: "expandable",
      flatten: true,
      title: t("display"),
      schema: [
        { name: "max_consumers", selector: { number: { min: 1, max: 50, mode: "box" } } },
        { name: "min_consumer_w", selector: { number: { min: 0, max: 1000, mode: "box" } } },
        { name: "update_interval_s", selector: { number: { min: 1, max: 60, mode: "box" } } },
        { name: "rest_label", selector: { text: {} } },
        { name: "list_enabled", selector: { boolean: {} } },
        { name: "ring_enabled", selector: { boolean: {} } },
      ],
    },
    {
      name: "view",
      type: "expandable",
      flatten: true,
      title: t("view"),
      schema: [
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
        { name: "show_selector", selector: { boolean: {} } },
      ],
    },
    {
      name: "flow",
      type: "expandable",
      flatten: true,
      title: t("flow"),
      schema: [
        { name: "min_w", selector: { number: { min: 0, max: 1000, mode: "box" } } },
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
      ],
    },
    {
      name: "colors",
      type: "expandable",
      flatten: true,
      title: t("colors"),
      // Text rather than a colour picker: HA's pickers know RGB triples, not
      // theme variables, and var(--energy-solar-color) is the point (REQ C-1).
      schema: COLOR_KEYS.map((key) => ({ name: `color_${key}`, selector: { text: {} } })),
    },
    {
      name: "icons",
      type: "expandable",
      flatten: true,
      title: t("icons"),
      schema: QUANTITIES.map((key) => ({ name: `icon_${key}`, selector: { icon: {} } })),
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
  };

  hass?: HomeAssistant;
  private _config?: RawConfig;
  /** The form's own state. It outlives the config because a chosen source or a
   *  half-filled split has no YAML representation yet (see buildRef). */
  private _flat?: FlatConfig;
  /** What we last emitted, to tell our own echo from an outside edit. */
  private _emitted?: string;

  setConfig(config: RawConfig): void {
    this._config = config;
    // HA hands every config-changed back through setConfig. Only a config we
    // did not produce ourselves - a YAML edit, a fresh open - resets the form.
    if (this._flat === undefined || JSON.stringify(config) !== this._emitted) {
      this._flat = toFlat(config);
    }
  }

  private _label = (item: { name: string }): string => {
    const name = item.name;
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
    let key = `editor_help.${item.name}`;
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
    if (!this._config) return;
    this._flat = ev.detail.value;
    const config = fromFlat(this._flat, this._config);
    this._emitted = JSON.stringify(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config || !this._flat) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._flat}
        .schema=${schema(this.hass, this._flat as FlatRecord)}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

if (!customElements.get(EDITOR_NAME)) {
  customElements.define(EDITOR_NAME, EnerLensCardEditor);
}
