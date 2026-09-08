/**
 * Draws the cross: connection lines as SVG, node contents as HTML on top
 * (REQ K-1 to K-6, ENT-20).
 */
import { type TemplateResult, html, svg } from "lit";
import { socColor } from "../colors";
import { formatPower, formatSoc } from "../format";
import { localize } from "../localize";
import type {
  ColorKey,
  Config,
  HomeAssistant,
  Model,
  NodeKey,
  Reading,
  Segment,
  Signed,
} from "../types";
import { DRAWN_CONNECTIONS, PATHS, VIEW_H, VIEW_W, nodePercent } from "./geometry";
import { renderRing } from "./ring";

/** Resolves var(--x) against the document so the gradient can mix real colours. */
function resolveCssColor(value: string): string {
  const match = /^var\((--[^,)]+)/.exec(value.trim());
  if (!match || typeof getComputedStyle === "undefined") return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || value;
}

/** Opens Home Assistant's own dialog with its history graph (REQ I-1, ENT-3). */
export function openMoreInfo(target: EventTarget, entityId: string): void {
  target.dispatchEvent(
    new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }),
  );
}

const DEFAULT_ICONS: Record<NodeKey, string> = {
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

/**
 * Splits "Netz · Einspeisung" onto two lines. A single long line reaches into
 * the neighbouring circle once the nodes sit close together.
 */
function label(base: string, derived: boolean, hass: HomeAssistant): TemplateResult {
  const [name, ...rest] = base.split(" · ");
  const state = rest.join(" · ");
  const suffix = derived ? localize("node.derived_suffix", hass) : "";
  return html`<span class="label-name">${name}</span>${
    state ? html`<span class="label-state">${state}</span>` : ""
  }${suffix ? html`<span class="label-state derived">${suffix}</span>` : ""}`;
}

export function buildNodeViews(model: Model, config: Config, hass: HomeAssistant): NodeView[] {
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
  views.push({
    key: "grid",
    icon: config.icons.grid ?? DEFAULT_ICONS.grid,
    color: signedColor(grid, "grid_import", "grid_export", config),
    // The state word follows the sign, but only once something actually flows:
    // 4 W of export rounds to 0.00 kW, and "export" next to that is noise (REQ K-3).
    label: !grid.available
      ? localize("node.grid", hass)
      : grid.net >= config.flow.minW
        ? localize("node.grid_import", hass)
        : grid.net <= -config.flow.minW
          ? localize("node.grid_export", hass)
          : localize("node.grid", hass),
    derived: grid.derived,
    value: grid.available
      ? formatPower(Math.abs(grid.net), hass, config.power)
      : localize("state.unavailable", hass),
    available: grid.available,
    // Whichever direction is running is the one worth opening (REQ I-1).
    entity: grid.derived
      ? undefined
      : grid.available && grid.net < 0
        ? (grid.entityNegative ?? grid.entityPositive)
        : (grid.entityPositive ?? grid.entityNegative),
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
    const socEntity = config.sources.batterySoc;
    const stateObj = socEntity ? hass.states[socEntity] : undefined;
    views.push({
      key: "battery",
      icon: batteryIcon(model.soc, config.icons.battery),
      color: signedColor(bat, "battery_discharge", "battery_charge", config),
      label: !bat.available
        ? localize("node.battery", hass)
        : bat.net >= config.flow.minW
          ? localize("node.battery_discharging", hass)
          : bat.net <= -config.flow.minW
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
      entity: bat.derived
        ? undefined
        : bat.available && bat.net < 0
          ? (bat.entityNegative ?? bat.entityPositive)
          : (bat.entityPositive ?? bat.entityNegative),
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
): TemplateResult {
  const views = buildNodeViews(model, config, hass);
  // No battery configured: its lines go with it, the rest of the cross stays put.
  const withBattery = model.battery
    ? DRAWN_CONNECTIONS
    : DRAWN_CONNECTIONS.filter((id) => !BATTERY_LINKS.has(id));
  // Connections without flow can be dropped entirely (REQ P-9). The nodes keep
  // their positions either way - the cross must not change shape with the data.
  const links =
    config.flow.inactiveLines === "hide"
      ? withBattery.filter((id) => activeConnections.has(id))
      : withBattery;

  return html`
    <div class="cross">
      <div class="plot">
        <svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" aria-hidden="true">
        ${links.map(
          (id) =>
            svg`<path
              class="link ${activeConnections.has(id) ? "active" : `inactive-${config.flow.inactiveLines}`}"
              style=${activeConnections.has(id) ? `stroke:${activeConnections.get(id)}` : ""}
              d=${PATHS[id]}
            ></path>`,
        )}
          <g class="dots"></g>
        </svg>
        ${views.map((v) => {
          const pos = nodePercent(v.key);
          const tap = (entity?: string) => (ev: Event) => {
            if (entity) openMoreInfo(ev.currentTarget as EventTarget, entity);
          };
          return html`
          <div
            class="node ${v.key} ${v.key === "house" && segments.length > 0 ? "has-ring" : ""}"
            style="left:${pos.left};top:${pos.top};border-color:${
              // With segments to show, the ring is the contour (REQ K-14).
              v.key === "house" && segments.length > 0 ? "transparent" : v.color
            }"
          >
            ${v.key === "house" ? renderRing(segments, segments.length > 0, nodePx) : ""}
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
            <ha-icon .icon=${v.icon} style="color:${v.color}"></ha-icon>
            <div class="value ${v.available ? "" : "unavailable"}">${v.value}</div>
            <div class="label">${label(v.label, v.derived, hass)}</div>
            ${
              v.socEntity
                ? html`
                    <button
                      class="hit upper"
                      aria-label=${`${v.label} ${v.socValue ?? ""}`}
                      @click=${tap(v.socEntity)}
                    ></button>
                    <button
                      class="hit lower"
                      aria-label=${`${v.label} ${v.value}`}
                      @click=${tap(v.entity)}
                      ?disabled=${!v.entity}
                    ></button>
                  `
                : v.entity
                  ? html`<button
                      class="hit"
                      style="top:-22px;bottom:-22px"
                      aria-label=${`${v.label} ${v.value}`}
                      @click=${tap(v.entity)}
                    ></button>`
                  : ""
            }
          </div>
          `;
        })}
      </div>
    </div>
  `;
}
