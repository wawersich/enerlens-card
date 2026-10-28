/**
 * <enerlens-card> - energy flow card for Home Assistant.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { AveragingBuffer, fetchHistory } from "./averaging";
import { ChargeTracker } from "./charge";
import {
  collectChargeIds,
  collectEntityIds,
  collectExtraIds,
  dashboardCards,
  memoryIdOf,
  newMemoryId,
  normalizeConfig,
} from "./config";
import {
  BUILD_ID,
  CARD_LABEL,
  CARD_NAME,
  CARD_VERSION,
  DETAIL_NAME,
  EDITOR_NAME,
  EXAMPLE_W,
  REPO_URL,
  STUB_ENTITIES,
} from "./const";
import { buildBreakdown, carries, refreshBreakdownValues } from "./consumers";
import { flowDesign, loadLiveDesigns } from "./designs";
import { CARD_GONE, CARD_GONE_MS } from "./detail-dialog";
import { periodStart } from "./energy";
import {
  type EnergyView,
  energyChipLabel,
  energyConfig,
  energyKey,
  fetchEnergy,
  firstWeekday,
  formatDay,
  hasStatistics,
  mainEntities,
  periodKey,
  timeZoneOf,
} from "./energy-view";
import { computeFlows, dotParams, planDots } from "./flow";
import { localize } from "./localize";
import { buildModel, buildModelFrom, readPowerW } from "./model";
import { applyStatus, fetchLastKnownStatus, readStatus, statusOptions } from "./outage";
import {
  type DetailNode,
  type DetailRequest,
  labelRoom,
  openDetail,
  openMoreInfo,
  renderCross,
} from "./render/cross";
import { DotLayer, type DotTechnique, detectTechnique } from "./render/dots";
import { FanLayer } from "./render/fan";
import {
  exitDirection,
  fanPath,
  placeBlock,
  placeBlocks,
  splitPoint,
  trunkPath,
} from "./render/fan-path";
import { NODE_R, VIEW_W, geometryFor, holesPathOf } from "./render/geometry";
import { groundIsDark, seeThrough } from "./render/ground";
import {
  type EnergyChip,
  type ScaleChip,
  renderExampleBanner,
  renderHeader,
  renderOutageBanner,
} from "./render/header";
import { GLIDE_MS, RowAnimator, renderList, renderSolarSide } from "./render/list";
import { mayStretchPaths, measurePathZoom } from "./render/path-zoom";
import { RingAnimator } from "./render/ring";
import { sizeFactors } from "./render/sizing";
import { buildSolarRows, refreshSolarRows, solarSegments } from "./solar";
import { SolarMemory } from "./solar-memory";
import { styles } from "./styles";
import {
  type Config,
  ConfigError,
  type EnergyPeriod,
  type Flows,
  type GridStatusSpec,
  type HomeAssistant,
  type Model,
  type NormalizedCharge,
  type OutageState,
  type PvScale,
  REST_KEY,
  type RawConfig,
  type Sample,
  type ViewMode,
} from "./types";

/** Preferences kept while view.remember is on (REQ V-11, L-12): the name of
 *  each; the key comes from _memKey - per card with a memory_id (V-12). */
const MODE_KEY = "view-mode";
const SHOW_ALL_KEY = "show-all";
/** The energy chip's choice, "kw" for the power view (REQ EM-2). */
const ENERGY_KEY = "energy-period";
const PV_SCALE_KEY = "pv-scale";
/** A period is asked for again this often while it is shown (REQ EM-4). */
const ENERGY_REFRESH_MS = 5 * 60_000;
/** After a failed request, the next one comes this much sooner. */
const ENERGY_RETRY_MS = 30_000;
/** The fan stops following the rows after this long, should a glide never end. */
const FAN_FOLLOW_MAX_MS = GLIDE_MS + 400;

/** localStorage throws in private mode and can be disabled outright; a lost
 *  preference must never cost more than the preference itself. */
function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not kept, nothing else changes.
  }
}

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** A row's drawn opacity, mid-animation included; 1 where it cannot be read. */
function rowOpacity(row: Element): number {
  const value = Number.parseFloat(getComputedStyle(row).opacity);
  return Number.isNaN(value) ? 1 : value;
}

/** Whether two grid-status settings mean the same thing - the entity and the
 *  state names, in order, which is all a latched outage depends on. */
function sameStatus(a?: GridStatusSpec, b?: GridStatusSpec): boolean {
  if (!a || !b) return a === b;
  const same = (x: string[], y: string[]) =>
    x.length === y.length && x.every((value, i) => value === y[i]);
  return a.entity === b.entity && same(a.outage, b.outage) && same(a.ok, b.ok);
}

/** The placeholders' invented readings, built once so they never count as a change. */
const EXAMPLE_STATES: HomeAssistant["states"] = Object.fromEntries(
  (Object.keys(STUB_ENTITIES) as (keyof typeof STUB_ENTITIES)[]).map((key) => [
    STUB_ENTITIES[key],
    {
      entity_id: STUB_ENTITIES[key],
      state: String(EXAMPLE_W[key]),
      attributes: { unit_of_measurement: "W", device_class: "power" },
      last_changed: "",
      last_updated: "",
    },
  ]),
);

/** Cards on the page, to find twins with the same memory_id (V-12). */
const LIVE = new Set<EnerLensCard>();

const isObject = (value: unknown): value is { views?: unknown } =>
  typeof value === "object" && value !== null;

const isPreview = (card: HTMLElement) =>
  (card as unknown as { preview?: boolean }).preview === true;

/** A node's ancestors from the document down, through shadow roots. */
function composedChain(node: Node): Node[] {
  const chain: Node[] = [];
  let at: Node | null = node;
  while (at) {
    chain.unshift(at);
    at = at.parentNode ?? (at instanceof ShadowRoot ? at.host : null);
  }
  return chain;
}

/** Page order across shadow roots - where a dashboard puts each card. */
function composedOrder(a: Node, b: Node): number {
  const pa = composedChain(a);
  const pb = composedChain(b);
  let i = 0;
  while (i < pa.length && i < pb.length && pa[i] === pb[i]) i++;
  if (i >= pa.length || i >= pb.length) return pa.length - pb.length;
  // A shadow root comes before the light children of its host.
  if (pa[i] instanceof ShadowRoot) return -1;
  if (pb[i] instanceof ShadowRoot) return 1;
  return pa[i].compareDocumentPosition(pb[i]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

class EnerLensCard extends LitElement {
  static styles = styles;

  static properties = {
    // The setter below decides when hass is worth a render. Lit would wrap it
    // and render on every hass - and Home Assistant hands over a new one
    // whenever any entity anywhere changes (REQ T-3, EL-I1).
    hass: { attribute: false, noAccessor: true },
    _model: { state: true },
    _showAll: { state: true },
    _pvScale: { state: true },
    _outage: { state: true },
    _scale: { state: true },
    _seeThrough: { state: true },
  };

  private _hass?: HomeAssistant;
  private _config?: Config;
  private _rawConfig?: RawConfig;
  private _entityIds: string[] = [];
  /** State-of-charge and plugged entities: watched, never averaged (REQ L-15). */
  private _chargeIds: string[] = [];
  /** Entities of the extra fields: watched, never averaged (REQ Z-9). */
  private _extraIds: string[] = [];
  private readonly _charge = new ChargeTracker();
  /** The last value of each PV source: night or fault (REQ PV-2). */
  private readonly _solarMemory = new SolarMemory();
  /** Hands the model a consumer's charge as the tracker knows it now. */
  private readonly _chargeOf = (charge: NormalizedCharge) =>
    this._charge.state(this._hass as HomeAssistant, charge);
  private _model?: Model;
  /** Snapshot the list, ring and dots work from - advanced on the tick. */
  private _tickModel?: Model;
  private _tickTimer?: ReturnType<typeof setInterval>;
  private readonly _rows = new RowAnimator();
  /** Latest entries by key - the fan needs colour and value per row. */
  private _lastEntries = new Map<string, { w: number; color: string; threshold: number }>();
  /** The PV rows as last rendered - the PV fan reads them like the consumers' (PV-7). */
  private _lastSolar = new Map<string, { w: number; color: string; threshold: number }>();
  /** The fan from the PV rows into the PV node (PV-7). */
  private _solarFan?: FanLayer;
  private _mode: ViewMode = "current";
  private _buffer?: AveragingBuffer;
  /** The buffer the history was last fetched for (REQ V-6, issue #16). */
  private _historyFor?: AveragingBuffer;
  /** Oldest sample time when the window is not yet full (REQ V-6). */
  private _since?: string;
  private _resizeObserver?: ResizeObserver;
  private _intersectionObserver?: IntersectionObserver;
  private _dots?: DotLayer;
  /** The spur replaces the dots while a design is chosen (P-10). */
  private _designsPickedUp = false;
  private _warnedDesign?: string;
  private _fan?: FanLayer;
  private readonly _ring = new RingAnimator();
  /** The PV ring moves on its own: two rings in one animator would mix their ranks. */
  private readonly _solarRing = new RingAnimator();
  /** Frame loop that keeps the fan on the rows while they glide. */
  private _fanFollow?: number;
  /** When the fan stops following the rows, should a glide never end. */
  private _fanFollowUntil = 0;
  private _technique: DotTechnique = "static";
  private _motionQuery?: MediaQueryList;
  private _visible = true;
  /** True while the list wraps below the cross - the lanes only run there. */
  private _stacked = false;
  /** The body's width when the lists last went below (AN-3 hysteresis). */
  private _stackedWidth = 0;
  /**
   * False until a measurement has left the layout alone. The first one can move
   * the list from beside the cross to below it, which is a jump of most of the
   * card - gliding through it is a lurch, not a transition (REQ P-6).
   */
  private _settled = false;
  /** Filter lifted by the toggle above the list (REQ L-12). Kept per browser
   *  like the view mode, unless view.remember is off. */
  private _showAll = false;
  /** Scale of the PV ring (PV-5, PV-6). */
  private _pvScale: PvScale = "share";
  /** Plot width over VIEW_W - the ring inside the house node is sized by it. */
  private _scale = 1;
  /** The plot's width over the viewBox's, as last measured - unrounded, unlike _scale. */
  private _plotScale = 1;
  /** Inside of a circle in the plot's user units, as measured (K-16). */
  private _holeR = NODE_R;
  /** Whether the nodes' fill lets the lines show through (K-16), as read. */
  private _seeThrough = false;
  /** Latched grid outage; undefined until a real status has been seen (REQ NS-3). */
  private _outage: OutageState;
  /** The one history lookup that gives the latch its starting point (REQ NS-6). */
  private _outagePrefilled = false;
  /** Energy chip: the period shown, null = the power view (REQ EM-2). */
  private _energyPeriod: EnergyPeriod | null = null;
  /** Set by a tap on the chip; the editor preview loads only then (EM-14). */
  private _energyChosen = false;
  /** Fetched periods, kept while the entities stay the same. */
  private _energyViews = new Map<EnergyPeriod, EnergyView>();
  /** What the views were fetched for; a change empties them. */
  private _energyKey = "";
  /** Last request per period and the start it was for - one at a time, then every 5 min. */
  private _energyAsked = new Map<EnergyPeriod, { at: number; start: number; open: boolean }>();
  /** A period tapped to but not fetched yet; the card shows it once it is (EM-16).
   *  null = back to kW, undefined = nothing pending. */
  private _energyPending: EnergyPeriod | null | undefined;
  /** The main sensors the statistics check ran for, and its answer (QB-8);
   *  undefined = still waiting. */
  private _statsKey = "";
  private _statsOk: boolean | undefined;
  /** The first positive answer has brought back a remembered period (QB-4). */
  private _statsRemembered = false;
  /** After a failed check: when to ask again (QB-8). */
  private _statsRetryAt = 0;

  /**
   * The period the card draws: none for the example (E-5), and none in the
   * editor preview until the chip is tapped there (EM-14).
   */
  private get _period(): EnergyPeriod | null {
    if (!this._energyPeriod || this._example) return null;
    // Without power on offer there is nothing else to show, preview or not (QB-2).
    const power = this._config?.view.power !== false;
    if ((this as unknown as { preview?: boolean }).preview && !this._energyChosen && power) {
      return null;
    }
    return this._energyPeriod;
  }

  /**
   * What the quick button power/energy offers right now, null = power
   * (QB-2): the default periods only once the statistics are there (QB-8).
   */
  private _energyOffer(config: Config): (EnergyPeriod | null)[] {
    const view = config.view;
    const periods = view.energyDefault && this._statsOk !== true ? [] : view.energyPeriods;
    return [...(view.power ? [null] : []), ...periods];
  }

  /** The default periods still wait for the statistics check (QB-8). */
  private _statsWaiting(config: Config): boolean {
    return config.view.energyDefault && this._statsOk === undefined && !this._example;
  }

  /**
   * The start value, or - on opening - a remembered one while it is offered
   * and the button is one to switch (QB-4). A start value changed in the
   * editor shows at once (Markus 21.10.2026). Never writes: a value is only
   * stored on a tap.
   */
  private _startEnergy(config: Config, remembered: boolean): void {
    const offer = this._energyOffer(config);
    const start = config.view.defaultEnergy === "power" ? null : config.view.defaultEnergy;
    let pick = offer.includes(start) ? start : (offer[0] ?? null);
    if (remembered && config.view.remember && offer.length > 1) {
      const stored = load(this._memKey(ENERGY_KEY));
      const remembered = offer.find((p) => (p ?? "kw") === stored);
      if (remembered !== undefined) pick = remembered;
    }
    this._energyPeriod = pick;
  }

  /** Set until the first render has read what was remembered (V-12). */
  private _rememberPending = false;

  /** The remembered value of each button that switches, on opening (QB-4). */
  private _applyRemembered(): void {
    const config = this._config;
    if (!config?.view.remember) return;
    if (config.view.modes.length > 1) {
      const stored = config.view.modes.find((m) => m === load(this._memKey(MODE_KEY)));
      if (stored) this._mode = stored;
    }
    if (config.list.scope.length > 1) {
      const stored = load(this._memKey(SHOW_ALL_KEY));
      if (stored === "1") this._showAll = config.list.scope.includes("full");
      if (stored === "0") this._showAll = !config.list.scope.includes("filtered");
    }
    if (config.view.pvScales.length > 1) {
      const stored = config.view.pvScales.find((s) => s === load(this._memKey(PV_SCALE_KEY)));
      if (stored) this._pvScale = stored;
    }
    this._startEnergy(config, true);
    if (this._hass) this._tickModel = this._modelForMode(this._hass, config);
  }

  /**
   * Where a remembered value lives (REQ V-12). Without a memory_id: shared
   * by the browser, as before. With one: the view, the id and - for the
   * later of two cards with the same id in this view, never the first - a
   * suffix. The editor preview reads the card it previews and is no twin.
   */
  private _memKey(name: string): string {
    const id = this._config?.memoryId;
    if (!id) return `enerlens-${name}`;
    const view = location.pathname.replace(/^\/+|\/+$/g, "");
    let rank = 0;
    if (!isPreview(this)) {
      rank = this._rankInDashboard(id) ?? this._rankOnPage(id);
    }
    return `enerlens:${view}:${id}${rank > 0 ? `#${rank + 1}` : ""}:${name}`;
  }

  /**
   * Cards before this one with the same id in its view, counted in the
   * dashboard's configuration - the same on every device and whatever loads
   * first; on screen a masonry column can put a copy before its original.
   * Undefined where the configuration is not to be found (V-12).
   */
  private _rankInDashboard(id: string): number | undefined {
    let own: unknown;
    let dashboard: { views?: unknown } | undefined;
    for (const node of composedChain(this).reverse()) {
      const el = node as { localName?: string; config?: unknown; lovelace?: { config?: unknown } };
      if (own === undefined && el.localName === "hui-card" && el.config) own = el.config;
      if (!dashboard && isObject(el.lovelace?.config)) dashboard = el.lovelace.config;
    }
    if (own === undefined || !dashboard || !Array.isArray(dashboard.views)) return undefined;
    for (const view of dashboard.views) {
      const cards = dashboardCards(view);
      const at = cards.indexOf(own as Record<string, unknown>);
      if (at === -1) continue;
      return cards.slice(0, at).filter((c) => memoryIdOf(c.memory_id) === id).length;
    }
    return undefined;
  }

  /** The fallback: twins on the page in the order of the document. */
  private _rankOnPage(id: string): number {
    const twins = [...LIVE]
      .filter((c) => c.isConnected && !isPreview(c) && c._config?.memoryId === id)
      .sort(composedOrder);
    return Math.max(0, twins.indexOf(this));
  }

  /** Asks once per set of main sensors whether the default periods can work (QB-8). */
  private _checkStatistics(): void {
    const config = this._config;
    const hass = this._realHass;
    if (!config?.view.energyDefault || !hass || this._example) return;
    const key = mainEntities(config).join(",");
    const retry = this._statsRetryAt > 0 && Date.now() >= this._statsRetryAt;
    if (key === this._statsKey && !retry) return;
    this._statsKey = key;
    this._statsRetryAt = 0;
    // A retry keeps power on show rather than an empty room.
    if (!retry) this._statsOk = undefined;
    hasStatistics(hass, config).then((ok) => {
      if (this._statsKey !== key) return;
      // Home Assistant restarting is no answer: power for now, another try
      // in half a minute, like a failed period (EM-4).
      if (ok === undefined) this._statsRetryAt = Date.now() + ENERGY_RETRY_MS;
      this._statsOk = ok ?? false;
      if (ok === false) console.warn(localize("energy.no_statistics", hass));
      // A remembered period counts on opening only - the first answer, not
      // one after the sensors were changed in the editor (QB-4).
      if (ok && this._config) {
        this._startEnergy(this._config, !this._statsRemembered);
        this._statsRemembered = true;
      }
      this.requestUpdate();
    });
  }

  /** The configuration as drawn: in a period with kWh and W x 1 h (EM-7, EM-8). */
  private _shownConfig(): Config {
    const config = this._config as Config;
    const period = this._period;
    return period ? energyConfig(config, this._energyViews.get(period)) : config;
  }

  /** Energy per connection over the period, or the live split (REQ EM-8). */
  private _flowsOf(model: Model): Flows {
    const period = this._period;
    if (!period) return computeFlows(model);
    return this._energyViews.get(period)?.flowsW ?? {};
  }

  /**
   * The chip steps on from what is shown, or from a period still on its way.
   * A period that is not there yet is fetched first and shown when it is
   * complete: the card keeps its picture until then, and chip, figures, list
   * and fan change together - rows glide, come and go as with the filter
   * button, instead of an empty list filling up (EM-16, 20.10.2026).
   */
  private _cycleEnergy(): void {
    if (!this._config) return;
    const order = this._energyOffer(this._config);
    // From what is shown: the preview shows kW even with a period remembered.
    const from = this._energyPending !== undefined ? this._energyPending : this._period;
    this._selectEnergy(order[(order.indexOf(from) + 1) % order.length]);
  }

  /** Power or a period, picked directly (expanded, QB-10) or as the next one. */
  private _selectEnergy(next: EnergyPeriod | null): void {
    const hass = this._hass;
    if (!this._config) return;
    const ready = next === null || (hass !== undefined && this._fresh(next, hass, Date.now()));
    if (ready) {
      this._energyPending = undefined;
      this._showEnergy(next);
      return;
    }
    this._energyPending = next;
    // The chip shows the tap at once; the figures follow when they are there.
    this.requestUpdate();
    this._ensureEnergy(next, true);
  }

  private _showEnergy(period: EnergyPeriod | null): void {
    this._energyPeriod = period;
    // Only now: in the preview a remembered period would otherwise show up,
    // empty, while the tapped one is still loading (EM-14, EM-16).
    this._energyChosen = true;
    // A tap in the editor preview is a look, not a choice for the dashboard.
    const preview = (this as unknown as { preview?: boolean }).preview;
    if (this._config?.view.remember && !preview) store(this._memKey(ENERGY_KEY), period ?? "kw");
    if (this._hass && this._config) this._tickModel = this._modelForMode(this._hass, this._config);
    this.requestUpdate();
  }

  /**
   * What the detail window needs from the card (DF-3): the configuration,
   * the period it shows (null = the power view) and the periods it offers.
   */
  detailState(): {
    config: Config;
    period: EnergyPeriod | null;
    periods: EnergyPeriod[];
    shown: string[];
  } | null {
    if (!this._config) return null;
    return {
      config: this._config,
      // The consumers the list shows now: the rest is the house without them (DF-18).
      shown: [...(this._lastEntries?.keys() ?? [])].filter((key) => key !== REST_KEY),
      // A period tapped to but still loading is the one the card is going to.
      period: this._energyPending !== undefined ? this._energyPending : this._period,
      periods: this._energyOffer(this._config).filter((p): p is EnergyPeriod => p !== null),
    };
  }

  /**
   * A period's figures for the detail window - the card's own while they are
   * current, so window and node show the same (DF-3); otherwise fetched once
   * and kept for the card as well. Never switches what the card shows.
   */
  async detailEnergy(period: EnergyPeriod): Promise<EnergyView> {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config) throw new Error("EnerLens: no configuration");
    const now = Date.now();
    const view = this._energyViews.get(period);
    if (
      view?.detail &&
      this._fresh(period, hass, now) &&
      now - view.fetchedAt < ENERGY_REFRESH_MS
    ) {
      return view;
    }
    const key = this._energyKey;
    const fresh = await fetchEnergy(hass, config, period, now);
    if (key === this._energyKey) {
      this._energyViews.set(period, fresh);
      if (this._period === period && this._hass && this._config) {
        this._tickModel = this._modelForMode(this._hass, this._config);
        this.requestUpdate();
      }
    }
    return fresh;
  }

  /** A fetched view of the period that is running now. */
  private _fresh(period: EnergyPeriod, hass: HomeAssistant, now: number): boolean {
    const view = this._energyViews.get(period);
    return (
      view !== undefined &&
      view.start ===
        periodKey(period, periodStart(period, now, timeZoneOf(hass), firstWeekday(hass)))
    );
  }

  /**
   * Asks for a period when it has none yet, when the last answer is five
   * minutes old (EM-4), or when a new day, week or month began - the old
   * figures stay up until the new ones are there. After a render, like the
   * averaging history, so the editor preview - flagged only after the first
   * hass - never asks by itself.
   */
  private _ensureEnergy(wanted?: EnergyPeriod, tapped = false): void {
    const period = wanted ?? this._period;
    const hass = this._hass;
    const config = this._config;
    if (!period || !hass || !config) return;
    const now = Date.now();
    const start = periodKey(period, periodStart(period, now, timeZoneOf(hass), firstWeekday(hass)));
    const asked = this._energyAsked.get(period);
    // A tap asks again after a failed try at once - only not twice at a time.
    if (asked?.open) return;
    if (!tapped && asked && asked.start === start && now - asked.at < ENERGY_REFRESH_MS) return;
    const ask = { at: now, start, open: true };
    this._energyAsked.set(period, ask);
    const key = this._energyKey;
    fetchEnergy(hass, config, period, now)
      .then((view) => {
        ask.open = false;
        // A configuration with other entities came meanwhile: its own fetch follows.
        if (key !== this._energyKey) return;
        this._energyViews.set(period, view);
        if (this._energyPending === period) {
          this._energyPending = undefined;
          this._showEnergy(period);
          return;
        }
        if (this._hass && this._config && this._period === period) {
          this._tickModel = this._modelForMode(this._hass, this._config);
        }
        this.requestUpdate();
      })
      .catch((error) => {
        // The picture stays as it was. A slow or restarting Home Assistant
        // gets another try in half a minute rather than in five.
        console.warn(error);
        ask.open = false;
        // An answer for an older configuration says nothing about a newer tap.
        if (key !== this._energyKey) return;
        if (this._energyAsked.get(period) === ask)
          ask.at = now - ENERGY_REFRESH_MS + ENERGY_RETRY_MS;
        if (this._energyPending === period) {
          this._energyPending = undefined;
          this.requestUpdate();
        }
      });
  }

  /** The chip as the header draws it; undefined without periods (EM-2). */
  private _energyChip(hass: HomeAssistant, config: Config): EnergyChip | undefined {
    if (this._example) return undefined;
    const waiting = this._statsWaiting(config);
    // While waiting the room is that of the button to come (QB-8).
    const order = waiting
      ? [...(config.view.power ? [null] : []), ...config.view.energyPeriods]
      : this._energyOffer(config);
    // The tap shows at once, even while the period's figures are on their way.
    const period = this._energyPending !== undefined ? this._energyPending : this._period;
    if (order.length < 2 && period === null && !waiting) return undefined;
    const view = period ? this._energyViews.get(period) : undefined;
    const next = order[(order.indexOf(period) + 1) % order.length];
    const unit = config.power.unit;
    const active = energyChipLabel(period, view, hass, unit);
    const late = period !== null && view?.lateStart === true;
    return {
      labels: order.map((p) => energyChipLabel(p, undefined, hass, unit)),
      active,
      ariaLabel: localize("energy.chip", hass, {
        mode: active,
        next: energyChipLabel(next, undefined, hass, unit),
      }),
      inPeriod: period !== null,
      late,
      waiting,
      title:
        late && view
          ? localize("energy.late", hass, { date: formatDay(view.from, hass, true) })
          : "",
      onCycle: () => this._cycleEnergy(),
      // Expanded: the date of a late start only in the tooltip, so no value
      // grows when it is picked (QB-14, EM-2).
      options: order.map((p) => {
        const v = p ? this._energyViews.get(p) : undefined;
        const lateHere = p !== null && v?.lateStart === true;
        return {
          label: energyChipLabel(p, undefined, hass, unit),
          late: lateHere,
          title:
            lateHere && v
              ? localize("energy.late", hass, { date: formatDay(v.from, hass, true) })
              : "",
        };
      }),
      selected: order.indexOf(period),
      onSelect: (index: number) => this._selectEnergy(order[index]),
    };
  }

  /** Drawn node diameter in CSS px; mirrors --el-node-size in styles.ts. */
  private get _nodePx(): number {
    return Math.max(70, 112 * this._scale + 11);
  }

  /** The arrangement as drawn now (AN-1): the battery decides the triangle's height. */
  private _geometry() {
    const config = this._config as Config;
    return geometryFor(config.layout, config.flow.lines, (this._model?.battery ?? null) !== null);
  }

  /** One tap, the next scale of the PV ring (PV-6); remembered like the rest (V-12). */
  private _cyclePvScale(): void {
    const scales = this._config?.view.pvScales ?? [];
    if (scales.length < 2) return;
    this._setPvScale(scales[(scales.indexOf(this._pvScale) + 1) % scales.length]);
  }

  /** A scale of the PV ring, picked directly or as the next one (PV-6, QB-10). */
  private _setPvScale(scale: PvScale): void {
    this._pvScale = scale;
    if (this._config?.view.remember && !isPreview(this)) {
      store(this._memKey(PV_SCALE_KEY), this._pvScale);
    }
  }

  /** The PV scale chip as the header draws it; undefined when fixed or absent (PV-6). */
  private _pvScaleChip(hass: HomeAssistant, config: Config): ScaleChip | undefined {
    const scales = config.view.pvScales;
    if (scales.length < 2) return undefined;
    const label = (scale: PvScale) => localize(`pv_scale.${scale}`, hass);
    const next = scales[(scales.indexOf(this._pvScale) + 1) % scales.length];
    const titleKey =
      this._pvScale === "peak" && this._period
        ? "pv_scale.peak_period_title"
        : `pv_scale.${this._pvScale}_title`;
    return {
      labels: scales.map(label),
      active: label(this._pvScale),
      ariaLabel: localize("pv_scale.chip", hass, { mode: label(this._pvScale), next: label(next) }),
      title: localize(titleKey, hass),
      onCycle: () => this._cyclePvScale(),
      // Expanded, each scale says what it shows (PV-6, QB-10).
      titles: scales.map((scale) =>
        localize(
          scale === "peak" && this._period
            ? "pv_scale.peak_period_title"
            : `pv_scale.${scale}_title`,
          hass,
        ),
      ),
      selected: scales.indexOf(this._pvScale),
      onSelect: (index: number) => this._setPvScale(scales[index]),
    };
  }

  private _toggleShowAll(): void {
    this._showAll = !this._showAll;
    if (this._config?.view.remember && !isPreview(this)) {
      store(this._memKey(SHOW_ALL_KEY), this._showAll ? "1" : "0");
    }
    // Re-select at once rather than on the next tick; the FLIP in updated()
    // glides the rows that move.
    if (this._hass && this._config) this._tickModel = this._modelForMode(this._hass, this._config);
  }
  private readonly _onVisibility = () => {
    this._syncPlayState();
    if (document.visibilityState === "hidden") this._pause(Date.now());
    else this._resume();
  };

  /** When the card stopped seeing readings: page hidden, connection lost,
   *  taken out of the page, or a tick that came far too late (REQ V-7). */
  private _pausedAt?: number;
  /** When the last tick ran - a device asleep says nothing, its timers just stop. */
  private _lastTick?: number;

  private _pause(at: number): void {
    this._pausedAt ??= at;
  }

  /**
   * Back from a pause: one that outlasted update_interval_s is a gap. The
   * buffer holds no value across it, and counts as not prefilled, so the
   * check after the next render fetches the history again - at once in an
   * average view, otherwise when one is chosen (REQ V-7, issue #18).
   */
  private _resume(): void {
    const since = this._pausedAt;
    if (since === undefined || !this.isConnected || document.visibilityState === "hidden") return;
    if (this._realHass?.connected === false) return;
    this._pausedAt = undefined;
    const now = Date.now();
    // The tick that was due during the pause comes late now - it must not
    // count the same pause a second time.
    this._lastTick = now;
    if (!this._config || now - since <= this._config.updateIntervalS * 1000) return;
    this._buffer?.markGap(since, now);
    this._historyFor = undefined;
    if (this._hass) this._tickModel = this._modelForMode(this._hass, this._config);
    this.requestUpdate();
  }
  private readonly _onMotionChange = () => this.requestUpdate();
  /** The fill of a circle changed after drawing - card-mod arriving late, a
   *  theme - and the browser says so; nothing in hass would (REQ K-16, T-3). */
  private readonly _onTransitionEnd = (ev: Event) => {
    const { propertyName, target } = ev as TransitionEvent;
    if (propertyName !== "outline-color" || !(target instanceof HTMLElement)) return;
    const plot = target.classList.contains("node") ? target.closest(".plot") : null;
    if (plot) this._measureHoles(plot as HTMLElement);
  };
  /** How much the browser stretches motion paths (issue #7, render/path-zoom.ts). */
  private _pathZoom = 1;
  private readonly _onWindowResize = () => this._measurePathZoom();

  set hass(real: HomeAssistant) {
    this._realHass = real;
    if (real.connected === false) this._pause(Date.now());
    else this._resume();
    const wasExample = this._example;
    const hass = this._withExample(real);
    const previous = this._hass;
    this._hass = hass;
    if (!this._config) return;
    this._checkStatistics();
    // Only rebuild and draw when something the card shows changed (REQ T-3).
    if (previous && wasExample === this._example && !this._shownChanged(previous, hass)) return;
    if (this._config.gridStatus) {
      this._outage = readStatus(hass, this._config.gridStatus, this._outage);
    }
    this._observeCharge(hass);
    // Invented readings are no last values of real sources (E-5).
    if (!this._example) this._solarMemory.observe(hass, this._config.solarSources);
    this._model = buildModel(hass, this._config, this._chargeOf, this._solarMemory.values);
    this._tickModel ??= this._model;
    // Invented readings never go into the averages: they would outlive the
    // example as a "measured" mean (E-5).
    if (!this._example) this._recordSamples(hass);
    // A new model asks for a render by itself; a theme, a language or a
    // reconnect changes none, so the request is made here for all of them.
    this.requestUpdate("hass", previous);
  }
  /** Whether the card shows invented readings, marked as such (REQ E-5). */
  private _example = false;
  /** A tap on an example node would open a dialog for an entity that does not exist. */
  private _onMoreInfo = (ev: Event): void => {
    if (this._example) ev.stopPropagation();
  };

  /**
   * Grid or battery with two sensors: Home Assistant's dialog manager opens
   * the detail window (REQ DF-2). In the editor's preview it would cover the
   * editor - there the entity of the running direction opens, as before.
   */
  private _onDetail = (ev: Event): void => {
    ev.stopPropagation();
    if (this._example) return;
    const request = (ev as CustomEvent<DetailRequest>).detail;
    const origin = ev.composedPath()[0] as HTMLElement | undefined;
    if (isPreview(this)) {
      if (request.entity) openMoreInfo(origin ?? this, request.entity);
      return;
    }
    this.dispatchEvent(
      new CustomEvent("show-dialog", {
        bubbles: true,
        composed: true,
        detail: {
          dialogTag: DETAIL_NAME,
          // The element comes with the bundle (G-4): nothing to load.
          dialogImport: () => Promise.resolve(),
          dialogParams: { card: this, node: request.node, origin, entity: request.entity },
        },
      }),
    );
  };

  /** The hass Home Assistant handed over, before any example was put in. */
  private _realHass?: HomeAssistant;

  /**
   * A new card starts with placeholder sensors (E-5). Where none of the
   * configured entities exists and they are only those placeholders, the card
   * reads invented values instead and says so in a banner - in the card
   * picker, which sets no preview flag, in the editor and on a dashboard
   * alike. Any real configuration, even one whose sensors are missing, keeps
   * its own readings: measured values are never made up.
   */
  private _withExample(hass: HomeAssistant): HomeAssistant {
    // Every entity the configuration names counts - extra values and charge
    // sensors too - and one Home Assistant knows of, even without a state yet
    // (a restart), is real.
    const ids = [...this._entityIds, ...this._extraIds, ...this._chargeIds];
    const placeholders: string[] = Object.values(STUB_ENTITIES);
    this._example =
      this._entityIds.length > 0 &&
      ids.every((id) => placeholders.includes(id)) &&
      !ids.some((id) => hass?.states?.[id] || hass?.entities?.[id]);
    if (!this._example) return hass;
    return { ...hass, states: { ...hass.states, ...EXAMPLE_STATES } };
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  /**
   * Whether anything the card shows differs between two hass objects (REQ
   * T-3): the state of any entity it reads, and what Home Assistant writes
   * them with - language, number format, its formatter, a display precision -
   * plus the theme and the connection. The list follows what HA's own cards
   * compare (has-changed.ts), less what this card never reads. What render
   * reads directly and is missed here waits for the next tick at most; what
   * only this setter derives - the outage latch, the charge memory, the
   * samples - waits for the next change that passes, so its inputs belong here.
   */
  private _shownChanged(a: HomeAssistant, b: HomeAssistant): boolean {
    const ids = [...this._entityIds, ...this._chargeIds, ...this._extraIds];
    if (ids.some((id) => a.states[id] !== b.states[id])) return true;
    // An extra field is written the way Home Assistant writes it. HA rebuilds
    // its formatter after a new precision, number format or translation - only
    // then is the new text there to show (REQ Z-5, Z-9).
    if (
      a.language !== b.language ||
      a.locale !== b.locale ||
      a.formatEntityState !== b.formatEntityState ||
      a.themes !== b.themes ||
      a.connected !== b.connected
    ) {
      return true;
    }
    if (a.entities === b.entities) return false;
    return ids.some(
      (id) => a.entities?.[id]?.display_precision !== b.entities?.[id]?.display_precision,
    );
  }

  /** Remembers plugged state and the last state of charge (REQ L-15). */
  private _observeCharge(hass: HomeAssistant): void {
    if (!this._config || this._chargeIds.length === 0) return;
    this._charge.observe(hass, this._config.consumers);
  }

  /**
   * The two recorder lookups besides the averaging history: the last real
   * grid status, so an outage that began before the card opened is shown
   * (REQ NS-6), and the last value of a state of charge that has none right
   * now - a car asleep since before the card opened (REQ L-15).
   *
   * After a render, like _ensureHistory and for the same reason: Home
   * Assistant sets `preview` only after the first hass, and the editor
   * preview, rebuilt on every keystroke, must not ask at all (issue #17).
   */
  private _ensureLookups(): void {
    const hass = this._hass;
    if (!hass || !this._config) return;
    // Example values have nothing to look up (E-5).
    if (this._example || (this as unknown as { preview?: boolean }).preview) return;
    if (this._config.gridStatus && !this._outagePrefilled) {
      this._outagePrefilled = true;
      void this._prefillOutage();
    }
    // A PV source already gone when the card opened: was it night, or a
    // fault? The recorder knows its last value (REQ PV-2).
    const gone = this._solarMemory.missing(hass, this._config.solarSources);
    if (gone.length > 0) {
      this._solarMemory
        .prefill(hass, this._config.solarSources, gone)
        .catch(() => undefined)
        .finally(() => {
          if (this._hass && this._config) {
            this._model = buildModel(
              this._hass,
              this._config,
              this._chargeOf,
              this._solarMemory.values,
            );
            this._tickModel = this._modelForMode(this._hass, this._config);
          }
          this.requestUpdate();
        });
    }
    if (this._chargeIds.length === 0) return;
    const missing = this._charge.missing(hass, this._config.consumers);
    if (missing.length === 0) return;
    this._charge
      .prefill(hass, missing)
      .catch(() => undefined)
      .finally(() => {
        if (this._hass && this._config) {
          this._model = buildModel(
            this._hass,
            this._config,
            this._chargeOf,
            this._solarMemory.values,
          );
          this._tickModel = this._modelForMode(this._hass, this._config);
        }
        this.requestUpdate();
      });
  }

  /**
   * The GUI editor calls this on every keystroke and every drag of the colour
   * wheel, so it resets only what the new configuration actually changed.
   * Rebuilding the averaging buffer or jumping back to the start view would
   * move every value at once, the list would reorder, and all of it would glide
   * - a lurch on the preview for a change that was only about a colour.
   */
  setConfig(config: RawConfig): void {
    const previous = this._config;
    // Structural problems throw so HA shows its error card; runtime problems
    // never do - they are rendered inside the card (REQ E-1).
    this._config = normalizeConfig(config, this._hass);
    this._rawConfig = config;
    this._entityIds = collectEntityIds(this._config);
    this._chargeIds = collectChargeIds(this._config);
    this._extraIds = collectExtraIds(this._config);
    // An edit can end the example (or start it) before the next state update.
    if (this._realHass) this._hass = this._withExample(this._realHass);

    const view = this._config.view;
    if (!previous || previous.view.avgLongMinutes !== view.avgLongMinutes) {
      this._buffer = new AveragingBuffer(view.avgLongMinutes * 60_000);
    }

    // What was remembered is read on the first render, once the card stands
    // on the page: only then does it know whether a twin stands before it (V-12).
    if (!previous) this._rememberPending = true;
    // The view the user is on is theirs until the configured start view itself
    // changes or the view is no longer offered - not something an unrelated
    // edit takes away from them. On opening a remembered view wins while
    // offered; a start value changed in the editor shows at once (QB-4).
    if (
      !previous ||
      previous.view.defaultMode !== view.defaultMode ||
      !view.modes.includes(this._mode)
    ) {
      this._mode = view.defaultMode;
    }
    // The scale follows the same rule as the other buttons (QB-4).
    if (
      !previous ||
      previous.view.defaultPvScale !== view.defaultPvScale ||
      !view.pvScales.includes(this._pvScale)
    ) {
      this._pvScale = view.defaultPvScale;
    }
    const list = this._config.list;
    const scope = this._showAll ? "full" : "filtered";
    if (
      !previous ||
      previous.list.defaultScope !== list.defaultScope ||
      !list.scope.includes(scope)
    ) {
      this._showAll = list.defaultScope === "full";
    }

    // Fetched periods hold for the same entities only (EM-4).
    const key = energyKey(this._config);
    if (key !== this._energyKey) {
      this._energyKey = key;
      this._energyViews.clear();
      this._energyAsked.clear();
      this._energyPending = undefined;
    }
    if (mainEntities(this._config).join(",") !== this._statsKey || !view.energyDefault) {
      this._statsKey = "";
      this._statsOk = undefined;
      this._statsRetryAt = 0;
    }
    // A value no longer offered goes to the start value (QB-4), and one
    // still loading is not shown when it arrives.
    const offer = this._energyOffer(this._config);
    if (
      !previous ||
      previous.view.defaultEnergy !== view.defaultEnergy ||
      !offer.includes(this._energyPeriod)
    ) {
      this._startEnergy(this._config, false);
    }
    if (this._energyPending !== undefined && !offer.includes(this._energyPending)) {
      this._energyPending = undefined;
    }
    this._checkStatistics();
    // A new buffer or view wants its history, fetched after the next render.
    // Setting the model above already asks for that render where hass is
    // there; this only makes sure of it.
    this.requestUpdate();

    // A latched outage is history, not configuration; only a different status
    // entity makes what we latched meaningless.
    if (!previous || !sameStatus(previous.gridStatus, this._config.gridStatus)) {
      this._outage = undefined;
      this._outagePrefilled = false;
    }

    if (this._hass) {
      this._observeCharge(this._hass);
      this._model = buildModel(this._hass, this._config, this._chargeOf, this._solarMemory.values);
      this._tickModel = this._model;
    }
    if (!previous || previous.updateIntervalS !== this._config.updateIntervalS) {
      this._restartTick();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    LIVE.add(this);
    // Text keeps a minimum size in CSS pixels while the drawing scales, so the
    // card stays legible on a phone (REQ K-12).
    this._resizeObserver = new ResizeObserver(() => {
      this._measure();
      // The rows may have moved without a render - a late font, a column
      // that got its width. Cheap: the fan writes only what changed.
      this._drawFan();
      // A new layout may come with a new zoom (issue #7, render/path-zoom.ts).
      this._measurePathZoom();
    });
    this._resizeObserver.observe(this);
    // Zooming the page resizes the window in CSS pixels even where the card
    // keeps its width, so this is where a new zoom shows up (issue #7).
    window.addEventListener("resize", this._onWindowResize);

    this._technique = detectTechnique();

    // Animations cost nothing while nobody is looking (REQ P-8).
    this._intersectionObserver = new IntersectionObserver((entries) => {
      this._visible = entries.some((e) => e.isIntersecting);
      this._syncPlayState();
      // Back in view: the lines to where the rows are now, and along with any
      // glide still under way.
      if (this._visible && this._config) this._updateFan();
    });
    this._intersectionObserver.observe(this);
    this._pickUpLiveDesigns();
    document.addEventListener("visibilitychange", this._onVisibility);
    this.renderRoot.addEventListener("transitionend", this._onTransitionEnd);
    this._resume();

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
    this._lastTick = Date.now();
    this._tickTimer = setInterval(() => {
      // A tick more than twice late means the timers stood still - a device
      // asleep without a visibility event. The gap began at the last tick.
      const now = Date.now();
      const last = this._lastTick ?? now;
      this._lastTick = now;
      if (now - last > 2 * seconds * 1000) {
        this._pause(last);
        this._resume();
      }
      if (!this._hass || !this._config) return;
      // In an average mode the window keeps moving even when no sensor changed,
      // so the tick recomputes rather than reusing the last model (REQ T-1).
      this._tickModel = this._modelForMode(this._hass, this._config);
      this._updateSince();
      this.requestUpdate();
    }, seconds * 1000);
  }

  /**
   * Dots only where they move: switched off, or in a browser that cannot move
   * them along a path, a dot standing still says nothing (P-7, 03.10.2026).
   */
  private get _dotsMove(): boolean {
    return this._animationsWanted && this._technique === "waapi";
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
    // A period hands the model its means over the period; the whole pipeline
    // - balance, list, ring - then works as it does for the averages (EM-4).
    const period = this._period;
    if (period) {
      const view = this._energyViews.get(period);
      return buildModelFrom(
        hass,
        config,
        (id) => view?.meanW(id) ?? null,
        this._chargeOf,
        this._solarMemory.values,
      );
    }
    // The example has no history to average; it shows its invented now.
    if (this._mode === "current" || !this._buffer || this._example) {
      return buildModel(hass, config, this._chargeOf, this._solarMemory.values);
    }
    const minutes =
      this._mode === "avg_short" ? config.view.avgShortMinutes : config.view.avgLongMinutes;
    const windowMs = minutes * 60_000;
    const now = Date.now();
    const buffer = this._buffer;
    // The state of charge is never averaged, so buildModelFrom reads it live.
    return buildModelFrom(
      hass,
      config,
      (entityId) => buffer.mean(entityId, windowMs, now),
      this._chargeOf,
    );
  }

  /**
   * Fetches the recent history into the averaging buffer once it is wanted
   * (REQ V-6): an average view is on and this buffer has not been filled yet.
   * Called after every render rather than from setConfig or the hass setter -
   * Home Assistant calls setConfig before it hands over hass and sets
   * `preview` only after the first hass, so a fetch started there either went
   * nowhere (issue #16) or would run in the editor preview. `force` is a tap
   * on a chip: it fetches again, which also mends a gap (until V-7 does).
   */
  private _ensureHistory(force = false): void {
    const buffer = this._buffer;
    if (!buffer || this._mode === "current" || !this._hass || !this._config) return;
    if (!force && this._historyFor === buffer) return;
    // Example values are never averaged (E-5); the preview fetches nothing.
    if (this._example || (this as unknown as { preview?: boolean }).preview) return;
    this._historyFor = buffer;
    void this._prefill(buffer);
  }

  private async _prefill(buffer: AveragingBuffer): Promise<void> {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config) return;
    const asked = Date.now();
    try {
      const history = await fetchHistory(hass, this._entityIds, config.view.avgLongMinutes);
      // A new window length brought a new buffer meanwhile: this answer is
      // for the old one and has its own fetch coming.
      if (buffer !== this._buffer) return;
      for (const [entityId, samples] of Object.entries(history)) {
        const unit = hass.states[entityId]?.attributes.unit_of_measurement;
        for (const sample of samples as Sample[]) {
          buffer.push(entityId, sample.t, this._toWatts(sample.v, unit));
        }
      }
      // The history describes every pause that was over when it was asked for,
      // for the entities it answered for (REQ V-7); the rest stays a gap.
      buffer.healGaps(
        asked,
        Object.entries(history)
          .filter(([, samples]) => samples.length > 0)
          .map(([entityId]) => entityId),
      );
      // List order, ring and dots follow the full mean now, not at the next
      // tick up to update_interval_s later (V-8).
      if (this._hass && this._config) {
        this._tickModel = this._modelForMode(this._hass, this._config);
      }
      this._updateSince();
    } catch {
      // Recorder slow or unavailable: carry on with live buffering and label
      // the mode with "since hh:mm" until the window fills (REQ V-6). No retry
      // on its own - a tap on a chip asks again.
      this._updateSince();
    } finally {
      this.requestUpdate();
    }
  }

  /**
   * The latch has no history of its own when the card is loaded, so the last
   * real state from the recorder gives it one. Without this, a card opened
   * during an outage that already went unavailable would show a normal grid
   * (REQ NS-6).
   */
  private async _prefillOutage(): Promise<void> {
    const spec = this._config?.gridStatus;
    if (!this._hass || !spec) return;
    try {
      const state = await fetchLastKnownStatus(this._hass, spec.entity);
      // A live state that arrived meanwhile wins - it is newer than the query.
      // An answer for a status entity the config has since replaced is dropped.
      if (this._outage === undefined && sameStatus(this._config?.gridStatus, spec)) {
        this._outage = applyStatus(undefined, state, spec, statusOptions(this._hass, spec.entity));
      }
    } catch {
      // Recorder slow or unavailable: the latch stays unknown and the card
      // draws a normal grid rather than claiming an outage it cannot prove.
    } finally {
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
    // A tap in the editor preview is a look, not a choice (as in _showEnergy).
    if (this._config?.view.remember && !isPreview(this)) store(this._memKey(MODE_KEY), mode);
    this._ensureHistory(true);
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
  /** Returns true when the measurement moved the layout, so the caller knows
   *  the picture is not settled yet. */
  private _measure(): boolean {
    const plot = this.renderRoot?.querySelector(".plot") as HTMLElement | null;
    const width = plot?.getBoundingClientRect().width ?? 0;
    if (width > 0) {
      const scale = width / VIEW_W;
      this._plotScale = scale;
      this.style.setProperty("--el-scale", String(scale));
      this._dots?.setScale(scale);
      // Only a real change re-renders; sub-pixel noise from the observer does not.
      if (Math.abs(scale - this._scale) > 0.005) this._scale = scale;
      this._measureHoles(plot as HTMLElement);
    }
    return this._checkStacked();
  }

  /**
   * How far the inside of a circle reaches in the plot's user units, for the
   * cut-out under the nodes (REQ K-16). Measured on a drawn node rather than
   * taken from its size formula: both sizes come from the computed style, in
   * layout pixels, which the SVG's user units follow. A scaled element above
   * the card shrinks the boxes on screen, not these. Read after --el-scale is
   * set, so the node already has the size that scale gives it.
   */
  private _measureHoles(plot: HTMLElement): void {
    const node = plot.querySelector(".node") as HTMLElement | null;
    if (!node) return;
    const style = getComputedStyle(node);
    // Only a fill that lets the lines show through gets the cut-out; behind
    // an opaque one the card draws as it did before K-16, without the cost of
    // clipping the moving dots. Read on every measurement, so a theme change
    // or card-mod arriving late is picked up with the next update.
    const through = seeThrough(style.backgroundColor);
    if (through !== this._seeThrough) this._seeThrough = through;
    if (!through) return;
    const plotPx = Number.parseFloat(getComputedStyle(plot).width);
    const insidePx =
      Number.parseFloat(style.width) / 2 - Number.parseFloat(style.borderTopWidth || "0");
    const r = (insidePx * VIEW_W) / plotPx;
    if (!(r > 0) || !Number.isFinite(r) || Math.abs(r - this._holeR) < 0.005) return;
    this._holeR = r;
    // Straight onto the path: a measurement does not re-render. The next
    // render writes the same value from _holeR.
    plot.querySelector("path.holes")?.setAttribute("d", holesPathOf(this._geometry(), r));
  }

  /**
   * Measures the WebKit bug that puts the dots beside their lines when the page
   * is zoomed (issue #7; the why and how are in render/path-zoom.ts). Looks
   * like it does nothing wherever the bug does not strike: outside WebKit it
   * does not measure, and in a WebKit without the bug the factor is 1. Called
   * on a new layout and on every window resize, not on every render: the
   * probe costs a layout of its own.
   */
  private _measurePathZoom(): void {
    if (this._technique !== "waapi" || !mayStretchPaths()) return;
    const svg = this.renderRoot?.querySelector(".plot svg") as SVGSVGElement | null;
    const zoom = svg ? measurePathZoom(svg) : undefined;
    if (zoom === undefined || Math.abs(zoom - this._pathZoom) < 0.002) return;
    this._pathZoom = zoom;
    this._dots?.setPathZoom(zoom);
    this._fan?.setPathZoom(zoom);
    this._solarFan?.setPathZoom(zoom);
    // The fan sets its paths when it draws; the cross dots took theirs above.
    this._drawFan();
  }

  /**
   * Whether the list wrapped below the cross. Measured rather than derived from
   * a width threshold: the flex bases live in the stylesheet, and a number
   * duplicated here would silently drift apart from them.
   */
  private _checkStacked(): boolean {
    const cross = this.renderRoot?.querySelector(".cross") as HTMLElement | null;
    const list = this.renderRoot?.querySelector(".list:not(.pv-side)") as HTMLElement | null;
    const body = this.renderRoot?.querySelector(".body") as HTMLElement | null;
    if (!cross || !body) return false;
    let stacked: boolean;
    if (this._splitsLists()) {
      // Not laid out yet (or hidden): nothing to measure.
      if (body.clientWidth === 0) return false;
      if (this._stacked) {
        // Both lists below (forced, so they cannot climb back on their own)
        // until the card is wider than where they last did not fit: a figure
        // growing from "999 W" to "1,00 kW" cannot tip it (AN-3).
        stacked = body.clientWidth <= this._stackedWidth;
      } else {
        // Three in a row, or one of them wrapped: a wrapped item starts at
        // the left again.
        const side = this.renderRoot.querySelector(".pv-side") as HTMLElement | null;
        stacked =
          (side !== null && cross.offsetLeft <= side.offsetLeft) ||
          (list !== null && list.offsetLeft <= cross.offsetLeft);
      }
    } else {
      if (!list) return false;
      stacked = list.offsetTop >= cross.offsetTop + cross.offsetHeight / 2;
    }
    if (stacked === this._stacked) return false;
    if (stacked) this._stackedWidth = body.clientWidth;
    this._stacked = stacked;
    this.requestUpdate();
    return true;
  }

  /** Square, solar left with PV rows (AN-3): one list on each side of the drawing. */
  private _splitsLists(): boolean {
    return this._config?.layout === "square_left" && this._lastSolar.size > 0;
  }

  /**
   * One line from the house node to each row, with dots on it (REQ P-1 style).
   *
   * Beside the cross the lines start at the right edge of the house node.
   * Stacked below it they start at the left edge of the rows, halfway down the
   * block - a fan from the house node would have to cross every row above its
   * target, but the rows still deserve lines that converge on one point rather
   * than parallel bars (REQ L-13). The list is HTML and the cross is SVG, so
   * there is no shared coordinate system: both are measured and the fan is
   * drawn in CSS pixels on its own overlay.
   */
  private _updateFan(): void {
    this._drawFan();
    // Rows glide for GLIDE_MS after a reorder. The lines follow them frame by
    // frame - measured mid-transform, getBoundingClientRect reports where a
    // row is drawn, not where it will land - but only while one is under way:
    // most renders move no row, and the loop used to run after each of them.
    if (!this._visible || typeof requestAnimationFrame !== "function") return;
    if (!this._rows.gliding(this.renderRoot.querySelector(".body"))) return;
    // A glide that starts while the loop runs gets its full time too.
    this._fanFollowUntil = performance.now() + FAN_FOLLOW_MAX_MS;
    // A loop already running is left be; it asks the rows itself.
    if (this._fanFollow !== undefined) return;
    const step = () => {
      // Cleared first, so a draw that throws cannot block every later loop.
      this._fanFollow = undefined;
      // Asked before drawing, so the frame after the last glide ended still
      // draws - the rows in their places, a new row at full opacity.
      const more =
        this._visible &&
        performance.now() < this._fanFollowUntil &&
        this._rows.gliding(this.renderRoot.querySelector(".body"));
      this._drawFan();
      if (more) this._fanFollow = requestAnimationFrame(step);
    };
    this._fanFollow = requestAnimationFrame(step);
  }

  private _drawFan(): void {
    if (!this._config) return;
    // The blocks first: the fans are measured from where the rows stand.
    this._placeLists();
    this._drawConsumerFan();
    this._drawSolarFan();
  }

  /**
   * Beside the drawing, the PV rows level with the PV node and the consumers
   * with the house - as far as they fit; together taller than the drawing
   * they stand as the layout put them, with the drawing in their middle
   * (L-17). Moved by transform, not margin: layout stays as it was, so the
   * stacked check cannot swing on it.
   */
  private _placeLists(): void {
    const pv = this.renderRoot?.querySelector(".pv-rows") as HTMLElement | null;
    const rows = this.renderRoot?.querySelector(".rows") as HTMLElement | null;
    const blocks = [pv, rows].filter((b): b is HTMLElement => b !== null);
    const body = this.renderRoot?.querySelector(".body") as HTMLElement | null;
    const cross = this.renderRoot?.querySelector(".cross") as HTMLElement | null;
    const solar = this.renderRoot?.querySelector(".node.solar") as HTMLElement | null;
    const house = this.renderRoot?.querySelector(".node.house") as HTMLElement | null;
    if (this._stacked || !pv || !body || !cross || !solar || !house) {
      for (const b of blocks) b.style.transform = "";
      return;
    }
    const apart = pv.parentElement?.classList.contains("pv-side") ?? false;
    const origin = body.getBoundingClientRect().top;
    const shift = (el: HTMLElement) => {
      const m = /translateY\((-?[\d.]+)px\)/.exec(el.style.transform);
      return m ? Number(m[1]) : 0;
    };
    const centre = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - origin;
    };
    const block = (el: HTMLElement | null, node: HTMLElement) => {
      if (!el) return { top: 0, height: 0, node: centre(node) };
      const r = el.getBoundingClientRect();
      return { top: r.top - origin - shift(el), height: r.height, node: centre(node) };
    };
    const c = cross.getBoundingClientRect();
    const drawing = { top: c.top - origin, bottom: c.bottom - origin };
    const set = (el: HTMLElement | null, by: number) => {
      if (!el) return;
      const t = by ? `translateY(${by}px)` : "";
      if (el.style.transform !== t) el.style.transform = t;
    };
    if (apart) {
      // One list on each side (AN-3): each one alone with its node.
      set(pv, placeBlock(drawing, block(pv, solar)));
      if (rows) set(rows, placeBlock(drawing, block(rows, house)));
      return;
    }
    const moves = placeBlocks({
      drawing,
      pv: block(pv, solar),
      consumers: block(rows, house),
      // The margin under the PV rows (styles.ts): they part no closer.
      gap: 10,
    });
    set(pv, moves.pv);
    set(rows, moves.consumers);
  }

  /** A fan's rows as the layer draws them (P-9, L-13, L-15). */
  private _fanRows(
    rows: HTMLElement[],
    entries: Map<string, { w: number; color: string; threshold: number }>,
    origin: DOMRect,
    side: 1 | -1 = 1,
  ) {
    return rows
      .map((row) => {
        const key = row.dataset.key;
        const entry = key ? entries.get(key) : undefined;
        if (!entry) return null;
        /*
         * Two questions, two answers (REQ P-9, changed 20.09.2026).
         *
         * The colour says whether anything flows here, and for a row that is
         * the same question as whether it earned its place in the list - a
         * consumer listed with 15 W and a grey line beside it contradicted
         * itself. Only a row that the filter had to be lifted for is drawn
         * grey, and then flow.inactive_lines decides how: hidden means no
         * line at all (L-13).
         *
         * The dots ask something else - is there enough for movement to be
         * worth watching - and that is still flow.min_w. A coloured line
         * without dots therefore reads "yes, but little", which is true.
         */
        const params = dotParams(entry.w, this._shownConfig());
        // One test for line and ring segment alike, so the two cannot drift.
        const quiet = !carries(entry, this._shownConfig());
        const mode = this._config?.flow.inactiveLines ?? "show";
        if (quiet && mode === "hide") return null;
        // Stacked, the line ends at the colour mark, not at the row's edge -
        // the runway column lies in between.
        const target = this._stacked
          ? ((row.querySelector(".swatch") as HTMLElement | null) ?? row)
          : row;
        const box = target.getBoundingClientRect();
        const rowBox = row.getBoundingClientRect();
        // A state-of-charge ring reaches beyond the mark; the line stops at
        // the ring instead of running into it (REQ L-15).
        const ring = row.querySelector(".charge-ring");
        const left = ring ? Math.min(box.left, ring.getBoundingClientRect().left) : box.left;
        return {
          key: key as string,
          x: (side === 1 ? left : box.right) - origin.left,
          y: rowBox.top + rowBox.height / 2 - origin.top,
          color: entry.color,
          // No dots without motion, as on the cross (P-7).
          count: this._dotsMove ? (params?.count ?? 0) : 0,
          durationS: params?.durationS ?? 1,
          inactive: quiet && mode !== "hide" ? mode : undefined,
          // A row still fading in brings its line along, not ahead of it.
          fade: rowOpacity(row),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }

  /** A layer for an overlay, set up like the cross (P-10, P-13, issue #7). */
  private _layer(existing: FanLayer | undefined, svg: SVGSVGElement): FanLayer {
    const layer = existing ?? new FanLayer(svg);
    if (!existing) layer.setPathZoom(this._pathZoom);
    const config = this._config as Config;
    layer.setDesign(flowDesign(config.flow.design), groundIsDark(this, config.appearance));
    layer.setDotColor(config.flow.dotColor);
    // The base size of the connection dots and the colour mark, grown with
    // the card like the cross (K-12).
    layer.setDotRadius(5);
    layer.setDotScale(sizeFactors(this._plotScale, config.flow).dot);
    return layer;
  }

  /**
   * Where a fan leaves its node beside the drawing (L-16): on the circle,
   * towards the middle of its rows, and the circle's inside for the cut-out
   * (K-16) - measured on screen, the border at the same scale as the box.
   */
  private _exit(
    node: HTMLElement,
    rows: { x: number; y: number }[],
    origin: DOMRect,
    side: 1 | -1,
  ) {
    const box = node.getBoundingClientRect();
    const centre = {
      x: box.left + box.width / 2 - origin.left,
      y: box.top + box.height / 2 - origin.top,
    };
    const rowX =
      rows.length > 0
        ? side === 1
          ? Math.min(...rows.map((r) => r.x))
          : Math.max(...rows.map((r) => r.x))
        : undefined;
    const dir = exitDirection(
      centre,
      rows.map((r) => r.y),
      side,
      rowX,
    );
    const radius = box.width / 2;
    const start = { x: centre.x + dir.x * radius, y: centre.y + dir.y * radius };
    const border = Number.parseFloat(getComputedStyle(node).borderTopWidth) || 0;
    const scale = box.width / (node.offsetWidth || box.width);
    const hole = this._seeThrough
      ? { x: centre.x, y: centre.y, r: radius - border * scale }
      : undefined;
    // The straight piece out of the circle grows with the lines (K-12).
    const lead = 10 * sizeFactors(this._plotScale, (this._config as Config).flow).line;
    return { centre, dir, start, hole, lead, radius };
  }

  /**
   * One line from the house node to each row, with dots on it (REQ P-1 style).
   *
   * Beside the cross the lines leave the house towards their rows (L-16).
   * Stacked below it they start at the left edge of the rows, halfway down the
   * block - a fan from the house node would have to cross every row above its
   * target, but the rows still deserve lines that converge on one point rather
   * than parallel bars (REQ L-13). The list is HTML and the cross is SVG, so
   * there is no shared coordinate system: both are measured and the fan is
   * drawn in CSS pixels on its own overlay.
   */
  private _drawConsumerFan(): void {
    const svg = this.renderRoot?.querySelector("svg.fan:not(.pv-fan)") as SVGSVGElement | null;
    if (!svg || !this._config) return;
    this._fan = this._layer(this._fan, svg);
    const body = this.renderRoot.querySelector(".body") as HTMLElement | null;
    const house = this.renderRoot.querySelector(".node.house") as HTMLElement | null;
    const block = this.renderRoot.querySelector(".rows") as HTMLElement | null;
    const rows = [...this.renderRoot.querySelectorAll<HTMLElement>(".rows .row")];
    if (!body || !house || !block || rows.length === 0) {
      this._fan.destroy();
      return;
    }
    const origin = body.getBoundingClientRect();
    const fanRows = this._fanRows(rows, this._lastEntries, origin);
    const size = { width: origin.width, height: origin.height };
    if (this._stacked) {
      const b = block.getBoundingClientRect();
      this._fan.route = undefined;
      this._fan.update(
        fanRows,
        { x: b.left - origin.left, y: b.top + b.height / 2 - origin.top },
        size,
        this._animationsWanted,
      );
      return;
    }
    const exit = this._exit(house, fanRows, origin, 1);
    this._fan.route = exit.dir.y !== 0 ? (o, r) => fanPath(o, exit.dir, r, exit.lead) : undefined;
    this._fan.update(fanRows, exit.start, size, this._animationsWanted, exit.hole);
  }

  /**
   * The PV fan (PV-7): from each PV row into the PV node, dots running in.
   * Beside the drawing the lines leave the node together and part at one
   * point, as close to it as the house allows - none crosses another, none
   * the house or the consumers' lines. Stacked, they gather at the left of
   * the PV block, where the PV icon stands (L-13).
   */
  private _drawSolarFan(): void {
    const svg = this.renderRoot?.querySelector("svg.pv-fan") as SVGSVGElement | null;
    if (!svg || !this._config) return;
    this._solarFan = this._layer(this._solarFan, svg);
    this._solarFan.reverse = true;
    const body = this.renderRoot.querySelector(".body") as HTMLElement | null;
    const solar = this.renderRoot.querySelector(".node.solar") as HTMLElement | null;
    const house = this.renderRoot.querySelector(".node.house") as HTMLElement | null;
    const block = this.renderRoot.querySelector(".pv-rows") as HTMLElement | null;
    const rows = [...this.renderRoot.querySelectorAll<HTMLElement>(".pv-rows .row")];
    if (!body || !solar || !house || !block || rows.length === 0) {
      this._solarFan.destroy();
      return;
    }
    const origin = body.getBoundingClientRect();
    const apart = block.parentElement?.classList.contains("pv-side") ?? false;
    const fanRows = this._fanRows(rows, this._lastSolar, origin, apart ? -1 : 1);
    const size = { width: origin.width, height: origin.height };
    if (this._stacked) {
      const b = block.getBoundingClientRect();
      this._solarFan.route = undefined;
      this._solarFan.update(
        fanRows,
        { x: b.left - origin.left, y: b.top + b.height / 2 - origin.top },
        size,
        this._animationsWanted,
      );
      return;
    }
    // Left of the drawing in square, solar left (AN-3), else right of it.
    const side: 1 | -1 = block.parentElement?.classList.contains("pv-side") ? -1 : 1;
    const exit = this._exit(solar, fanRows, origin, side);
    // Clear of every other node by the line, its dots and some air (the
    // house beside the cross, the grid in square, solar left) ...
    const obstacles = [...this.renderRoot.querySelectorAll<HTMLElement>(".node:not(.solar)")].map(
      (node) => {
        const b = node.getBoundingClientRect();
        return {
          x: b.left + b.width / 2 - origin.left,
          y: b.top + b.height / 2 - origin.top,
          r: b.width / 2 + 14,
        };
      },
    );
    // ... and out of the strip right of the house, below its middle, where
    // the consumers' lines start.
    const h = house.getBoundingClientRect();
    const houseY = h.top + h.height / 2 - origin.top;
    const fanEdge = h.right - origin.left + 16;
    const rowX =
      side === 1 ? Math.min(...fanRows.map((r) => r.x)) : Math.max(...fanRows.map((r) => r.x));
    const xs = splitPoint(
      exit.start,
      fanRows.map((r) => r.y),
      rowX,
      side,
      obstacles,
      side === 1 ? (x, y) => x < fanEdge && y > houseY - 6 : undefined,
      exit.dir,
      exit.lead,
    );
    this._solarFan.route = (o, r) => trunkPath(o, exit.dir, xs, r, exit.lead);
    this._solarFan.update(fanRows, exit.start, size, this._animationsWanted, exit.hole);
  }

  /**
   * Only does anything in a local build: there a design saved in the tool shows
   * up after a reload without rebuilding the card (P-10). Once per card - the
   * result is cached in the module, but asking again would render again.
   *
   * Called when the card is connected, not when it becomes visible: an
   * IntersectionObserver may not report before the first paint, and the design
   * is needed for that paint.
   */
  private _pickUpLiveDesigns(): void {
    if (this._designsPickedUp) return;
    this._designsPickedUp = true;
    void loadLiveDesigns().then(() => this.requestUpdate());
  }

  /**
   * Says once when a configured design is not in this build. Falling back to
   * the plain dots is deliberate (P-10), but silently drawing something other
   * than what the configuration asks for is worth a word in the console.
   */
  private _warnUnknownDesign(found: boolean): void {
    const id = this._config?.flow.design;
    if (found || !id || id === "none" || this._warnedDesign === id) return;
    this._warnedDesign = id;
    console.warn(`${CARD_LABEL}: flow design "${id}" is not in this build - drawing plain dots.`);
  }

  private _syncPlayState(): void {
    const documentHidden = typeof document !== "undefined" && document.hidden;
    if (this._visible && !documentHidden) {
      this._dots?.resume();
      this._fan?.resume();
      this._solarFan?.resume();
    } else {
      this._dots?.pause();
      this._fan?.pause();
      this._solarFan?.pause();
      // Nobody is looking: the ring goes to its values now, not after its
      // glide - there may be no render to stop it until it is seen again (P-8).
      this._ring.stop();
      this._solarRing.stop();
    }
  }

  /**
   * The dot layer lives outside Lit's template: letting the template own those
   * elements would recreate them on every render and restart each animation,
   * which is what REQ P-6 forbids.
   */
  protected willUpdate(): void {
    if (this._rememberPending && this.isConnected) {
      this._rememberPending = false;
      this._applyRemembered();
    }
    // Measured against .body, not .rows: beside the cross the list is centred
    // vertically, so a changed row count shifts the whole block - a movement
    // the rows must glide through too.
    this._rows.capture(this.renderRoot?.querySelector(".body") ?? null);
  }

  protected updated(): void {
    this._ensureHistory();
    this._ensureLookups();
    this._ensureEnergy();
    this._rows.play(
      this.renderRoot.querySelector(".body"),
      this._animationsWanted && this._settled,
    );
    // Ahead of the early returns below: every render has to be compared with
    // the one before, or a reorder is judged against an older order.
    // Off-screen or in a hidden tab the ring goes straight to its values (P-8).
    // `jump` asks for a ring that never moves, whatever else does (R-4).
    const ringMoves =
      this._animationsWanted &&
      this._config?.ring.animation !== "jump" &&
      this._visible &&
      !(typeof document !== "undefined" && document.hidden);
    const nodeOf = (key: string) => this.renderRoot.querySelector(`.node.${key}`);
    this._ring.update(nodeOf("house") ?? this.renderRoot, ringMoves, this._nodePx);
    const solarNode = nodeOf("solar");
    if (solarNode) this._solarRing.update(solarNode, ringMoves, this._nodePx);
    if (!this._hass || !this._config) return;
    const group = this.renderRoot.querySelector("g.dots") as SVGGElement | null;
    if (!group) return;
    const plot = this.renderRoot.querySelector(".plot") as HTMLElement | null;
    const width = plot?.getBoundingClientRect().width ?? 0;
    const design = flowDesign(this._config.flow.design);
    this._warnUnknownDesign(design !== undefined);
    const dark = groundIsDark(this, this._config.appearance);
    // A forced ground is an attribute, so the stylesheet can hang the colour
    // overrides off it. On "auto" it comes off again and the theme rules.
    if (this._config.appearance === "auto") this.removeAttribute("data-appearance");
    else this.setAttribute("data-appearance", this._config.appearance);

    if (width > 0) this._plotScale = width / VIEW_W;
    // Dots and lines grow with the card, damped (K-12, sizing.ts). The lines
    // take theirs through the stylesheet; a factor on the CSS variable keeps
    // the calc() in styles.ts free of any root or power WebKit might mishandle.
    const sizes = sizeFactors(this._plotScale, this._config.flow);
    this.style.setProperty("--el-line-k", sizes.line.toFixed(4));

    if (!this._dots) {
      this._dots = new DotLayer(group, this._technique);
      if (width > 0) this._dots.setScale(width / VIEW_W);
      // The first measure, now that the SVG exists; later ones come with
      // resizes (issue #7).
      this._dots.setPathZoom(this._pathZoom);
      this._measurePathZoom();
    }
    // Handed over on every render: the same object does nothing, but a
    // reloaded design file returns a new one under the same id, and that has
    // to reach the screen.
    this._dots.setDesign(design, dark);
    this._dots.setDotScale(sizes.dot);

    const ticked =
      this._tickModel ??
      this._model ??
      buildModel(this._hass, this._config, this._chargeOf, this._solarMemory.values);
    // Still, a dot says nothing - its speed is the message, and the line's
    // colour already tells whether anything flows.
    const plans = this._dotsMove ? planDots(this._flowsOf(ticked), this._shownConfig()) : [];
    this._dots.setPaths(this._geometry().paths);
    this._dots.update(plans, this._config, this._animationsWanted);

    // The dots need a quieter line to stand out against; the design says how
    // quiet. Set here rather than in the template, which knows no ground.
    const ground = dark ? design?.dark : design?.light;
    if (ground) this.style.setProperty("--el-link-opacity", String(ground.line / 100));
    else this.style.removeProperty("--el-link-opacity");

    // Measured before the fan is drawn: a new scale moves the nodes the lines
    // start from, and no frame loop comes after to pick that up.
    const moved = this._measure();
    this._updateFan();
    this._syncPlayState();
    // Rows only glide once a measurement has left the layout where it was: the
    // move that settles it is not one the eye should have to follow.
    if (!moved) this._settled = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // A detail window of this card closes with it (DF-2) - unless the card
    // only moved: a masonry view takes cards out and puts them back when its
    // columns change, e.g. when a phone is turned.
    setTimeout(() => {
      if (!this.isConnected) window.dispatchEvent(new CustomEvent(CARD_GONE, { detail: this }));
    }, CARD_GONE_MS);
    LIVE.delete(this);
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._intersectionObserver?.disconnect();
    this._intersectionObserver = undefined;
    document.removeEventListener("visibilitychange", this._onVisibility);
    this.renderRoot.removeEventListener("transitionend", this._onTransitionEnd);
    this._pause(Date.now());
    window.removeEventListener("resize", this._onWindowResize);
    this._motionQuery?.removeEventListener?.("change", this._onMotionChange);
    this._motionQuery = undefined;
    this._dots?.destroy();
    this._dots = undefined;
    if (this._fanFollow) cancelAnimationFrame(this._fanFollow);
    this._fanFollow = undefined;
    this._fan?.destroy();
    this._fan = undefined;
    this._solarFan?.destroy();
    this._solarFan = undefined;
    this._ring.stop();
    this._solarRing.stop();
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

  static getStubConfig(): Record<string, unknown> {
    return {
      // Each new card remembers for itself (REQ V-12).
      memory_id: newMemoryId(),
      entities: { ...STUB_ENTITIES },
      // Among the consumers' icons a lone dot looks out of place. Set here
      // rather than as the card's default, so existing cards keep their dot
      // and deleting the icon brings it back (E-5).
      icons: { rest: "mdi:cloud-question" },
    };
  }

  render(): TemplateResult | typeof nothing {
    if (!this._hass || !this._config) return nothing;
    const model = this._modelForMode(this._hass, this._config);
    const ticked = this._tickModel ?? model;
    const shown = this._shownConfig();
    // Selection and order come from the tick, the figures from the live model
    // (REQ L-7): values may move every second, rows only on the beat.
    const breakdown = refreshBreakdownValues(
      buildBreakdown(ticked, shown, this._showAll),
      model,
      shown,
    );
    // Lines carry the colour of the flow on them, dimmed by CSS (REQ P-5).
    const plans = planDots(this._flowsOf(ticked), shown);
    const active = new Map(
      plans.map((p) => [p.connection, this._config?.colors[p.colorKey] ?? ""]),
    );
    this._lastEntries = new Map(
      breakdown.entries.map((e) => [e.key, { w: e.w, color: e.color, threshold: e.threshold }]),
    );
    // The PV rows (PV-7): selection and order from the tick, figures live (L-7).
    const solarRows = shown.list.solar
      ? refreshSolarRows(buildSolarRows(ticked, shown, this._showAll), model)
      : [];
    this._lastSolar = new Map(
      solarRows.map((e) => [e.key, { w: e.w, color: e.color, threshold: e.threshold }]),
    );
    // Square, solar left: the PV rows left of the drawing, as long as it fits (AN-3).
    const solarApart = this._splitsLists() && !this._stacked;
    // The PV ring: its order from the tick like the rows, its figures live (L-7).
    const solarRing =
      shown.view.pvScales.length > 0
        ? {
            segments: solarSegments(
              model,
              shown,
              this._pvScale,
              buildSolarRows(ticked, shown, true).map((row) => row.key),
            ),
            layout: this._pvScale,
          }
        : undefined;
    // A consumer with a state of charge opens the window (DF-15).
    const openEntry = (entity: string, ev: Event, detail?: DetailNode) =>
      detail
        ? openDetail(ev.currentTarget as EventTarget, { node: detail, entity: entity || undefined })
        : openMoreInfo(ev.currentTarget as EventTarget, entity);

    return html`
      <ha-card
        translate="no"
        @hass-more-info=${this._onMoreInfo}
        @enerlens-detail=${this._onDetail}
      >
        ${renderHeader(
          this._config,
          this._hass,
          this._rawConfig?.title,
          this._mode,
          this._since,
          (mode) => this._setMode(mode),
          this._showAll,
          () => this._toggleShowAll(),
          this._energyChip(this._hass, this._config),
          this._pvScaleChip(this._hass, this._config),
        )}
        ${this._outage === true ? renderOutageBanner(this._hass) : nothing}
        ${this._example ? renderExampleBanner(this._hass) : nothing}
        <div
          class="body layout-${this._config.layout.replace("_", "-")} ${this._stacked ? "stacked" : ""} ${
            this._config.list.alwaysBelow || (this._stacked && this._splitsLists())
              ? "force-below"
              : ""
          } ${solarApart ? "split" : ""} ${this._config.list.enabled || solarRows.length > 0 ? "" : "no-list"}"
          style=${labelRoom(this._config, model.battery !== null)}
        >
          <svg class="fan" aria-hidden="true"></svg>
          <svg class="fan pv-fan" aria-hidden="true"></svg>
          ${solarApart ? renderSolarSide(breakdown, shown, this._hass, openEntry, solarRows) : nothing}
          ${renderCross(
            model,
            shown,
            this._hass,
            active,
            this._config.ring.enabled ? breakdown.segments : [],
            this._nodePx,
            this._outage === true,
            this._animationsWanted,
            this._holeR,
            this._seeThrough,
            solarRing,
          )}
          ${renderList(breakdown, shown, this._hass, openEntry, this._stacked, solarRows, solarApart)}
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
    name: CARD_LABEL,
    description: "Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",
    preview: true,
    documentationURL: REPO_URL,
  });
}

console.info(
  `%c ${CARD_NAME.toUpperCase()} %c ${CARD_VERSION} · ${BUILD_ID} `,
  "color:#fff;background:#03a9f4;font-weight:700",
  "color:#03a9f4;background:#fff;font-weight:700",
);

export { ConfigError, type Config };
