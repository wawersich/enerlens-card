/**
 * Draws the cross: connection lines as SVG, node contents as HTML on top
 * (REQ K-1 to K-6, ENT-20).
 */
import { type TemplateResult, html, nothing, svg } from "lit";
import { resolveCssColor, socColor } from "../colors";
import { formatExtra, formatPower, formatSoc } from "../format";
import { localize } from "../localize";
import type {
  ColorKey,
  Config,
  ExtraColorKey,
  ExtraField,
  ExtraWeight,
  HomeAssistant,
  Model,
  NodeKey,
  Reading,
  Segment,
  Signed,
} from "../types";
import {
  DRAWN_CONNECTIONS,
  NODE_R,
  PATHS,
  VIEW_H,
  VIEW_W,
  holesPath,
  nodePercent,
} from "./geometry";
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
  /** Grid node while the status entity reports an outage (REQ NS-4). */
  outage?: boolean;
  socEntity?: string;
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
  const top = Math.max(8, PAD_TOP + blockHeight(config, "solar", false) - LABEL_LINE);
  const bottom = withBattery
    ? Math.max(8, PAD_BOTTOM + blockHeight(config, "battery", true) - 2 * LABEL_LINE)
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
  tap: (entity?: string) => (ev: Event) => void,
): TemplateResult | string {
  const options = config.nodes[v.key];
  const near = options.label ? "-2px" : "-22px";
  const top = v.key === "solar" ? near : "-22px";
  const bottom = v.key === "solar" ? "-22px" : near;
  const above = options.inside?.position === "above" ? options.inside : undefined;
  const upper = v.socEntity
    ? { entity: v.socEntity, text: v.socValue ?? "" }
    : above
      ? { entity: above.entity, text: formatExtra(hass.states[above.entity], hass, above.decimals) }
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
          v.key === "solar" && options.label
            ? `top:${top};bottom:auto;${half};z-index:3`
            : `top:${top}`
        }
        aria-label=${`${v.label} ${upper.text}`}
        @click=${tap(upper.entity)}
      ></button>
      <button
        class="hit lower"
        style=${v.key !== "solar" && options.label ? `top:auto;bottom:${bottom};${half}` : `bottom:${bottom}`}
        aria-label=${`${v.label} ${v.value}`}
        @click=${tap(v.entity)}
        ?disabled=${!v.entity}
      ></button>
    `;
  }
  if (!v.entity) return "";
  return html`<button
    class="hit"
    style="top:${top};bottom:${bottom}"
    aria-label=${`${v.label} ${v.value}`}
    @click=${tap(v.entity)}
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
  tap: (entity?: string) => (ev: Event) => void,
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
  let extra: TemplateResult | string = "";
  if (field) {
    const prefix = field.prefix ?? "";
    const text = formatExtra(hass.states[field.entity], hass, field.decimals);
    const color = config.extraColors[`${v.key}_label` as ExtraColorKey];
    const full = prefix ? `${prefix} ${text}` : text;
    // A target of its own: the field shows another entity than the node (REQ Z-7).
    extra = html`<button
      class="extra-label extra"
      style=${extraStyle(field, color, "--el-label-size")}
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
  return html`<div class="label">${v.key === "solar" ? html`${lines}${extra}` : html`${extra}${lines}`}</div>`;
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
    entity: model.solar.derived ? undefined : model.solar.entity,
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
    // While the grid is gone, the node shows the status - so a tap opens the
    // status history, which is the one that says since when.
    entity: gridOutage ? config.gridStatus?.entity : moreInfoEntity(grid, config.flow.minW),
  });

  views.push({
    key: "house",
    icon: config.icons.house ?? DEFAULT_ICONS.house,
    color: config.colors.house,
    label: localize("node.house", hass),
    derived: model.house.derived,
    value: readingValue(model.house, hass, config),
    available: model.house.available,
    entity: model.house.derived ? undefined : model.house.entity,
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
      socEntity,
    });
  }

  return views;
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
): TemplateResult {
  const views = buildNodeViews(model, config, hass, outage);
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
        <svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" aria-hidden="true">
          ${
            cut
              ? svg`<defs>
            <clipPath id="el-holes" clipPathUnits="userSpaceOnUse">
              <path class="holes" clip-rule="evenodd" d=${holesPath(holeR)}></path>
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
                d=${PATHS[id]}
              ></path>`,
          )}
            <g class="dots"></g>
          </g>
        </svg>
        ${views.map((v) => {
          const pos = nodePercent(v.key);
          const tap = (entity?: string) => (ev: Event) => {
            if (entity) openMoreInfo(ev.currentTarget as EventTarget, entity);
          };
          return html`
          <div
            class="node ${v.key} ${v.key === "house" && segments.length > 0 ? "has-ring" : ""} ${
              v.outage ? "outage" : ""
            }"
            style="left:${pos.left};top:${pos.top};border-color:${
              // With segments to show, the ring is the contour (REQ K-14).
              v.key === "house" && segments.length > 0 ? "transparent" : v.color
            }"
          >
            ${v.key === "house" ? renderRing(segments, segments.length > 0, nodePx, config.ring.animation, moving) : ""}
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
            ${config.nodes[v.key].inside?.position === "above" ? insideField(v, config, hass) : ""}
            ${
              v.outage
                ? // A big X over the symbol, not a slash through it: the slash
                  // disappeared into the glyph and read as part of it. Its arms
                  // stop above the text line, whatever the node size (REQ NS-4).
                  html`<div class="icon-cross">
                    <ha-icon .icon=${v.icon} style="color:${v.color}"></ha-icon>
                    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
                      <path d="M3,3 L21,21"></path>
                      <path d="M21,3 L3,21"></path>
                    </svg>
                  </div>`
                : html`<ha-icon .icon=${v.icon} style="color:${v.color}"></ha-icon>`
            }
            <div class="value ${v.available ? "" : "unavailable"}">${v.value}</div>
            ${config.nodes[v.key].inside?.position === "below" ? insideField(v, config, hass) : ""}
            ${v.key === "solar" ? renderLabel(v, config, hass, tap) : ""}
            ${renderHits(v, config, hass, tap)}
            ${
              // After the node's targets below the circle, so Tab runs top to bottom (I-5).
              v.key === "solar" ? "" : renderLabel(v, config, hass, tap)
            }
          </div>
          `;
        })}
      </div>
    </div>
  `;
}
