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

import { ENERGY_COLOURS, NAMES, THEME, consumers as listOf } from "./shared.js?v=0d0b43df";

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

await import("./enerlens-card.js?v=92a15e70");

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

function powers(t, scene, shift = SHIFT) {
  const d = new Date(t + shift);
  const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  const s = t / 1000; // seconds, for the small live wobble
  const wave = (period, amp, phase = 0) => amp * Math.sin((s / period) * 2 * Math.PI + phase);
  const fast = scene === "fade" ? 0.45 : 1; // the fade scene re-sorts more often
  let pv = h > 6 && h < 20 ? 11000 * Math.sin((Math.PI * (h - 6)) / 14) + wave(29, 300) : 0;
  const c1 = (h < 7 || h > 21 ? 1500 : 2300) + wave(23 * fast, 900);
  const c2 = h >= 9 && h < 15 ? 1700 + wave(17 * fast, 1100, 2) : 0;
  const c3 = h >= 12 && h < 18 ? 850 + wave(11, 150, 1) : 0;
  // The arrangement scene keeps its list short, so the PV rows and the
  // consumers on either side are about even; the fridges fall to the filter.
  const c4 = scene === "arrange" ? 6 : 140;
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
    // Three PV sources summing to the PV above (REQ 2.17).
    "sensor.pv1": Math.max(pv, 0) * 0.62, "sensor.pv2": Math.max(pv, 0) * 0.28,
    // A fourth, shaded source of a few watts, which only the complete list
    // shows; it is part of the arrangement scene only.
    "sensor.pv3": Math.max(pv, 0) * (scene === "arrange" ? 0.0993 : 0.1),
    "sensor.pv4": Math.max(pv, 0) * (scene === "arrange" ? 0.0007 : 0),
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
    flow: { design: "electron", inactive_lines: "dim" },
    // Nothing remembered: several cards on one page must not share a view.
    view: { energy_periods: ["power", "today", "24h", "week"], remember: false },
    update_interval_s: 3,
  };
  // Several PV sources with their rows (PV-7), for the PV and arrangement scenes.
  const sources = {
    entities: {
      ...split,
      solar: [
        { entity: "sensor.pv1", name: t.roof, kwp: 7 },
        { entity: "sensor.pv2", name: t.west, kwp: 3.5 },
        { entity: "sensor.pv3", name: t.balcony, kwp: 0.8 },
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
  const clock = { shift: SHIFT };
  const set = (data) => card.setConfig(config(scene, t, data));
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
    triangle: "Dreieck", lines: "Linienform", curved: "Geschwungen", straight: "Gerade",
    pvrows: "PV-Zeilen in der Liste", list: "Verbraucher-Liste", on: "An", off: "Aus", time: "Tageszeit (erfundener Tag)",
    yaml: "So sieht das in YAML aus:", none: "# alles Standard - nichts einzutragen",
  },
  en: {
    layout: "Arrangement", cross: "Cross", square_right: "Square · solar right", square_left: "Square · solar left",
    triangle: "Triangle", lines: "Line form", curved: "Curved", straight: "Straight",
    pvrows: "PV rows in the list", list: "Consumer list", on: "On", off: "Off", time: "Time of day (invented day)",
    yaml: "This is the YAML:", none: "# all defaults - nothing to set",
  },
};

function controls(host, card, lang, { set, feed, clock }) {
  const w = WORDS[lang] ?? WORDS.en;
  const state = { layout: "cross", lines: undefined, pvRows: true, list: true, expanded: host.dataset.expanded };
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
    set(state);
    feed();
    draw();
  };
  // The line form the card uses: chosen, or the arrangement's default.
  const lines = () => state.lines ?? (state.layout === "cross" ? "curved" : "straight");
  const choice = (label, values, current, pick) => {
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
      b.textContent = w[v];
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
    const now = new Date(Date.now() + clock.shift);
    const h = Math.round((now.getHours() + now.getMinutes() / 60) * 4) / 4;
    const text = (x) => `${String(Math.floor(x)).padStart(2, "0")}:${String(Math.round((x % 1) * 60)).padStart(2, "0")}`;
    g.innerHTML = `<span class="demo-label">${w.time} <output>${text(h)}</output></span>`;
    const r = document.createElement("input");
    Object.assign(r, { type: "range", min: 0, max: 23.75, step: 0.25, value: h });
    r.addEventListener("input", () => {
      const real = new Date();
      clock.shift = (Number(r.value) - (real.getHours() + real.getMinutes() / 60)) * 3600e3;
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
          choice(w.layout, ["cross", "square_right", "square_left", "triangle"], state.layout, (v) => {
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
        slider,
      ].filter(Boolean),
    );
    const out = [];
    if (state.layout !== "cross") out.push(`layout: ${state.layout}`);
    if (state.lines) out.push("flow:", `  lines: ${state.lines}`);
    if (state.pvRows || !state.list) out.push("list:");
    if (!state.list) out.push("  enabled: false");
    if (state.pvRows) out.push("  solar: true");
    if (state.expanded) out.push("view:", `  expanded: [${state.expanded.split(",").join(", ")}]`);
    yaml.innerHTML = `<span class="demo-label">${w.yaml}</span><pre><code></code></pre>`;
    yaml.querySelector("code").textContent = out.length ? out.join("\n") : w.none;
  }
  apply();
}
