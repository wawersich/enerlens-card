/**
 * Draws the cross: connection lines as SVG, node contents as HTML on top
 * (REQ K-1 to K-6, ENT-20).
 */
import { type TemplateResult, html, nothing, svg } from "lit";
import { arrowColor, resolveCssColor, socColor } from "../colors";
import { formatExtra, formatPower, formatSoc } from "../format";
import { localize } from "../localize";
import type {
  ColorKey,
  Config,
  DirectionKey,
  EnergyMark,
  ExtraColorKey,
  ExtraField,
  ExtraWeight,
  HomeAssistant,
  LayoutName,
  Model,
  NodeKey,
  Reading,
  Segment,
  Signed,
} from "../types";
import { DRAWN_CONNECTIONS, NODE_R, geometryFor, holesPathOf, nodePercentOf } from "./geometry";
import { renderRing } from "./ring";

/**
 * Which way a signed quantity is running, as one answer for the label and the
 * tap target. Below flow.min_w neither: 4 W of export is not export, and the
 * card must not open the export history while the node says "grid" (REQ I-1,
 * K-3). Two separate rules for the same question drifted apart once already.
 */
function direction(value: Signed, minW: number): "positive" | "negative" | "none" {
  if (!value.available) return "none";
  if (value.net >= minW) return "positive";
  if (value.net <= -minW) return "negative";
  return "none";
}

/** The entity worth opening: the running direction, else the one that defines
 *  the sign - import for the grid, discharging for the battery (REQ I-1). */
function moreInfoEntity(value: Signed, minW: number): string | undefined {
  if (value.derived) return undefined;
  return direction(value, minW) === "negative"
    ? (value.entityNegative ?? value.entityPositive)
    : (value.entityPositive ?? value.entityNegative);
}

/** The nodes with a detail window (REQ DF-1). */
/** Which window a target opens (REQ DF-1, DF-14). */
export type DetailNode =
  | "grid"
  | "battery"
  | "house"
  | "solar"
  | "rest"
  | `consumer:${string}`
  | `source:${string}`;

/** What a tap on a node with a detail window asks the card for (REQ DF-1). */
export interface DetailRequest {
  node: DetailNode;
  /** The entity to open instead, where the window cannot (DF-2, DF-7). */
  entity?: string;
}

/** Asks the card for the detail window; the card decides how (REQ DF-2). */
export function openDetail(target: EventTarget, request: DetailRequest): void {
  target.dispatchEvent(
    new CustomEvent<DetailRequest>("enerlens-detail", {
      detail: request,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Opens Home Assistant's own dialog with its history graph (REQ I-1, ENT-3). */
export function openMoreInfo(target: EventTarget, entityId: string): void {
  target.dispatchEvent(
    new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }),
  );
}

export const DEFAULT_ICONS: Record<NodeKey, string> = {
  solar: "mdi:white-balance-sunny",
  grid: "mdi:transmission-tower",
  house: "mdi:home",
  battery: "mdi:battery",
};

/** Battery icon follows the state of charge unless one is configured. */
function batteryIcon(soc: Reading, configured?: string): string {
  if (configured) return configured;
  if (!soc.available) return "mdi:battery";
  const step = Math.round(soc.w / 10) * 10;
  if (step <= 0) return "mdi:battery-outline";
  if (step >= 100) return "mdi:battery";
  return `mdi:battery-${step}`;
}

interface NodeView {
  key: NodeKey;
  icon: string;
  color: string;
  label: string;
  derived: boolean;
  /** Primary value line; the battery adds a second one above the icon. */
  value: string;
  available: boolean;
  socValue?: string;
  /** 0..100 for the fill level; undefined when there is no state of charge. */
  socPercent?: number;
  socFillColor?: string;
  /** More-info targets. Absent means not clickable (REQ I-4). */
  entity?: string;
  /** Grid or battery with two sensors: the value's target opens the detail
   *  window instead; `entity` stays as its fallback (REQ DF-1, DF-7). */
  detail?: DetailNode;
  /** Grid node while the status entity reports an outage (REQ NS-4). */
  outage?: boolean;
  socEntity?: string;
  /** Energy mode, grid and battery: one figure above the icon, one below (EM-5). */
  /** Upper absent: a signed grid sensor shows only its balance (EM-3). */
  figures?: { upper?: Figure; lower: Figure };
  /** Energy mode, signed battery sensor: no figure at all, only the symbol (EM-3). */
  noFigure?: boolean;
  /** Energy mode: how sure the node's figure is (EM-11). */
  mark?: EnergyMark;
  /** Energy mode during an outage: the symbol crossed out in red, the
   *  period's figures kept - they are still right (EM-6). */
  crossed?: boolean;
  /** Power view: a PV source failed while delivering - the value is a
   *  partial sum, amber, and this names what is missing (PV-2). */
  partial?: string;
}

/** The note for a value built on a partial PV sum (PV-2), power view only. */
function partialNote(
  missing: string[] | undefined,
  config: Config,
  hass: HomeAssistant,
): string | undefined {
  if (!missing || config.energy) return undefined;
  return localize("node.partial", hass, { names: missing.join(", ") });
}

/** One energy figure with its direction arrow (REQ EM-5). */
interface Figure {
  arrow: string;
  color: string;
  text: string;
  entity?: string;
  mark?: EnergyMark;
}

/** The class and tooltip a figure's warning tier gives it (EM-11). */
function markClass(mark?: EnergyMark): string {
  return mark && mark.tier > 0 ? `warn${mark.tier}` : "";
}

/** Colour of a two-way quantity from the sign of its net value (REQ 4.2). */
function signedColor(
  s: Signed | null,
  positive: ColorKey,
  negative: ColorKey,
  config: Config,
): string {
  // Neutral below flow.min_w, in step with the state word and the dots.
  if (!s || !s.available || Math.abs(s.net) < config.flow.minW) return "var(--el-line)";
  return config.colors[s.net > 0 ? positive : negative];
}

function readingValue(r: Reading, hass: HomeAssistant, config: Config): string {
  return r.available ? formatPower(r.w, hass, config.power) : localize("state.unavailable", hass);
}

const WEIGHTS: Record<ExtraWeight, number> = { normal: 400, medium: 500, bold: 700 };

/** Colour, size and weight of one extra field, relative to the text beside it (REQ Z-6). */
function extraStyle(field: ExtraField, color: string, base: string): string {
  return `color:${color};font-size:calc(var(${base}) * ${field.size / 100});font-weight:${WEIGHTS[field.weight]}`;
}

/** An extra value inside the circle: number and unit, nothing else (REQ Z-2). */
function insideField(v: NodeView, config: Config, hass: HomeAssistant): TemplateResult {
  const field = config.nodes[v.key].inside;
  if (!field) return html``;
  const color = config.extraColors[`${v.key}_inside` as ExtraColorKey];
  // Its own class, never "value": the outage colours the node value red, and the
  // measuring tools read .value as the node figure.
  return html`<div class="extra-inside extra" style=${extraStyle(field, color, "--el-value-size")}>${formatExtra(
    hass.states[field.entity],
    hass,
    field.decimals,
  )}</div>`;
}

/** One line of label text: 12 px at line height 1.25 (REQ K-12). */
const LABEL_LINE = 15;
/**
 * A label field is a tap target, at least 24 px high (REQ Z-7, I-3). Even at
 * the largest size, 150 % of 12 px at line height 1.25 is 22.5 px - so the
 * target, not the type, sets the field's height.
 */
const FIELD_HEIGHT = 24;
/** Room above and below the cross for one and two label lines, as it always was. */
const PAD_TOP = 26;
const PAD_BOTTOM = 28;

/** Height of a label block as configured - lines that may show, not what shows now. */
function blockHeight(config: Config, key: NodeKey, stateWord: boolean): number {
  const options = config.nodes[key];
  const field = options.label;
  const text =
    (options.showName ? LABEL_LINE : 0) +
    (stateWord && options.showState ? LABEL_LINE : 0) +
    (config.sources[key].kind === "derived" ? LABEL_LINE : 0);
  if (!field) return text;
  // A field with no text beyond it is the outermost line - a target next to the
  // mode chips above PV and the list rows below the battery, which needs its
  // 8 px of air to them, where plain text needed none (I-3).
  return text + FIELD_HEIGHT + (text === 0 ? 8 : 0);
}

/**
 * Room for the label blocks above PV and below the battery, from the
 * configuration rather than from measuring: a state word comes and goes at
 * flow.min_w, and measured room would make the cross jump with it (REQ Z-8).
 * One line above and two below are what the room always held.
 *
 * The list beside the cross centres on the cross's box, the house sits at the
 * centre of the plot: room that grows more on one side moves the house by half
 * the difference, and the list's margins move it along (L-1). Measured against
 * the room as it always was, so a card without extra values stays as it was -
 * except a calculated PV or battery, whose "calculated" line now has room too.
 * As custom properties for .body, where both the cross and the list read them.
 */
export function labelRoom(config: Config, withBattery: boolean): string {
  // Every label in the upper row above, in the lower row below (AN-5); the
  // cross has PV above and the battery below, as it always had.
  const g = geometryFor(config.layout, config.flow.lines, withBattery);
  const keys = (Object.keys(g.nodePos) as NodeKey[]).filter((k) => k !== "battery" || withBattery);
  const word = (k: NodeKey) => k === "grid" || k === "battery";
  const middle = g.viewH / 2;
  const tops = keys.filter((k) => g.labelAbove[k] && g.nodePos[k].y < middle);
  const bottoms = keys.filter((k) => !g.labelAbove[k] && g.nodePos[k].y > middle + 1);
  const top = Math.max(
    8,
    ...tops.map((k) => PAD_TOP + blockHeight(config, k, word(k)) - LABEL_LINE),
  );
  const bottom =
    bottoms.length > 0
      ? Math.max(
          8,
          ...bottoms.map((k) => PAD_BOTTOM + blockHeight(config, k, word(k)) - 2 * LABEL_LINE),
        )
      : PAD_BOTTOM;
  const shift = top - PAD_TOP - (bottom - PAD_BOTTOM);
  return `--el-pad-top:${top}px;--el-pad-bottom:${bottom}px;--el-list-mt:${Math.max(0, shift)}px;--el-list-mb:${Math.max(0, -shift)}px`;
}

/**
 * The node's tap targets. A field above the icon splits the node like the
 * battery: upper half the field's entity, lower half the node's (REQ Z-7, I-2).
 * A label field next to the circle is a target of its own, so the node's
 * target stops 8 px short of it: 2 px past the node's box, where the field's box
 * starts 10 px past it - measured from the visible rim, 0 and 8 px (I-3).
 */
function renderHits(
  v: NodeView,
  config: Config,
  hass: HomeAssistant,
  tap: (entity?: string, detail?: DetailNode) => (ev: Event) => void,
  /** The label stands above the node (AN-5). */
  labelAbove = v.key === "solar",
): TemplateResult | string {
  const options = config.nodes[v.key];
  const near = options.label ? "-2px" : "-22px";
  const top = labelAbove ? near : "-22px";
  const bottom = labelAbove ? "-22px" : near;
  // In a period the extra fields are hidden, and with them their targets (EM-6).
  const above = options.inside?.position === "above" && !config.energy ? options.inside : undefined;
  const upper = v.figures?.upper?.entity
    ? { entity: v.figures.upper.entity, text: v.figures.upper.text }
    : // With two sensors the window shows the charge too: one target (I-2, DF-1).
      v.socEntity && v.detail !== "battery"
      ? { entity: v.socEntity, text: v.socValue ?? "" }
      : above
        ? {
            entity: above.entity,
            text: formatExtra(hass.states[above.entity], hass, above.decimals),
          }
        : undefined;
  if (upper) {
    // A half that stops short of a label field keeps its 44 px by growing
    // towards the middle, not past the field: the minimum height would
    // otherwise push it back over the gap (I-3).
    const half = "height:max(44px, calc(50% + 2px))";
    return html`
      <button
        class="hit upper"
        style=${
          // Later in the document, the lower half would take back the overlap.
          above && options.label ? `top:${top};bottom:auto;${half};z-index:3` : `top:${top}`
        }
        aria-label=${`${v.label} ${upper.text}`}
        @click=${
          // A period's upper figure is one of the pair: the window too (DF-1, EM-13).
          tap(upper.entity, v.figures?.upper ? v.detail : undefined)
        }
      ></button>
      <button
        class="hit lower"
        style=${!labelAbove && options.label ? `top:auto;bottom:${bottom};${half}` : `bottom:${bottom}`}
        aria-label=${v.value ? `${v.label} ${v.value}` : v.label}
        @click=${tap(v.entity, v.detail)}
        ?disabled=${!v.entity && !v.detail}
      ></button>
    `;
  }
  // A window with no single entity behind it is a target too (DF-13).
  if (!v.entity && !v.detail) return "";
  // One target for the whole battery names its charge as well (I-2, I-5).
  const charge = v.socValue ? `, ${v.socValue}` : "";
  return html`<button
    class="hit"
    style="top:${top};bottom:${bottom}"
    aria-label=${v.value ? `${v.label} ${v.value}${charge}` : `${v.label}${charge}`}
    @click=${tap(v.entity, v.detail)}
  ></button>`;
}

/**
 * The label block: the extra field next to the circle, then name, state word
 * and "calculated" further out - above the circle for solar, so the field
 * comes last, below it for the others, so it comes first (REQ Z-3, Z-4). "Netz · Einspeisung" is split onto two lines: a
 * single long line reaches into the neighbouring circle once the nodes sit
 * close together. An empty block is not drawn at all.
 */
function renderLabel(
  v: NodeView,
  config: Config,
  hass: HomeAssistant,
  tap: (entity?: string, detail?: DetailNode) => (ev: Event) => void,
  /** The label stands above the node (AN-5). */
  above = v.key === "solar",
): TemplateResult | string {
  const options = config.nodes[v.key];
  const [name, ...rest] = v.label.split(" · ");
  const state = options.showState ? rest.join(" · ") : "";
  // The outage is the message of the grid node; its name stays with it (NS-4).
  const showName = options.showName || v.outage === true;
  const suffix = v.derived
    ? localize(showName ? "node.derived_suffix" : "node.derived_alone", hass)
    : "";
  const field = options.label;
  // A live value next to a period's energy would mislead. The field keeps its
  // room, so switching never moves a node or a label (EM-6).
  const hidden = config.energy !== undefined;
  let extra: TemplateResult | string = "";
  if (field) {
    const prefix = field.prefix ?? "";
    const text = formatExtra(hass.states[field.entity], hass, field.decimals);
    const color = config.extraColors[`${v.key}_label` as ExtraColorKey];
    const full = prefix ? `${prefix} ${text}` : text;
    // A target of its own: the field shows another entity than the node (REQ Z-7).
    extra = html`<button
      class="extra-label extra"
      style=${extraStyle(field, color, "--el-label-size") + (hidden ? ";visibility:hidden" : "")}
      tabindex=${hidden ? "-1" : "0"}
      aria-hidden=${hidden ? "true" : "false"}
      title=${full}
      aria-label=${full}
      @click=${tap(field.entity)}
    >${prefix ? html`<span class="extra-prefix">${prefix}</span> ` : ""}<span class="extra-value"
        >${text}</span
      ></button>`;
  }
  if (!showName && !state && !suffix && !field) return "";
  const lines = html`${showName ? html`<span class="label-name">${name}</span>` : ""}${
    state ? html`<span class="label-state">${state}</span>` : ""
  }${suffix ? html`<span class="label-state derived">${suffix}</span>` : ""}`;
  return html`<div class="label">${above ? html`${lines}${extra}` : html`${extra}${lines}`}</div>`;
}

export function buildNodeViews(
  model: Model,
  config: Config,
  hass: HomeAssistant,
  /** Latched grid outage; undefined or false renders the grid node as always. */
  outage = false,
): NodeView[] {
  const views: NodeView[] = [];

  views.push({
    key: "solar",
    icon: config.icons.solar ?? DEFAULT_ICONS.solar,
    color: model.solar.available && model.solar.w > 0 ? config.colors.solar : "var(--el-line)",
    label: localize("node.solar", hass),
    derived: model.solar.derived,
    value: readingValue(model.solar, hass, config),
    available: model.solar.available,
    // Several sources: no one entity behind the sum, the window instead; a
    // list of one is that source (PV-10, DF-13).
    entity: model.solar.derived
      ? undefined
      : (model.solar.entity ??
        (config.solarSources.length === 1 ? config.solarSources[0].entity : undefined)),
    // Every node with something measured behind it opens the window (DF-20).
    detail: model.solar.derived ? undefined : "solar",
    partial: partialNote(model.solar.missing, config, hass),
  });

  const grid = model.grid;
  const gridDirection = direction(grid, config.flow.minW);
  const gridOutage = outage && config.gridStatus !== undefined;
  views.push({
    key: "grid",
    icon: config.icons.grid ?? DEFAULT_ICONS.grid,
    color: gridOutage ? "var(--el-error)" : signedColor(grid, "grid_import", "grid_export", config),
    // The state word follows the sign, but only once something actually flows:
    // 4 W of export rounds to 0.00 kW, and "export" next to that is noise (REQ K-3).
    // No state word during an outage: "export" next to a severed grid is noise.
    label:
      gridOutage || gridDirection === "none"
        ? localize("node.grid", hass)
        : gridDirection === "positive"
          ? localize("node.grid_import", hass)
          : localize("node.grid_export", hass),
    derived: grid.derived,
    // The word instead of a figure: 0 W and "cut off" look the same otherwise,
    // which is the reason this feature exists at all (REQ NS-4).
    value: gridOutage
      ? localize("node.no_grid", hass)
      : grid.available
        ? formatPower(Math.abs(grid.net), hass, config.power)
        : localize("state.unavailable", hass),
    available: gridOutage || grid.available,
    outage: gridOutage,
    partial: partialNote(grid.missing, config, hass),
    // While the grid is gone, the node shows the status - so a tap opens the
    // status history, which is the one that says since when.
    entity: gridOutage ? config.gridStatus?.entity : moreInfoEntity(grid, config.flow.minW),
    // Both directions at once - not while the status is what matters (DF-1, NS-4).
    detail: !gridOutage && !grid.derived ? "grid" : undefined,
  });

  views.push({
    key: "house",
    icon: config.icons.house ?? DEFAULT_ICONS.house,
    color: config.colors.house,
    label: localize("node.house", hass),
    // Corrected by sources outside the measured value: no "calculated" - only
    // the value matters (PV-3, Markus 27.10.2026); derived it is said (A-3).
    derived: model.house.derived,
    value: readingValue(model.house, hass, config),
    available: model.house.available,
    entity: model.house.derived ? undefined : model.house.entity,
    partial: partialNote(model.house.missing, config, hass),
    // Corrected, the node shows more than the sensor's history: the window
    // shows the node's figure instead (DF-14, issue #30).
    detail: model.house.derived ? undefined : "house",
  });

  const bat = model.battery;
  if (bat) {
    const batDirection = direction(bat, config.flow.minW);
    const socEntity = config.sources.batterySoc;
    const stateObj = socEntity ? hass.states[socEntity] : undefined;
    views.push({
      key: "battery",
      icon: batteryIcon(model.soc, config.icons.battery),
      color: signedColor(bat, "battery_discharge", "battery_charge", config),
      label:
        batDirection === "positive"
          ? localize("node.battery_discharging", hass)
          : batDirection === "negative"
            ? localize("node.battery_charging", hass)
            : localize("node.battery", hass),
      derived: bat.derived,
      value: bat.available
        ? formatPower(Math.abs(bat.net), hass, config.power)
        : localize("state.unavailable", hass),
      available: bat.available,
      // Percent above the icon, power below - two separate tap targets (REQ K-4, ENT-5).
      socValue: model.soc.available ? formatSoc(stateObj, hass) : undefined,
      socPercent: model.soc.available ? Math.max(0, Math.min(100, model.soc.w)) : undefined,
      socFillColor: model.soc.available
        ? socColor(model.soc.w, config.colors.socStops, resolveCssColor)
        : undefined,
      entity: moreInfoEntity(bat, config.flow.minW),
      // One target, the charge in the window, with one sensor or two (I-2, DF-20).
      detail: bat.derived ? undefined : "battery",
      socEntity,
      partial: partialNote(bat.missing, config, hass),
    });
  }

  if (config.energy) energyViews(views, model, config, hass);
  return views;
}

/**
 * A period: grid and battery show both directions, each with its arrow, and
 * no state word - over a day, the grid did both (EM-5). The state of charge is
 * a now, not a period: no figure, no fill, no level in the symbol.
 */
function energyViews(views: NodeView[], model: Model, config: Config, hass: HomeAssistant): void {
  const marks = config.energy?.roles ?? {};
  const arrows = arrowsFor(config.layout);
  const unavailable = localize("state.unavailable", hass);
  const fig = (
    arrow: string,
    color: DirectionKey,
    w: number | null,
    role: string,
    entity?: string,
  ): Figure => ({
    arrow,
    color: arrowColor(config, color),
    text: w === null ? unavailable : formatPower(w, hass, config.power),
    entity,
    mark: marks[role],
  });
  /** The node takes the colour of the larger direction, once anything flowed. */
  const tone = (a: number, b: number, colorA: ColorKey, colorB: ColorKey): string =>
    Math.max(a, b) < config.flow.minW ? "var(--el-line)" : config.colors[a >= b ? colorA : colorB];
  for (const v of views) {
    if (v.key === "solar") v.mark = marks.solar;
    if (v.key === "house") v.mark = marks.house;
    if (v.key === "grid") {
      const g = model.grid;
      const imp = g.available ? g.positive : null;
      const exp = g.available ? g.negative : null;
      v.label = localize("node.grid", hass);
      v.crossed = v.outage;
      v.outage = false;
      v.icon = config.icons.grid ?? DEFAULT_ICONS.grid;
      v.color = tone(imp ?? 0, exp ?? 0, "grid_import", "grid_export");
      if (config.sources.grid.kind === "single") {
        // One signed sensor: only its balance is exact - one figure, its
        // arrow the net direction (EM-3). The halves only drive the dots.
        const net = g.available ? g.net : null;
        const out = (net ?? 0) < 0;
        const balance = fig(
          out ? arrows.export : arrows.import,
          out ? "grid_export" : "grid_import",
          net === null ? null : Math.abs(net),
          out ? "export" : "import",
          g.entityPositive ?? g.entityNegative,
        );
        balance.mark = worse(marks.import, marks.export);
        // A period's figures stay right during an outage: the window too (DF-20, EM-6).
        v.detail = "grid";
        v.figures = { lower: balance };
        v.entity = balance.entity;
        v.value = balance.text;
        continue;
      }
      // The period's figures stay right during an outage: the window too (DF-1, EM-6).
      v.detail = "grid";
      v.figures = {
        upper: fig(arrows.import, "grid_import", imp, "import", g.entityPositive),
        lower: fig(arrows.export, "grid_export", exp, "export", g.entityNegative),
      };
      v.entity = g.entityNegative;
      v.value = v.figures.lower.text;
    }
    if (v.key === "battery" && model.battery) {
      const b = model.battery;
      const out = b.available ? b.positive : null;
      const into = b.available ? b.negative : null;
      v.label = localize("node.battery", hass);
      v.color = tone(out ?? 0, into ?? 0, "battery_discharge", "battery_charge");
      v.socValue = undefined;
      v.socPercent = undefined;
      v.socEntity = undefined;
      v.icon = config.icons.battery ?? "mdi:battery";
      if (config.sources.battery.kind === "single") {
        // One signed sensor: neither direction is exact, and a balance of a
        // store says little - the node shows no figure (EM-3, Markus).
        v.noFigure = true;
        // Not even for the screen reader: the figure is not shown (EM-3).
        v.value = "";
        v.entity = b.entityPositive ?? b.entityNegative;
        continue;
      }
      v.detail = "battery";
      v.figures = {
        upper: fig(arrows.discharge, "battery_discharge", out, "discharge", b.entityPositive),
        lower: fig(arrows.charge, "battery_charge", into, "charge", b.entityNegative),
      };
      v.entity = b.entityNegative;
      v.value = v.figures.lower.text;
    }
  }
}

/** The drawn arrow per direction: a long shaft and a short head (Markus,
 *  20.10.2026: "etwas länger"). Horizontal ones lie in a wide box, vertical
 *  ones in a tall one, so neither takes room it does not show. */
export const ARROWS: Record<string, { box: string; d: string; shape: "wide" | "tall" | "square" }> =
  {
    "→": { box: "0 0 18 12", d: "M1.5 6 H16 M12 2.2 L16 6 L12 9.8", shape: "wide" },
    "←": { box: "0 0 18 12", d: "M16.5 6 H2 M6 2.2 L2 6 L6 9.8", shape: "wide" },
    "↓": { box: "0 0 12 18", d: "M6 1.5 V16 M2.2 12 L6 16 L9.8 12", shape: "tall" },
    "↑": { box: "0 0 12 18", d: "M6 16.5 V2 M2.2 6 L6 2 L9.8 6", shape: "tall" },
    // The diagonals of the squares (AN-4): corner to corner, the head as a
    // corner of its own - the same stroke as the straight ones.
    "↘": { box: "0 0 16 16", d: "M2 2 L14 14 M14 7.5 V14 H7.5", shape: "square" },
    "↖": { box: "0 0 16 16", d: "M14 14 L2 2 M2 8.5 V2 H8.5", shape: "square" },
    "↗": { box: "0 0 16 16", d: "M2 14 L14 2 M7.5 2 H14 V8.5", shape: "square" },
    "↙": { box: "0 0 16 16", d: "M14 2 L2 14 M2 7.5 V14 H8.5", shape: "square" },
  };

/**
 * Which way the arrows point in an arrangement (AN-4): import and discharge
 * from the node to the middle of the drawing, export and charge away from it.
 */
export function arrowsFor(layout: LayoutName): {
  import: string;
  export: string;
  discharge: string;
  charge: string;
} {
  switch (layout) {
    case "square_right":
      return { import: "↘", export: "↖", discharge: "↗", charge: "↙" };
    case "square_left":
      return { import: "↗", export: "↙", discharge: "↖", charge: "↘" };
    default:
      return { import: "→", export: "←", discharge: "↑", charge: "↓" };
  }
}

/**
 * The arrow is drawn, not typed: the font's arrows are hairlines next to the
 * figures, bold or not (Markus, 20.10.2026: "sehr dünn").
 */
/** The higher warning of two marks (EM-11). */
function worse(a?: EnergyMark, b?: EnergyMark): EnergyMark | undefined {
  if (!a) return b;
  if (!b) return a;
  return b.tier > a.tier ? b : a;
}

function renderFigure(f: Figure): TemplateResult {
  const arrow = ARROWS[f.arrow] ?? ARROWS["→"];
  return html`<div class="value figure ${markClass(f.mark)}" title=${f.mark?.note ?? ""}>
    <svg
      class="arrow ${arrow.shape === "tall" ? "vertical" : arrow.shape === "square" ? "diagonal" : ""}"
      data-arrow=${f.arrow}
      viewBox=${arrow.box}
      aria-hidden="true"
      style="color:${f.color}"
    >
      ${svg`<path d=${arrow.d}></path>`}
    </svg>
    ${f.text}
  </div>`;
}

/** An inside field: in a period it keeps its room unseen (EM-6); grid and
 *  battery figures take its place. */
function insideAt(v: NodeView, config: Config, hass: HomeAssistant, where: "above" | "below") {
  if (config.nodes[v.key].inside?.position !== where || v.figures) return "";
  return insideField(v, config, hass);
}

/** Connections that only exist when a battery node is present (REQ K-10). */
const BATTERY_LINKS = new Set(["solar_battery", "grid_battery", "battery_house", "battery_grid"]);

export function renderCross(
  model: Model,
  config: Config,
  hass: HomeAssistant,
  /** Active connection -> CSS colour of the flow running on it (REQ P-5). */
  activeConnections: ReadonlyMap<string, string>,
  /** Ring segments; empty when the ring is off or there is nothing to show. */
  segments: Segment[] = [],
  /** Drawn node diameter in CSS px - the ring's stroke is sized against it. */
  nodePx = 123,
  /** Latched grid outage (REQ NS-4). */
  outage = false,
  /** Whether the card moves at all (P-7); the ring blends colours only then. */
  moving = false,
  /** Inside of a circle in user units, as measured (K-16); the lines end at NODE_R. */
  holeR = NODE_R,
  /** Whether the nodes let the lines show through, and they are cut out (K-16). */
  cut = false,
  /** The PV ring (PV-4, PV-5); undefined when there is none. */
  solarRing?: { segments: Segment[]; layout: "share" | "peak" },
): TemplateResult {
  const views = buildNodeViews(model, config, hass, outage);
  // The arrangement (AN-1): where the nodes stand, the lines, the labels.
  const g = geometryFor(config.layout, config.flow.lines, model.battery !== null);
  // No battery configured: its lines go with it, the rest of the cross stays put.
  const withBattery = model.battery
    ? DRAWN_CONNECTIONS
    : DRAWN_CONNECTIONS.filter((id) => !BATTERY_LINKS.has(id));
  // Connections without flow can be dropped entirely (REQ P-9). The nodes keep
  // their positions either way - the cross must not change shape with the data.
  const drawn =
    config.flow.inactiveLines === "hide"
      ? withBattery.filter((id) => activeConnections.has(id))
      : withBattery;
  /*
   * Lines that carry something are drawn last, so they lie on top.
   *
   * Two connections meet the battery from above and run the last stretch on
   * the same line; without this the grey of an idle one tinted the colour of a
   * working one wherever they overlapped, simply because it came later in the
   * fixed order. The order within each group stays as it is - the cross must
   * always be built the same way round. Sort is stable, which is what makes
   * that true.
   */
  const links = [...drawn].sort(
    (a, b) => Number(activeConnections.has(a)) - Number(activeConnections.has(b)),
  );

  return html`
    <div class="cross ${model.battery === null ? "no-battery" : ""}">
      <div class="plot">
        <svg viewBox="0 0 ${g.viewW} ${g.viewH}" aria-hidden="true">
          ${
            cut
              ? svg`<defs>
            <clipPath id="el-holes" clipPathUnits="userSpaceOnUse">
              <path class="holes" clip-rule="evenodd" d=${holesPathOf(g, holeR)}></path>
            </clipPath>
          </defs>`
              : nothing
          }
          <g clip-path=${cut ? "url(#el-holes)" : nothing}>
          ${links.map(
            (id) =>
              svg`<path
                class="link ${activeConnections.has(id) ? "active" : `inactive-${config.flow.inactiveLines}`}"
                style=${activeConnections.has(id) ? `stroke:${activeConnections.get(id)}` : ""}
                d=${g.paths[id]}
              ></path>`,
          )}
            <g class="dots"></g>
          </g>
        </svg>
        ${views.map((v) => {
          const pos = nodePercentOf(g, v.key);
          const above = g.labelAbove[v.key];
          const tap = (entity?: string, detail?: DetailNode) => (ev: Event) => {
            if (detail) openDetail(ev.currentTarget as EventTarget, { node: detail, entity });
            else if (entity) openMoreInfo(ev.currentTarget as EventTarget, entity);
          };
          const ring =
            v.key === "house" ? segments : v.key === "solar" ? (solarRing?.segments ?? []) : [];
          const ringShown = ring.some((s) => s.share > 0);
          return html`
          <div
            class="node ${v.key} ${ringShown ? "has-ring" : ""} ${above ? "label-above" : ""} ${
              // Triangle: the middle node's label sits on the lines below it (AN-5).
              g.ground === v.key ? "label-ground" : ""
            } ${v.outage ? "outage" : ""} ${config.energy ? "in-period" : ""}"
            style="left:${pos.left};top:${pos.top};border-color:${
              // With segments to show, the ring is the contour (REQ K-14).
              ringShown ? "transparent" : v.color
            }"
          >
            ${v.key === "house" ? renderRing(segments, segments.length > 0, nodePx, config.ring.animation, moving) : ""}
            ${
              v.key === "solar" && solarRing
                ? renderRing(
                    solarRing.segments,
                    true,
                    nodePx,
                    config.ring.animation,
                    moving,
                    solarRing.layout,
                  )
                : ""
            }
            ${
              v.socPercent !== undefined
                ? html`<div class="fill-clip">
                    <div
                      class="fill"
                      style="height:${v.socPercent}%;background:${v.socFillColor}"
                    ></div>
                  </div>`
                : ""
            }
            ${v.socValue ? html`<div class="value">${v.socValue}</div>` : ""}
            ${v.figures?.upper ? renderFigure(v.figures.upper) : ""}
            ${insideAt(v, config, hass, "above")}
            ${
              v.outage || v.crossed
                ? // A big X over the symbol, not a slash through it: the slash
                  // disappeared into the glyph and read as part of it. Its arms
                  // stop above the text line, whatever the node size (REQ NS-4).
                  html`<div class="icon-cross">
                    <ha-icon
                      .icon=${v.icon}
                      style="color:${v.crossed ? "var(--el-error)" : v.color}"
                    ></ha-icon>
                    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
                      <path d="M3,3 L21,21"></path>
                      <path d="M21,3 L3,21"></path>
                    </svg>
                  </div>`
                : html`<ha-icon .icon=${v.icon} style="color:${v.color}"></ha-icon>`
            }
            ${
              v.noFigure
                ? ""
                : v.figures
                  ? renderFigure(v.figures.lower)
                  : html`<div
                    class="value ${v.available ? "" : "unavailable"} ${markClass(v.mark)} ${
                      // Amber means "incomplete" on the whole card (PV-2, EM-11).
                      v.partial ? "warn2" : ""
                    }"
                    title=${v.partial ?? v.mark?.note ?? ""}
                  >${v.value}</div>`
            }
            ${insideAt(v, config, hass, "below")}
            ${above ? renderLabel(v, config, hass, tap, above) : ""}
            ${renderHits(v, config, hass, tap, above)}
            ${
              // After the node's targets below the circle, so Tab runs top to bottom (I-5).
              above ? "" : renderLabel(v, config, hass, tap, above)
            }
          </div>
          `;
        })}
      </div>
    </div>
  `;
}
