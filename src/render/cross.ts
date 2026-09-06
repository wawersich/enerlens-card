/**
 * Draws the cross: connection lines as SVG, node contents as HTML on top
 * (REQ K-1 to K-6, ENT-20).
 */
import { type TemplateResult, html, svg } from "lit";
import { formatKW, formatSoc } from "../format";
import { localize } from "../localize";
import type { ColorKey, Config, HomeAssistant, Model, NodeKey, Reading, Signed } from "../types";
import { DRAWN_CONNECTIONS, PATHS, VIEW_H, VIEW_W, nodePercent } from "./geometry";

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
}

/** Colour of a two-way quantity from the sign of its net value (REQ 4.2). */
function signedColor(
  s: Signed | null,
  positive: ColorKey,
  negative: ColorKey,
  config: Config,
): string {
  if (!s || !s.available || s.net === 0) return "var(--el-line)";
  return config.colors[s.net > 0 ? positive : negative];
}

function readingValue(r: Reading, hass: HomeAssistant): string {
  return r.available ? formatKW(r.w, hass) : localize("state.unavailable", hass);
}

function label(base: string, derived: boolean, hass: HomeAssistant): TemplateResult {
  const suffix = derived ? localize("node.derived_suffix", hass) : "";
  return html`${base}${suffix ? html`<span class="derived"> ${suffix}</span>` : ""}`;
}

export function buildNodeViews(model: Model, config: Config, hass: HomeAssistant): NodeView[] {
  const views: NodeView[] = [];

  views.push({
    key: "solar",
    icon: config.icons.solar ?? DEFAULT_ICONS.solar,
    color: model.solar.available && model.solar.w > 0 ? config.colors.solar : "var(--el-line)",
    label: localize("node.solar", hass),
    derived: model.solar.derived,
    value: readingValue(model.solar, hass),
    available: model.solar.available,
  });

  const grid = model.grid;
  views.push({
    key: "grid",
    icon: config.icons.grid ?? DEFAULT_ICONS.grid,
    color: signedColor(grid, "grid_import", "grid_export", config),
    label: !grid.available
      ? localize("node.grid", hass)
      : grid.net > 0
        ? localize("node.grid_import", hass)
        : grid.net < 0
          ? localize("node.grid_export", hass)
          : localize("node.grid", hass),
    derived: grid.derived,
    value: grid.available
      ? formatKW(Math.abs(grid.net), hass)
      : localize("state.unavailable", hass),
    available: grid.available,
  });

  views.push({
    key: "house",
    icon: config.icons.house ?? DEFAULT_ICONS.house,
    color: config.colors.house,
    label: localize("node.house", hass),
    derived: model.house.derived,
    value: readingValue(model.house, hass),
    available: model.house.available,
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
        : bat.net > 0
          ? localize("node.battery_discharging", hass)
          : bat.net < 0
            ? localize("node.battery_charging", hass)
            : localize("node.battery", hass),
      derived: bat.derived,
      value: bat.available
        ? formatKW(Math.abs(bat.net), hass)
        : localize("state.unavailable", hass),
      available: bat.available,
      // Percent above the icon, power below - two separate tap targets (REQ K-4, ENT-5).
      socValue: model.soc.available ? formatSoc(stateObj, hass) : undefined,
    });
  }

  return views;
}

export function renderCross(
  model: Model,
  config: Config,
  hass: HomeAssistant,
  activeConnections: ReadonlySet<string>,
): TemplateResult {
  const views = buildNodeViews(model, config, hass);

  return html`
    <div class="cross">
      <div class="plot">
        <svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" aria-hidden="true">
        ${DRAWN_CONNECTIONS.map(
          (id) =>
            svg`<path
              class="link ${activeConnections.has(id) ? "active" : ""}"
              d=${PATHS[id]}
            ></path>`,
        )}
        </svg>
        ${views.map((v) => {
          const pos = nodePercent(v.key);
          return html`
          <div
            class="node ${v.key}"
            style="left:${pos.left};top:${pos.top};border-color:${v.color}"
          >
            ${
              v.socValue
                ? html`<div class="value" style="color:${v.color}">${v.socValue}</div>`
                : ""
            }
            <ha-icon .icon=${v.icon} style="color:${v.color}"></ha-icon>
            <div class="value ${v.available ? "" : "unavailable"}">${v.value}</div>
            <div class="label">${label(v.label, v.derived, hass)}</div>
          </div>
          `;
        })}
      </div>
    </div>
  `;
}
