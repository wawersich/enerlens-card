// The real EnerLens card on a docs page, fed with invented values.
//
// Every <div class="card-demo" data-demo="…"> becomes one card. The card is
// the released bundle, unchanged; this file plays Home Assistant around it:
//   - hass.states, renewed every second from one invented day;
//   - history/history_during_period, so "Ø 2 min" and "Ø 15 min" have their
//     window filled at once;
//   - recorder statistics, so the energy button (today, 24 h, week) works;
//   - ha-card and ha-icon, whose glyphs come from demo/icons.json, built from
//     @mdi/js - no request to a third party.
// A card starts when it scrolls into view; six on one page would otherwise
// all animate on a phone at once.

import { ENERGY_COLOURS, NAMES, THEME, consumers as listOf } from "./shared.js?v=2baa76fe";

const ICONS = await fetch(new URL("./icons.json?v=808703dd", import.meta.url)).then((r) => r.json());

customElements.define(
  "ha-card",
  class extends HTMLElement {
    connectedCallback() {
      this.style.display = "block";
      this.style.background = "var(--ha-card-background)";
      this.style.borderRadius = "12px";
      this.style.padding = "0 0 4px";
    }
  },
);
customElements.define(
  "ha-icon",
  class extends HTMLElement {
    // Sized in :host like Home Assistant's own ha-icon - an inline size would
    // be replaced by the card's style attribute on the next render.
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML =
        "<style>:host{display:inline-flex;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)}</style><slot></slot>";
    }
    set icon(v) {
      this._icon = v;
      this.draw();
    }
    connectedCallback() {
      this._icon ??= this.getAttribute("icon");
      this.draw();
    }
    draw() {
      const d = ICONS[(this._icon || "").replace(/^mdi:/, "")];
      this.innerHTML = d
        ? `<svg viewBox="0 0 24 24" width="100%" height="100%" style="fill:currentColor"><path d="${d}"></path></svg>`
        : "";
    }
  },
);

await import("./enerlens-card.js?v=c4e0a58b");

/* What a tap on a node would open in Home Assistant, said instead. */
const TAP = {
  de: "In Home Assistant öffnet sich hier der Verlauf von",
  en: "In Home Assistant this opens the history of",
};

/* ------------------------------------------------------------ the day
 * One invented day drives everything: live values, history and statistics.
 * The demo clock is shifted so that "now" is half past twelve - a visitor at
 * night still sees the sun. Signed like real sensors: grid + = import,
 * battery + = discharge.
 */
const now0 = new Date();
const SHIFT = (12.5 - (now0.getHours() + now0.getMinutes() / 60)) * 3600e3;

/*
 * The time-of-day slider moves the card's own clock, not only the values:
 * "today" in the energy mode then runs from midnight to the time set. The
 * page's Date is replaced by one running `offset` ahead - one clock for the
 * page, which only a page with a slider does. The clock never runs back: a
 * time earlier than now is that time tomorrow, so the card sees a new day and
 * asks for its figures again (it asks only every five minutes or per day).
 */
const RealDate = Date;
let offset = 0;
function shiftClock() {
  if (globalThis.Date !== RealDate) return;
  offset = SHIFT;
  globalThis.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(RealDate.now() + offset);
      else super(...args);
    }
    static now() {
      return RealDate.now() + offset;
    }
  };
}
function setTimeOfDay(hours) {
  const now = Date.now();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  let target = midnight.getTime() + hours * 3600e3;
  if (target <= now) target += 86400e3;
  offset += target - now;
}

function powers(t, scene, shift = SHIFT) {
  const d = new Date(t + shift);
  // The dots scene stands still at half past twelve: only the dots move.
  const still = scene === "dots";
  const h = still ? 12.5 : d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const s = t / 1000; // seconds, for the small live wobble
  const wave = (period, amp, phase = 0) => (still ? 0 : amp * Math.sin((s / period) * 2 * Math.PI + phase));
  const fast = scene === "fade" ? 0.45 : 1; // the fade scene re-sorts more often
  // Each PV source has its own day by where it faces (PV-4): the roof faces
  // south, west catches the afternoon, the balcony the morning and is held to
  // the 800 W of its inverter. The node shows their sum.
  const sun = (from, to) => (h > from && h < to ? Math.sin((Math.PI * (h - from)) / (to - from)) : 0);
  const lit = (from, to, peak, wobble) => (sun(from, to) > 0 ? Math.max(0, peak * sun(from, to) + wobble) : 0);
  const dim = scene === "outage" ? 0.35 : 1;
  const pv1 = dim * lit(6, 20, 7500, wave(29, 200));
  const pv2 = dim * lit(9, 21, 3500, wave(31, 100, 1));
  const pv3 = dim * Math.min(800, lit(5.5, 17.5, 900, wave(23, 30, 2)));
  // A fourth, shaded source of a few watts, which only the complete list
  // shows; it is part of the arrangement scene only.
  const pv4 = scene === "arrange" ? lit(9, 16, 8, 0) : 0;
  const pv = pv1 + pv2 + pv3 + pv4;
  let c1 = (h < 7 || h > 21 ? 1500 : 2300) + wave(23 * fast, 900);
  let c2 = h >= 9 && h < 15 ? 1700 + wave(17 * fast, 1100, 2) : 0;
  let c3 = h >= 12 && h < 18 ? 850 + wave(11, 150, 1) : 0;
  // The arrangement scene keeps its list short, so the PV rows and the
  // consumers on either side are about even; the fridges fall to the filter.
  let c4 = scene === "arrange" ? 6 : 140;
  let wb = h >= 11 && h < 15 ? 3700 : 0;
  if (scene === "ring") {
    // Four consumers around the same mean, each on its own beat: their order
    // changes every few seconds, so the ring re-sorts all the time.
    [c1, c2, c3, c4] = [13, 17, 11, 19].map((period, i) => 1200 + wave(period, 900, i * 1.6));
    wb = 0;
  }
  const q1 = 0;
  const q2 = 8;
  const q3 = 3;
  if (scene === "outage") wb = 0;
  const house = 450 + c1 + c2 + c3 + c4 + wb + q1 + q2 + q3;
  const surplus = pv - house;
  let battery;
  let grid;
  if (scene === "outage") {
    battery = house - pv; // the battery covers everything the sun does not
    grid = 0;
  } else {
    battery = surplus > 0 ? -Math.min(surplus, 2500) : Math.min(-surplus, h > 16 || h < 2 ? 2500 : 0);
    grid = house - pv - battery;
  }
  return {
    "sensor.s": Math.max(pv, 0), "sensor.g": grid, "sensor.h": house, "sensor.b": battery,
    "sensor.gi": Math.max(grid, 0), "sensor.ge": Math.max(-grid, 0),
    "sensor.bd": Math.max(battery, 0), "sensor.bc": Math.max(-battery, 0),
    "sensor.c1": c1, "sensor.c2": c2, "sensor.c3": c3, "sensor.c4": c4, "sensor.wb": wb,
    "sensor.q1": q1, "sensor.q2": q2, "sensor.q3": q3,
    // Three PV sources summing to the PV above (REQ 2.17).
    "sensor.pv1": pv1, "sensor.pv2": pv2, "sensor.pv3": pv3, "sensor.pv4": pv4,
  };
}

const entity = (id, state, unit, cls) => ({
  entity_id: id, state: String(state),
  attributes: { unit_of_measurement: unit, ...(cls ? { device_class: cls } : {}), state_class: "measurement" },
  last_changed: "", last_updated: "",
});

function statesAt(t, scene, shift = SHIFT) {
  const out = {};
  for (const [id, w] of Object.entries(powers(t, scene, shift))) out[id] = entity(id, Math.round(w), "W", "power");
  out["sensor.soc"] = entity("sensor.soc", scene === "outage" ? 54 : 68, "%", "battery");
  out["sensor.car"] = entity("sensor.car", 80, "%", "battery");
  out["sensor.grid_status"] = {
    entity_id: "sensor.grid_status", state: scene === "outage" ? "not_detected" : "ok",
    attributes: { device_class: "enum", options: ["ok", "not_detected"] }, last_changed: "", last_updated: "",
  };
  // Extra values (issue #9): what an installation might have to show.
  out["sensor.pv_today"] = entity("sensor.pv_today", 23.42, "kWh", "energy");
  out["sensor.pv_forecast"] = entity("sensor.pv_forecast", 6.81, "kWh", "energy");
  out["sensor.import_today"] = entity("sensor.import_today", 1.24, "kWh", "energy");
  out["sensor.autarky"] = entity("sensor.autarky", 92, "%");
  out["sensor.battery_left"] = entity("sensor.battery_left", 7.9, "kWh", "energy");
  out["sensor.export_today"] = entity("sensor.export_today", 12.83, "kWh", "energy");
  out["sensor.house_today"] = entity("sensor.house_today", 18.61, "kWh", "energy");
  return out;
}

/* ------------------------------------------------------- Home Assistant */
const STEP = { "5minute": 300e3, hour: 3600e3, day: 86400e3 };

function callWS(scene, clock) {
  return async (msg) => {
    if (msg.type === "recorder/get_statistics_metadata") {
      return msg.statistic_ids.map((id) => ({
        statistic_id: id, mean_type: 1, has_mean: true, unit_class: "power",
        statistics_unit_of_measurement: "W",
      }));
    }
    if (msg.type === "recorder/statistics_during_period") {
      const step = STEP[msg.period];
      const end = msg.end_time ? Date.parse(msg.end_time) : Date.now();
      const out = Object.fromEntries(msg.statistic_ids.map((id) => [id, []]));
      for (let t = Math.ceil(Date.parse(msg.start_time) / step) * step; t + step <= end; t += step) {
        // A row's mean over its span, sampled every five minutes.
        const n = Math.max(1, Math.round(step / 300e3));
        const sum = {};
        for (let k = 0; k < n; k++) {
          const p = powers(t + (k + 0.5) * (step / n), scene, clock.shift);
          for (const id of msg.statistic_ids) sum[id] = (sum[id] ?? 0) + (p[id] ?? 0);
        }
        for (const id of msg.statistic_ids) out[id].push({ start: t, mean: sum[id] / n });
      }
      return out;
    }
    if (msg.type === "history/history_during_period") {
      // A point every 30 s across the window, as a sensor would have written.
      const start = Date.parse(msg.start_time);
      const end = msg.end_time ? Date.parse(msg.end_time) : Date.now();
      const out = {};
      for (const id of msg.entity_ids) {
        out[id] = [];
        for (let t = start; t <= end; t += 30e3) {
          const state = statesAt(t, scene, clock.shift)[id]?.state;
          if (state !== undefined) out[id].push({ s: state, lu: t / 1000 });
        }
      }
      return out;
    }
    return {};
  };
}

/* ------------------------------------------------------------ the scenes */
function config(scene, t, data = {}) {
  // With the quiet ones: the filter button brings them into the list.
  const consumers = listOf(t, { quiet: true });
  // One sensor per direction for grid and battery, so the energy button shows
  // both ways in every scene; in the power view this looks the same as a
  // signed sensor (REQ 2.15).
  const split = {
    solar: "sensor.s", house: "sensor.h", battery_soc: "sensor.soc",
    grid: { import: "sensor.gi", export: "sensor.ge" },
    battery: { discharge: "sensor.bd", charge: "sensor.bc" },
  };
  const base = {
    type: "custom:enerlens-card",
    entities: split,
    consumers,
    // Grid and battery as a traffic light: import and discharge red, export
    // and charge green (Markus, 27.10.2026); Home Assistant's own energy
    // colours stay the card's default.
    colors: {
      grid_import: "#e51414",
      grid_export: "#42af38",
      battery_discharge: "#e51414",
      battery_charge: "#42af38",
    },
    flow: { design: "neutrino", inactive_lines: "dim" },
    // Nothing remembered: several cards on one page must not share a view.
    view: { energy_periods: ["power", "today", "24h", "week"], remember: false },
    update_interval_s: 3,
  };
  // Several PV sources with their rows (PV-7), for the PV and arrangement scenes.
  // Their peaks: at most about 12 kW of 18 kWp at any hour, so "% kWp" always
  // leaves a third of the ring grey (Markus, 27.10.2026: at least a quarter).
  const sources = {
    entities: {
      ...split,
      solar: [
        { entity: "sensor.pv1", name: t.roof, kwp: 12 },
        { entity: "sensor.pv2", name: t.west, kwp: 5 },
        { entity: "sensor.pv3", name: t.balcony, kwp: 1.2 },
      ],
    },
    list: { solar: true },
  };
  switch (scene) {
    case "pv":
      return { ...base, ...sources };
    case "square_right":
    case "square_left":
    case "triangle":
    case "triangle_battery":
      return { ...base, ...sources, layout: scene };
    case "quick":
      // The quick buttons alone, in one style; data-expanded names the ones
      // that show every value side by side (QB-9 to QB-14).
      return {
        ...base,
        ...sources,
        view: {
          ...base.view,
          quick_style: data.style || "segment",
          expanded: (data.expanded || "").split(",").filter(Boolean),
        },
      };
    case "arrange":
      // Driven by the switches above the card (data-controls).
      return {
        ...base,
        ...sources,
        entities: {
          ...sources.entities,
          solar: [...sources.entities.solar, { entity: "sensor.pv4", name: t.shed, kwp: 0.3 }],
        },
        layout: data.layout,
        ...(data.lines ? { flow: { ...base.flow, lines: data.lines } } : {}),
        list: { solar: data.pvRows, enabled: data.list },
        ...(data.expanded ? { view: { ...base.view, expanded: data.expanded.split(",") } } : {}),
      };
    case "period":
      // The energy chapter: PV sources with peak power, so "% kWp" shows the
      // ring grow and shrink with the sun - in power first, the capacity
      // factor of a period a tap away. Colours blend rather than overtake:
      // calmer while the slider moves.
      return {
        ...base,
        ...sources,
        ring: { animation: "fade" },
        view: {
          ...base.view,
          pv_scales: ["share", "peak"],
          default_pv_scale: "peak",
          expanded: ["energy_periods", "pv_scales"],
        },
      };
    case "energy":
      return {
        ...base,
        // Only this card carries a title: it shows energy, the others power.
        title: t.title,
        view: { ...base.view, default_energy: "24h" },
      };
    case "outage":
      return {
        ...base,
        entities: { ...split, grid_status: { entity: "sensor.grid_status", outage: ["not_detected"], ok: ["ok"] } },
      };
    case "extras":
      return {
        ...base,
        nodes: {
          solar: {
            show_name: false,
            inside: { entity: "sensor.pv_today", decimals: 1 },
            label: { entity: "sensor.pv_forecast", prefix: t.forecast, decimals: 1 },
          },
          grid: { label: { entity: "sensor.import_today", prefix: t.imported, decimals: 1 } },
          house: { show_name: false, label: { entity: "sensor.autarky", prefix: t.autarky, decimals: 0 } },
          battery: { label: { entity: "sensor.battery_left", prefix: t.left, decimals: 1 } },
        },
      };
    case "ring":
      // The ring alone in a plain cross: no list, no quick buttons; the
      // switch above picks how it follows the new order.
      return {
        ...base,
        list: { enabled: false, scope: ["filtered"] },
        view: { ...base.view, modes: ["current"], energy_periods: ["power"] },
        ring: { animation: data.ring ?? "overtake" },
        update_interval_s: 2,
      };
    case "dots":
      // Constant values, so nothing re-sorts: only the dots move, in the
      // design, number and speed switched above.
      return {
        ...base,
        ...sources,
        list: { solar: true, scope: ["filtered"] },
        view: { ...base.view, modes: ["current"], energy_periods: ["power"], pv_scales: ["share"] },
        flow: {
          ...base.flow,
          design: data.design ?? "electron",
          max_dots: Number(data.dots ?? 5),
          dot_size: Number(data.dotsize ?? 100),
          ...speedOf(Number(data.speed ?? SPEED_DEFAULT)),
        },
      };
    case "nodes":
      // Driven by the switches above the card (data-controls): the same extra
      // values at every node, placed and styled as switched.
      return { ...base, nodes: extraNodes(t, data) };
    case "fade":
      return { ...base, ring: { animation: "fade" }, update_interval_s: 2 };
    case "below":
      return { ...base, list: { always_below: true } };
    default:
      return base;
  }
}

/**
 * The speed slider: seconds per run at the top of the range (fast_s), from
 * slower than slow to fast. The low end (slow_s) keeps the card's own ratio,
 * 5 to 1.8 - at the default step 7 that gives the card's defaults.
 */
const FAST_S = [12, 9, 7, 5, 4, 3, 2.4, 1.8, 1.4, 1.1, 0.8];
const SPEED_DEFAULT = 7;
const speedOf = (step) => {
  const fast = FAST_S[step];
  return { fast_s: fast, slow_s: Math.round(((fast * 5) / 1.8) * 10) / 10 };
};

/** The extra values of the "nodes" scene, as the switches set them (Z-1 ff.). */
function extraNodes(t, data) {
  const values = {
    solar: [{ entity: "sensor.pv_today", decimals: 1 }, { entity: "sensor.pv_forecast", prefix: t.forecast, decimals: 1 }],
    grid: [{ entity: "sensor.import_today", decimals: 1 }, { entity: "sensor.export_today", prefix: t.exported, decimals: 1 }],
    house: [{ entity: "sensor.autarky", decimals: 0 }, { entity: "sensor.house_today", prefix: t.today, decimals: 1 }],
    // The battery has no value in the circle: it shows two there already.
    battery: [undefined, { entity: "sensor.battery_left", prefix: t.left, decimals: 1 }],
  };
  const style = {
    ...(data.weight && data.weight !== "normal" ? { weight: data.weight } : {}),
    ...(data.size && data.size !== "100" ? { size: Number(data.size) } : {}),
  };
  const nodes = {};
  for (const [key, [inside, label]] of Object.entries(values)) {
    const node = {};
    if (data.name === "off") node.show_name = false;
    // Only grid and battery have a state word ("Einspeisung", "lädt").
    if (data.word === "off" && (key === "grid" || key === "battery")) node.show_state = false;
    if (inside && data.inside !== "off") {
      node.inside = { ...inside, ...(data.inside === "below" ? { position: "below" } : {}), ...style };
    }
    if (data.label !== "off") {
      const { entity, prefix, decimals } = label;
      node.label = { entity, ...(data.label === "prefix" ? { prefix } : {}), decimals, ...style };
    }
    if (Object.keys(node).length) nodes[key] = node;
  }
  return nodes;
}

/* ------------------------------------------------------------- start */
function start(host, { dark, lang }) {
  const t = NAMES[lang] ?? NAMES.en;
  const tap = TAP[lang] ?? TAP.en;
  const scene = host.dataset.demo || "live";
  const card = document.createElement("enerlens-card");
  const paint = () => {
    const scheme = dark() ? "dark" : "light";
    for (const [k, v] of Object.entries({ ...THEME[scheme], ...ENERGY_COLOURS })) host.style.setProperty(k, v);
  };
  paint();
  // With a slider the page's clock carries the shift (shiftClock), the values not.
  const sliding = (host.dataset.controls ?? "").split(",").includes("time");
  if (sliding) shiftClock();
  const clock = { shift: sliding ? 0 : SHIFT };
  const set = (data) => {
    const c = config(scene, t, data);
    card.setConfig(c);
    return c;
  };
  set(host.dataset);
  // class="header-only": the page shows the card's header, nothing below it.
  if (host.classList.contains("header-only")) {
    const clip = () => {
      const header = card.shadowRoot?.querySelector(".header");
      if (header) host.style.height = `${header.offsetTop + header.offsetHeight + 6}px`;
    };
    new ResizeObserver(clip).observe(host);
    setInterval(clip, 500);
  }
  const ws = callWS(scene, clock);
  const feed = () => {
    card.hass = {
      states: statesAt(Date.now(), scene, clock.shift),
      locale: { language: lang, number_format: "language" },
      language: lang,
      callWS: ws,
    };
  };
  feed();
  host.appendChild(card);
  setInterval(feed, 1000);
  if (host.dataset.controls) controls(host, card, lang, { set, feed, clock });
  addEventListener("themechange", paint);

  // A tap on a node asks Home Assistant for its history dialog; here a note
  // says so instead.
  const note = document.createElement("div");
  note.className = "card-demo-note";
  card.parentElement.appendChild(note);
  let timer;
  card.addEventListener("hass-more-info", (ev) => {
    const id = ev.detail?.entityId ?? "";
    note.textContent = `${tap} ${id}.`;
    note.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => note.classList.remove("show"), 3500);
  });
}

export function startDemos(env) {
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        seen.unobserve(e.target);
        start(e.target, env);
      }
    },
    { rootMargin: "200px" },
  );
  for (const host of document.querySelectorAll(".card-demo")) seen.observe(host);
}

/* ------------------------------------------------------- the switches
 * data-controls="layout,lines,pvrows,list,time" puts switches above a card. They
 * change what an editor would change - the configuration - or, for the time
 * of day, the invented day. Below the card the YAML of the changes, only
 * what differs from the defaults, as the editor writes it.
 */
const WORDS = {
  de: {
    layout: "Anordnung", cross: "Kreuz", square_right: "Quadrat · PV rechts", square_left: "Quadrat · PV links",
    triangle: "Dreieck · Haus Mitte", triangle_battery: "Dreieck · Batterie Mitte", lines: "Linienform", curved: "Geschwungen", straight: "Gerade",
    pvrows: "PV-Zeilen in der Liste", list: "Verbraucher-Liste", on: "An", off: "Aus", time: "Tageszeit (erfundener Tag)",
    yaml: "So sieht das in YAML aus:", none: "# alles Standard - nichts einzutragen",
    inside: "Zusatzwert im Kreis", above: "über dem Icon", below: "unter dem Wert",
    label: "Zusatzwert beim Text", plain: "ohne Vorsatz", prefix: "mit Vorsatz",
    weight: "Schriftstärke", normal: "normal", medium: "mittel", bold: "fett",
    size: "Größe", 80: "80 %", 100: "100 %", 130: "130 %",
    name: "Name anzeigen", word: "Zustandswort anzeigen",
    ring: "Animation des Verbraucher-Rings", overtake: "Überholen", fade: "Farben überblenden", jump: "Springen",
    design: "Aussehen der Punkte", d_none: "Einfache Punkte", d_kugeln: "Kugeln", d_partylicht: "Partylicht",
    d_leuchtpunkte: "Leuchtpunkte", d_electron: "Electron", d_proton: "Proton", d_neutrino: "Neutrino",
    dots: "Höchstzahl Punkte", speed: "Tempo", run: "s pro Runde", dotsize: "Punktgröße",
  },
  en: {
    layout: "Arrangement", cross: "Cross", square_right: "Square · solar right", square_left: "Square · solar left",
    triangle: "Triangle · house centre", triangle_battery: "Triangle · battery centre", lines: "Line form", curved: "Curved", straight: "Straight",
    pvrows: "PV rows in the list", list: "Consumer list", on: "On", off: "Off", time: "Time of day (invented day)",
    yaml: "This is the YAML:", none: "# all defaults - nothing to set",
    inside: "Extra value in the circle", above: "above the icon", below: "below the value",
    label: "Extra value with the label", plain: "without prefix", prefix: "with prefix",
    weight: "Font weight", normal: "normal", medium: "medium", bold: "bold",
    size: "Size", 80: "80%", 100: "100%", 130: "130%",
    name: "Show name", word: "Show state word",
    ring: "Consumer ring animation", overtake: "Overtake", fade: "Cross-fade colours", jump: "Jump",
    design: "Dot style", d_none: "Plain dots", d_kugeln: "Orbs", d_partylicht: "Party Light",
    d_leuchtpunkte: "Glowing Dots", d_electron: "Electron", d_proton: "Proton", d_neutrino: "Neutrino",
    dots: "Maximum dots", speed: "Speed", run: "s a run", dotsize: "Dot size",
  },
};

function controls(host, card, lang, { set, feed, clock }) {
  const w = WORDS[lang] ?? WORDS.en;
  const state = {
    layout: "cross", lines: undefined, pvRows: true, list: true, expanded: host.dataset.expanded,
    inside: "above", label: "prefix", weight: "normal", size: "100", name: "on", word: "on",
    ring: "overtake", design: "electron", dots: 5, speed: SPEED_DEFAULT, dotsize: 100,
  };
  // The extra-value switches: name, values, the state key they set.
  const EXTRAS = [
    ["inside", ["off", "above", "below"]], ["label", ["off", "plain", "prefix"]],
    ["weight", ["normal", "medium", "bold"]], ["size", ["80", "100", "130"]],
    ["name", ["on", "off"]], ["word", ["on", "off"]],
    ["ring", ["overtake", "fade", "jump"]],
    ["design", ["none", "kugeln", "partylicht", "leuchtpunkte", "electron", "proton", "neutrino"], "d_"],
  ];
  // Sliders: range, and what the label says of a value.
  const decimal = (x) => x.toLocaleString(lang, { maximumFractionDigits: 1 });
  const SLIDERS = [
    // The card takes 2 to 10 dots (flow.max_dots).
    ["dots", 2, 8, (v) => String(v)],
    // flow.dot_size takes 40 to 150 %.
    ["dotsize", 40, 150, (v) => `${v} %`, 10],
    ["speed", 0, FAST_S.length - 1, (v) => `${decimal(speedOf(v).slow_s)} – ${decimal(speedOf(v).fast_s)} ${w.run}`],
  ];
  const sliders = new Map();
  const slide = (key, min, max, text, step = 1) => {
    const g = document.createElement("label");
    g.className = "demo-group demo-time";
    g.innerHTML = `<span class="demo-label">${w[key]} <output>${text(state[key])}</output></span>`;
    const r = document.createElement("input");
    Object.assign(r, { type: "range", min, max, step, value: state[key] });
    r.addEventListener("input", () => {
      state[key] = Number(r.value);
      g.querySelector("output").textContent = text(state[key]);
      apply();
    });
    g.appendChild(r);
    return g;
  };
  let shown;
  // The card in a frame of its own, apart from the switches and the YAML.
  host.classList.add("with-controls");
  const frame = document.createElement("div");
  frame.className = "card-frame";
  host.insertBefore(frame, card);
  frame.appendChild(card);
  const bar = document.createElement("div");
  bar.className = "demo-controls";
  host.insertBefore(bar, frame);
  // data-yaml="off": the switches without the YAML below the card.
  const yaml = document.createElement("div");
  yaml.className = "demo-yaml";
  if (host.dataset.yaml !== "off") host.appendChild(yaml);

  const apply = () => {
    shown = set(state);
    feed();
    draw();
  };
  // The line form the card uses: chosen, or the arrangement's default.
  const lines = () => state.lines ?? (state.layout === "cross" ? "curved" : "straight");
  const choice = (label, values, current, pick, prefix = "") => {
    const g = document.createElement("div");
    g.className = "demo-group";
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", label);
    g.innerHTML = `<span class="demo-label">${label}</span>`;
    const row = document.createElement("div");
    row.className = "demo-choices";
    for (const v of values) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = w[prefix + v];
      b.setAttribute("aria-pressed", String(v === current));
      b.addEventListener("click", () => pick(v));
      row.appendChild(b);
    }
    g.appendChild(row);
    return g;
  };
  const time = () => {
    const g = document.createElement("label");
    g.className = "demo-group demo-time";
    const now = new Date();
    const h = Math.round((now.getHours() + now.getMinutes() / 60) * 4) / 4;
    const text = (x) => `${String(Math.floor(x)).padStart(2, "0")}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`;
    g.innerHTML = `<span class="demo-label">${w.time} <output>${text(h)}</output></span>`;
    const r = document.createElement("input");
    Object.assign(r, { type: "range", min: 0, max: 23.75, step: 0.25, value: h });
    r.addEventListener("input", () => {
      setTimeOfDay(Number(r.value));
      g.querySelector("output").textContent = text(Number(r.value));
      feed();
    });
    g.appendChild(r);
    return g;
  };
  const want = host.dataset.controls.split(",");
  let slider;
  function draw() {
    // The slider is kept, so a drag is not cut off by a redraw.
    slider ??= want.includes("time") ? time() : undefined;
    bar.replaceChildren(
      ...[
        want.includes("layout") &&
          choice(w.layout, ["cross", "square_right", "square_left", "triangle", "triangle_battery"], state.layout, (v) => {
            state.layout = v;
            apply();
          }),
        want.includes("lines") &&
          choice(w.lines, ["curved", "straight"], lines(), (v) => {
            // The default of the arrangement is no change (as in the editor).
            state.lines = v === (state.layout === "cross" ? "curved" : "straight") ? undefined : v;
            apply();
          }),
        want.includes("pvrows") &&
          choice(w.pvrows, ["on", "off"], state.pvRows ? "on" : "off", (v) => {
            state.pvRows = v === "on";
            apply();
          }),
        want.includes("list") &&
          choice(w.list, ["on", "off"], state.list ? "on" : "off", (v) => {
            state.list = v === "on";
            apply();
          }),
        ...EXTRAS.filter(([key]) => want.includes(key)).map(([key, values, prefix]) =>
          choice(
            w[key],
            values,
            state[key],
            (v) => {
              state[key] = v;
              apply();
            },
            prefix,
          ),
        ),
        ...SLIDERS.filter(([key]) => want.includes(key)).map(([key, min, max, text, step]) => {
          // Kept across redraws, so a drag is not cut off.
          if (!sliders.has(key)) sliders.set(key, slide(key, min, max, text, step));
          return sliders.get(key);
        }),
        slider,
      ].filter(Boolean),
    );
    const out = [];
    if (shown.nodes) out.push(...nodesYaml(shown.nodes));
    if (want.includes("ring") && state.ring !== "overtake") out.push("ring:", `  animation: ${state.ring}`);
    if (want.includes("design")) {
      // Only what differs from the card's own defaults (design none, 5 dots,
      // 5 s and 1.8 s a run).
      const flow = [];
      if (state.design !== "none") flow.push(`  design: ${state.design}`);
      if (state.dots !== 5) flow.push(`  max_dots: ${state.dots}`);
      if (state.dotsize !== 100) flow.push(`  dot_size: ${state.dotsize}`);
      if (state.speed !== SPEED_DEFAULT) {
        const { slow_s, fast_s } = speedOf(state.speed);
        flow.push(`  slow_s: ${slow_s}`, `  fast_s: ${fast_s}`);
      }
      if (flow.length) out.push("flow:", ...flow);
    }
    // Only the keys this card has switches for.
    const pvRows = want.includes("pvrows") && state.pvRows;
    const noList = want.includes("list") && !state.list;
    if (state.layout !== "cross") out.push(`layout: ${state.layout}`);
    if (state.lines) out.push("flow:", `  lines: ${state.lines}`);
    if (pvRows || noList) out.push("list:");
    if (noList) out.push("  enabled: false");
    if (pvRows) out.push("  solar: true");
    if (state.expanded) out.push("view:", `  expanded: [${state.expanded.split(",").join(", ")}]`);
    yaml.innerHTML = `<span class="demo-label">${w.yaml}</span><pre><code></code></pre>`;
    yaml.querySelector("code").textContent = out.length ? out.join("\n") : w.none;
  }
  apply();
}

/** The nodes block as the docs write it: one line per field, flow style. */
function nodesYaml(nodes) {
  const flow = (o) => `{ ${Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
  const out = ["nodes:"];
  for (const [key, node] of Object.entries(nodes)) {
    out.push(`  ${key}:`);
    for (const [k, v] of Object.entries(node)) out.push(`    ${k}: ${typeof v === "object" ? flow(v) : v}`);
  }
  return out.length > 1 ? out : [];
}
