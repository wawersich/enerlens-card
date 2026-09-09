/**
 * Card header: title plus the view mode chips (REQ V-2, V-3).
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
  const modes: ViewMode[] = ["current", "avg_short", "avg_long"];
  const showSelector = config.view.showSelector;
  const hasToggle = onToggleAll !== undefined && config.consumers.length > 0;

  if (!title && !showSelector && mode === "current" && !hasToggle) return nothing;

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
          showSelector
            ? html`<div class="modes" role="radiogroup" aria-label=${localize("view.label", hass)}>
                ${modes.map(
                  (m) => html`<button
                    class="mode ${m === mode ? "on" : ""}"
                    role="radio"
                    aria-checked=${m === mode ? "true" : "false"}
                    title=${m === mode && since ? localize("view.since", hass, { time: since }) : ""}
                    @click=${() => onMode(m)}
                  >
                    ${modeLabel(m, config, hass)}
                  </button>`,
                )}
              </div>`
            : mode !== "current"
              ? // Selector hidden: name the mode anyway (REQ V-3).
                html`<div class="mode-note">${modeLabel(mode, config, hass)}</div>`
              : nothing
        }
        ${toggle}
      </div>
    </div>
  `;
}
