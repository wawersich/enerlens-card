/**
 * The consumer list beside the house node.
 *
 * Rows are keyed by entity id so Lit reuses the same element across updates -
 * that is what lets the FLIP animation measure a real "before" and "after"
 * (REQ L-1 to L-9).
 */
import { type TemplateResult, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { formatKW } from "../format";
import { localize } from "../localize";
import type { Breakdown, Config, HomeAssistant, ListEntry } from "../types";

function rowLabel(entry: ListEntry, hass: HomeAssistant): string {
  if (!entry.isRest) return entry.name;
  // An unconfigured rest label follows the interface language (REQ L-5).
  return entry.name || localize("list.rest", hass);
}

export function renderList(
  breakdown: Breakdown,
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event) => void,
): TemplateResult | typeof nothing {
  if (!config.list.enabled) return nothing;

  return html`
    <div class="list">
      ${config.list.title ? html`<p class="list-title">${config.list.title}</p>` : nothing}
      <div class="rows">
        ${repeat(
          breakdown.entries,
          (entry) => entry.key,
          (entry) => html`
            <div class="row ${entry.isRest ? "rest" : ""}" data-key=${entry.key}>
              <span class="swatch" style="background:${entry.color}"></span>
              <span class="name">${rowLabel(entry, hass)}</span>
              <span class="row-value">${formatKW(entry.w, hass)}</span>
              ${
                entry.entity
                  ? html`<button
                    class="row-hit"
                    aria-label=${`${rowLabel(entry, hass)} ${formatKW(entry.w, hass)}`}
                    @click=${(ev: Event) => onEntry(entry.entity as string, ev)}
                  ></button>`
                  : nothing
              }
            </div>
          `,
        )}
      </div>
    </div>
  `;
}

/**
 * FLIP: rows are measured before the update, then animated from their old
 * position to the new one. Without this they would jump when the order changes
 * (REQ L-8).
 */
export class RowAnimator {
  private positions = new Map<string, number>();

  /** Call before the DOM changes. */
  capture(container: Element | null): void {
    this.positions.clear();
    if (!container) return;
    for (const row of container.querySelectorAll<HTMLElement>(".row")) {
      const key = row.dataset.key;
      if (key) this.positions.set(key, row.getBoundingClientRect().top);
    }
  }

  /** Call after the DOM changed; animates every row that moved. */
  play(container: Element | null, enabled: boolean): void {
    if (!container) return;
    for (const row of container.querySelectorAll<HTMLElement>(".row")) {
      const key = row.dataset.key;
      if (!key) continue;
      const before = this.positions.get(key);
      const after = row.getBoundingClientRect().top;

      if (before === undefined) {
        // New row: fade and slide in rather than appearing abruptly.
        if (enabled) {
          row.animate(
            [
              { opacity: 0, transform: "translateY(-6px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 350, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
          );
        }
        continue;
      }

      const delta = before - after;
      if (!delta || !enabled) continue;
      row.animate([{ transform: `translateY(${delta}px)` }, { transform: "none" }], {
        duration: 600,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      });
    }
    this.positions.clear();
  }
}
