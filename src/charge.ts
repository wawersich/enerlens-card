/**
 * A consumer's state of charge - typically an EV at its wallbox (REQ L-15).
 *
 * The wallbox measures the power, the car reports its charge through an
 * integration of its own; nothing in Home Assistant links the two, so the
 * configuration does. The last known state of charge needs memory across
 * updates and lives here (a sleeping car often goes unavailable, and its last
 * reading is still a measurement - shown grey, never made up). Whether the car
 * is plugged in became a condition of its own (REQ L-18, hold.ts).
 */
import type { ChargeState, HomeAssistant, NormalizedCharge, NormalizedConsumer } from "./types";

/** A state of charge in percent, or undefined when the state is no number. */
export function socValue(state: string | undefined): number | undefined {
  if (state === undefined || state.trim() === "") return undefined;
  const value = Number(state);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : undefined;
}

interface Known {
  value: number;
  t: number;
}

export class ChargeTracker {
  /** Last numeric state of charge per entity, with when it was measured. */
  private readonly known = new Map<string, Known>();
  /** Entities whose history was already asked for, so it is asked only once. */
  private readonly asked = new Set<string>();

  /** Folds the live states into what the tracker remembers. */
  observe(hass: HomeAssistant, consumers: readonly NormalizedConsumer[]): void {
    for (const consumer of consumers) {
      const charge = consumer.charge;
      if (!charge) continue;
      const stateObj = hass.states[charge.soc];
      const value = socValue(stateObj?.state);
      if (value !== undefined) {
        // When it was last reported, not when it last changed: a car that
        // says 80 % again and again is up to date (REQ L-15).
        const t = Date.parse(stateObj?.last_updated || stateObj?.last_changed || "");
        this.known.set(charge.soc, { value, t: Number.isFinite(t) ? t : Date.now() });
      }
    }
  }

  state(hass: HomeAssistant, charge: NormalizedCharge): ChargeState {
    const live = socValue(hass.states[charge.soc]?.state);
    if (live !== undefined) return { soc: live, stale: false };
    const known = this.known.get(charge.soc);
    if (known) return { soc: known.value, stale: true, since: known.t };
    return { stale: false };
  }

  /** State-of-charge entities with no value now and none remembered, not yet asked for. */
  missing(hass: HomeAssistant, consumers: readonly NormalizedConsumer[]): string[] {
    const out: string[] = [];
    for (const consumer of consumers) {
      const soc = consumer.charge?.soc;
      if (!soc || out.includes(soc) || this.asked.has(soc) || this.known.has(soc)) continue;
      if (socValue(hass.states[soc]?.state) === undefined) out.push(soc);
    }
    return out;
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
        const value = typeof point.s === "string" ? socValue(point.s) : undefined;
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
