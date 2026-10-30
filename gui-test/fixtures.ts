/**
 * Test values and configurations for the GUI tests (REQ GT-2, GT-3, GT-6).
 * The values add up: 4.5 kW PV (3 + 1 + 0.5) and 0.2 kW from the grid feed a
 * house of 3.3 kW and charge the battery with 1.4 kW. The house sensor reads
 * 2.8 kW: the balcony's 0.5 kW reach the house past it (`house: excluded`,
 * PV-3), so the card shows 3.3 kW, "calculated".
 */
import { CARD, SENSOR } from "./ha";

const W = { unit_of_measurement: "W", device_class: "power", state_class: "measurement" };

export const STATES: Record<string, [number | string, Record<string, unknown>]> = {
  pv_roof: [3000, W],
  pv_west: [1000, W],
  pv_balcony: [500, W],
  grid: [200, W],
  grid_import: [200, W],
  grid_export: [0, W],
  house: [2800, W],
  battery: [-1400, W],
  battery_charge: [1400, W],
  battery_discharge: [0, W],
  soc: [64, { unit_of_measurement: "%", device_class: "battery" }],
  heat_pump: [1200, W],
  washer: [400, W],
  car: [0, W],
  car_soc: [71, { unit_of_measurement: "%", device_class: "battery" }],
  today: [12.3, { unit_of_measurement: "kWh", device_class: "energy" }],
  status: ["ok", { device_class: "enum", options: ["ok", "not_detected"] }],
};

const s = (key: keyof typeof STATES) => `${SENSOR}${key}`;

/** Several PV sources, a balcony past the house, most options off their default. */
export const RICH = {
  type: `custom:${CARD}`,
  title: "GUI",
  layout: "square_left",
  entities: {
    solar: [
      { entity: s("pv_roof"), name: "Dach", kwp: 8, icon: "mdi:solar-panel" },
      { entity: s("pv_west"), name: "West", kwp: 4 },
      { entity: s("pv_balcony"), name: "Balkon", kwp: 0.8, house: "excluded" },
    ],
    grid: s("grid"),
    house: s("house"),
    battery: s("battery"),
    battery_soc: s("soc"),
    grid_status: { entity: s("status"), outage: ["not_detected"], ok: ["ok"] },
  },
  consumers: [
    // A ring, so the fields of an extra value are operated too (L-20).
    {
      entity: s("heat_pump"),
      name: "Wärmepumpe",
      icon: "mdi:heat-wave",
      min_w: 20,
      indicators: { ring: { entity: s("car_soc") } },
    },
    { entity: s("washer"), name: "Waschmaschine", color: "#123456" },
    {
      entity: s("car"),
      name: "Auto",
      charge: { soc: s("car_soc"), show: "always" },
    },
  ],
  min_consumer_w: 10,
  max_consumers: 6,
  appearance: "light",
  list: { enabled: true, solar: true, rest_label: "Rest" },
  ring: { enabled: true, solar: true, animation: "fade" },
  view: { modes: ["current", "avg_short"], pv_scales: ["share", "peak"], default_pv_scale: "peak" },
  flow: { lines: "curved", inactive_lines: "dim", dot_size: 120, min_w: 15 },
  power: { unit: "kW", decimals: 2 },
  nodes: {
    solar: { inside: { entity: s("today"), position: "below", decimals: 1 } },
    grid: { show_state: false },
  },
};

/** Split sensors, one PV entity inverted, the triangle - the other side of most choices. */
export const SPLIT = {
  type: `custom:${CARD}`,
  layout: "triangle",
  entities: {
    solar: { entity: s("pv_roof"), invert: false },
    grid: { import: s("grid_import"), export: s("grid_export") },
    house: s("house"),
    battery: { charge: s("battery_charge"), discharge: s("battery_discharge") },
    battery_soc: s("soc"),
  },
  consumers: [{ entity: s("heat_pump"), name: "Wärmepumpe" }],
  list: { always_below: true },
  ring: { enabled: false },
  power: { unit: "auto", digits: 4 },
  flow: { lines: "straight", animation: "off" },
};
