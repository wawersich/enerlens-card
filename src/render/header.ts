/**
 * Card header: title plus the view mode chip (REQ V-2, V-3).
 *
 * The active mode is always visible, even with the selector switched off -
 * nobody should mistake a 15-minute mean for a live reading (REQ V-3, G-1).
 */
import { type TemplateResult, html, nothing } from "lit";
import { localize } from "../localize";
import type { Config, HomeAssistant, ViewMode } from "../types";

export function modeLabel(mode: ViewMode, config: Config, hass: HomeAssistant): string {
  if (mode === "current") return localize("view.now", hass);
  const minutes = mode === "avg_short" ? config.view.avgShortMinutes : config.view.avgLongMinutes;
  return localize("view.average", hass, { minutes });
}

/**
 * The strip above the cross while the grid is gone (REQ NS-5). Only rendered
 * during an outage, so it costs no height in normal operation.
 */
export function renderOutageBanner(hass: HomeAssistant): TemplateResult {
  return html`<div class="outage-banner" role="status">
    <ha-icon icon="mdi:flash-off"></ha-icon>
    <span>${localize("outage.banner", hass)}</span>
  </div>`;
}

/** Marks invented readings while only placeholder sensors are set (REQ E-5). */
export function renderExampleBanner(hass: HomeAssistant): TemplateResult {
  return html`<div class="example-banner" role="status">
    <ha-icon icon="mdi:information-outline"></ha-icon>
    <span>${localize("example.banner", hass)}</span>
  </div>`;
}

/**
 * One chip steps through the offered modes (REQ V-2, QB-3, issue #20). Every label is laid
 * into the same grid cell and only the active one is visible, so the chip is
 * as wide as its longest label and keeps its size while stepping through.
 */
function renderModeChip(
  config: Config,
  hass: HomeAssistant,
  mode: ViewMode,
  since: string | undefined,
  onMode: (mode: ViewMode) => void,
  /** In an energy period: greyed out and inert rather than gone, so nobody
   *  wonders where it went - and nothing beside it moves (EM-2). */
  off = false,
): TemplateResult {
  const modes = config.view.modes;
  const next = modes[(modes.indexOf(mode) + 1) % modes.length];
  const label = off
    ? localize("view.off_in_period", hass)
    : localize("view.chip", hass, {
        mode: modeLabel(mode, config, hass),
        next: modeLabel(next, config, hass),
      });
  return html`<button
    class="mode-chip view-chip"
    aria-disabled=${off ? "true" : "false"}
    aria-label=${label}
    title=${off ? label : since ? localize("view.since", hass, { time: since }) : ""}
    @click=${() => {
      // Not `disabled`: it stays focusable and its label says why (QB-3).
      if (!off) onMode(next);
    }}
  >
    ${modes.map(
      (m) => html`<span class="mode-label ${m === mode ? "active" : ""}" aria-hidden="true"
        >${modeLabel(m, config, hass)}</span
      >`,
    )}
  </button>`;
}

/** The energy chip as the card hands it over (REQ EM-2); undefined = mode off. */
export interface EnergyChip {
  /** Every label the chip can show; it keeps the width of the longest. */
  labels: string[];
  active: string;
  ariaLabel: string;
  /** A period is shown (not kW): the averages make no sense then. */
  inPeriod: boolean;
  /** Counted from a late start: amber, with the date in the label (EM-9). */
  late: boolean;
  /** The default still waits for the statistics check: room kept, nothing shown (QB-8). */
  waiting: boolean;
  title: string;
  onCycle: () => void;
}

function renderEnergyChip(chip: EnergyChip): TemplateResult {
  const labels = chip.labels.includes(chip.active) ? chip.labels : [...chip.labels, chip.active];
  if (chip.waiting) {
    return html`<button class="mode-chip energy-chip waiting" aria-hidden="true" tabindex="-1">
      ${labels.map((l) => html`<span class="mode-label ${l === chip.active ? "active" : ""}">${l}</span>`)}
    </button>`;
  }
  return html`<button
    class="mode-chip energy-chip ${chip.late ? "late" : ""}"
    aria-label=${chip.ariaLabel}
    title=${chip.title}
    @click=${chip.onCycle}
  >
    ${labels.map(
      (l) => html`<span class="mode-label ${l === chip.active ? "active" : ""}" aria-hidden="true"
        >${l}</span
      >`,
    )}
  </button>`;
}

export function renderHeader(
  config: Config,
  hass: HomeAssistant,
  title: string | undefined,
  mode: ViewMode,
  since: string | undefined,
  onMode: (mode: ViewMode) => void,
  /** Filter lifted on the consumer list (REQ L-12); undefined = no list, no toggle. */
  showAll?: boolean,
  onToggleAll?: () => void,
  energy?: EnergyChip,
): TemplateResult | typeof nothing {
  // A quick button offering one value is no button: that value is fixed
  // (QB-3). What is fixed and not the plain live view is named instead, so
  // nobody mistakes a mean or a period for a live reading (REQ V-3).
  const smoothing = config.view.modes.length > 1;
  const hasToggle =
    onToggleAll !== undefined && config.consumers.length > 0 && config.list.scope.length > 1;
  const energyButton = energy !== undefined && (energy.waiting || energy.labels.length > 1);
  const inPeriod = energy?.inPeriod === true;
  // In a period only the period counts: nothing is averaged there (QB-5).
  const note = inPeriod
    ? energyButton
      ? nothing
      : html`<div class="mode-note ${energy?.late ? "late" : ""}" title=${energy?.title ?? ""}>
          ${localize("energy.fixed", hass, { period: energy?.active ?? "" })}
        </div>`
    : !smoothing && mode !== "current"
      ? html`<div class="mode-note">${modeLabel(mode, config, hass)}</div>`
      : nothing;
  if (!title && !smoothing && !energyButton && !hasToggle && note === nothing) return nothing;

  const toggleLabel = localize(showAll ? "list.filter_on" : "list.show_all", hass);
  const toggle = hasToggle
    ? html`<button
        class="filter-toggle ${showAll ? "on" : ""}"
        aria-pressed=${showAll ? "true" : "false"}
        aria-label=${toggleLabel}
        title=${toggleLabel}
        @click=${onToggleAll}
      >
        <ha-icon .icon=${showAll ? "mdi:filter-off-outline" : "mdi:filter-outline"}></ha-icon>
      </button>`
    : nothing;

  return html`
    <div class="header">
      ${title ? html`<div class="title">${title}</div>` : html`<span></span>`}
      <div class="controls">
        ${
          // A period's figures are energies; a mean of them is no view (EM-2):
          // the chip stays, greyed out.
          smoothing ? renderModeChip(config, hass, mode, since, onMode, inPeriod) : nothing
        }
        ${note}
        ${energyButton && energy ? renderEnergyChip(energy) : nothing}
        ${toggle}
      </div>
    </div>
  `;
}
