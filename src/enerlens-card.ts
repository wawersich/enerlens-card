/**
 * <enerlens-card> - energy flow card for Home Assistant.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { collectEntityIds, normalizeConfig } from "./config";
import { CARD_NAME, CARD_VERSION, EDITOR_NAME, REPO_URL } from "./const";
import { buildBreakdown, refreshBreakdownValues } from "./consumers";
import { computeFlows, dotParams, planDots } from "./flow";
import { buildModel } from "./model";
import { openMoreInfo, renderCross } from "./render/cross";
import { DotLayer, type DotTechnique, detectTechnique } from "./render/dots";
import { FanLayer } from "./render/fan";
import { VIEW_W } from "./render/geometry";
import { RowAnimator, renderList } from "./render/list";
import { styles } from "./styles";
import { type Config, ConfigError, type HomeAssistant, type Model, type RawConfig } from "./types";

class EnerLensCard extends LitElement {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _model: { state: true },
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
  private _resizeObserver?: ResizeObserver;
  private _intersectionObserver?: IntersectionObserver;
  private _dots?: DotLayer;
  private _fan?: FanLayer;
  private _fanRedraw?: ReturnType<typeof setTimeout>;
  private _technique: DotTechnique = "static";
  private _motionQuery?: MediaQueryList;
  private _visible = true;
  /** True while the list wraps below the cross - the lanes only run there. */
  private _stacked = false;
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
      if (!this._model) return;
      this._tickModel = this._model;
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

    // Rows glide for 600 ms after a reorder; redraw once they have landed.
    if (this._fanRedraw) clearTimeout(this._fanRedraw);
    this._fanRedraw = setTimeout(() => this._updateFan(), 650);
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
    this._fan?.destroy();
    this._fan = undefined;
    if (this._fanRedraw) clearTimeout(this._fanRedraw);
    this._fanRedraw = undefined;
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
    const model = this._model ?? buildModel(this._hass, this._config);
    const ticked = this._tickModel ?? model;
    // Selection and order come from the tick, the figures from the live model
    // (REQ L-7): values may move every second, rows only on the beat.
    const breakdown = refreshBreakdownValues(buildBreakdown(ticked, this._config), model);
    // Lines carry the colour of the flow on them, dimmed by CSS (REQ P-5).
    const plans = planDots(computeFlows(ticked), this._config);
    const active = new Map(
      plans.map((p) => [p.connection, this._config?.colors[p.colorKey] ?? ""]),
    );
    this._lastEntries = new Map(breakdown.entries.map((e) => [e.key, { w: e.w, color: e.color }]));
    const openEntry = (entity: string, ev: Event) =>
      openMoreInfo(ev.currentTarget as EventTarget, entity);

    return html`
      <ha-card .header=${this._rawConfig?.title} translate="no">
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
  `%c ENERLENS-CARD %c ${CARD_VERSION} `,
  "color:#fff;background:#03a9f4;font-weight:700",
  "color:#03a9f4;background:#fff;font-weight:700",
);

export { ConfigError, type Config };
