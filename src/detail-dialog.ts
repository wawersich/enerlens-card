/**
 * The detail window for grid and battery with two sensors (REQ 2.20): one
 * element Home Assistant's dialog manager creates, shows and closes, its
 * content inside HA's own adaptive dialog - a sheet from below on a phone,
 * closed by the back button and Escape, the focus kept inside (DF-2). The
 * chart is HA's own element; the card hands it its figures (G-3, DF-7).
 */
import { LitElement, type PropertyValues, css, html, nothing } from "lit";
import { fetchHistory } from "./averaging";
import { arrowColor, swatchHex } from "./colors";
import { DETAIL_NAME } from "./const";
import {
  type EnergyBar,
  type EnergyRole,
  bucketStart,
  periodEnd,
  periodStart,
  warnTier,
} from "./energy";
import { type EnergyView, firstWeekday, formatDay, timeZoneOf } from "./energy-view";
import { formatEnergy, formatPower, localeFor } from "./format";
import { localize } from "./localize";
import { type DetailNode, arrowsFor, openMoreInfo } from "./render/cross";
import { radioStep } from "./render/header";
import type { Config, DirectionKey, EnergyPeriod, HomeAssistant } from "./types";

/** Sent by a card that leaves the page: its window closes with it (DF-2). */
export const CARD_GONE = "enerlens-card-gone";
/** How long a card may be out of the page before its window closes (DF-2). */
export const CARD_GONE_MS = 500;

/** HA's chart element and how long to wait for it (DF-7); tests change both. */
export const detailSetup = { chartTag: "ha-chart-base", chartWaitMs: 5000 };

/** While open, the figures are asked for again as often as the card does (DF-10). */
const REFRESH_MS = 5 * 60_000;
const HOUR = 3_600_000;
/** A week of raw readings is a lot; the recorder gets its time (DF-4). */
const HISTORY_TIMEOUT_MS = 20_000;

/** The power view's fixed ranges (DF-4), hours back; today starts at midnight. */
type PowerRange = "today" | "24h" | "48h" | "7d";
const POWER_RANGES: Record<PowerRange, number> = { today: 0, "24h": 24, "48h": 48, "7d": 168 };
const RANGE_LABELS: Record<PowerRange, string> = {
  today: "energy.today",
  "24h": "energy.24h",
  "48h": "detail.48h",
  "7d": "energy.7d",
};

type ChartElement = HTMLElement & Record<string, unknown>;

/** The state of charge: measured states, and hourly extremes before them (DF-5). */
interface SocData {
  line: [number, number | null][];
  band: { start: number; min: number; max: number }[];
}

/** What the window asks of the card that opened it. */
export interface DetailCard extends HTMLElement {
  hass?: HomeAssistant;
  detailState(): {
    config: Config;
    period: EnergyPeriod | null;
    periods: EnergyPeriod[];
    /** The consumers the list shows now (DF-18). */
    shown?: string[];
  } | null;
  detailEnergy(period: EnergyPeriod): Promise<EnergyView>;
}

/** What the card hands to the dialog manager (REQ DF-2). */
export interface DetailParams {
  card: DetailCard;
  node: DetailNode;
  /** The target that was tapped: the focus goes back there (DF-2). */
  origin?: HTMLElement;
  /** What the target opened before: the way out when the window cannot (DF-7). */
  entity?: string;
}

/**
 * One series of the window: a sensor, its name and colour, and which way it
 * is drawn - up, or mirrored below zero (DF-3).
 */
interface Series {
  entity: string;
  name: string;
  /** Its colour, a CSS value as configured (DF-6). */
  color: string;
  /** Direction arrow in the header, and its colour (EM-5, C-8). */
  arrow?: string;
  arrowColor?: string;
  sign: 1 | -1;
  /** Which of the card's energy figures it is (DF-3). */
  role: EnergyRole;
}

/** One sensor of a figure the card adds up (PV-3): turned, and 0 when quiet. */
interface Part {
  entity: string;
  invert: boolean;
  /** No reading counts as 0, as the node counts it - else a gap (DF-17). */
  quiet: boolean;
  /** Taken off rather than added: the consumers in the rest (DF-18). */
  minus?: boolean;
}

/** What a window shows (DF-1): its title, its series, a state of charge below. */
interface Plan {
  title: string;
  series: Series[];
  /** The state of charge below the chart (DF-5). */
  soc?: string;
  /**
   * How the series lie: a pair mirrored at zero (DF-3), the parts of a sum
   * stacked (DF-13), or one series that is the card's own sum of `parts` -
   * the corrected house (DF-14).
   */
  layout: "mirrored" | "stacked" | "total" | "single";
  /** The sensors the card adds up to the node's figure (PV-3, DF-17). */
  parts?: Part[];
}

function planOf(
  node: DetailNode,
  config: Config,
  hass?: HomeAssistant,
  shown: string[] = [],
): Plan {
  if (node.startsWith("consumer:")) {
    // Power and the car's charge in one (DF-15): the consumer's own series.
    const consumer = config.consumers.find((c) => `consumer:${c.key}` === node);
    const friendly = consumer
      ? (hass?.states?.[consumer.entity]?.attributes?.friendly_name as string | undefined)
      : undefined;
    const title = consumer?.name ?? friendly ?? consumer?.entity ?? "";
    if (!consumer?.charge) return { title, series: [], layout: "single" };
    return {
      title,
      layout: "single",
      series: [
        { entity: consumer.entity, name: title, color: consumer.color, sign: 1, role: "house" },
      ],
      soc: consumer.charge.soc,
    };
  }
  const title = localize(`node.${node}`, hass);
  const none: Plan = { title, series: [], layout: "mirrored" };
  if (node === "solar") {
    const sources = config.solarSources;
    if (config.sources.solar.kind !== "sum" || sources.length < 2) return none;
    return {
      title,
      layout: "stacked",
      series: sources.map((source) => ({
        entity: source.entity,
        name:
          source.name ??
          (hass?.states?.[source.entity]?.attributes?.friendly_name as string | undefined) ??
          source.entity,
        color: source.color,
        sign: 1,
        role: "solar",
      })),
      parts: sources.map((source) => ({
        entity: source.entity,
        invert: source.invert,
        quiet: true,
      })),
    };
  }
  if (node === "rest") {
    // The house as the node counts it, minus the consumers the list shows -
    // the rest as its row has it (DF-18).
    const house = config.sources.house;
    const title = config.list.restLabel || localize("list.rest", hass);
    if (house.kind !== "single") return { title, series: [], layout: "total" };
    const past = config.solarSources.filter((source) => source.excluded);
    return {
      title,
      layout: "total",
      series: [
        {
          entity: house.entity,
          name: `${title} ${localize("node.derived_suffix", hass)}`,
          // The rest's own colour is a faint list mark; as a line it would
          // hardly show (Markus 27.10.2026: grey).
          color: "var(--secondary-text-color)",
          sign: 1,
          role: "house",
        },
      ],
      parts: [
        { entity: house.entity, invert: house.invert, quiet: false },
        ...past.map((source) => ({ entity: source.entity, invert: source.invert, quiet: true })),
        ...shown.map((entity) => ({ entity, invert: false, quiet: true, minus: true })),
      ],
    };
  }
  if (node === "house") {
    const house = config.sources.house;
    const past = config.solarSources.filter((source) => source.excluded);
    if (house.kind !== "single" || past.length === 0) return none;
    return {
      title,
      layout: "total",
      series: [
        {
          entity: house.entity,
          name: `${title} ${localize("node.derived_suffix", hass)}`,
          color: config.colors.house,
          sign: 1,
          role: "house",
        },
      ],
      parts: [
        { entity: house.entity, invert: house.invert, quiet: false },
        ...past.map((source) => ({ entity: source.entity, invert: source.invert, quiet: true })),
      ],
    };
  }
  const spec = node === "grid" ? config.sources.grid : config.sources.battery;
  if (spec.kind !== "split") return none;
  const arrows = arrowsFor(config.layout);
  const [up, down] =
    node === "grid" ? (["import", "export"] as const) : (["discharge", "charge"] as const);
  const side = (role: typeof up | typeof down, entity: string, sign: 1 | -1): Series => {
    const key = (node === "grid" ? `grid_${role}` : `battery_${role}`) as DirectionKey;
    return {
      entity,
      name: localize(`detail.${role}`, hass),
      color: config.colors[key],
      arrow: arrows[role],
      arrowColor: arrowColor(config, key),
      sign,
      role,
    };
  };
  return {
    title,
    layout: "mirrored",
    series: [side(up, spec.positive, 1), side(down, spec.negative, -1)],
    soc: node === "battery" ? config.sources.batterySoc : undefined,
  };
}

/**
 * Readings as a stepped line: each holds until the next, the first from the
 * start of the range, the last up to now; an unavailable one is a gap.
 */
function held(
  samples: { t: number; v: number | null }[],
  from: number,
  now: number,
  scale: (v: number) => number,
): [number, number | null][] {
  const points = samples.map((s): [number, number | null] => [
    Math.max(s.t, from),
    s.v === null ? null : scale(s.v),
  ]);
  const last = points.at(-1);
  if (last && last[0] < now) points.push([now, last[1]]);
  return points;
}

/**
 * The state of charge as measured. Where the history no longer reaches (the
 * recorder keeps ten days by default), the hours before it as a band of their
 * smallest and largest value - measured extremes, never a mean (DF-5, ENT-13).
 */
async function socData(
  hass: HomeAssistant,
  entity: string,
  from: number,
  now: number,
  /** Hours, or days beside daily bars: hourly extremes over a month read as hairlines. */
  step: "hour" | "day" = "hour",
): Promise<SocData> {
  const history = await fetchHistory(
    hass,
    [entity],
    Math.ceil((now - from) / 60_000),
    HISTORY_TIMEOUT_MS,
  );
  const line = held(history[entity] ?? [], from, now, (v) => v);
  const first = line[0]?.[0] ?? now;
  if (first - from <= HOUR) return { line, band: [] };
  const stats = (await hass.callWS({
    type: "recorder/statistics_during_period",
    start_time: new Date(from).toISOString(),
    end_time: new Date(first).toISOString(),
    statistic_ids: [entity],
    period: step,
    types: ["min", "max"],
  })) as Record<string, { start: number; min: number | null; max: number | null }[]>;
  const band = (stats?.[entity] ?? [])
    .filter((r) => r.min !== null && r.max !== null && r.start < first)
    .map((r) => ({ start: r.start, min: r.min as number, max: r.max as number }));
  return { line, band };
}

/**
 * A tooltip of several lines. HA's chart renders what a formatter returns
 * with Lit, so a string's <br> would show as text - a template is needed.
 */
function tipLines(lines: string[]) {
  return html`${lines.map((line, i) => (i === 0 ? html`${line}` : html`<br />${line}`))}`;
}

/** One five-minute row of HA's statistics, in watts. */
interface StatRow5 {
  start: number;
  mean: number | null;
  min: number | null;
  max: number | null;
}

/** Five-minute mean, min and max per entity, in watts whatever the unit (DF-4). */
async function fiveMinutes(
  hass: HomeAssistant,
  ids: string[],
  from: number,
  now: number,
): Promise<Record<string, StatRow5[]>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error("EnerLens: five-minute statistics did not answer")),
      HISTORY_TIMEOUT_MS,
    );
  });
  try {
    const answer = await Promise.race([
      hass.callWS<Record<string, StatRow5[]>>({
        type: "recorder/statistics_during_period",
        start_time: new Date(from).toISOString(),
        end_time: new Date(now).toISOString(),
        statistic_ids: ids,
        period: "5minute",
        types: ["mean", "min", "max"],
        units: { power: "W" },
      }),
      timeout,
    ]);
    return answer ?? {};
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The mean of a figure the card adds up over a period, as the node takes it:
 * each sensor turned, a quiet one 0, a missing other one no figure (PV-3).
 */
function totalMean(parts: Part[], view?: EnergyView): number | null | undefined {
  if (!view) return undefined;
  let sum = 0;
  let known = false;
  for (const part of parts) {
    const mean = view.meanW(part.entity);
    if (mean === null) {
      if (part.quiet) continue;
      return null;
    }
    if (!part.minus) known = true;
    const own = part.invert ? -mean : mean;
    sum += part.minus ? -own : own;
  }
  // No source known at all: no figure, as the node shows none (PV-2).
  return known ? sum : null;
}

/** A part's mean in the card's sign: turned where it is inverted (PV-2). */
function turned(entity: string, parts: Part[] | undefined, view?: EnergyView) {
  const mean = view?.meanW(entity);
  if (mean === null || mean === undefined) return mean;
  return parts?.find((part) => part.entity === entity)?.invert ? -mean : mean;
}

/** A mean over the period as its energy, as the card writes it (EM-5). */
function energyOf(mean: number | null | undefined, view: EnergyView, hass: HomeAssistant) {
  return mean === null || mean === undefined
    ? "—"
    : formatEnergy(Math.max(0, mean * view.hours), hass);
}

export class EnerLensDetail extends LitElement {
  /** Set by HA's dialog manager, which keeps it current. */
  hass?: HomeAssistant;
  private _params?: DetailParams;
  private _open = false;
  private _period: EnergyPeriod | null = null;
  /** Opened in the power view: its own ranges (DF-4). */
  private _power = false;
  /** The last 24 hours first, as HA's own history (DF-4, Markus 27.10.2026). */
  private _range: PowerRange = "24h";
  private _view?: EnergyView;
  private _busy = false;
  private _ticket = 0;
  /**
   * The consumers the list showed when the figures were asked for: fetch,
   * drawing and header all take the rest from the same selection (DF-18).
   */
  private _shown: string[] = [];
  /** Whether anything was drawn yet: a later failure keeps it up (DF-7). */
  private _loaded = false;
  private _chart?: ChartElement;
  private _socChart?: ChartElement;
  /** What is drawn, kept to draw again in another theme (DF-6). */
  private _drawn?: {
    period: EnergyPeriod | null;
    range: PowerRange;
    power?: { range: { from: number; to: number }; rows: Record<string, StatRow5[]> };
    soc?: { data: SocData; min: number; max: number };
  };
  /** The theme it was drawn in. */
  private _dark?: boolean;
  /** Opening more-info once the window is closed, the focus left to it (DF-7). */
  private _giveWayTo?: string;
  private _timer?: ReturnType<typeof setInterval>;

  static properties = {
    hass: { attribute: false },
    _params: { state: true },
    _open: { state: true },
    _period: { state: true },
    _range: { state: true },
    _view: { state: true },
    _busy: { state: true },
  };

  static styles = css`
    ha-adaptive-dialog {
      /* Room for a day of hourly bars (DF-3); a phone gets the sheet. */
      --ha-dialog-width-md: 760px;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      font: inherit;
      font-size: 13px;
      min-height: 32px;
      padding: 0 12px;
      border-radius: 16px;
      border: 1px solid var(--divider-color);
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .chip[aria-checked="true"] {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }
    .sums {
      display: flex;
      flex-wrap: wrap;
      column-gap: 20px;
    }
    .sum {
      font: inherit;
      font-size: 15px;
      background: none;
      border: none;
      padding: 4px 0;
      color: var(--primary-text-color);
      cursor: pointer;
      /* Arrow, name and figure stay together on a narrow screen (DF-11). */
      white-space: nowrap;
    }
    .sum b {
      font-weight: 500;
    }
    .sum.total {
      cursor: default;
    }
    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      margin-right: 6px;
    }
    .sum.warn1 b {
      color: var(--el-warn1, #6b8aa6);
    }
    .sum.warn2 b,
    .late {
      color: var(--el-warn2, #c77c02);
    }
    .late {
      font-size: 13px;
    }
    .note {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    /* As big as the header's entries: it is a link like them (Markus 27.10.2026). */
    .soc-name {
      align-self: flex-start;
    }
    .charts {
      display: flex;
      flex-direction: column;
      min-height: 300px;
      transition: opacity 0.15s 0.15s;
    }
    .charts.busy,
    .sums.busy {
      opacity: 0.5;
    }
    .sums {
      transition: opacity 0.15s 0.15s;
    }
    .chart {
      display: block;
    }
    .loading {
      width: 32px;
      height: 32px;
      margin: 120px auto;
      border-radius: 50%;
      border: 3px solid var(--divider-color);
      border-top-color: var(--primary-color);
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  async showDialog(params: DetailParams): Promise<void> {
    // The manager reuses this element: nothing of a window before stays.
    clearInterval(this._timer);
    this._params = params;
    this._open = true;
    this._view = undefined;
    this._chart = undefined;
    this._socChart = undefined;
    this._drawn = undefined;
    this._busy = false;
    this._giveWayTo = undefined;
    this._loaded = false;
    window.addEventListener(CARD_GONE, this._onCardGone);
    const state = params.card.detailState();
    this._period = state?.period ?? null;
    this._power = this._period === null;
    this._range = "24h";
    void this._load();
    this._timer = setInterval(() => void this._load(), REFRESH_MS);
    await this.updateComplete;
  }

  private _onCardGone = (ev: Event): void => {
    if ((ev as CustomEvent).detail === this._params?.card) this.closeDialog();
  };

  /** Asked by the manager, e.g. for the back button. */
  closeDialog(): boolean {
    this._open = false;
    // Without HA's element nothing would report the close (tests, an old HA).
    if (!customElements.get("ha-adaptive-dialog")) this._closed();
    return true;
  }

  private _closed(): void {
    const params = this._params;
    if (!params) return;
    const origin = params.origin;
    window.removeEventListener(CARD_GONE, this._onCardGone);
    clearInterval(this._timer);
    this._timer = undefined;
    this._ticket++;
    this._params = undefined;
    this._open = false;
    this.dispatchEvent(
      new CustomEvent("dialog-closed", {
        detail: { dialog: DETAIL_NAME },
        bubbles: true,
        composed: true,
      }),
    );
    const giveWayTo = this._giveWayTo;
    this._giveWayTo = undefined;
    // Giving way: more-info after the close, and the focus stays with it.
    if (giveWayTo) openMoreInfo(params.card, giveWayTo);
    else origin?.focus();
  }

  private get _hass(): HomeAssistant | undefined {
    return this.hass ?? this._params?.card.hass;
  }

  /**
   * HA loads its chart element with its own charts. One hidden statistics
   * card pulls it in; without it in time, the window gives way (DF-7).
   */
  private async _chartReady(): Promise<boolean> {
    const tag = detailSetup.chartTag;
    if (customElements.get(tag)) return true;
    if (tag === "ha-chart-base") this._pullChart().catch((error) => console.warn(error));
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        customElements.whenDefined(tag).then(() => true),
        new Promise<boolean>((resolve) => {
          timer = setTimeout(() => resolve(false), detailSetup.chartWaitMs);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  private async _pullChart(): Promise<void> {
    const helpers = await (
      window as unknown as {
        loadCardHelpers?: () => Promise<{ createCardElement: (c: unknown) => HTMLElement }>;
      }
    ).loadCardHelpers?.();
    const params = this._params;
    const state = params?.card.detailState();
    const entity =
      params?.entity ??
      (params && state ? planOf(params.node, state.config).series[0]?.entity : undefined);
    if (!helpers || !entity) return;
    const probe = helpers.createCardElement({
      type: "statistics-graph",
      entities: [entity],
      days_to_show: 1,
    }) as HTMLElement & { hass?: HomeAssistant };
    probe.hass = this._hass;
    probe.style.display = "none";
    this.renderRoot.appendChild(probe);
    await customElements.whenDefined("ha-chart-base");
    probe.remove();
  }

  /** The window cannot draw: the entity the target opened before (DF-7). */
  private _giveWay(): void {
    const params = this._params;
    if (!params) return;
    this._giveWayTo = params.entity;
    this.closeDialog();
  }

  /** Fetches the period shown; a later tap wins over a slower answer (DF-10). */
  private async _load(dim = false): Promise<void> {
    const params = this._params;
    const hass = this._hass;
    const state = params?.card.detailState();
    if (!params || !hass || !state) return;
    const ticket = ++this._ticket;
    const current = () => ticket === this._ticket;
    // Dimmed while another period loads - not at the five-minute refresh (DF-10).
    if (dim) this._busy = true;
    try {
      // HA's chart element and the figures load at the same time: after a
      // reload the element comes only with the first chart (Markus: "leere
      // Seite", then the curves).
      const energy = !this._power && this._period;
      const range = this._powerRange(hass);
      this._shown = state.shown ?? [];
      const plan = planOf(params.node, state.config, hass, this._shown);
      const figures = energy
        ? params.card.detailEnergy(energy)
        : fiveMinutes(
            hass,
            (plan.parts ?? plan.series).map((s) => s.entity),
            range.from,
            Date.now(),
          );
      // Not left unhandled while the chart element is waited for.
      figures.catch(() => undefined);
      const ready = await this._chartReady();
      if (!current()) return;
      if (!ready) {
        this._giveWay();
        return;
      }
      // The axis the state of charge follows: the bars', half a bar wider on
      // each side as the chart draws bars, or the power chart's (DF-5).
      let axis: { from: number; to: number; min: number; max: number } | undefined;
      let step: "hour" | "day" = "hour";
      const drawn: NonNullable<typeof this._drawn> = { period: this._period, range: this._range };
      if (energy) {
        const view = (await figures) as EnergyView;
        if (!current()) return;
        // A consumer's power without statistics: its more-info, not an empty window (DF-15).
        if (
          !this._loaded &&
          plan.layout === "single" &&
          view.meanW(plan.series[0]?.entity ?? "") === null
        ) {
          this._giveWay();
          return;
        }
        this._view = view;
        this._drawEnergy(view);
        const d = view.detail;
        if (d) {
          const half = (d.step === "hour" ? HOUR : 24 * HOUR) / 2;
          axis = { from: d.axisFrom, to: d.axisTo, min: d.axisFrom - half, max: d.axisTo + half };
          step = d.step;
        }
      } else {
        const rows = (await figures) as Record<string, StatRow5[]>;
        if (!current()) return;
        if (
          !this._loaded &&
          plan.layout === "single" &&
          !rows[plan.series[0]?.entity ?? ""]?.length
        ) {
          this._giveWay();
          return;
        }
        drawn.power = { range, rows };
        this._drawPower(range, rows);
        axis = { ...range, min: range.from, max: range.to };
      }
      const soc = plan.soc;
      if (soc && axis) {
        const data = await socData(hass, soc, axis.from, Math.min(axis.to, Date.now()), step);
        if (!current()) return;
        drawn.soc = { data, min: axis.min, max: axis.max };
        this._drawSoc(data, axis.min, axis.max);
      }
      this._drawn = drawn;
      this._loaded = true;
      this._renew = false;
      this._renewed.clear();
    } catch (error) {
      console.warn(error);
      // The first answer failed: nothing to show, more-info instead (DF-7).
      if (current() && !this._loaded) this._giveWay();
      // A later one: the chips go back to what is still shown, so they never
      // name a period whose figures are not there (DF-3).
      else if (current() && this._drawn) {
        this._period = this._drawn.period;
        this._range = this._drawn.range;
        this._renew = false;
        this._renewed.clear();
      }
    } finally {
      if (current()) this._busy = false;
    }
  }

  private _pick(period: EnergyPeriod): void {
    if (period === this._period) return;
    this._period = period;
    this._renew = true;
    this._renewed.clear();
    void this._load(true);
  }

  private _pickRange(range: PowerRange): void {
    if (range === this._range) return;
    this._range = range;
    this._renew = true;
    this._renewed.clear();
    void this._load(true);
  }

  /**
   * Another period gets new chart elements: handed new figures, the chart
   * would morph thousands of old points into the new ones (Markus: "eine
   * seltsame verzerrte Darstellung"). The old ones stay until then (DF-10).
   */
  private _renew = false;
  private _renewed = new Set<string>();

  /** Today from midnight to midnight, the others back from now (DF-4). */
  private _powerRange(hass: HomeAssistant): { from: number; to: number } {
    const now = Date.now();
    if (this._range !== "today") return { from: now - POWER_RANGES[this._range] * HOUR, to: now };
    const tz = timeZoneOf(hass);
    const from = periodStart("today", now, tz, firstWeekday(hass));
    return { from, to: periodEnd("today", from, now, tz) };
  }

  /**
   * The two sensors as Home Assistant's own history shows power: the
   * five-minute mean as a line, the band from the smallest to the largest
   * reading around it - so no peak gets lost (DF-4, Markus 26.10.2026). The
   * second side below zero; the recorder hands watts whatever the unit (K-8).
   */
  private _drawPower(range: { from: number; to: number }, rows: Record<string, StatRow5[]>): void {
    const params = this._params;
    const hass = this._hass;
    const state = params?.card.detailState();
    if (!params || !hass || !state) return;
    const plan = planOf(params.node, state.config, hass, this._shown);
    if (plan.layout === "total" && plan.parts) {
      this._drawTotal(plan, plan.parts, range, rows);
      return;
    }
    if (plan.layout === "stacked" && plan.parts) {
      this._drawStacked(plan, plan.parts, range, rows);
      return;
    }
    const sides = plan.series;
    const power = state.config.power;
    const watts = (v: number) => formatPower(Math.abs(v), hass, power);
    const series = sides.flatMap((side) => {
      const own = rows[side.entity] ?? [];
      const color = this._paint(side.color);
      // Mirrored, the band's lower edge is the largest reading.
      const signed = (v: number) => (v === 0 ? 0 : side.sign * v);
      const low = (r: StatRow5) =>
        r.min === null || r.max === null ? null : side.sign > 0 ? r.min : signed(r.max);
      const band = { stack: `band-${side.role}`, stackStrategy: "all", showSymbol: false };
      return [
        {
          ...band,
          name: `${side.role}-low`,
          type: "line",
          lineStyle: { opacity: 0 },
          data: own.map((r) => [r.start, low(r)]),
        },
        {
          ...band,
          name: `${side.role}-span`,
          type: "line",
          lineStyle: { opacity: 0 },
          areaStyle: { color, opacity: 0.2 },
          data: own.map((r) => [r.start, r.min === null || r.max === null ? null : r.max - r.min]),
        },
        {
          id: side.entity,
          name: side.name,
          type: "line",
          showSymbol: false,
          lineStyle: { width: 1.5 },
          itemStyle: { color },
          data: own.map((r) => [r.start, r.mean === null ? null : signed(r.mean)]),
        },
      ];
    });
    const chart = this._chartFor("_chart", "power");
    chart.options = {
      xAxis: { type: "time", min: range.from, max: range.to },
      yAxis: { type: "value", axisLabel: { formatter: watts } },
      legend: { show: false },
      grid: { left: 64, right: 16, top: 16, bottom: 28, containLabel: false },
      tooltip: {
        trigger: "axis",
        // Inside the chart: the dialog's edge cuts off what reaches past it.
        confine: true,
        // Each side as its mean and its range, not as the stacked band (DF-4).
        formatter: (raw: unknown) => {
          const points = (Array.isArray(raw) ? raw : [raw]) as {
            seriesName: string;
            value: [number, number | null];
            axisValueLabel?: string;
          }[];
          const at = (name: string) => points.find((p) => p.seriesName === name)?.value[1];
          const lines = sides.map((side) => {
            const mean = at(side.name);
            const low = at(`${side.role}-low`);
            const span = at(`${side.role}-span`);
            if (mean === undefined || mean === null) return `${side.name}: —`;
            if (low === undefined || low === null || span === undefined || span === null) {
              return `${side.name}: ${watts(mean)}`;
            }
            // Smallest first, also on the mirrored side.
            const [a, b] = [Math.abs(low), Math.abs(low + span)].sort((x, y) => x - y);
            return `${side.name}: ${watts(mean)} (${watts(a)} – ${watts(b)})`;
          });
          return tipLines([points[0]?.axisValueLabel ?? "", ...lines]);
        },
      },
    };
    chart.data = series;
    this.requestUpdate();
  }

  /**
   * The parts of a sum stacked, each its five-minute mean turned as the card
   * turns it, a quiet one 0 - their top the node's figure - and the sum as a
   * thin grey line (DF-13, Markus: "mit dünner grauen Summenlinie"). No band.
   */
  private _drawStacked(
    plan: Plan,
    parts: Part[],
    range: { from: number; to: number },
    rows: Record<string, StatRow5[]>,
  ): void {
    const hass = this._hass;
    const state = this._params?.card.detailState();
    if (!hass || !state) return;
    const means = parts.map(
      (part) => new Map((rows[part.entity] ?? []).map((r) => [r.start, r.mean])),
    );
    const starts = [...new Set(means.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
    const own = parts.map((part, i) =>
      starts.map((t) => {
        const v = means[i].get(t);
        return v === undefined || v === null ? 0 : part.invert ? -v : v;
      }),
    );
    const watts = (v: number) => formatPower(Math.abs(v), hass, state.config.power);
    const grey = this._paint("var(--secondary-text-color)");
    const chart = this._chartFor("_chart", "power");
    chart.options = {
      xAxis: { type: "time", min: range.from, max: range.to },
      yAxis: { type: "value", axisLabel: { formatter: watts } },
      legend: { show: false },
      grid: { left: 64, right: 16, top: 16, bottom: 28, containLabel: false },
      tooltip: {
        trigger: "axis",
        confine: true,
        // In its sign: a source's standby below zero shows as such.
        valueFormatter: (v: unknown) =>
          typeof v === "number" ? `${v < 0 ? "−" : ""}${watts(v)}` : "—",
      },
    };
    chart.data = [
      ...plan.series.map((side, i) => {
        const color = this._paint(side.color);
        return {
          id: side.entity,
          name: side.name,
          type: "line",
          stack: "pv",
          showSymbol: false,
          lineStyle: { width: 0 },
          itemStyle: { color },
          areaStyle: { color, opacity: 0.85 },
          data: starts.map((t, k) => [t, own[i][k]]),
        };
      }),
      {
        id: "sum",
        name: plan.title,
        type: "line",
        showSymbol: false,
        z: 10,
        lineStyle: { width: 0.8, color: grey },
        itemStyle: { color: grey },
        data: starts.map((t, k) => [t, own.reduce((sum, v) => sum + v[k], 0)]),
      },
    ];
    this.requestUpdate();
  }

  /**
   * A figure the card adds up, as one line: each five minutes the parts'
   * means, turned as the card turns them, a quiet part 0 - as the node counts
   * it (DF-14, DF-17). No band: the span of a sum cannot be told from the
   * spans of its parts.
   */
  private _drawTotal(
    plan: Plan,
    parts: Part[],
    range: { from: number; to: number },
    rows: Record<string, StatRow5[]>,
  ): void {
    const hass = this._hass;
    const state = this._params?.card.detailState();
    const own = plan.series[0];
    if (!hass || !state || !own) return;
    const means = parts.map(
      (part) => new Map((rows[part.entity] ?? []).map((r) => [r.start, r.mean])),
    );
    const starts = [...new Set(means.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
    const data = starts.map((t): [number, number | null] => {
      let sum = 0;
      for (const [i, part] of parts.entries()) {
        const v = means[i].get(t);
        if (v === undefined || v === null) {
          if (part.quiet) continue;
          return [t, null];
        }
        const own = part.invert ? -v : v;
        sum += part.minus ? -own : own;
      }
      return [t, sum];
    });
    const watts = (v: number) => formatPower(Math.abs(v), hass, state.config.power);
    const color = this._paint(own.color);
    const chart = this._chartFor("_chart", "power");
    chart.options = {
      xAxis: { type: "time", min: range.from, max: range.to },
      yAxis: { type: "value", axisLabel: { formatter: watts } },
      legend: { show: false },
      grid: { left: 64, right: 16, top: 16, bottom: 28, containLabel: false },
      tooltip: {
        trigger: "axis",
        confine: true,
        // In its sign: a source's standby below zero shows as such.
        valueFormatter: (v: unknown) =>
          typeof v === "number" ? `${v < 0 ? "−" : ""}${watts(v)}` : "—",
      },
    };
    chart.data = [
      {
        id: own.entity,
        name: own.name,
        type: "line",
        showSymbol: false,
        // A line in the node's colour, as grid and battery draw their means
        // (Markus 27.10.2026: "keine Füllung unter der Kurve").
        lineStyle: { width: 1.5 },
        itemStyle: { color },
        data,
      },
    ];
    this.requestUpdate();
  }

  /** The state of charge in a chart of its own below, on the same axis (DF-5). */
  private _drawSoc(data: SocData, min: number, max: number): void {
    const hass = this._hass;
    if (!hass) return;
    const name = localize("detail.soc", hass);
    const line = this._paint("var(--secondary-text-color)");
    const fill = this._paint("var(--divider-color)");
    const percent = (v: number) => `${Math.round(v)} %`;
    const series: Record<string, unknown>[] = [];
    if (data.band.length > 0) {
      // Lower edge, then the span above it, stacked: the area between is the
      // hour's range - measured extremes, never a mean (ENT-13).
      series.push(
        {
          name: "min",
          type: "line",
          stack: "band",
          step: "end",
          showSymbol: false,
          lineStyle: { opacity: 0 },
          data: data.band.map((b) => [b.start, b.min]),
        },
        {
          name: "max",
          type: "line",
          stack: "band",
          step: "end",
          showSymbol: false,
          lineStyle: { opacity: 0 },
          areaStyle: { color: line, opacity: 0.25 },
          data: data.band.map((b) => [b.start, b.max - b.min]),
        },
      );
    }
    series.push({
      name,
      type: "line",
      step: "end",
      showSymbol: false,
      lineStyle: { width: 1.5, color: line },
      itemStyle: { color: line },
      areaStyle: { color: fill, opacity: 0.6 },
      data: data.line,
    });
    const chart = this._chartFor("_socChart", "soc");
    chart.height = "160px";
    chart.options = {
      xAxis: { type: "time", min, max },
      yAxis: { type: "value", min: 0, max: 100, interval: 50, axisLabel: { formatter: percent } },
      legend: { show: false },
      grid: { left: this._power ? 64 : 48, right: 16, top: 12, bottom: 28, containLabel: false },
      tooltip: {
        trigger: "axis",
        // Inside the chart: the dialog's edge cuts off what reaches past it.
        confine: true,
        // The band reads as its range, not as the stacked span (DF-5).
        formatter: (raw: unknown) => {
          const points = (Array.isArray(raw) ? raw : [raw]) as {
            seriesName: string;
            value: [number, number | null];
            axisValueLabel?: string;
          }[];
          const low = points.find((p) => p.seriesName === "min")?.value[1];
          const span = points.find((p) => p.seriesName === "max")?.value[1];
          const own = points.find((p) => p.seriesName === name)?.value[1];
          const value =
            own !== undefined && own !== null
              ? percent(own)
              : low !== undefined && low !== null && span !== undefined && span !== null
                ? `${percent(low)} – ${percent(low + span)}`
                : "—";
          return tipLines([points[0]?.axisValueLabel ?? "", `${name}: ${value}`]);
        },
      },
    };
    chart.data = series;
    this.requestUpdate();
  }

  /** The chart element of a slot, made once and then only given new figures. */
  private _chartFor(slot: "_chart" | "_socChart", kind: string): ChartElement {
    if (this._renew && !this._renewed.has(slot)) {
      this._renewed.add(slot);
      this[slot] = undefined;
    }
    const chart = this[slot] ?? (document.createElement(detailSetup.chartTag) as ChartElement);
    chart.className = `chart ${kind}`;
    chart.hass = this._hass;
    chart.height = "300px";
    this[slot] = chart;
    return chart;
  }

  /** A colour as the canvas needs it - the browser resolves the theme (DF-6). */
  private _paint(value: string): string {
    const probe = document.createElement("span");
    probe.style.color = value;
    this.renderRoot.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    if (resolved && !resolved.includes("var(")) return resolved;
    return swatchHex(value) ?? value;
  }

  private _drawEnergy(view: EnergyView): void {
    const params = this._params;
    const hass = this._hass;
    const state = params?.card.detailState();
    const detail = view.detail;
    if (!params || !hass || !state || !detail) return;
    const tz = timeZoneOf(hass);
    const plan = planOf(params.node, state.config, hass, this._shown);
    const sides = plan.series;
    // The card's own sum, bucket by bucket: the house's bars and those of the
    // sources past its meter, already turned (DF-14, DF-17).
    const barsOf = (side: Series): EnergyBar[] => {
      if (plan.layout === "stacked" || plan.layout === "single") {
        return detail.entityBars[side.entity] ?? [];
      }
      if (plan.layout !== "total" || !plan.parts) return detail.bars[side.role] ?? [];
      const sum = new Map<number, EnergyBar>();
      // Buckets the house has a bar for: elsewhere a gap, never a bar of the
      // other parts alone (DF-8, DF-18).
      let held: Set<number> | undefined;
      for (const part of plan.parts) {
        const found =
          part.entity === side.entity ? detail.bars[side.role] : detail.entityBars[part.entity];
        // The house without statistics: no bars, as its figure is "—" (DF-8).
        if (!found && !part.quiet) return [];
        const own = found ?? [];
        if (!part.quiet) held = new Set(own.map((bar) => bar.start));
        for (const bar of own) {
          const was = sum.get(bar.start);
          sum.set(bar.start, {
            start: bar.start,
            wh: (was?.wh ?? 0) + (part.minus ? -bar.wh : bar.wh),
            filledShare: Math.max(was?.filledShare ?? 0, bar.filledShare),
          });
        }
      }
      return [...sum.values()].filter((bar) => !held || held.has(bar.start));
    };
    // Every bucket of the axis, the ones without figures empty: a single bar
    // would otherwise make the chart widen its axis around it.
    const starts: number[] = [];
    for (let t = detail.axisFrom; t < detail.axisTo; ) {
      starts.push(t);
      t = detail.step === "hour" ? t + HOUR : bucketStart(t + 36 * HOUR, "day", tz);
    }
    const series = sides.map((side) => {
      const bars = new Map<number, EnergyBar>(barsOf(side).map((b) => [b.start, b]));
      return {
        id: side.entity,
        name: side.name,
        type: "bar",
        stack: "pair",
        barMaxWidth: 28,
        itemStyle: { color: this._paint(side.color), borderRadius: 2 },
        data: starts.map((t, i) => {
          const bar = bars.get(t);
          const middle = t + ((starts[i + 1] ?? detail.axisTo) - t) / 2;
          if (!bar) return [middle, null];
          // A pair's halves never below zero, as the card shows them (model,
          // A-2); anything else as it is, or the bars would no longer add up
          // to the figure above them (DF-17).
          const wh = plan.layout === "mirrored" ? Math.max(0, bar.wh) : bar.wh;
          const point: [number, number] = [middle, (side.sign * wh) / 1000];
          // Filled in from neighbouring values: paler, as the node's warning (EM-11).
          return warnTier(bar.filledShare) > 0
            ? { value: point, itemStyle: { opacity: 0.45 } }
            : point;
        }),
      };
    });
    // HA's number format, as the totals above (DF-12).
    const format = new Intl.NumberFormat(localeFor(hass), { maximumFractionDigits: 1 });
    const number = (v: number) => format.format(Math.abs(v));
    const chart = this._chartFor("_chart", "energy");
    chart.options = {
      xAxis: { type: "time", min: detail.axisFrom, max: detail.axisTo },
      yAxis: { type: "value", name: "kWh", axisLabel: { formatter: number } },
      legend: { show: false },
      grid: { left: 48, right: 16, top: 32, bottom: 28, containLabel: false },
      tooltip: {
        trigger: "axis",
        // Inside the chart: the dialog's edge cuts off what reaches past it.
        confine: true,
        valueFormatter: (v: unknown) =>
          typeof v === "number" ? formatEnergy(Math.abs(v) * 1000, hass) : "",
      },
    };
    chart.data = series;
    this.requestUpdate();
  }

  /** Another theme while open: the same figures in its colours (DF-6). */
  protected updated(changed: PropertyValues): void {
    if (!changed.has("hass")) return;
    const dark = (this.hass?.themes as { darkMode?: boolean } | undefined)?.darkMode;
    const before = this._dark;
    this._dark = dark;
    if (before === undefined || before === dark || !this._drawn) return;
    const drawn = this._drawn;
    if (drawn.power) this._drawPower(drawn.power.range, drawn.power.rows);
    else if (this._view) this._drawEnergy(this._view);
    if (drawn.soc) this._drawSoc(drawn.soc.data, drawn.soc.min, drawn.soc.max);
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    return changed.has("_params") || changed.has("_open") || this._params !== undefined;
  }

  private _chips<T extends string>(
    keys: T[],
    chosen: T | null,
    label: (key: T) => string,
    pick: (key: T) => void,
  ) {
    const hass = this._hass;
    if (keys.length < 2) return nothing;
    // A radio group like the quick buttons: one tab stop, arrows, Home/End (QB-14).
    const step = (ev: KeyboardEvent, index: number) => {
      const to = radioStep(ev.key, index, keys.length);
      if (to < 0) return;
      ev.preventDefault();
      const group = (ev.currentTarget as HTMLElement).parentElement;
      pick(keys[to]);
      setTimeout(() => group?.querySelectorAll<HTMLElement>('[role="radio"]')[to]?.focus(), 0);
    };
    const checked = Math.max(0, chosen === null ? 0 : keys.indexOf(chosen));
    return html`<div class="chips" role="radiogroup" aria-label=${localize("detail.periods", hass)}>
      ${keys.map(
        (key, i) => html`<button
          class="chip"
          role="radio"
          aria-checked=${key === chosen ? "true" : "false"}
          tabindex=${i === checked ? 0 : -1}
          @click=${() => pick(key)}
          @keydown=${(ev: KeyboardEvent) => step(ev, i)}
        >${label(key)}</button>`,
      )}
    </div>`;
  }

  private _renderContent(state: NonNullable<ReturnType<DetailCard["detailState"]>>) {
    const params = this._params;
    const hass = this._hass;
    if (!params || !hass) return nothing;
    const view = this._power ? undefined : this._view;
    const plan = planOf(params.node, state.config, hass, this._shown);
    const sides = plan.series;
    const marks = view?.marks.roles;
    const soc = plan.soc;
    const more = (entity: string) => (ev: Event) =>
      openMoreInfo(ev.currentTarget as EventTarget, entity);
    return html`
      ${
        this._power
          ? this._chips(
              Object.keys(POWER_RANGES) as PowerRange[],
              this._range,
              (r) => localize(RANGE_LABELS[r], hass),
              (r) => this._pickRange(r),
            )
          : this._chips(
              state.periods,
              this._period,
              (p) => localize(`energy.${p}`, hass),
              (p) => this._pick(p),
            )
      }
      <div class="sums ${this._busy ? "busy" : ""}">
        ${
          // The parts' sum first: the node's figure (DF-16).
          plan.layout === "stacked" && plan.parts
            ? html`<span class="sum total ${
                marks?.solar && marks.solar.tier > 0 ? `warn${marks.solar.tier}` : ""
              }"
                title=${marks?.solar?.note ?? ""}
                >${plan.title}${
                  view
                    ? html` <b>${energyOf(totalMean(plan.parts, view), view, hass)}</b>`
                    : nothing
                }</span
              >`
            : nothing
        }
        ${sides.map((side) => {
          // The power view names the sides; a period adds its totals (DF-3, DF-9).
          const mean =
            plan.layout === "total" && plan.parts
              ? totalMean(plan.parts, view)
              : plan.layout === "stacked"
                ? turned(side.entity, plan.parts, view)
                : view?.meanW(side.entity);
          const figure = this._power
            ? undefined
            : view && mean !== null && mean !== undefined
              ? formatEnergy(Math.max(0, mean * view.hours), hass)
              : "—";
          // A source's own warning, not the sum's (EM-11).
          const mark =
            plan.layout === "stacked" || plan.layout === "single"
              ? view?.marks.consumers[side.entity]
              : // The rest's own warning, as its row shows it (EM-11).
                params.node === "rest"
                ? view?.marks.rest
                : marks?.[side.role];
          // The card's own sum: no entity carries it, so no link - the raw
          // sensor's would show another figure (DF-14, Markus 27.10.2026).
          if (plan.layout === "total") {
            return html`<span
              class="sum total ${mark && mark.tier > 0 ? `warn${mark.tier}` : ""}"
              title=${mark?.note ?? ""}
              >${side.name}${figure ? html` <b>${figure}</b>` : nothing}</span
            >`;
          }
          return html`<button
            class="sum ${mark && mark.tier > 0 ? `warn${mark.tier}` : ""}"
            title=${mark?.note ?? ""}
            aria-label=${localize("detail.open", hass, {
              name: figure ? `${side.name} ${figure}` : side.name,
            })}
            @click=${more(side.entity)}
          >${
            side.arrow
              ? html`<span style="color:${side.arrowColor}">${side.arrow}</span> `
              : plan.layout === "stacked"
                ? html`<span class="swatch" style="background:${side.color}"></span>`
                : nothing
          }${side.name}${figure ? html` <b>${figure}</b>` : nothing}</button>`;
        })}
      </div>
      ${
        // Says what the line is: a mean, its band the readings around it (DF-4).
        this._power
          ? html`<div class="note">${localize(plan.layout === "mirrored" || plan.layout === "single" ? "detail.aggregation" : "detail.mean", hass)}</div>`
          : nothing
      }
      ${
        view?.lateStart
          ? html`<div class="late">
            ${localize("energy.late", hass, {
              date: formatDay(view.from, hass, view.detail?.step === "hour"),
            })}
          </div>`
          : nothing
      }
      <div class="charts ${this._busy ? "busy" : ""}">
        ${
          // Until the first chart is there: something is coming (DF-10).
          this._chart ?? html`<div class="loading" role="progressbar" aria-busy="true"></div>`
        }
        ${
          soc && this._socChart
            ? html`<button
                class="sum soc-name"
                aria-label=${localize("detail.open", hass, { name: localize("detail.soc", hass) })}
                @click=${more(soc)}
              >${localize("detail.soc", hass)}</button>
              ${this._socChart}`
            : nothing
        }
      </div>
    `;
  }

  render() {
    if (!this._params) return html``;
    const hass = this._hass;
    const state = this._params.card.detailState();
    const title = state
      ? planOf(this._params.node, state.config, hass, this._shown).title
      : localize(`node.${this._params.node}`, hass);
    return html`
      <ha-adaptive-dialog
        .hass=${hass}
        .open=${this._open}
        .headerTitle=${title}
        width="medium"
        flexcontent
        @closed=${this._closed}
      >
        <span slot="headerTitle" id="title">${title}</span>
        <div class="content">${state ? this._renderContent(state) : nothing}</div>
      </ha-adaptive-dialog>
    `;
  }
}

if (!customElements.get(DETAIL_NAME)) {
  customElements.define(DETAIL_NAME, EnerLensDetail);
}
