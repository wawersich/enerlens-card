/**
 * <enerlens-card> - energy flow card for Home Assistant.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { AveragingBuffer, fetchHistory } from "./averaging";
import { collectEntityIds, normalizeConfig } from "./config";
import { BUILD_ID, CARD_NAME, CARD_VERSION, EDITOR_NAME, REPO_URL } from "./const";
import { buildBreakdown, refreshBreakdownValues } from "./consumers";
import { computeFlows, dotParams, planDots } from "./flow";
import { buildModel, buildModelFrom, readPowerW } from "./model";
import { openMoreInfo, renderCross } from "./render/cross";
import { DotLayer, type DotTechnique, detectTechnique } from "./render/dots";
import { FanLayer } from "./render/fan";
import { VIEW_W } from "./render/geometry";
import { renderHeader } from "./render/header";
import { RowAnimator, renderList } from "./render/list";
import { styles } from "./styles";
import {
  type Config,
  ConfigError,
  type HomeAssistant,
  type Model,
  type RawConfig,
  type Sample,
  type ViewMode,
} from "./types";

class EnerLensCard extends LitElement {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _model: { state: true },
    _showAll: { state: true },
  };

  private _hass?: HomeAssistant;
  private _config?: Config;
  private _rawConfig?: RawConfig;
  private _entityIds: string[] = [];
  private _model?: Model;
  /** Snapshot the list, ring and dots work from - advanced on the tick. */
  private _tickModel?: Model;
  private _tickTimer?: ReturnType<typeof setInterval>;
  private readonly _rows = new RowAnimator();
  /** Latest entries by key - the fan needs colour and value per row. */
  private _lastEntries = new Map<string, { w: number; color: string }>();
  private _mode: ViewMode = "current";
  private _buffer?: AveragingBuffer;
  /** Set while a prefill is in flight, so a mode switch does not start a second. */
  private _prefilling = false;
  /** Oldest sample time when the window is not yet full (REQ V-6). */
  private _since?: string;
  private _resizeObserver?: ResizeObserver;
  private _intersectionObserver?: IntersectionObserver;
  private _dots?: DotLayer;
  private _fan?: FanLayer;
  /** Frame loop that keeps the fan on the rows while they glide. */
  private _fanFollow?: number;
  private _technique: DotTechnique = "static";
  private _motionQuery?: MediaQueryList;
  private _visible = true;
  /** True while the list wraps below the cross - the lanes only run there. */
  private _stacked = false;
  /** Filter lifted by the toggle above the list (REQ L-12). Not persisted. */
  private _showAll = false;

  private _toggleShowAll(): void {
    this._showAll = !this._showAll;
    // Re-select at once rather than on the next tick; the FLIP in updated()
    // glides the rows that move.
    if (this._hass && this._config) this._tickModel = this._modelForMode(this._hass, this._config);
  }
  private readonly _onVisibility = () => this._syncPlayState();
  private readonly _onMotionChange = () => this.requestUpdate();

  set hass(hass: HomeAssistant) {
    const previous = this._hass;
    this._hass = hass;
    if (!this._config) return;
    // Only rebuild when one of our entities actually changed (REQ T-3).
    if (previous && !this._entitiesChanged(previous, hass)) return;
    this._model = buildModel(hass, this._config);
    this._tickModel ??= this._model;
    this._recordSamples(hass);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private _entitiesChanged(a: HomeAssistant, b: HomeAssistant): boolean {
    for (const id of this._entityIds) {
      if (a.states[id] !== b.states[id]) return true;
    }
    return false;
  }

  setConfig(config: RawConfig): void {
    // Structural problems throw so HA shows its error card; runtime problems
    // never do - they are rendered inside the card (REQ E-1).
    this._config = normalizeConfig(config, this._hass);
    this._rawConfig = config;
    this._entityIds = collectEntityIds(this._config);
    this._buffer = new AveragingBuffer(this._config.view.avgLongMinutes * 60_000);
    this._mode = this._config.view.defaultMode;
    if (this._config.view.remember) {
      try {
        const stored = localStorage.getItem("enerlens-view-mode");
        if (stored === "current" || stored === "avg_short" || stored === "avg_long") {
          this._mode = stored;
        }
      } catch {
        // Storage unavailable - fall back to the configured default.
      }
    }
    if (this._mode !== "current") void this._prefill();
    if (this._hass) {
      this._model = buildModel(this._hass, this._config);
      this._tickModel = this._model;
    }
    this._restartTick();
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Text keeps a minimum size in CSS pixels while the drawing scales, so the
    // card stays legible on a phone (REQ K-12).
    this._resizeObserver = new ResizeObserver(() => this._measure());
    this._resizeObserver.observe(this);

    this._technique = detectTechnique();

    // Animations cost nothing while nobody is looking (REQ P-8).
    this._intersectionObserver = new IntersectionObserver((entries) => {
      this._visible = entries.some((e) => e.isIntersecting);
      this._syncPlayState();
    });
    this._intersectionObserver.observe(this);
    document.addEventListener("visibilitychange", this._onVisibility);

    // The system setting can change while the card is open (REQ P-7).
    this._motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    this._motionQuery?.addEventListener?.("change", this._onMotionChange);
    this._restartTick();
  }

  /**
   * Values and order in the list change together, on a fixed beat - otherwise
   * every sensor update would reshuffle the rows independently (REQ T-2, L-7).
   */
  private _restartTick(): void {
    if (this._tickTimer) clearInterval(this._tickTimer);
    const seconds = this._config?.updateIntervalS ?? 5;
    this._tickTimer = setInterval(() => {
      if (!this._hass || !this._config) return;
      // In an average mode the window keeps moving even when no sensor changed,
      // so the tick recomputes rather than reusing the last model (REQ T-1).
      this._tickModel = this._modelForMode(this._hass, this._config);
      this._updateSince();
      this.requestUpdate();
    }, seconds * 1000);
  }

  private get _animationsWanted(): boolean {
    const mode = this._config?.flow.animation ?? "auto";
    if (mode === "off") return false;
    if (mode === "on") return true;
    return !this._motionQuery?.matches;
  }

  /**
   * Every reading goes into the buffer, whatever the current mode - switching
   * to an average then has history to work with rather than starting empty.
   */
  private _recordSamples(hass: HomeAssistant): void {
    if (!this._config || !this._buffer) return;
    const now = Date.now();
    for (const id of this._entityIds) {
      const state = hass.states[id];
      if (!state) continue;
      this._buffer.push(id, Date.parse(state.last_changed) || now, readPowerW(hass, id));
    }
    this._buffer.prune(now);
  }

  /** Model for the active mode: raw readings, or window means (REQ V-4). */
  private _modelForMode(hass: HomeAssistant, config: Config): Model {
    if (this._mode === "current" || !this._buffer) return buildModel(hass, config);
    const minutes =
      this._mode === "avg_short" ? config.view.avgShortMinutes : config.view.avgLongMinutes;
    const windowMs = minutes * 60_000;
    const now = Date.now();
    const buffer = this._buffer;
    // The state of charge is never averaged, so buildModelFrom reads it live.
    return buildModelFrom(hass, config, (entityId) => buffer.mean(entityId, windowMs, now));
  }

  /**
   * Pulls recent history in one request so a freshly opened card does not have
   * to wait a quarter of an hour for its first mean (REQ V-6). Skipped in the
   * editor preview, which recreates the card on every keystroke.
   */
  private async _prefill(): Promise<void> {
    if (!this._hass || !this._config || !this._buffer || this._prefilling) return;
    if ((this as unknown as { preview?: boolean }).preview) return;
    this._prefilling = true;
    try {
      const history = await fetchHistory(
        this._hass,
        this._entityIds,
        this._config.view.avgLongMinutes,
      );
      for (const [entityId, samples] of Object.entries(history)) {
        const unit = this._hass.states[entityId]?.attributes.unit_of_measurement;
        for (const sample of samples as Sample[]) {
          this._buffer.push(entityId, sample.t, this._toWatts(sample.v, unit));
        }
      }
      this._updateSince();
    } catch {
      // Recorder slow or unavailable: carry on with live buffering and label
      // the mode with "since hh:mm" until the window fills (REQ V-6).
      this._updateSince();
    } finally {
      this._prefilling = false;
      this.requestUpdate();
    }
  }

  /** History returns raw sensor numbers; the model normalises live values. */
  private _toWatts(value: number | null, unit: string | undefined): number | null {
    if (value === null) return null;
    const factor = unit === "kW" ? 1000 : unit === "MW" ? 1e6 : unit === "mW" ? 1e-3 : 1;
    return value * factor;
  }

  private _updateSince(): void {
    if (!this._buffer || this._mode === "current") {
      this._since = undefined;
      return;
    }
    const status = this._buffer.status(Date.now());
    this._since =
      status.complete || !status.since
        ? undefined
        : new Date(status.since).toLocaleTimeString(this._hass?.locale.language ?? "de", {
            hour: "2-digit",
            minute: "2-digit",
          });
  }

  private _setMode(mode: ViewMode): void {
    if (mode === this._mode) return;
    this._mode = mode;
    if (this._config?.view.remember) {
      try {
        localStorage.setItem("enerlens-view-mode", mode);
      } catch {
        // Private browsing or storage disabled - the mode simply is not kept.
      }
    }
    if (mode !== "current") void this._prefill();
    this._updateSince();
    // A switch takes effect at once rather than waiting for the next tick (V-8).
    if (this._hass && this._config) this._tickModel = this._modelForMode(this._hass, this._config);
    this.requestUpdate();
  }

  /**
   * Line widths, dot sizes and font sizes are meant in screen pixels and are
   * divided by this scale to survive resizing. It has to come from the drawing
   * itself: with the list beside the cross the SVG is only about half the
   * card's width, and measuring the card would leave lines and dots too thin.
   */
  private _measure(): void {
    const plot = this.renderRoot?.querySelector(".plot") as HTMLElement | null;
    const width = plot?.getBoundingClientRect().width ?? 0;
    if (width > 0) {
      const scale = width / VIEW_W;
      this.style.setProperty("--el-scale", String(scale));
      this._dots?.setScale(scale);
    }
    this._checkStacked();
  }

  /**
   * Whether the list wrapped below the cross. Measured rather than derived from
   * a width threshold: the flex bases live in the stylesheet, and a number
   * duplicated here would silently drift apart from them.
   */
  private _checkStacked(): void {
    const cross = this.renderRoot?.querySelector(".cross") as HTMLElement | null;
    const list = this.renderRoot?.querySelector(".list") as HTMLElement | null;
    if (!cross || !list) return;
    const stacked = list.offsetTop >= cross.offsetTop + cross.offsetHeight / 2;
    if (stacked === this._stacked) return;
    this._stacked = stacked;
    this.requestUpdate();
  }

  /**
   * One line from the house node to each row, with dots on it (REQ P-1 style).
   *
   * Only when the list sits beside the cross - stacked, the rows carry their
   * own short lanes instead, and a fan would have to cross every row above its
   * target. The list is HTML and the cross is SVG, so there is no shared
   * coordinate system: both are measured and the fan is drawn in CSS pixels on
   * its own overlay.
   */
  private _updateFan(): void {
    this._drawFan();

    // Rows glide for 600 ms after a reorder. The lines follow them frame by
    // frame - measured mid-transform, getBoundingClientRect reports where a
    // row is drawn, not where it will land - and one last pass after the glide.
    if (this._fanFollow) cancelAnimationFrame(this._fanFollow);
    if (typeof requestAnimationFrame !== "function") return;
    const started = performance.now();
    const step = () => {
      this._drawFan();
      this._fanFollow = performance.now() - started < 650 ? requestAnimationFrame(step) : undefined;
    };
    this._fanFollow = requestAnimationFrame(step);
  }

  private _drawFan(): void {
    const svg = this.renderRoot?.querySelector("svg.fan") as SVGSVGElement | null;
    if (!svg || !this._config) return;
    if (!this._fan) this._fan = new FanLayer(svg);

    const body = this.renderRoot.querySelector(".body") as HTMLElement | null;
    const house = this.renderRoot.querySelector(".node.house") as HTMLElement | null;
    const rows = this.renderRoot.querySelectorAll<HTMLElement>(".row");
    if (this._stacked || !body || !house || rows.length === 0) {
      this._fan.destroy();
      return;
    }

    const origin = body.getBoundingClientRect();
    const houseBox = house.getBoundingClientRect();
    const start = {
      x: houseBox.right - origin.left,
      y: houseBox.top + houseBox.height / 2 - origin.top,
    };

    const entries = this._lastEntries;
    const fanRows = [...rows]
      .map((row) => {
        const key = row.dataset.key;
        const entry = key ? entries.get(key) : undefined;
        if (!entry) return null;
        const params = dotParams(entry.w, this._config as Config);
        if (!params) return null;
        const box = row.getBoundingClientRect();
        return {
          key: key as string,
          x: box.left - origin.left,
          y: box.top + box.height / 2 - origin.top,
          color: entry.color,
          count: params.count,
          durationS: params.durationS,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    this._fan.setDotRadius(5);
    this._fan.update(
      fanRows,
      start,
      { width: origin.width, height: origin.height },
      this._animationsWanted,
    );
  }

  private _syncPlayState(): void {
    const documentHidden = typeof document !== "undefined" && document.hidden;
    if (this._visible && !documentHidden) this._dots?.resume();
    else this._dots?.pause();
  }

  /**
   * The dot layer lives outside Lit's template: letting the template own those
   * elements would recreate them on every render and restart each animation,
   * which is what REQ P-6 forbids.
   */
  protected willUpdate(): void {
    this._rows.capture(this.renderRoot?.querySelector(".rows") ?? null);
  }

  protected updated(): void {
    this._rows.play(this.renderRoot.querySelector(".rows"), this._animationsWanted);
    if (!this._hass || !this._config) return;
    const group = this.renderRoot.querySelector("g.dots") as SVGGElement | null;
    if (!group) return;
    if (!this._dots) {
      this._dots = new DotLayer(group, this._technique);
      const plot = this.renderRoot.querySelector(".plot") as HTMLElement | null;
      const width = plot?.getBoundingClientRect().width ?? 0;
      if (width > 0) this._dots.setScale(width / VIEW_W);
    }
    const ticked = this._tickModel ?? this._model ?? buildModel(this._hass, this._config);
    const plans = planDots(computeFlows(ticked), this._config);
    this._dots.update(plans, this._config, this._animationsWanted);
    this._updateFan();
    this._syncPlayState();
    this._measure();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._intersectionObserver?.disconnect();
    this._intersectionObserver = undefined;
    document.removeEventListener("visibilitychange", this._onVisibility);
    this._motionQuery?.removeEventListener?.("change", this._onMotionChange);
    this._motionQuery = undefined;
    this._dots?.destroy();
    this._dots = undefined;
    if (this._fanFollow) cancelAnimationFrame(this._fanFollow);
    this._fanFollow = undefined;
    this._fan?.destroy();
    this._fan = undefined;
    if (this._tickTimer) clearInterval(this._tickTimer);
    this._tickTimer = undefined;
  }

  getCardSize(): number {
    return 7;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 12, min_columns: 12, rows: "auto" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement(EDITOR_NAME);
  }

  static getStubConfig(
    _hass: HomeAssistant,
    entities: string[] = [],
    entitiesFallback: string[] = [],
  ): Record<string, unknown> {
    const pool = [...entities, ...entitiesFallback].filter((id) => id.startsWith("sensor."));
    return {
      entities: {
        solar: pool[0] ?? "sensor.solar_power",
        grid: pool[1] ?? "sensor.grid_power",
      },
    };
  }

  render(): TemplateResult | typeof nothing {
    if (!this._hass || !this._config) return nothing;
    const model = this._modelForMode(this._hass, this._config);
    const ticked = this._tickModel ?? model;
    // Selection and order come from the tick, the figures from the live model
    // (REQ L-7): values may move every second, rows only on the beat.
    const breakdown = refreshBreakdownValues(
      buildBreakdown(ticked, this._config, this._showAll),
      model,
    );
    // Lines carry the colour of the flow on them, dimmed by CSS (REQ P-5).
    const plans = planDots(computeFlows(ticked), this._config);
    const active = new Map(
      plans.map((p) => [p.connection, this._config?.colors[p.colorKey] ?? ""]),
    );
    this._lastEntries = new Map(breakdown.entries.map((e) => [e.key, { w: e.w, color: e.color }]));
    const openEntry = (entity: string, ev: Event) =>
      openMoreInfo(ev.currentTarget as EventTarget, entity);

    return html`
      <ha-card translate="no">
        ${renderHeader(
          this._config,
          this._hass,
          this._rawConfig?.title,
          this._mode,
          this._since,
          (mode) => this._setMode(mode),
          this._showAll,
          () => this._toggleShowAll(),
        )}
        <div class="body">
          <svg class="fan" aria-hidden="true"></svg>
          ${renderCross(
            model,
            this._config,
            this._hass,
            active,
            this._config.ring.enabled ? breakdown.segments : [],
          )}
          ${renderList(breakdown, this._config, this._hass, openEntry, this._stacked)}
        </div>
      </ha-card>
    `;
  }
}

if (!customElements.get(CARD_NAME)) {
  customElements.define(CARD_NAME, EnerLensCard);
}

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}
const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards || [];
if (!w.customCards.some((c) => c.type === CARD_NAME)) {
  w.customCards.push({
    type: CARD_NAME,
    name: "EnerLens Card",
    description: "Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",
    preview: true,
    documentationURL: REPO_URL,
  });
}

console.info(
  `%c ENERLENS-CARD %c ${CARD_VERSION} · ${BUILD_ID} `,
  "color:#fff;background:#03a9f4;font-weight:700",
  "color:#03a9f4;background:#fff;font-weight:700",
);

export { ConfigError, type Config };
