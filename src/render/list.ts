/**
 * The consumer list beside the house node.
 *
 * Rows are keyed by entity id so Lit reuses the same element across updates -
 * that is what lets the FLIP animation measure a real "before" and "after"
 * (REQ L-1 to L-9).
 */
import { type TemplateResult, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { dotParams } from "../flow";
import { formatKW } from "../format";
import { localize } from "../localize";
import type { Breakdown, Config, HomeAssistant, ListEntry } from "../types";

function rowLabel(entry: ListEntry, hass: HomeAssistant): string {
  if (!entry.isRest) return entry.name;
  // An unconfigured rest label follows the interface language (REQ L-5).
  return entry.name || localize("list.rest", hass);
}

/**
 * A short run of "wire" at the left of a row, carrying the same dots as the
 * connections do (REQ 4.6 via `dotParams`).
 *
 * Only drawn when the list sits below the cross. Beside the cross the ring and
 * the flow lines already carry the movement, and a second animation there is
 * noise; below the cross the rows are the only thing left, and a fan of lines
 * from the house node would have to cross every row above its target.
 *
 * Speed comes from the ticked value, so it changes on the beat rather than with
 * every reading - a CSS animation restarts its phase when the duration changes,
 * and on a 26 px run that is only tolerable a few times a minute.
 */
function lane(w: number, color: string, config: Config): TemplateResult | typeof nothing {
  const params = dotParams(w, config);
  // The track is always drawn, even below the flow threshold: a row without one
  // reads as broken rather than as idle. Only the dots depend on there being
  // something to move.
  if (!params) return html`<span class="lane" aria-hidden="true"></span>`;

  const { count, durationS } = params;
  const dots = Array.from({ length: count }, (_, i) => i);
  return html`<span class="lane" aria-hidden="true">
    ${dots.map(
      (i) => html`<span
        class="lane-dot"
        style="background:${color};animation-duration:${durationS.toFixed(2)}s;animation-delay:${(
          (-i * durationS) / count
        ).toFixed(2)}s"
      ></span>`,
    )}
  </span>`;
}

/**
 * Row pitch by the number of rows (REQ L-9): three entries may sit apart, ten
 * should not turn the card into a scroll. The hit target grows with the row
 * (row-hit reaches 5 px beyond it), so the effective target is the pitch -
 * never below the 24 px floor of I-3.
 */
export function rowHeight(count: number): number {
  if (count <= 4) return 40;
  if (count <= 7) return 34;
  return 28;
}

export function renderList(
  breakdown: Breakdown,
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event) => void,
  stacked: boolean,
): TemplateResult | typeof nothing {
  if (!config.list.enabled) return nothing;

  return html`
    <div class="list" style="--el-row-h:${rowHeight(breakdown.entries.length)}px">
      ${config.list.title ? html`<p class="list-title">${config.list.title}</p>` : nothing}
      <div class="rows">
        ${repeat(
          breakdown.entries,
          (entry) => entry.key,
          (entry) => html`
            <div class="row ${entry.isRest ? "rest" : ""}" data-key=${entry.key}>
              ${
                // The colour mark at the row's start - where the fan line ends. A
                // configured icon takes its place, in the same colour (REQ L-2).
                entry.icon
                  ? html`<ha-icon class="swatch icon" .icon=${entry.icon} style="color:${entry.color}"></ha-icon>`
                  : html`<span class="swatch dot" style="color:${entry.color}"></span>`
              }
              ${stacked ? lane(entry.w, entry.color, config) : nothing}
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
  /** Drawn position per row before the update, relative to the container. */
  private positions = new Map<string, number>();
  /** Layout position each row was last sent to, relative to the container. */
  private targets = new Map<string, number>();
  /** Top of the .rows block before the update - new rows ride along with it. */
  private blockTop?: number;

  /**
   * Positions are taken relative to the container, not the viewport: the card
   * re-renders on every state change, and a render while the page scrolls
   * would otherwise see every row "move" by the scroll distance and glide the
   * whole list for nothing.
   */
  private static top(row: Element, container: Element): number {
    return row.getBoundingClientRect().top - container.getBoundingClientRect().top;
  }

  /** Call before the DOM changes. */
  capture(container: Element | null): void {
    this.positions.clear();
    this.blockTop = undefined;
    if (!container) return;
    const block = container.querySelector(".rows");
    if (block) this.blockTop = RowAnimator.top(block, container);
    for (const row of container.querySelectorAll<HTMLElement>(".row")) {
      const key = row.dataset.key;
      if (key) this.positions.set(key, RowAnimator.top(row, container));
    }
  }

  /** Call after the DOM changed; animates every row that moved. */
  play(container: Element | null, enabled: boolean): void {
    if (!container) return;
    // Without the Web Animations API the list still works, it just does not
    // glide - the rows are already in their new places (REQ N-5).
    const canAnimate = enabled && typeof Element.prototype.animate === "function";
    const seen = new Set<string>();
    // How far the whole block moved (the list re-centres beside the cross when
    // rows come and go). Entering rows start displaced by this much, so they
    // arrive together with their neighbours instead of popping into a moving list.
    const block = container.querySelector(".rows");
    const blockDelta =
      block && this.blockTop !== undefined ? this.blockTop - RowAnimator.top(block, container) : 0;
    for (const row of container.querySelectorAll<HTMLElement>(".row")) {
      const key = row.dataset.key;
      if (!key) continue;
      seen.add(key);
      const before = this.positions.get(key);
      const after = RowAnimator.top(row, container);

      // A render mid-glide (the card updates with every state change) finds
      // the row drawn somewhere between start and target. If its layout target
      // has not changed, the running glide will land it - starting a fresh
      // animation from the drawn position would reset the easing each time
      // and turn one smooth move into a series of jerks.
      const glide = RowAnimator.runningGlide(row);
      if (glide && this.targets.get(key) === after) continue;
      this.targets.set(key, after);

      if (before === undefined) {
        // New row: fade in while moving with the block, on the glide's own clock.
        if (canAnimate) {
          const animation = row.animate(
            [
              { opacity: 0, transform: `translateY(${blockDelta}px)` },
              { opacity: 0, transform: `translateY(${blockDelta * 0.6}px)`, offset: 0.4 },
              { opacity: 1, transform: "none" },
            ],
            { duration: 600, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
          );
          animation.id = GLIDE;
        }
        continue;
      }

      const delta = before - after;
      if (!delta || !canAnimate) continue;
      // A real reorder while a glide is running: continue from where the row is
      // drawn, but as the only glide on it.
      glide?.cancel();
      const animation = row.animate(
        [{ transform: `translateY(${delta}px)` }, { transform: "none" }],
        { duration: 600, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      );
      animation.id = GLIDE;
    }
    for (const key of [...this.targets.keys()]) if (!seen.has(key)) this.targets.delete(key);
    this.positions.clear();
  }

  private static runningGlide(row: Element): Animation | undefined {
    if (typeof row.getAnimations !== "function") return undefined;
    return row.getAnimations().find((a) => a.id === GLIDE && a.playState === "running");
  }
}

const GLIDE = "enerlens-glide";
