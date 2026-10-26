/**
 * Pictures of the editor for the documentation (asciidoc/content/{de,en}):
 * each one in German and English, light and dark, taken from the real edit
 * dialog of a running Home Assistant. Like the GUI tests it saves nothing and
 * leaves the profile as it was: language and dark mode are switched in this
 * page only.
 *
 *   HA_URL=... HA_TOKEN_FILE=... HA_DASHBOARD=... npm run doc-shots
 *
 * A picture is an entry in SHOTS: the configuration, the part of the editor,
 * and where it is cut. Written to docs/images/<name>-<lang>-<theme>.png and
 * used in pairs with [.only-light] / [.only-dark] like the other pictures.
 */
import { resolve } from "node:path";
import { type Page, test } from "@playwright/test";
import { closeDialog, loadFormElements, openDialog } from "./editor";
import { CARD, putState, signIn } from "./ha";

type Lang = "de" | "en";

/** Sensors for the pictures, with names a reader can follow - in memory only. */
const DOC = "sensor.enerlens_doc_";
const PLUG = "binary_sensor.enerlens_doc_plug";
type Sensor = { de: string; en: string; state: number | string; unit?: string; cls?: string };
const W = (de: string, en: string, state: number): Sensor => ({
  de,
  en,
  state,
  unit: "W",
  cls: "power",
});
const SENSORS: Record<string, Sensor> = {
  roof: W("Wechselrichter Dach", "Inverter roof", 3000),
  west: W("Wechselrichter West", "Inverter west", 1000),
  balcony: W("Balkonkraftwerk", "Balcony plant", 500),
  grid: W("Netz", "Grid", 200),
  grid_import: W("Netzbezug", "Grid import", 200),
  grid_export: W("Netzeinspeisung", "Grid export", 0),
  house: W("Hausverbrauch", "House consumption", 2800),
  battery: W("Batterie", "Battery", -1400),
  heat: W("Wärmepumpe Leistung", "Heat pump power", 1200),
  washer: W("Waschmaschine Leistung", "Washing machine power", 400),
  wallbox: W("Wallbox Leistung", "Wallbox power", 3700),
  soc: { de: "Batterie Ladestand", en: "Battery charge", state: 64, unit: "%", cls: "battery" },
  car: { de: "Auto Ladestand", en: "Car charge", state: 71, unit: "%", cls: "battery" },
  today: { de: "PV-Ertrag heute", en: "Solar today", state: 23.4, unit: "kWh", cls: "energy" },
  forecast: {
    de: "PV-Prognose Rest",
    en: "Solar forecast left",
    state: 6.8,
    unit: "kWh",
    cls: "energy",
  },
  status: { de: "Netzstatus", en: "Grid status", state: "ok", cls: "enum" },
};

async function sensors(lang: Lang): Promise<void> {
  for (const [key, s] of Object.entries(SENSORS)) {
    await putState(`${DOC}${key}`, s.state, {
      ...(s.unit ? { unit_of_measurement: s.unit } : {}),
      ...(s.cls ? { device_class: s.cls } : {}),
      ...(s.unit ? { state_class: "measurement" } : {}),
      ...(key === "status" ? { options: ["ok", "not_detected"] } : {}),
      friendly_name: s[lang],
    });
  }
  await putState(PLUG, "on", {
    device_class: "plug",
    friendly_name: lang === "de" ? "Auto Ladekabel" : "Car charging cable",
  });
}

const tr = (lang: Lang, de: string, en: string) => (lang === "de" ? de : en);

/** One PV entity, grid, house, battery and three consumers - a plain setup. */
const BASIC = (lang: Lang) => ({
  type: `custom:${CARD}`,
  entities: {
    solar: `${DOC}roof`,
    grid: `${DOC}grid`,
    house: `${DOC}house`,
    battery: `${DOC}battery`,
    battery_soc: `${DOC}soc`,
  },
  consumers: [
    { entity: `${DOC}heat`, name: tr(lang, "Wärmepumpe", "Heat pump"), icon: "mdi:heat-wave" },
    { entity: `${DOC}washer`, name: tr(lang, "Waschmaschine", "Washing machine") },
    { entity: `${DOC}wallbox`, name: "Wallbox", icon: "mdi:ev-station" },
  ],
});

const PV_SOURCES = (lang: Lang) => ({
  type: `custom:${CARD}`,
  entities: {
    solar: [
      { entity: `${DOC}roof`, name: lang === "de" ? "Dach" : "Roof", kwp: 8 },
      {
        entity: `${DOC}balcony`,
        name: lang === "de" ? "Balkon" : "Balcony",
        kwp: 0.8,
        house: "excluded",
      },
    ],
    grid: `${DOC}grid`,
    house: `${DOC}house`,
    battery: `${DOC}battery`,
    battery_soc: `${DOC}soc`,
  },
  list: { solar: true },
});

interface Shot {
  name: string;
  /** Only the part's own panel open, the panels inside it closed. */
  closed?: boolean;
  config: (lang: Lang) => object;
  /** The part of the editor: a section's data-section, or a CSS selector. */
  part: string;
  /** Cut from this field's name to that one's (both inclusive); whole part if absent. */
  from?: string;
  to?: string;
}

/** The pictures. Page "Balkonkraftwerk und weitere PV" (balcony.adoc). */
const SHOTS: Shot[] = [
  { name: "editor-pv-sources", config: PV_SOURCES, part: ".sources-panel" },
  {
    name: "editor-pv-display",
    config: PV_SOURCES,
    part: '.section[data-section="display"]',
    from: "list_enabled",
    to: "ring_solar",
  },
  // Page "Anordnungen" (layout.adoc).
  {
    name: "editor-layout",
    config: (lang) => ({ ...PV_SOURCES(lang), layout: "square_left" }),
    part: '.section[data-section="display"]',
    from: "layout",
    to: "flow_lines",
  },
  // Page "Einrichtung" (setup.adoc).
  { name: "editor-entities", config: BASIC, part: '.section[data-section="entities"]' },
  {
    name: "editor-consumers",
    config: BASIC,
    part: ".consumers-panel:not(.sources-panel)",
    closed: true,
  },
  {
    name: "editor-signs",
    config: (lang) => ({
      ...BASIC(lang),
      entities: {
        ...BASIC(lang).entities,
        grid: { import: `${DOC}grid_import`, export: `${DOC}grid_export` },
        battery: { entity: `${DOC}battery`, invert: true },
      },
    }),
    part: '.section[data-section="entities"]',
    from: "grid_source",
    to: "battery_invert",
  },
  // Page "Fehlende Größen ableiten" (derive.adoc): the house left out.
  {
    name: "editor-derive",
    config: (lang) => {
      const { house: _, ...entities } = BASIC(lang).entities;
      return { ...BASIC(lang), entities };
    },
    part: '.section[data-section="entities"]',
    from: "house_source",
    to: "house_source",
  },
  // Page "Wallbox und E-Auto" (ev.adoc).
  {
    name: "editor-ev",
    config: (lang) => ({
      ...BASIC(lang),
      consumers: [
        {
          entity: `${DOC}wallbox`,
          name: "Wallbox",
          icon: "mdi:ev-station",
          charge: { soc: `${DOC}car`, show: "plugged", plugged: PLUG },
        },
      ],
    }),
    part: ".consumers-panel:not(.sources-panel)",
  },
  // Page "Zusatzwerte an den Knoten" (extras.adoc).
  {
    name: "editor-extras",
    config: (lang) => ({
      ...BASIC(lang),
      nodes: {
        solar: {
          inside: { entity: `${DOC}today`, decimals: 1 },
          label: {
            entity: `${DOC}forecast`,
            prefix: tr(lang, "Prognose", "Forecast"),
            decimals: 1,
          },
        },
      },
    }),
    part: '.section[data-section="nodes"]',
    from: "node_solar_show_name",
    to: "node_solar_label_weight",
  },
  // Pages "Quick-Buttons" and "Energie für einen Zeitraum".
  {
    name: "editor-quick",
    config: (lang) => ({
      ...BASIC(lang),
      view: { energy_periods: ["power", "today", "24h", "week"], expanded: ["modes"] },
    }),
    part: '.section[data-section="quick_buttons"]',
  },
  {
    name: "editor-energy",
    config: (lang) => ({
      ...BASIC(lang),
      view: { energy_periods: ["power", "today", "24h", "week", "month"] },
    }),
    part: '.section[data-section="quick_buttons"]',
    from: "energy_periods",
    to: "expanded_energy_periods",
  },
  // Page "Netzausfall" (outage.adoc).
  {
    name: "editor-outage",
    config: (lang) => ({
      ...BASIC(lang),
      entities: {
        ...BASIC(lang).entities,
        grid_status: { entity: `${DOC}status`, outage: ["not_detected"], ok: ["ok"] },
      },
    }),
    part: '.section[data-section="grid_status"]',
  },
  // Page "Animationen" (animation.adoc).
  {
    name: "editor-ring-anim",
    config: (lang) => ({ ...BASIC(lang), ring: { animation: "fade" } }),
    part: '.section[data-section="display"]',
    from: "ring_enabled",
    to: "ring_animation",
  },
  {
    name: "editor-flow",
    config: (lang) => ({ ...BASIC(lang), flow: { design: "neutrino", max_dots: 8 } }),
    part: '.section[data-section="flow"]',
  },
  // Page "Farben und Aussehen" (look.adoc).
  {
    name: "editor-colors",
    config: BASIC,
    part: "ha-expansion-panel:has(> div.colors)",
    closed: true,
  },
];

/** DOC_SHOTS=<regex> takes only the pictures whose "<name>-<lang>-<theme>" matches. */
const ONLY = process.env.DOC_SHOTS ? new RegExp(process.env.DOC_SHOTS) : undefined;

/** Language and dark mode of this page only - never the profile's (GT-2). */
async function look(page: Page, lang: Lang, dark: boolean): Promise<void> {
  await page.evaluate(
    async ({ lang, dark }) => {
      const ha = document.querySelector("home-assistant") as unknown as {
        hass: { selectedTheme?: object };
        _selectLanguage(l: string, save: boolean): Promise<void>;
        _updateHass(p: object): void;
        _applyTheme(dark: boolean): void;
      };
      await ha._selectLanguage(lang, false);
      // Never the "settheme" event: that one saves the choice to the profile.
      ha._updateHass({ selectedTheme: { ...ha.hass.selectedTheme, dark } });
      await new Promise((r) => setTimeout(r, 300));
      ha._applyTheme(dark);
      await new Promise((r) => setTimeout(r, 1500));
    },
    { lang, dark },
  );
}

/** Unfolds the part in the dialog's editor and returns the box to cut. */
async function frame(page: Page, shot: Omit<Shot, "config">) {
  return page.evaluate(
    async ({ card, shot }) => {
      const deep = (window as unknown as { __deep: (s: string, r?: ParentNode) => HTMLElement[] })
        .__deep;
      const editor = deep(`${card}-editor`)[0] as HTMLElement & {
        _builtSections: unknown;
        requestUpdate(): void;
        updateComplete: Promise<unknown>;
      };
      editor._builtSections = { has: () => true };
      (editor as unknown as { _builtConsumers: unknown })._builtConsumers = { has: () => true };
      editor.requestUpdate();
      await editor.updateComplete;
      const part = editor.shadowRoot?.querySelector(shot.part) as HTMLElement;
      if (!part) throw new Error(`${shot.name}: ${shot.part} nicht gefunden`);
      // Open it as a user would see it; the editor's other sections closed.
      // In rounds: a section inside another is only drawn once that one is
      // open, and then starts closed.
      for (let round = 0; round < 4; round++) {
        for (const panel of deep("ha-expansion-panel", editor.shadowRoot as ParentNode)) {
          const inside = !shot.closed && deep("ha-expansion-panel", part).includes(panel);
          (panel as unknown as { expanded: boolean }).expanded = panel === part || inside;
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      // A section that keeps itself closed opens with a click on its head,
      // as a user would open it.
      if (!shot.closed) {
        for (const panel of deep("ha-expansion-panel", part)) {
          if ((panel as unknown as { expanded: boolean }).expanded) continue;
          (panel.shadowRoot?.querySelector("#summary, .summary") as HTMLElement | null)?.click();
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      const own =
        part.tagName === "HA-EXPANSION-PANEL" ? part : part.querySelector("ha-expansion-panel");
      if (own) (own as unknown as { expanded: boolean }).expanded = true;
      await new Promise((r) => setTimeout(r, 800));
      part.scrollIntoView({ block: "start" });
      await new Promise((r) => setTimeout(r, 400));
      const box = part.getBoundingClientRect();
      let top = box.top;
      let bottom = box.bottom;
      const field = (name: string) =>
        (deep("ha-selector", part) as unknown as (HTMLElement & { name: string })[]).find(
          (s) => s.name === name,
        );
      if (shot.from) top = (field(shot.from) as HTMLElement).getBoundingClientRect().top - 8;
      if (shot.to) {
        // The whole row the last field stands in, help texts included: a
        // switch beside an entity is shorter than the entity and its text.
        let row: Element = field(shot.to) as HTMLElement;
        for (let n: Node | null = row; n; ) {
          if (n instanceof HTMLElement && n.tagName === "HA-FORM-GRID") {
            row = n;
            break;
          }
          n = n.parentNode instanceof ShadowRoot ? n.parentNode.host : n.parentNode;
        }
        const below = [...(row.shadowRoot ?? row).querySelectorAll("*")]
          .map((e) => e.getBoundingClientRect().bottom)
          .filter((b) => b > 0);
        bottom = Math.max(row.getBoundingClientRect().bottom, ...below) + 8;
      }
      return { x: box.left, y: top, width: box.width, height: bottom - top };
    },
    { card: CARD, shot },
  );
}

test("doc shots", async ({ browser }) => {
  test.setTimeout(90 * 60_000);
  for (const lang of ["de", "en"] as const) {
    await sensors(lang);
    for (const dark of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 2600 } });
      await signIn(page);
      await loadFormElements(page, SHOTS[0].config(lang));
      await look(page, lang, dark);
      const theme = dark ? "dark" : "light";
      // DOC_SHOTS matches "<name>-<lang>-<theme>", so a run can redo single files.
      for (const shot of SHOTS.filter((s) => !ONLY || ONLY.test(`${s.name}-${lang}-${theme}`))) {
        // The dialog now and then never shows the editor; a fresh page does.
        for (let attempt = 1; ; attempt++) {
          try {
            await openDialog(page, shot.config(lang));
            break;
          } catch (error) {
            if (attempt === 3) throw error;
            await signIn(page);
            await loadFormElements(page, SHOTS[0].config(lang));
            await look(page, lang, dark);
          }
        }
        const clip = await frame(page, {
          name: shot.name,
          part: shot.part,
          from: shot.from,
          to: shot.to,
          closed: shot.closed,
        });
        const file = `${shot.name}-${lang}-${theme}.png`;
        await page.screenshot({ path: resolve("docs/images", file), clip });
        await closeDialog(page);
      }
      await page.close();
    }
  }
});
