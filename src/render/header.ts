/**
 * Card header: title plus the view mode chip (REQ V-2, V-3).
 *
 * The active mode is always visible, even with the selector switched off -
 * nobody should mistake a 15-minute mean for a live reading (REQ V-3, G-1).
 */
import { type TemplateResult, html, nothing } from "lit";
import { localize } from "../localize";
import type { Config, HomeAssistant, QuickName, ViewMode } from "../types";

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
  /** Expanded (QB-10): every offered value, the shown one, a direct pick. */
  options: { label: string; late: boolean; title: string }[];
  selected: number;
  onSelect: (index: number) => void;
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

/** The PV scale chip (PV-6): steps through its scales, as wide as the widest. */
export interface ScaleChip {
  labels: string[];
  active: string;
  ariaLabel: string;
  title: string;
  onCycle: () => void;
  /** Expanded (QB-10): each scale's own tooltip, the shown one, a direct pick. */
  titles: string[];
  selected: number;
  onSelect: (index: number) => void;
}

/** One value of an expanded quick button (REQ QB-10). */
interface Choice {
  label: TemplateResult | string;
  aria: string;
  title?: string;
  /** Counted from a late start: amber (EM-9, QB-14). */
  late?: boolean;
}

/**
 * Where an arrow key, Home or End moves in a radio group of `n` (QB-14);
 * -1 for any other key. Shared with the detail window's periods (DF-9).
 */
export function radioStep(key: string, index: number, n: number): number {
  if (key === "ArrowRight" || key === "ArrowDown") return (index + 1) % n;
  if (key === "ArrowLeft" || key === "ArrowUp") return (index - 1 + n) % n;
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  return -1;
}

/**
 * An expanded quick button: every value its own button, a tap picks it
 * (REQ QB-10). A radio group (QB-14): one tab stop - the checked value -,
 * arrow keys and Home/End pick within; a tap on the checked one does
 * nothing. Greyed out it stays focusable and says why (QB-5).
 */
function renderChoices(
  name: QuickName,
  label: string,
  choices: Choice[],
  selected: number,
  onSelect: (index: number) => void,
  off = false,
  offTitle = "",
): TemplateResult {
  const pick = (index: number) => {
    if (!off && index !== selected) onSelect(index);
  };
  const key = (ev: KeyboardEvent, index: number) => {
    const to = radioStep(ev.key, index, choices.length);
    if (to < 0) return;
    ev.preventDefault();
    if (off) return;
    const group = (ev.currentTarget as HTMLElement).parentElement;
    pick(to);
    // The focus follows the pick once the group is drawn again.
    setTimeout(() => group?.querySelectorAll<HTMLElement>('[role="radio"]')[to]?.focus(), 0);
  };
  return html`<div
    class="quick-group ${off ? "off" : ""}"
    role="radiogroup"
    data-quick=${name}
    aria-label=${label}
    aria-disabled=${off ? "true" : "false"}
    title=${off ? offTitle : ""}
  >
    ${choices.map(
      (c, i) => html`<button
        class="quick-option ${i === selected ? "selected" : ""} ${c.late ? "late" : ""}"
        role="radio"
        aria-checked=${i === selected ? "true" : "false"}
        tabindex=${i === (selected < 0 ? 0 : selected) ? 0 : -1}
        aria-label=${c.aria}
        title=${off ? offTitle : (c.title ?? "")}
        @click=${() => pick(i)}
        @keydown=${(ev: KeyboardEvent) => key(ev, i)}
      >
        ${c.label}
      </button>`,
    )}
  </div>`;
}

function renderScaleChip(chip: ScaleChip): TemplateResult {
  return html`<button
    class="mode-chip energy-chip pv-scale-chip"
    aria-label=${chip.ariaLabel}
    title=${chip.title}
    @click=${chip.onCycle}
  >
    ${chip.labels.map(
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
  /** The PV scale (PV-6); undefined when fixed or there is no PV ring. */
  pvScale?: ScaleChip,
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
  // Expanded, the energy button waits unseen (QB-14, C): it keeps no header.
  const energyShown =
    energyButton && !(config.view.expanded.includes("energy_periods") && energy?.waiting);
  if (!title && !smoothing && !energyShown && !pvScale && !hasToggle && note === nothing)
    return nothing;

  // Expanded quick buttons and the style for all of them (QB-9, QB-10).
  const expanded = new Set(config.view.expanded);
  const group = (key: string) => localize(`editor.${key}`, hass);
  const toggleLabel = localize(showAll ? "list.filter_on" : "list.show_all", hass);
  const toggle = !hasToggle
    ? nothing
    : expanded.has("scope")
      ? renderChoices(
          "scope",
          group("group_scope"),
          [
            {
              label: html`<ha-icon .icon=${"mdi:filter-outline"}></ha-icon>`,
              aria: localize("editor.scope_filtered", hass),
              title: localize("editor.scope_filtered", hass),
            },
            {
              label: html`<ha-icon .icon=${"mdi:filter-off-outline"}></ha-icon>`,
              aria: localize("editor.scope_full", hass),
              title: localize("editor.scope_full", hass),
            },
          ],
          showAll ? 1 : 0,
          () => onToggleAll?.(),
        )
      : html`<button
        class="filter-toggle ${showAll ? "on" : ""}"
        aria-pressed=${showAll ? "true" : "false"}
        aria-label=${toggleLabel}
        title=${toggleLabel}
        @click=${onToggleAll}
      >
        <ha-icon .icon=${showAll ? "mdi:filter-off-outline" : "mdi:filter-outline"}></ha-icon>
      </button>`;
  const modes = config.view.modes;
  const smoothingChip = !smoothing
    ? nothing
    : expanded.has("modes")
      ? renderChoices(
          "modes",
          group("group_smoothing"),
          modes.map((m) => ({
            label: modeLabel(m, config, hass),
            aria: modeLabel(m, config, hass),
            title: m === mode && since ? localize("view.since", hass, { time: since }) : "",
          })),
          modes.indexOf(mode),
          (i) => onMode(modes[i]),
          inPeriod,
          localize("view.off_in_period", hass),
        )
      : renderModeChip(config, hass, mode, since, onMode, inPeriod);
  // Expanded, the energy button waits unseen: no room kept (QB-14, C).
  const energyChip =
    !energyButton || !energy
      ? nothing
      : !expanded.has("energy_periods")
        ? renderEnergyChip(energy)
        : energy.waiting
          ? nothing
          : renderChoices(
              "energy_periods",
              group("group_energy"),
              energy.options.map((o) => ({
                label: o.label,
                aria: o.label,
                title: o.title,
                late: o.late,
              })),
              energy.selected,
              energy.onSelect,
            );
  const scaleChip = !pvScale
    ? nothing
    : expanded.has("pv_scales")
      ? renderChoices(
          "pv_scales",
          group("group_pv_scale"),
          pvScale.labels.map((l, i) => ({ label: l, aria: l, title: pvScale.titles[i] })),
          pvScale.selected,
          pvScale.onSelect,
        )
      : renderScaleChip(pvScale);

  return html`
    <div class="header">
      ${title ? html`<div class="title">${title}</div>` : html`<span></span>`}
      <div class="controls qs-${config.view.quickStyle.replace("_", "-")}">
        ${
          // A period's figures are energies; a mean of them is no view (EM-2):
          // the chip stays, greyed out.
          smoothingChip
        }
        ${note}
        ${energyChip}
        ${scaleChip}
        ${toggle}
      </div>
    </div>
  `;
}
