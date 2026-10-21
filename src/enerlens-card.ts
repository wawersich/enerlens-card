/**
 * <enerlens-card> - energy flow card for Home Assistant.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { AveragingBuffer, fetchHistory } from "./averaging";
import { ChargeTracker } from "./charge";
import { collectChargeIds, collectEntityIds, collectExtraIds, normalizeConfig } from "./config";
import {
  BUILD_ID,
  CARD_LABEL,
  CARD_NAME,
  CARD_VERSION,
  EDITOR_NAME,
  EXAMPLE_W,
  REPO_URL,
  STUB_ENTITIES,
} from "./const";
import { buildBreakdown, carries, refreshBreakdownValues } from "./consumers";
import { flowDesign, loadLiveDesigns } from "./designs";
import { periodStart } from "./energy";
import {
  type EnergyView,
  energyChipLabel,
  energyConfig,
  energyKey,
  fetchEnergy,
  firstWeekday,
  formatDay,
  periodKey,
  timeZoneOf,
} from "./energy-view";
import { computeFlows, dotParams, planDots } from "./flow";
import { localize } from "./localize";
import { buildModel, buildModelFrom, readPowerW } from "./model";
import { applyStatus, fetchLastKnownStatus, readStatus, statusOptions } from "./outage";
import { labelRoom, openMoreInfo, renderCross } from "./render/cross";
import { DotLayer, type DotTechnique, detectTechnique } from "./render/dots";
import { FanLayer } from "./render/fan";
import { NODE_R, VIEW_W, holesPath } from "./render/geometry";
import { groundIsDark, seeThrough } from "./render/ground";
import {
  type EnergyChip,
  renderExampleBanner,
  renderHeader,
  renderOutageBanner,
} from "./render/header";
import { RowAnimator, renderList } from "./render/list";
import { mayStretchPaths, measurePathZoom } from "./render/path-zoom";
import { RingAnimator } from "./render/ring";
import { sizeFactors } from "./render/sizing";
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
  type RawConfig,
  type Sample,
  type ViewMode,
} from "./types";

/** Preferences kept per browser while view.remember is on (REQ V-11, L-12). */
const MODE_KEY = "enerlens-view-mode";
const SHOW_ALL_KEY = "enerlens-show-all";
/** The energy chip's choice, "kw" for the power view (REQ EM-2). */
const ENERGY_KEY = "enerlens-energy-period";
/** A period is asked for again this often while it is shown (REQ EM-4). */
const ENERGY_REFRESH_MS = 5 * 60_000;
/** After a failed request, the next one comes this much sooner. */
const ENERGY_RETRY_MS = 30_000;

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

class EnerLensCard extends LitElement {
  static styles = styles;

  static properties = {
    // The setter below decides when hass is worth a render. Lit would wrap it
    // and render on every hass - and Home Assistant hands over a new one
    // whenever any entity anywhere changes (REQ T-3, EL-I1).
    hass: { attribute: false, noAccessor: true },
    _model: { state: true },
    _showAll: { state: true },
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
  /** Frame loop that keeps the fan on the rows while they glide. */
  private _fanFollow?: number;
  private _technique: DotTechnique = "static";
  private _motionQuery?: MediaQueryList;
  private _visible = true;
  /** True while the list wraps below the cross - the lanes only run there. */
  private _stacked = false;
  /**
   * False until a measurement has left the layout alone. The first one can move
   * the list from beside the cross to below it, which is a jump of most of the
   * card - gliding through it is a lurch, not a transition (REQ P-6).
   */
  private _settled = false;
  /** Filter lifted by the toggle above the list (REQ L-12). Kept per browser
   *  like the view mode, unless view.remember is off. */
  private _showAll = false;
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

  /**
   * The period the card draws: none for the example (E-5), and none in the
   * editor preview until the chip is tapped there (EM-14).
   */
  private get _period(): EnergyPeriod | null {
    if (!this._energyPeriod || this._example) return null;
    if ((this as unknown as { preview?: boolean }).preview && !this._energyChosen) return null;
    return this._energyPeriod;
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
    const hass = this._hass;
    const periods = this._config?.view.energyPeriods ?? [];
    const order: (EnergyPeriod | null)[] = [null, ...periods];
    // From what is shown: the preview shows kW even with a period remembered.
    const from = this._energyPending !== undefined ? this._energyPending : this._period;
    const next = order[(order.indexOf(from) + 1) % order.length];
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
    if (this._config?.view.remember && !preview) store(ENERGY_KEY, period ?? "kw");
    if (this._hass && this._config) this._tickModel = this._modelForMode(this._hass, this._config);
    this.requestUpdate();
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
    const periods = config.view.energyPeriods;
    if (periods.length === 0 || this._example) return undefined;
    // The tap shows at once, even while the period's figures are on their way.
    const period = this._energyPending !== undefined ? this._energyPending : this._period;
    const view = period ? this._energyViews.get(period) : undefined;
    const order: (EnergyPeriod | null)[] = [null, ...periods];
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
      title:
        late && view
          ? localize("energy.late", hass, { date: formatDay(view.from, hass, true) })
          : "",
      onCycle: () => this._cycleEnergy(),
    };
  }

  /** Drawn node diameter in CSS px; mirrors --el-node-size in styles.ts. */
  private get _nodePx(): number {
    return Math.max(70, 112 * this._scale + 11);
  }

  private _toggleShowAll(): void {
    this._showAll = !this._showAll;
    if (this._config?.view.remember) store(SHOW_ALL_KEY, this._showAll ? "1" : "0");
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
    // Only rebuild and draw when something the card shows changed (REQ T-3).
    if (previous && wasExample === this._example && !this._shownChanged(previous, hass)) return;
    if (this._config.gridStatus) {
      this._outage = readStatus(hass, this._config.gridStatus, this._outage);
    }
    this._observeCharge(hass);
    this._model = buildModel(hass, this._config, this._chargeOf);
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
    if (this._chargeIds.length === 0) return;
    const missing = this._charge.missing(hass, this._config.consumers);
    if (missing.length === 0) return;
    this._charge
      .prefill(hass, missing)
      .catch(() => undefined)
      .finally(() => {
        if (this._hass && this._config) {
          this._model = buildModel(this._hass, this._config, this._chargeOf);
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

    // The view the user is on is theirs until the configured start view itself
    // changes - not something an unrelated edit takes away from them.
    if (!previous || previous.view.defaultMode !== view.defaultMode) {
      this._mode = view.defaultMode;
      if (view.remember) {
        const stored = load(MODE_KEY);
        if (stored === "current" || stored === "avg_short" || stored === "avg_long") {
          this._mode = stored;
        }
      }
    }
    if (view.remember && !previous) this._showAll = load(SHOW_ALL_KEY) === "1";

    // Fetched periods hold for the same entities only (EM-4).
    const key = energyKey(this._config);
    if (key !== this._energyKey) {
      this._energyKey = key;
      this._energyViews.clear();
      this._energyAsked.clear();
      this._energyPending = undefined;
    }
    if (!previous && view.remember) {
      const stored = load(ENERGY_KEY);
      this._energyPeriod = view.energyPeriods.find((p) => p === stored) ?? null;
    }
    // A period no longer offered falls back to the power view, quietly (EM-2),
    // and one still loading is not shown when it arrives.
    if (this._energyPeriod && !view.energyPeriods.includes(this._energyPeriod)) {
      this._energyPeriod = null;
    }
    if (this._energyPending && !view.energyPeriods.includes(this._energyPending)) {
      this._energyPending = undefined;
    }
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
      this._model = buildModel(this._hass, this._config, this._chargeOf);
      this._tickModel = this._model;
    }
    if (!previous || previous.updateIntervalS !== this._config.updateIntervalS) {
      this._restartTick();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Text keeps a minimum size in CSS pixels while the drawing scales, so the
    // card stays legible on a phone (REQ K-12).
    this._resizeObserver = new ResizeObserver(() => {
      this._measure();
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
      return buildModelFrom(hass, config, (id) => view?.meanW(id) ?? null, this._chargeOf);
    }
    // The example has no history to average; it shows its invented now.
    if (this._mode === "current" || !this._buffer || this._example) {
      return buildModel(hass, config, this._chargeOf);
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
    if (this._config?.view.remember) store(MODE_KEY, mode);
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
    plot.querySelector("path.holes")?.setAttribute("d", holesPath(r));
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
    const list = this.renderRoot?.querySelector(".list") as HTMLElement | null;
    if (!cross || !list) return false;
    const stacked = list.offsetTop >= cross.offsetTop + cross.offsetHeight / 2;
    if (stacked === this._stacked) return false;
    this._stacked = stacked;
    this.requestUpdate();
    return true;
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
    if (!this._fan) {
      this._fan = new FanLayer(svg);
      this._fan.setPathZoom(this._pathZoom);
    }
    // The rows follow the same design as the cross (P-10).
    this._fan.setDesign(
      flowDesign(this._config.flow.design),
      groundIsDark(this, this._config.appearance),
    );
    this._fan.setDotColor(this._config.flow.dotColor);

    const body = this.renderRoot.querySelector(".body") as HTMLElement | null;
    const house = this.renderRoot.querySelector(".node.house") as HTMLElement | null;
    const block = this.renderRoot.querySelector(".rows") as HTMLElement | null;
    const rows = this.renderRoot.querySelectorAll<HTMLElement>(".row");
    if (!body || !house || !block || rows.length === 0) {
      this._fan.destroy();
      return;
    }

    const origin = body.getBoundingClientRect();
    const source = this._stacked ? block.getBoundingClientRect() : house.getBoundingClientRect();
    const start = this._stacked
      ? { x: source.left - origin.left, y: source.top + source.height / 2 - origin.top }
      : { x: source.right - origin.left, y: source.top + source.height / 2 - origin.top };

    const entries = this._lastEntries;
    const fanRows = [...rows]
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
          x: left - origin.left,
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

    // The base size of the connection dots and the colour mark, grown with the
    // card like the cross (K-12).
    this._fan.setDotRadius(5);
    this._fan.setDotScale(sizeFactors(this._plotScale, this._config.flow).dot);
    // Beside the cross the fan leaves the house's circle, and its dots start
    // half inside it (K-16). Measured like the start, on screen, the border
    // taken at the same scale as the box.
    let hole: { x: number; y: number; r: number } | undefined;
    if (!this._stacked && this._seeThrough) {
      const border = Number.parseFloat(getComputedStyle(house).borderTopWidth) || 0;
      const scale = source.width / (house.offsetWidth || source.width);
      hole = { x: start.x - source.width / 2, y: start.y, r: source.width / 2 - border * scale };
    }
    this._fan.update(
      fanRows,
      start,
      { width: origin.width, height: origin.height },
      this._animationsWanted,
      hole,
    );
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
    } else {
      this._dots?.pause();
      this._fan?.pause();
      // Nobody is looking: the ring goes to its values now, not after its
      // glide - there may be no render to stop it until it is seen again (P-8).
      this._ring.stop();
    }
  }

  /**
   * The dot layer lives outside Lit's template: letting the template own those
   * elements would recreate them on every render and restart each animation,
   * which is what REQ P-6 forbids.
   */
  protected willUpdate(): void {
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
    this._ring.update(this.renderRoot, ringMoves, this._nodePx);
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
      this._tickModel ?? this._model ?? buildModel(this._hass, this._config, this._chargeOf);
    // Still, a dot says nothing - its speed is the message, and the line's
    // colour already tells whether anything flows.
    const plans = this._dotsMove ? planDots(this._flowsOf(ticked), this._shownConfig()) : [];
    this._dots.update(plans, this._config, this._animationsWanted);

    // The dots need a quieter line to stand out against; the design says how
    // quiet. Set here rather than in the template, which knows no ground.
    const ground = dark ? design?.dark : design?.light;
    if (ground) this.style.setProperty("--el-link-opacity", String(ground.line / 100));
    else this.style.removeProperty("--el-link-opacity");

    this._updateFan();
    this._syncPlayState();
    // Rows only glide once a measurement has left the layout where it was: the
    // move that settles it is not one the eye should have to follow.
    if (!this._measure()) this._settled = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
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
    this._ring.stop();
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
    const openEntry = (entity: string, ev: Event) =>
      openMoreInfo(ev.currentTarget as EventTarget, entity);

    return html`
      <ha-card translate="no" @hass-more-info=${this._onMoreInfo}>
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
        )}
        ${this._outage === true ? renderOutageBanner(this._hass) : nothing}
        ${this._example ? renderExampleBanner(this._hass) : nothing}
        <div
          class="body ${this._stacked ? "stacked" : ""} ${
            this._config.list.alwaysBelow ? "force-below" : ""
          } ${this._config.list.enabled ? "" : "no-list"}"
          style=${labelRoom(this._config, model.battery !== null)}
        >
          <svg class="fan" aria-hidden="true"></svg>
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
          )}
          ${renderList(breakdown, shown, this._hass, openEntry, this._stacked)}
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
