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

export function renderHeader(
  config: Config,
  hass: HomeAssistant,
  title: string | undefined,
  mode: ViewMode,
  since: string | undefined,
  onMode: (mode: ViewMode) => void,
): TemplateResult | typeof nothing {
  const modes: ViewMode[] = ["current", "avg_short", "avg_long"];
  const showSelector = config.view.showSelector;

  if (!title && !showSelector && mode === "current") return nothing;

  return html`
    <div class="header">
      ${title ? html`<div class="title">${title}</div>` : html`<span></span>`}
      ${
        showSelector
          ? html`<div class="modes" role="radiogroup" aria-label=${localize("view.label", hass)}>
              ${modes.map(
                (m) => html`<button
                  class="mode ${m === mode ? "on" : ""}"
                  role="radio"
                  aria-checked=${m === mode ? "true" : "false"}
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
      ${
        since
          ? html`<div class="since">${localize("view.since", hass, { time: since })}</div>`
          : nothing
      }
    </div>
  `;
}
