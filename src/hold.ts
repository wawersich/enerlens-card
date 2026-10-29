/**
 * What keeps a consumer row in the list regardless of its power (REQ L-18):
 * `show: always`, or a condition on any entity - a car plugged in, a printer
 * switched on, a voltage above a mark. It only ever adds a row; whatever
 * draws enough power is listed anyway, so no setting can hide a measured
 * consumer in the rest (Markus, 29.10.2026).
 */
import { normalizeState } from "./outage";
import type { HomeAssistant, NormalizedConsumer, NormalizedHold } from "./types";

type Condition = Extract<NormalizedHold, { kind: "condition" }>;

const NO_VALUE = new Set(["unavailable", "unknown", ""]);

/** A plain decimal when the whole text is one; "10.50" and "10.5" are the same. */
function asNumber(text: string): number | undefined {
  return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(text) ? Number(text) : undefined;
}

/**
 * Met, not met, or no answer. No answer is an entity without a value
 * (unavailable, unknown, empty) - the caller then keeps the last answer.
 * = and != are "one of" and "none of"; both sides numbers compare as numbers,
 * everything else as text regardless of case.
 */
export function conditionVerdict(state: string | undefined, hold: Condition): boolean | undefined {
  if (state === undefined) return undefined;
  const value = normalizeState(state);
  if (NO_VALUE.has(value)) return undefined;
  if (hold.invalid) return false;
  if (hold.operator === "=" || hold.operator === "!=") {
    const number = asNumber(value);
    const hit = (hold.values ?? []).some((candidate) => {
      const other = asNumber(candidate);
      return number !== undefined && other !== undefined ? number === other : candidate === value;
    });
    return hold.operator === "=" ? hit : !hit;
  }
  const number = asNumber(value);
  const limit = hold.limit;
  if (number === undefined || limit === undefined) return false;
  switch (hold.operator) {
    case ">":
      return number > limit;
    case "<":
      return number < limit;
    case ">=":
      return number >= limit;
    default:
      return number <= limit;
  }
}

/**
 * Remembers the last answer of every condition, so a sensor that drops out for
 * a moment does not throw its row out of the list; without any answer yet a
 * condition is not met (REQ L-18, as L-15 did for the plug).
 */
export class HoldTracker {
  private readonly answers = new Map<string, boolean>();

  /**
   * Keyed by the condition itself, not only the consumer: an answer belongs
   * to the question it answered. A condition changed in the editor while its
   * new sensor is unavailable starts without one.
   */
  private static keyOf(consumer: NormalizedConsumer, hold: Condition): string {
    return JSON.stringify([consumer.key, hold.entity, hold.operator, hold.values, hold.limit]);
  }

  observe(hass: HomeAssistant, consumers: readonly NormalizedConsumer[]): void {
    for (const consumer of consumers) {
      const hold = consumer.hold;
      if (hold?.kind !== "condition") continue;
      const verdict = conditionVerdict(hass.states[hold.entity]?.state, hold);
      if (verdict !== undefined) this.answers.set(HoldTracker.keyOf(consumer, hold), verdict);
    }
  }

  /**
   * Whether the row is held now. A period has no "now" to ask a condition
   * about, so the energy mode keeps only `always` (REQ L-18).
   */
  held(consumer: NormalizedConsumer, energy: boolean): boolean {
    const hold = consumer.hold;
    if (!hold) return false;
    if (hold.kind === "always") return true;
    if (energy) return false;
    return this.answers.get(HoldTracker.keyOf(consumer, hold)) ?? false;
  }
}
