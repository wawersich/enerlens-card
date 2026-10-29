// What the README pictures and the live cards on the website have in common:
// the consumers with their names and icons, and Home Assistant's colours.
//
// Two places use it: scripts/hero/export.html renders the pictures with fixed
// values (the same picture on every run), asciidoc/demo/demo.js runs the card
// on the website with a living day. The values differ on purpose; what a
// visitor recognises - names, icons, order, colours - comes from here only.

export const NAMES = {
  de: {
    title: "Energie", c1: "Wärmepumpe", c2: "Waschmaschine", c3: "Klima", c4: "Kühlschränke", wb: "Wallbox",
    q1: "Trockner", q2: "Router", q3: "Fernseher",
    forecast: "Prognose", imported: "Bezug", autarky: "Autarkie", left: "Rest",
    roof: "Dach", west: "West", balcony: "Balkon", shed: "Gartenhaus", exported: "Einspeisung", today: "Heute",
  },
  en: {
    title: "Energy", c1: "Heat pump", c2: "Washing machine", c3: "Air conditioning", c4: "Fridges", wb: "Wallbox",
    q1: "Dryer", q2: "Router", q3: "TV",
    forecast: "Forecast", imported: "Import", autarky: "Autarky", left: "Left",
    roof: "Roof", west: "West", balcony: "Balcony", shed: "Shed", exported: "Export", today: "Today",
  },
};

/**
 * The consumers in their order. The wallbox comes last, so the others keep
 * the palette colours they always had. `quiet` adds three devices below
 * min_consumer_w, which only the list's filter button shows.
 */
export function consumers(t, { quiet = false } = {}) {
  return [
    { entity: "sensor.c1", name: t.c1, icon: "mdi:heat-wave" },
    { entity: "sensor.c2", name: t.c2, icon: "mdi:washing-machine" },
    { entity: "sensor.c3", name: t.c3, icon: "mdi:air-conditioner" },
    { entity: "sensor.c4", name: t.c4, icon: "mdi:fridge-outline" },
    {
      entity: "sensor.wb",
      name: t.wb,
      icon: "mdi:ev-station",
      indicators: { ring: { entity: "sensor.car" }, idle_value: "ring" },
    },
    ...(quiet
      ? [
          { entity: "sensor.q1", name: t.q1, icon: "mdi:tumble-dryer" },
          { entity: "sensor.q2", name: t.q2, icon: "mdi:router-wireless" },
          { entity: "sensor.q3", name: t.q3, icon: "mdi:television" },
        ]
      : []),
  ];
}

/* Home Assistant's own colours, so the card looks as it does in a dashboard. */
export const THEME = {
  light: {
    "--ha-card-background": "#fff", "--card-background-color": "#fff", "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272", "--divider-color": "rgba(127,127,127,.3)", "--primary-color": "#03a9f4",
    "--error-color": "#db4437", "--text-primary-color": "#fff",
  },
  dark: {
    "--ha-card-background": "#1d1e21", "--card-background-color": "#1d1e21", "--primary-text-color": "#e3e3e3",
    "--secondary-text-color": "#9b9b9b", "--divider-color": "rgba(160,160,160,.3)", "--primary-color": "#03a9f4",
    "--error-color": "#f2645a", "--text-primary-color": "#fff",
  },
};

/* The energy dashboard's colours, which the card takes as its defaults. */
export const ENERGY_COLOURS = {
  "--energy-solar-color": "#ff9800", "--energy-grid-consumption-color": "#488fc2",
  "--energy-grid-return-color": "#8353d1", "--energy-battery-in-color": "#f06292",
  "--energy-battery-out-color": "#4db6ac",
};
