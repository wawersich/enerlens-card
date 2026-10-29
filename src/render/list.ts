/**
 * The consumer list beside the house node.
 *
 * Rows are keyed by entity id so Lit reuses the same element across updates -
 * that is what lets the FLIP animation measure a real "before" and "after"
 * (REQ L-1 to L-9).
 */
import { type TemplateResult, html, nothing, svg } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { formatClock, formatExtra, formatPercent, formatPower } from "../format";
import { localize } from "../localize";
import type {
  Breakdown,
  Config,
  HomeAssistant,
  IndicatorReading,
  IndicatorSlot,
  ListEntry,
} from "../types";
import { DEFAULT_ICONS, type DetailNode } from "./cross";

function rowLabel(entry: ListEntry, hass: HomeAssistant): string {
  if (!entry.isRest) return entry.name;
  // An unconfigured rest label follows the interface language (REQ L-5).
  return entry.name || localize("list.rest", hass);
}

/**
 * The runway the fan lines run through when the list sits below the cross.
 * Empty on purpose: it only holds the grid column open. The lines and their
 * dots are drawn on the overlay, so they can converge on one point instead of
 * running as parallel bars per row (REQ L-13).
 */
function runway(): TemplateResult {
  return html`<span class="lane" aria-hidden="true"></span>`;
}

/**
 * The house icon at the point where the lines gather, stacked only. Beside the
 * cross the lines start at the house node itself and need no stand-in; below
 * it the node sits far above the block, so without this the bundle would come
 * out of nowhere (REQ L-13).
 */
function origin(config: Config, of: "house" | "solar" = "house"): TemplateResult {
  return html`<ha-icon
    class="origin-icon"
    aria-hidden="true"
    .icon=${config.icons[of] ?? DEFAULT_ICONS[of]}
    style="color:${config.colors[of]}"
  ></ha-icon>`;
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

/**
 * How far an extra value fills its ring, bar or mark: (value - min) / (max -
 * min), held to 0..1 (REQ L-20). min > max is a scale running the other way;
 * min = max is empty below and full from the value on. Only the drawing is
 * held - the figure stays the measurement (rule 8).
 */
export function fractionOf(ind: IndicatorReading): number | undefined {
  if (ind.value === undefined) return undefined;
  if (ind.min === ind.max) return ind.value >= ind.max ? 1 : 0;
  return Math.max(0, Math.min(1, (ind.value - ind.min) / (ind.max - ind.min)));
}

/**
 * The ring around a row's mark, filled clockwise from twelve o'clock (REQ
 * L-15, L-20). Without a value it is the faint track alone.
 */
function ringOf(ind: IndicatorReading, rowColor: string): TemplateResult {
  // At the edge of its box: the box already reaches beyond the slot, so the
  // ring clears an icon of full size without crowding the name.
  const r = 11.2;
  const c = 2 * Math.PI * r;
  const len = c * (fractionOf(ind) ?? 0);
  return html`<svg
    class="charge-ring ${ind.stale ? "stale" : ""}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style="color:${ind.color ?? rowColor}"
  >
    <circle class="track" cx="12" cy="12" r=${r}></circle>
    ${
      len > 0
        ? // svg, not html: a nested html template would make an HTML <circle>,
          // which draws nothing.
          svg`<circle
          class="fill"
          cx="12"
          cy="12"
          r=${r}
          stroke-dasharray=${`${len.toFixed(2)} ${c.toFixed(2)}`}
          transform="rotate(-90 12 12)"
        ></circle>`
        : nothing
    }
  </svg>`;
}

/**
 * The figure of an extra value. Percent in whole numbers, as the state of
 * charge always was and the battery's is (L-15, K-3) - the old `charge` and
 * a ring written new read the same. Anything else as an extra at the cross
 * (Z-5), in the unit it was measured in, kept for a stale value.
 */
function indicatorFigure(ind: IndicatorReading, hass: HomeAssistant): string {
  if (ind.value === undefined) return "";
  const live = hass.states?.[ind.entity];
  const unit = ind.unit ?? live?.attributes?.unit_of_measurement;
  if (ind.percent || unit === "%") return formatPercent(ind.value, hass);
  const stateObj = {
    entity_id: ind.entity,
    state: String(ind.value),
    attributes: { ...(live?.attributes ?? {}), ...(unit ? { unit_of_measurement: unit } : {}) },
    last_changed: "",
    last_updated: "",
  };
  return formatExtra(stateObj, hass, "ha");
}

/**
 * What an extra value is called: its own label; the ring "State of charge"
 * as it always was; the others their entity's name (REQ L-20).
 */
function indicatorName(ind: IndicatorReading, slot: IndicatorSlot, hass: HomeAssistant): string {
  if (ind.label) return ind.label;
  if (slot === "ring") return localize("list.charge_label", hass);
  const friendly = hass.states?.[ind.entity]?.attributes?.friendly_name;
  return typeof friendly === "string" && friendly ? friendly : ind.entity;
}

/**
 * The tooltip line of an extra value: name and figure, how old it is when it
 * is old, and "now" in a period, so no one takes it for the period's value.
 */
function indicatorTitle(
  ind: IndicatorReading,
  slot: IndicatorSlot,
  hass: HomeAssistant,
  energy: boolean,
): string {
  const label = indicatorName(ind, slot, hass);
  let text: string;
  if (ind.value === undefined) text = localize("list.charge_unknown", hass, { label });
  else if (ind.stale && ind.since !== undefined) {
    text = localize("list.charge_stale", hass, {
      label,
      value: indicatorFigure(ind, hass),
      time: formatClock(ind.since, hass),
    });
  } else text = localize("list.charge", hass, { label, value: indicatorFigure(ind, hass) });
  return energy ? localize("list.indicator_now", hass, { text }) : text;
}

/**
 * The extra values a row draws: all of them with the power, in a period only
 * where the consumer asks for it (`in_energy`, REQ L-20).
 */
function shownIndicators(
  entry: ListEntry,
  config: Config,
): Partial<Record<IndicatorSlot, IndicatorReading>> {
  const indicators = entry.indicators;
  if (!indicators || (config.energy && !indicators.inEnergy)) return {};
  return indicators.slots;
}

/**
 * The extra value the value column shows instead of the power, if any: the
 * one `idle_value` names, decided on the tick (REQ L-20), and only while it
 * has a number - without one the power stands there.
 */
export function idleIndicator(entry: ListEntry, config: Config): IndicatorReading | undefined {
  if (!entry.idle || config.energy || !entry.indicators) return undefined;
  const slot = entry.indicators.idleValue;
  if (slot === "power") return undefined;
  const ind = entry.indicators.slots[slot];
  return ind?.value === undefined ? undefined : ind;
}

export function renderList(
  breakdown: Breakdown,
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event, detail?: DetailNode) => void,
  stacked: boolean,
  /** The PV rows above the consumers (PV-7); empty when there are none. */
  solarRows: ListEntry[] = [],
  /** The PV rows stand apart, left of the drawing (AN-3): not in this list. */
  solarApart = false,
): TemplateResult | typeof nothing {
  const consumers = config.list.enabled;
  if (!consumers && (solarRows.length === 0 || solarApart)) return nothing;
  const count = pitchCount(breakdown, config, solarRows);

  return html`
    <div class="list ${stacked ? "stacked" : ""}" style="--el-row-h:${rowHeight(count)}px">
      ${config.list.title ? html`<p class="list-title">${config.list.title}</p>` : nothing}
      ${solarRows.length > 0 && !solarApart ? renderSolarRows(solarRows, config, hass, onEntry, stacked) : nothing}
      ${consumers ? renderConsumers(breakdown, config, hass, onEntry, stacked) : nothing}
    </div>
  `;
}

/**
 * The PV rows on their own, left of the drawing (AN-3): mirrored, the mark
 * towards the drawing. Never stacked - too narrow, they join the list below.
 */
export function renderSolarSide(
  breakdown: Breakdown,
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event, detail?: DetailNode) => void,
  solarRows: ListEntry[],
): TemplateResult | typeof nothing {
  if (solarRows.length === 0) return nothing;
  return html`
    <div class="list pv-side" style="--el-row-h:${rowHeight(pitchCount(breakdown, config, solarRows))}px">
      ${renderSolarRows(solarRows, config, hass, onEntry, false)}
    </div>
  `;
}

/** One pitch for both blocks, on one side or two: they read as one list (L-9, PV-7). */
function pitchCount(breakdown: Breakdown, config: Config, solarRows: ListEntry[]): number {
  return (config.list.enabled ? breakdown.entries.length : 0) + solarRows.length;
}

function renderSolarRows(
  solarRows: ListEntry[],
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event, detail?: DetailNode) => void,
  stacked: boolean,
): TemplateResult {
  return html`<div class="pv-rows">
    ${stacked ? origin(config, "solar") : nothing}
    ${repeat(
      solarRows,
      (entry) => entry.key,
      (entry) => renderRow(entry, config, hass, onEntry, stacked, true),
    )}
  </div>`;
}

function renderConsumers(
  breakdown: Breakdown,
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event, detail?: DetailNode) => void,
  stacked: boolean,
): TemplateResult {
  return html`
      <div class="rows">
        ${stacked ? origin(config) : nothing}
        ${repeat(
          breakdown.entries,
          (entry) => entry.key,
          (entry) => renderRow(entry, config, hass, onEntry, stacked, false),
        )}
      </div>
  `;
}

/** One row - a consumer, the rest, or a PV source (PV-7, same columns). */
function renderRow(
  entry: ListEntry,
  config: Config,
  hass: HomeAssistant,
  onEntry: (entity: string, ev: Event, detail?: DetailNode) => void,
  stacked: boolean,
  solar: boolean,
): TemplateResult {
  const energy = config.energy !== undefined;
  const shown = shownIndicators(entry, config);
  const { ring, bar_top: barTop, bar_bottom: barBottom, fill } = shown;
  const idle = idleIndicator(entry, config);
  const idleSlot = entry.indicators?.idleValue as IndicatorSlot | undefined;
  const power = entry.powerUnknown ? "—" : formatPower(entry.w, hass, config.power);
  const value = idle ? indicatorFigure(idle, hass) : power;
  // In a period: gaps filled in, a late start, a remainder that holds
  // them (EM-11, EM-12) - a PV source's under its entity as well (PV-2).
  const mark = config.energy
    ? entry.isRest
      ? config.energy.rest
      : config.energy.consumers[entry.entity ?? ""]
    : undefined;
  const markClass = mark && mark.tier > 0 ? `warn${mark.tier}` : "";
  // Every row opens its window: a consumer's, a PV source's, the rest's -
  // the last needs a measured house (DF-18, DF-19). Power and every extra
  // value are in it (DF-15).
  const detail: DetailNode | undefined = entry.isRest
    ? config.sources.house.kind === "single"
      ? "rest"
      : undefined
    : entry.entity
      ? solar
        ? `source:${entry.key}`
        : `consumer:${entry.key}`
      : undefined;
  const open = (ev: Event) => onEntry(entry.entity ?? "", ev, detail);
  const titles = (Object.entries(shown) as [IndicatorSlot, IndicatorReading][]).map(([slot, ind]) =>
    indicatorTitle(ind, slot, hass, energy),
  );
  // One tap target, one tab stop: the row; its name says every value (L-20).
  const label = [`${rowLabel(entry, hass)} ${power}`, ...titles].join(", ");
  // The mark's tooltip: ring and fill, one per line. Not a button - a tap on
  // it falls through to the row (REQ L-20).
  const markTitle = [
    ring && indicatorTitle(ring, "ring", hass, energy),
    fill && indicatorTitle(fill, "fill", hass, energy),
  ]
    .filter(Boolean)
    .join("\n");
  const fraction = fill ? (fractionOf(fill) ?? 0) : 0;
  const swatch =
    ring || fill
      ? html`<span
          class="swatch ${entry.icon ? "icon" : "dot"} ${fill ? "filled" : ""} ${fill?.stale ? "stale" : ""}"
          style="color:${entry.color};--el-fill:${(fraction * 100).toFixed(1)}%"
          title=${markTitle}
          @click=${open}
          >${ring ? ringOf(ring, entry.color) : nothing}${
            entry.icon ? html`<ha-icon .icon=${entry.icon}></ha-icon>` : nothing
          }</span
        >`
      : entry.icon
        ? html`<ha-icon class="swatch icon" .icon=${entry.icon} style="color:${entry.color}"></ha-icon>`
        : html`<span class="swatch dot" style="color:${entry.color}"></span>`;
  const bar = (ind: IndicatorReading | undefined, slot: "bar_top" | "bar_bottom") =>
    ind
      ? html`<span
          class="bar ${slot === "bar_top" ? "top" : "bottom"} ${ind.stale ? "stale" : ""}"
          style="--bar-color:${ind.color ?? entry.color};--bar-fill:${((fractionOf(ind) ?? 0) * 100).toFixed(1)}%"
          title=${indicatorTitle(ind, slot, hass, energy)}
          @click=${open}
        ></span>`
      : nothing;
  return html`
            <div
              class="row ${solar ? "pv" : ""} ${entry.isRest ? "rest" : ""} ${
                ring || fill ? "charge" : ""
              } ${idle?.stale ? "stale" : ""} ${entry.highlight?.bold ? "bold" : ""} ${
                entry.highlight?.band ? "band" : ""
              }"
              style=${entry.highlight?.band ? `--el-row-color:${entry.color}` : ""}
              data-key=${entry.key}
            >
              ${stacked ? runway() : nothing}
              ${
                // The colour mark, directly in front of the name so the two read
                // as one label - the fan line ends on it. A configured icon takes
                // its place, in the same colour (REQ L-2, L-13). Ring and fill
                // live on it (L-15, L-20).
                swatch
              }
              <span class="name">${rowLabel(entry, hass)}</span>
              <span
                class="row-value ${idle ? "soc" : ""} ${markClass}"
                title=${mark?.note ?? ""}
                style=${idle && idleSlot && idleSlot !== "fill" && idle.color ? `color:${idle.color}` : ""}
                >${value}</span
              >
              ${
                entry.entity || detail
                  ? html`<button
                    class="row-hit"
                    title=${mark?.note ?? ""}
                    aria-label=${label}
                    @click=${open}
                  ></button>`
                  : nothing
              }
              ${bar(barTop, "bar_top")}${bar(barBottom, "bar_bottom")}
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
    const moved =
      block && this.blockTop !== undefined ? this.blockTop - RowAnimator.top(block, container) : 0;
    // From an empty list the block "moves" from the middle of the card to its
    // top; rows sent along that far started below the card with their fan
    // lines ahead of them (20.10.2026). With rows before, they travel with
    // their neighbours as always.
    const rowHeight = container.querySelector(".row")?.getBoundingClientRect().height || 28;
    const blockDelta =
      this.positions.size > 0 ? moved : Math.max(-rowHeight, Math.min(rowHeight, moved));
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
        // New row: moves with the block on the glide's own clock, but is
        // there almost at once - visible from the first frame, opaque after a
        // third of the glide. It used to stay hidden for 40 % of it while its
        // fan line was already drawn (Markus, 20.10.2026).
        if (canAnimate) {
          const animation = row.animate(
            [
              { opacity: 0, transform: `translateY(${blockDelta}px)` },
              { opacity: 1, transform: `translateY(${blockDelta * 0.45}px)`, offset: 0.33 },
              { opacity: 1, transform: "none" },
            ],
            { duration: GLIDE_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
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
        { duration: GLIDE_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      );
      animation.id = GLIDE;
    }
    for (const key of [...this.targets.keys()]) if (!seen.has(key)) this.targets.delete(key);
    this.positions.clear();
  }

  /**
   * Whether a row in the container is still under way - what the fan follows
   * frame by frame. Asked rather than remembered: a render mid-glide starts
   * nothing new, yet the row keeps moving.
   */
  gliding(container: Element | null): boolean {
    if (!container) return false;
    for (const row of container.querySelectorAll(".row")) {
      if (RowAnimator.runningGlide(row)) return true;
    }
    return false;
  }

  private static runningGlide(row: Element): Animation | undefined {
    if (typeof row.getAnimations !== "function") return undefined;
    // An older WebKit still reports an animation waiting for its first frame
    // as "pending".
    return row
      .getAnimations()
      .find(
        (a) =>
          a.id === GLIDE && (a.playState === "running" || (a.playState as string) === "pending"),
      );
  }
}

const GLIDE = "enerlens-glide";
/** How long a row glides to its new place. */
export const GLIDE_MS = 600;
