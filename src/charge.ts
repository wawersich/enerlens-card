/**
 * A consumer's state of charge - typically an EV at its wallbox (REQ L-15).
 *
 * The wallbox measures the power, the car reports its charge through an
 * integration of its own; nothing in Home Assistant links the two, so the
 * configuration does. Two things need memory across updates and live here:
 * whether the car is plugged in (an unavailable sensor keeps the last answer)
 * and the last known state of charge (a sleeping car often goes unavailable,
 * and its last reading is still a measurement - shown grey, never made up).
 */
import type { ChargeState, HomeAssistant, NormalizedCharge, NormalizedConsumer } from "./types";

const NO_VALUE = new Set(["unavailable", "unknown", ""]);

/**
 * Plugged in, not plugged in, or no answer. Without an `unplugged` list the
 * entity is on/off; with one, every real state outside it means plugged in.
 * Case does not count - OCPP boxes write `Available`, others `available`.
 */
export function pluggedVerdict(
  state: string | undefined,
  unplugged: readonly string[],
): boolean | undefined {
  if (state === undefined) return undefined;
  const value = state.trim().toLowerCase();
  if (NO_VALUE.has(value)) return undefined;
  if (unplugged.length === 0) return value === "on";
  return !unplugged.includes(value);
}

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
  /** Last answer per plugged entity; held while it is unavailable. */
  private readonly plugged = new Map<string, boolean>();
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
      if (charge.plugged) {
        const verdict = pluggedVerdict(hass.states[charge.plugged]?.state, charge.unplugged);
        if (verdict !== undefined) this.plugged.set(charge.plugged, verdict);
      }
    }
  }

  state(hass: HomeAssistant, charge: NormalizedCharge): ChargeState {
    const plugged = charge.plugged ? (this.plugged.get(charge.plugged) ?? false) : false;
    const live = socValue(hass.states[charge.soc]?.state);
    if (live !== undefined) return { soc: live, stale: false, plugged };
    const known = this.known.get(charge.soc);
    if (known) return { soc: known.value, stale: true, since: known.t, plugged };
    return { stale: false, plugged };
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
