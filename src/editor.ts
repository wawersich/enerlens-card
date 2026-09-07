/**
 * <enerlens-card-editor> - the GUI editor (REQ E-3 to E-6).
 *
 * Built on ha-form, which Home Assistant registers itself: passing it a schema
 * yields native pickers, translated labels and the look of every other card
 * editor. Consumers use the object selector with multiple: true, available
 * since HA 2025.7 (ENT-17) - that is what makes a list editable without a
 * hand-written sub-editor.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { EDITOR_NAME } from "./const";
import { localize } from "./localize";
import type { HomeAssistant, RawConfig } from "./types";

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

/**
 * Balance quantities the form can edit. A split ({import, export}) or derived
 * entry has no field: a single picker cannot express it, and offering one would
 * let a save replace the whole thing with one entity.
 */
function plainEntities(config: RawConfig): Set<string> {
  const plain = new Set<string>();
  for (const key of ["solar", "grid", "house", "battery"] as const) {
    const value = config.entities?.[key];
    if (value === undefined || typeof value === "string") plain.add(key);
  }
  return plain;
}

function schema(hass: HomeAssistant, editable: Set<string>) {
  const t = (key: string) => localize(`editor.${key}`, hass);
  return [
    { name: "title", selector: { text: {} } },
    {
      name: "entities",
      type: "expandable",
      flatten: true,
      title: t("entities"),
      schema: [
        ...(["solar", "grid", "house", "battery"] as const)
          .filter((key) => editable.has(key))
          .map((key) => ({ name: key, selector: { entity: { filter: POWER_FILTER } } })),
        { name: "battery_soc", selector: { entity: { filter: BATTERY_FILTER } } },
      ],
    },
    {
      name: "consumers",
      selector: {
        object: {
          multiple: true,
          label_field: "name",
          description_field: "entity",
          fields: {
            entity: { selector: { entity: { filter: POWER_FILTER } }, required: true },
            name: { selector: { text: {} } },
            color: { selector: { text: {} } },
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
  ];
}

/** ha-form works on a flat object; the card config is nested. */
interface FlatConfig {
  title?: string;
  solar?: string;
  grid?: string;
  house?: string;
  battery?: string;
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
}

/** Only entity references the form can express survive the round trip; split
 *  and derived forms stay untouched in the YAML (see setConfig). */
function toFlat(config: RawConfig): FlatConfig {
  const e = config.entities ?? {};
  const asEntity = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
  return {
    title: config.title,
    solar: asEntity(e.solar),
    grid: asEntity(e.grid),
    house: asEntity(e.house),
    battery: asEntity(e.battery),
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
  };
}

/** Undefined values are dropped so removing an option clears it from the YAML
 *  instead of leaving a null behind. */
function prune<T extends Record<string, unknown>>(obj: T): T | undefined {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== "") out[key] = value;
  }
  return Object.keys(out).length ? (out as T) : undefined;
}

function fromFlat(flat: FlatConfig, previous: RawConfig): RawConfig {
  // Only quantities the form could show are taken from it; the rest keep what
  // the YAML holds, so saving cannot flatten a split or derived entry.
  const editable = plainEntities(previous);
  const entities = {
    ...previous.entities,
    solar: editable.has("solar") ? flat.solar : previous.entities?.solar,
    grid: editable.has("grid") ? flat.grid : previous.entities?.grid,
    house: editable.has("house") ? flat.house : previous.entities?.house,
    battery: editable.has("battery") ? flat.battery : previous.entities?.battery,
    battery_soc: flat.battery_soc,
  };

  return {
    ...previous,
    type: previous.type,
    title: flat.title || undefined,
    entities: prune(entities as Record<string, unknown>) as RawConfig["entities"],
    consumers: (flat.consumers as RawConfig["consumers"]) ?? undefined,
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
    }),
  } as RawConfig;
}

class EnerLensCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: RawConfig;

  setConfig(config: RawConfig): void {
    this._config = config;
  }

  private _label = (item: { name: string }): string => localize(`editor.${item.name}`, this.hass);

  /** Helper text under a field. Empty for the self-explanatory ones - localize
   *  returns the key itself when there is no entry. */
  private _helper = (item: { name: string }): string => {
    const key = `editor_help.${item.name}`;
    const text = localize(key, this.hass);
    return text === key ? "" : text;
  };

  private _valueChanged(ev: CustomEvent<{ value: FlatConfig }>): void {
    if (!this._config) return;
    const config = fromFlat(ev.detail.value, this._config);
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    // Forms cannot express split or derived entities. Those fields are left out
    // entirely rather than offered and silently flattened on save (REQ E-1, G-5).
    const editable = plainEntities(this._config);
    const advanced = (["solar", "grid", "house", "battery"] as const).filter(
      (key) => !editable.has(key) && this._config?.entities?.[key] !== undefined,
    );

    return html`
      ${
        advanced.length
          ? html`<ha-alert alert-type="info">
              ${localize("editor.advanced_notice", this.hass, {
                fields: advanced.map((k) => localize(`editor.${k}`, this.hass)).join(", "),
              })}
            </ha-alert>`
          : nothing
      }
      <ha-form
        .hass=${this.hass}
        .data=${toFlat(this._config)}
        .schema=${schema(this.hass, editable)}
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
