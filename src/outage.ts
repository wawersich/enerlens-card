/**
 * Grid outage from an optional status entity (REQ NS-1 to NS-6).
 *
 * The entity is a latch, not a reading. States listed under `outage` switch the
 * outage on, states listed under `ok` switch it off, and everything else -
 * `unavailable`, `unknown`, a state nobody listed - leaves it as it was.
 *
 * That hold is the whole point. The integration behind the reference
 * installation keeps serving its last known value for ten minutes before it
 * gives up and goes unavailable, and an outage often takes the connection with
 * it. A card that read silence as "the grid is back" would drop the outage
 * exactly when it is real.
 */
import { localize } from "./localize";
import type { GridStatusSpec, HomeAssistant, OutageState } from "./types";

/** States that carry no information, whatever the integration calls its values. */
const NO_VALUE: ReadonlySet<string> = new Set(["unavailable", "unknown", "none", ""]);

export const normalizeState = (value: string): string => value.trim().toLowerCase();

/** What a state should do to the latch. */
export type StatusVerdict = "outage" | "ok" | "hold";

export function classifyStatus(
  state: string | undefined,
  spec: GridStatusSpec,
  /** The entity's own `options` attribute, if it has one (enum, input_select). */
  options?: readonly string[],
): StatusVerdict {
  if (state === undefined) return "hold";
  const value = normalizeState(state);
  if (NO_VALUE.has(value)) return "hold";
  if (spec.outage.includes(value)) return "outage";
  if (spec.ok.length > 0) return spec.ok.includes(value) ? "ok" : "hold";
  // No ok states given: the entity's own options minus the outage ones are the
  // ok ones. `unavailable` and `unknown` never appear in `options`, so the hold
  // rule survives. Without options, any other real state ends the outage.
  if (options && options.length > 0) {
    return options.some((option) => normalizeState(option) === value) ? "ok" : "hold";
  }
  return "ok";
}

export function applyStatus(
  previous: OutageState,
  state: string | undefined,
  spec: GridStatusSpec,
  options?: readonly string[],
): OutageState {
  switch (classifyStatus(state, spec, options)) {
    case "outage":
      return true;
    case "ok":
      return false;
    default:
      return previous;
  }
}

/** The options attribute as a string list; enum sensors and input_select have one. */
export function statusOptions(hass: HomeAssistant, entityId: string): string[] | undefined {
  const options = hass.states[entityId]?.attributes.options;
  if (!Array.isArray(options)) return undefined;
  return options.filter((option): option is string => typeof option === "string");
}

/** Reads the live state and folds it into the latch. */
export function readStatus(
  hass: HomeAssistant,
  spec: GridStatusSpec,
  previous: OutageState,
): OutageState {
  const state = hass.states[spec.entity]?.state;
  return applyStatus(previous, state, spec, statusOptions(hass, spec.entity));
}

interface HistoryPoint {
  s?: unknown;
  lu?: unknown;
}

/**
 * The newest state in the window that carries information, so a card opened
 * during an outage starts with the outage rather than with a shrug (REQ NS-6).
 *
 * Ten days is the natural window: that is how long the recorder keeps states,
 * and an enum has no long-term statistics to fall back on. Measured on the
 * reference installation that is seven states in 602 bytes - a staged search
 * would save nothing and cost a second loading state.
 */
export async function fetchLastKnownStatus(
  hass: HomeAssistant,
  entityId: string,
  days = 10,
  timeoutMs = 5000,
): Promise<string | undefined> {
  const end = Date.now();
  const request = hass.callWS<unknown>({
    type: "history/history_during_period",
    start_time: new Date(end - days * 86_400_000).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`EnerLens: grid status history timed out after ${timeoutMs} ms`)),
      timeoutMs,
    );
  });

  let response: unknown;
  try {
    response = await Promise.race([request, timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }

  if (response === null || typeof response !== "object") return undefined;
  const points = (response as Record<string, unknown>)[entityId];
  if (!Array.isArray(points)) return undefined;

  // Newest first: the last real state is the one that still applies.
  const time = (point: unknown): number => {
    const lu = (point as HistoryPoint).lu;
    return typeof lu === "number" ? lu : 0;
  };
  for (const point of [...points].sort((a, b) => time(b) - time(a))) {
    const state = (point as HistoryPoint).s;
    if (typeof state !== "string") continue;
    if (NO_VALUE.has(normalizeState(state))) continue;
    return state;
  }
  return undefined;
}

/** Console note when the status entity is configured but unusable (REQ NS-1, E-1). */
export function warnUnusable(field: string, hass?: HomeAssistant): void {
  console.warn(localize("error.config.grid_status_no_outage", hass, { field }));
}
