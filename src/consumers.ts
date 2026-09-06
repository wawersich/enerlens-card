/**
 * Filter, limit, rest entry, sorting, ring shares.
 * Owner: agent 3. REQ 4.4, L-3 - L-6, R-2, R-3.
 */
import type { Breakdown, Config, Model } from "./types";

/**
 * Applies REQ 4.4 in order: filter by `minConsumerW`, keep the strongest
 * `maxConsumers`, compute the rest, sort descending, derive ring shares.
 * Entries and segments always describe the same set in the same order (REQ R-2).
 */
export function buildBreakdown(_model: Model, _config: Config): Breakdown {
  throw new Error("TODO: agent 3");
}
