/**
 * The last value of each PV source (REQ PV-2): whether a source that went
 * away was quiet - a micro inverter off for the night, counted 0 - or was
 * delivering, which makes the PV a partial sum shown in amber.
 *
 * Kept while the card runs; a card opened while a source is already gone
 * asks the recorder once for the last real value before it went (like NS-6).
 */
import { readPowerW } from "./model";
import type { HomeAssistant, NormalizedSolarSource } from "./types";

export class SolarMemory {
  /** Last available value per source entity, in W, sign as configured. */
  private readonly last = new Map<string, number>();
  /** Entities whose history was already asked for, so it is asked only once. */
  private readonly asked = new Set<string>();

  /** What the model reads (REQ PV-2). */
  get values(): ReadonlyMap<string, number> {
    return this.last;
  }

  /** Folds the live states into what is remembered. */
  observe(hass: HomeAssistant, sources: readonly NormalizedSolarSource[]): void {
    for (const source of sources) {
      const w = readPowerW(hass, source.entity);
      if (w !== null) this.last.set(source.entity, source.invert ? -w : w);
    }
  }

  /** Sources without a value now and none remembered, not yet asked for. */
  missing(hass: HomeAssistant, sources: readonly NormalizedSolarSource[]): string[] {
    return sources
      .map((source) => source.entity)
      .filter((id) => !this.asked.has(id) && !this.last.has(id) && readPowerW(hass, id) === null);
  }

  /**
   * The newest numeric state of each entity from the recorder (ten days, as
   * long as it keeps states), in the unit the entity has now. Marks them
   * asked first, so a slow or failing recorder is not hit again.
   */
  async prefill(
    hass: HomeAssistant,
    sources: readonly NormalizedSolarSource[],
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
      timer = setTimeout(() => reject(new Error("EnerLens: PV history timed out")), timeoutMs);
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
      const stateObj = hass.states[id];
      let best: { w: number; t: number } | undefined;
      for (const point of points as Array<{ s?: unknown; lu?: unknown; lc?: unknown }>) {
        if (typeof point.s !== "string") continue;
        // The recorder sends no unit here; the entity's present one applies.
        const w = readPowerW(
          { ...hass, states: { [id]: { ...stateObj, entity_id: id, state: point.s } } },
          id,
        );
        const raw = typeof point.lc === "number" ? point.lc : point.lu;
        if (w === null || typeof raw !== "number") continue;
        if (!best || raw > best.t) best = { w, t: raw };
      }
      const invert = sources.find((source) => source.entity === id)?.invert === true;
      // A live value that arrived meanwhile is newer than anything recorded.
      if (best && !this.last.has(id)) this.last.set(id, invert ? -best.w : best.w);
    }
  }
}
