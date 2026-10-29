/**
 * The extra values of a consumer - ring, bars, fill (REQ L-20); first and
 * typically an EV's state of charge at its wallbox (REQ L-15).
 *
 * The wallbox measures the power, the car reports its charge through an
 * integration of its own; nothing in Home Assistant links the two, so the
 * configuration does. The last known state of charge needs memory across
 * updates and lives here (a sleeping car often goes unavailable, and its last
 * reading is still a measurement - shown grey, never made up). Whether the car
 * is plugged in became a condition of its own (REQ L-18, hold.ts).
 */
import type { HomeAssistant, IndicatorState, NormalizedConsumer } from "./types";

/**
 * The number a state stands for, or undefined when it is none - an enum
 * state, unavailable, empty. Never limited: the measurement is shown as it
 * is (rule 8); only the drawing is limited to its scale.
 */
export function indicatorValue(state: string | undefined): number | undefined {
  if (state === undefined || state.trim() === "") return undefined;
  const value = Number(state);
  return Number.isFinite(value) ? value : undefined;
}

/** The extra-value entities of the consumers, each once. */
function entitiesOf(consumers: readonly NormalizedConsumer[]): string[] {
  const ids = new Set<string>();
  for (const consumer of consumers) {
    for (const indicator of Object.values(consumer.indicators?.slots ?? {})) {
      ids.add(indicator.entity);
    }
  }
  return [...ids];
}

interface Known {
  value: number;
  t: number;
  unit?: string;
}

export class ChargeTracker {
  /** Last numeric state of charge per entity, with when it was measured. */
  private readonly known = new Map<string, Known>();
  /** Entities whose history was already asked for, so it is asked only once. */
  private readonly asked = new Set<string>();

  /** Folds the live states into what the tracker remembers. */
  observe(hass: HomeAssistant, consumers: readonly NormalizedConsumer[]): void {
    for (const entity of entitiesOf(consumers)) {
      const stateObj = hass.states[entity];
      const value = indicatorValue(stateObj?.state);
      if (value !== undefined) {
        // When it was last reported, not when it last changed: a car that
        // says 80 % again and again is up to date (REQ L-15).
        const t = Date.parse(stateObj?.last_updated || stateObj?.last_changed || "");
        const unit = stateObj?.attributes?.unit_of_measurement;
        this.known.set(entity, {
          value,
          t: Number.isFinite(t) ? t : Date.now(),
          unit: typeof unit === "string" ? unit : undefined,
        });
      }
    }
  }

  state(hass: HomeAssistant, entity: string): IndicatorState {
    const stateObj = hass.states[entity];
    const live = indicatorValue(stateObj?.state);
    const unit = stateObj?.attributes?.unit_of_measurement;
    if (live !== undefined) {
      return { value: live, stale: false, unit: typeof unit === "string" ? unit : undefined };
    }
    const known = this.known.get(entity);
    if (known) return { value: known.value, stale: true, since: known.t, unit: known.unit };
    return { stale: false };
  }

  /** Extra-value entities with no value now and none remembered, not yet asked for. */
  missing(hass: HomeAssistant, consumers: readonly NormalizedConsumer[]): string[] {
    return entitiesOf(consumers).filter(
      (id) =>
        !this.asked.has(id) &&
        !this.known.has(id) &&
        indicatorValue(hass.states[id]?.state) === undefined,
    );
  }

  /**
   * The newest numeric state of each entity from the recorder (ten days, as
   * long as it keeps states). Marks them asked first, so a slow or failing
   * recorder is not hit again on every update.
   */
  async prefill(
    hass: HomeAssistant,
    entityIds: readonly string[],
    timeoutMs = 5000,
  ): Promise<void> {
    if (entityIds.length === 0) return;
    for (const id of entityIds) this.asked.add(id);
    const end = Date.now();
    const request = hass.callWS<unknown>({
      type: "history/history_during_period",
      start_time: new Date(end - 10 * 86_400_000).toISOString(),
      end_time: new Date(end).toISOString(),
      entity_ids: [...entityIds],
      minimal_response: true,
      no_attributes: true,
    });
    // Lost to the timeout, a late failure must not surface as unhandled.
    request.catch(() => undefined);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error("EnerLens: charge history timed out")), timeoutMs);
    });
    let response: unknown;
    try {
      response = await Promise.race([request, timeout]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
    if (response === null || typeof response !== "object") return;
    for (const id of entityIds) {
      const points = (response as Record<string, unknown>)[id];
      if (!Array.isArray(points)) continue;
      let best: Known | undefined;
      for (const point of points as Array<{ s?: unknown; lu?: unknown; lc?: unknown }>) {
        const value = typeof point.s === "string" ? indicatorValue(point.s) : undefined;
        const raw = typeof point.lc === "number" ? point.lc : point.lu;
        if (value === undefined || typeof raw !== "number") continue;
        const t = raw * 1000;
        if (!best || t > best.t) best = { value, t };
      }
      // A live value that arrived meanwhile is newer than anything recorded.
      if (best && !this.known.has(id)) this.known.set(id, best);
    }
  }
}
