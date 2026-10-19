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

const MODES: ViewMode[] = ["current", "avg_short", "avg_long"];

/**
 * One chip steps through the modes (REQ V-2, issue #20). Every label is laid
 * into the same grid cell and only the active one is visible, so the chip is
 * as wide as its longest label and keeps its size while stepping through.
 */
function renderModeChip(
  config: Config,
  hass: HomeAssistant,
  mode: ViewMode,
  since: string | undefined,
  onMode: (mode: ViewMode) => void,
): TemplateResult {
  const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  const label = localize("view.chip", hass, {
    mode: modeLabel(mode, config, hass),
    next: modeLabel(next, config, hass),
  });
  return html`<button
    class="mode-chip"
    aria-label=${label}
    title=${since ? localize("view.since", hass, { time: since }) : ""}
    @click=${() => onMode(next)}
  >
    ${MODES.map(
      (m) => html`<span class="mode-label ${m === mode ? "active" : ""}" aria-hidden="true"
        >${modeLabel(m, config, hass)}</span
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
): TemplateResult | typeof nothing {
  // One switch for the whole bar: the averages and the consumer filter
  // are the bar, and half a bar is not a thing anyone asked for. Turned off,
  // the card starts with the flow and nothing above it.
  const showBar = config.view.showSelector;
  const hasToggle = showBar && onToggleAll !== undefined && config.consumers.length > 0;

  if (!title && !showBar && mode === "current") return nothing;

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
          showBar
            ? renderModeChip(config, hass, mode, since, onMode)
            : mode !== "current"
              ? // Bar hidden: name the mode anyway, or a card stuck on a mean
                // would silently read as the current value (REQ V-3).
                html`<div class="mode-note">${modeLabel(mode, config, hass)}</div>`
              : nothing
        }
        ${toggle}
      </div>
    </div>
  `;
}
