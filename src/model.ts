/**
 * Reads Home Assistant state into a `Model`: watts, resolved signs, availability,
 * and the one derived balance quantity.
 * Owner: agent 2. REQ 4.1 - 4.3, K-8, K-9, A-1 - A-6.
 */
import type {
  Config,
  ConsumerReading,
  HomeAssistant,
  Model,
  Reading,
  Signed,
  SourceSpec,
} from "./types";

/** Case-sensitive SI factors for `device_class: power` (REQ 4.1). */
export const POWER_UNITS: Readonly<Record<string, number>> = Object.freeze({
  mW: 1e-3,
  W: 1,
  kW: 1e3,
  MW: 1e6,
  GW: 1e9,
  TW: 1e12,
});

/** Nothing configured - every quantity reads as unavailable instead of throwing. */
const NO_SOURCES: Config["sources"] = {
  solar: { kind: "absent" },
  grid: { kind: "absent" },
  battery: { kind: "absent" },
  house: { kind: "absent" },
};

/** One warning per entity and cause, so a misconfigured sensor cannot flood the console. */
const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[enerlens-card] ${message}`);
}

function parseNumber(state: string | undefined): number | null {
  // Guard the empty string explicitly: Number("") is 0, not NaN.
  if (typeof state !== "string" || state.trim() === "") return null;
  const value = Number(state);
  return Number.isFinite(value) ? value : null;
}

/**
 * State of one entity in watts, or null when it is unavailable, unknown or not
 * numeric (REQ 4.1, K-8, K-9). Exported so the averaging buffer can normalize
 * recorded states the same way (REQ V-4).
 */
export function readPowerW(hass: HomeAssistant, entityId: string): number | null {
  const stateObj = hass?.states?.[entityId];
  if (!stateObj) return null;
  const value = parseNumber(stateObj.state);
  if (value === null) return null;

  const unit = stateObj.attributes?.unit_of_measurement;
  if (typeof unit === "string" && unit !== "") {
    const factor = POWER_UNITS[unit];
    if (typeof factor === "number") return value * factor;
    warnOnce(`${entityId}|unit`, `${entityId}: unknown power unit "${unit}", value ignored`);
    return null;
  }
  if (stateObj.attributes?.device_class === "power") {
    warnOnce(`${entityId}|assume-w`, `${entityId}: no unit_of_measurement, assuming W`);
    return value;
  }
  warnOnce(
    `${entityId}|no-unit`,
    `${entityId}: neither unit_of_measurement nor device_class "power", value ignored`,
  );
  return null;
}

/** Magnitudes plus their net, all in watts. */
interface SignedValue {
  positive: number;
  negative: number;
  net: number;
}

/** REQ 4.2: a signed value becomes two magnitudes; net avoids negative zero. */
function splitSigned(value: number): SignedValue {
  const positive = Math.max(0, value);
  const negative = Math.max(0, -value);
  return { positive, negative, net: positive - negative };
}

type ValueOf = (entityId: string) => number | null;

/** Measured value of one balance quantity, or null when unavailable (REQ 4.2). */
function measure(spec: SourceSpec, read: ValueOf): SignedValue | null {
  if (spec.kind === "single") {
    const raw = read(spec.entity);
    if (raw === null) return null;
    return splitSigned(spec.invert ? -raw : raw);
  }
  if (spec.kind === "split") {
    const positiveRaw = read(spec.positive);
    const negativeRaw = read(spec.negative);
    // Half a measurement is no measurement: substituting 0 would invent a value
    // (REQ G-1), so the whole quantity is unavailable (REQ K-9).
    if (positiveRaw === null || negativeRaw === null) return null;
    const positive = Math.max(0, positiveRaw);
    const negative = Math.max(0, negativeRaw);
    // Both halves may report > 0 at the same time; that is left as a net value
    // and never plausibility-checked (REQ 4.2, N-5).
    return { positive, negative, net: positive - negative };
  }
  return null;
}

interface Endpoints {
  positive?: string;
  negative?: string;
}

function entitiesOf(spec: SourceSpec): Endpoints {
  if (spec.kind === "single") return { positive: spec.entity, negative: spec.entity };
  if (spec.kind === "split") return { positive: spec.positive, negative: spec.negative };
  return {};
}

function makeReading(w: number | null, entity: string | undefined, derived: boolean): Reading {
  if (w === null) return { available: false, entity, derived };
  return { available: true, w, entity, derived };
}

function makeSigned(value: SignedValue | null, at: Endpoints, derived: boolean): Signed {
  if (value === null) {
    return { available: false, entityPositive: at.positive, entityNegative: at.negative, derived };
  }
  return {
    available: true,
    positive: value.positive,
    negative: value.negative,
    net: value.net,
    entityPositive: at.positive,
    entityNegative: at.negative,
    derived,
  };
}

/** State of charge, always live and never averaged (REQ V-5). Percent, not watts. */
function readSoc(hass: HomeAssistant, entityId: string | undefined): Reading {
  if (!entityId) return { available: false, derived: false };
  const stateObj = hass?.states?.[entityId];
  return makeReading(stateObj ? parseNumber(stateObj.state) : null, entityId, false);
}

/** Builds the model for the current instant. Never throws (REQ N-5). */
export function buildModel(hass: HomeAssistant, config: Config): Model {
  return buildModelFrom(hass, config, (entityId) => readPowerW(hass, entityId));
}

/**
 * Same as `buildModel`, but every power value is supplied by `valueOf` instead of
 * read from `hass`. This is how the averaged view modes reuse the whole pipeline:
 * the caller hands in window means (REQ V-4). `valueOf` returns watts, or null
 * when unavailable. The state of charge is always read live (REQ V-5).
 */
export function buildModelFrom(
  hass: HomeAssistant,
  config: Config,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: documented API parameter name.
  valueOf: (entityId: string) => number | null,
): Model {
  const safeValueOf: ValueOf = (entityId) => {
    try {
      const value = valueOf(entityId);
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  };

  const sources = config?.sources ?? NO_SOURCES;
  const { solar: solarSpec, grid: gridSpec, battery: batterySpec, house: houseSpec } = sources;

  // A missing `house` key means "derive it" (REQ A-1); `absent` is treated the
  // same way here, because the house node always exists (REQ G-2).
  const houseIsDerived = houseSpec.kind === "derived" || houseSpec.kind === "absent";
  const batteryIsAbsent = batterySpec.kind === "absent";

  const solarMeasured = measure(solarSpec, safeValueOf);
  const gridMeasured = measure(gridSpec, safeValueOf);
  const batteryMeasured = batteryIsAbsent ? null : measure(batterySpec, safeValueOf);
  const houseMeasured = houseIsDerived ? null : measure(houseSpec, safeValueOf);

  // Inputs of the one derived quantity (REQ A-2). Unavailable stays null, which
  // makes the result unavailable too (REQ A-4); an absent battery counts as 0 W
  // in the balance (REQ A-5).
  // `measure` already yields null for a derived quantity, so these are exactly
  // the measured inputs.
  const solarIn = solarMeasured?.net ?? null;
  const gridIn = gridMeasured?.net ?? null;
  const houseIn = houseMeasured?.net ?? null;
  const batteryIn = batteryIsAbsent ? 0 : (batteryMeasured?.net ?? null);

  /** Applies a formula only when all three inputs are available (REQ A-4). */
  const derive = (
    a: number | null,
    b: number | null,
    c: number | null,
    formula: (a: number, b: number, c: number) => number,
  ): number | null => (a === null || b === null || c === null ? null : formula(a, b, c));

  // Formulas from REQ A-2; the signs there are already those of REQ E-2 (grid
  // + = import, battery + = discharging). Derived house and pv are clamped at 0
  // (ENT-4), derived grid and battery keep their sign and are split like a
  // signed single entity (REQ 4.3).
  const derivedHouse = houseIsDerived
    ? derive(solarIn, gridIn, batteryIn, (pv, grid, bat) => Math.max(0, pv + grid + bat))
    : null;
  const derivedSolar =
    solarSpec.kind === "derived"
      ? derive(houseIn, gridIn, batteryIn, (h, grid, bat) => Math.max(0, h - grid - bat))
      : null;
  const derivedGrid =
    gridSpec.kind === "derived"
      ? derive(houseIn, solarIn, batteryIn, (h, pv, bat) => h - pv - bat)
      : null;
  const derivedBattery =
    batterySpec.kind === "derived"
      ? derive(houseIn, solarIn, gridIn, (h, pv, grid) => h - pv - grid)
      : null;

  const solar: Reading =
    solarSpec.kind === "derived"
      ? makeReading(derivedSolar, undefined, true)
      : makeReading(solarMeasured?.net ?? null, entitiesOf(solarSpec).positive, false);

  const house: Reading = houseIsDerived
    ? makeReading(derivedHouse, undefined, true)
    : makeReading(houseMeasured?.net ?? null, entitiesOf(houseSpec).positive, false);

  const grid: Signed =
    gridSpec.kind === "derived"
      ? makeSigned(derivedGrid === null ? null : splitSigned(derivedGrid), {}, true)
      : makeSigned(gridMeasured, entitiesOf(gridSpec), false);

  let battery: Signed | null = null;
  if (batterySpec.kind === "derived") {
    battery = makeSigned(derivedBattery === null ? null : splitSigned(derivedBattery), {}, true);
  } else if (!batteryIsAbsent) {
    battery = makeSigned(batteryMeasured, entitiesOf(batterySpec), false);
  }

  // Consumers are never derived (REQ A-6).
  const consumers: ConsumerReading[] = (config?.consumers ?? []).map((consumer) => {
    const stateObj = hass?.states?.[consumer.entity];
    const friendly = stateObj?.attributes?.friendly_name;
    return {
      key: consumer.key,
      entity: consumer.entity,
      name: consumer.name ?? friendly ?? consumer.entity,
      color: consumer.color,
      minW: consumer.minW,
      // Configured only. The entity's own icon attribute is almost never set
      // (device-class defaults live in the frontend), so a fallback would show
      // icons for one consumer in ten and dots for the rest - worse than dots.
      icon: consumer.icon,
      reading: makeReading(safeValueOf(consumer.entity), consumer.entity, false),
    };
  });

  return {
    solar,
    grid,
    battery,
    soc: readSoc(hass, sources.batterySoc),
    house,
    consumers,
  };
}
