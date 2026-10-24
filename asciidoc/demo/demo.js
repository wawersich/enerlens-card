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

import { ENERGY_COLOURS, NAMES, THEME, consumers as listOf } from "./shared.js";

const ICONS = await fetch(new URL("./icons.json", import.meta.url)).then((r) => r.json());

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

await import("./enerlens-card.js");

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

function powers(t, scene) {
  const d = new Date(t + SHIFT);
  const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const s = t / 1000; // seconds, for the small live wobble
  const wave = (period, amp, phase = 0) => amp * Math.sin((s / period) * 2 * Math.PI + phase);
  const fast = scene === "fade" ? 0.45 : 1; // the fade scene re-sorts more often
  let pv = h > 6 && h < 20 ? 11000 * Math.sin((Math.PI * (h - 6)) / 14) + wave(29, 300) : 0;
  const c1 = (h < 7 || h > 21 ? 1500 : 2300) + wave(23 * fast, 900);
  const c2 = h >= 9 && h < 15 ? 1700 + wave(17 * fast, 1100, 2) : 0;
  const c3 = h >= 12 && h < 18 ? 850 + wave(11, 150, 1) : 0;
  const c4 = 140;
  let wb = h >= 11 && h < 15 ? 3700 : 0;
  const q1 = 0;
  const q2 = 8;
  const q3 = 3;
  if (scene === "outage") {
    pv *= 0.35;
    wb = 0;
  }
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
  };
}

const entity = (id, state, unit, cls) => ({
  entity_id: id, state: String(state),
  attributes: { unit_of_measurement: unit, ...(cls ? { device_class: cls } : {}), state_class: "measurement" },
  last_changed: "", last_updated: "",
});

function statesAt(t, scene) {
  const out = {};
  for (const [id, w] of Object.entries(powers(t, scene))) out[id] = entity(id, Math.round(w), "W", "power");
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
  return out;
}

/* ------------------------------------------------------- Home Assistant */
const STEP = { "5minute": 300e3, hour: 3600e3, day: 86400e3 };

function callWS(scene) {
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
          const p = powers(t + (k + 0.5) * (step / n), scene);
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
          const state = statesAt(t, scene)[id]?.state;
          if (state !== undefined) out[id].push({ s: state, lu: t / 1000 });
        }
      }
      return out;
    }
    return {};
  };
}

/* ------------------------------------------------------------ the scenes */
function config(scene, t) {
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
    flow: { design: "electron", inactive_lines: "dim" },
    // Nothing remembered: several cards on one page must not share a view.
    view: { energy_periods: ["power", "today", "24h", "week"], remember: false },
    update_interval_s: 3,
  };
  switch (scene) {
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
    case "fade":
      return { ...base, ring: { animation: "fade" }, update_interval_s: 2 };
    case "below":
      return { ...base, list: { always_below: true } };
    default:
      return base;
  }
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
  card.setConfig(config(scene, t));
  const ws = callWS(scene);
  const feed = () => {
    card.hass = {
      states: statesAt(Date.now(), scene),
      locale: { language: lang, number_format: "language" },
      language: lang,
      callWS: ws,
    };
  };
  feed();
  host.appendChild(card);
  setInterval(feed, 1000);
  addEventListener("themechange", paint);

  // A tap on a node asks Home Assistant for its history dialog; here a note
  // says so instead.
  const note = document.createElement("div");
  note.className = "card-demo-note";
  host.appendChild(note);
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
