/**
 * Filter, limit, rest entry, sorting, ring shares.
 * Owner: agent 3. REQ 4.4, L-3 - L-6, R-2, R-3.
 */
import { type Breakdown, type Config, type ListEntry, type Model, REST_KEY } from "./types";

/**
 * Applies REQ 4.4 in order: filter by `minConsumerW`, keep the strongest
 * `maxConsumers`, compute the rest, sort descending, derive ring shares.
 * Entries and segments always describe the same set in the same order (REQ R-2).
 */
export function buildBreakdown(model: Model, config: Config): Breakdown {
  // 1. Candidates: available and at or above the threshold (REQ L-3).
  const candidates: ListEntry[] = [];
  for (const consumer of model.consumers) {
    if (!consumer.reading.available) continue;
    if (consumer.reading.w < config.minConsumerW) continue;
    candidates.push({
      key: consumer.key,
      name: consumer.name,
      w: consumer.reading.w,
      color: consumer.color,
      entity: consumer.entity,
      isRest: false,
    });
  }

  // 2. Strongest `maxConsumers` (REQ L-4). Array.sort is stable, so consumers
  // of equal power keep their configured order.
  const shown = sortDescending(candidates).slice(0, config.maxConsumers);

  // 3. Rest, only with an available house value and at or above the threshold
  // (REQ L-5). A negative rest - sum of shown > house - fails that test too.
  const entries = shown.slice();
  if (model.house.available) {
    const rest = model.house.w - shown.reduce((sum, entry) => sum + entry.w, 0);
    if (rest >= config.minConsumerW) {
      entries.push({
        key: REST_KEY,
        // Empty when unconfigured; the renderer localizes it (REQ L-5).
        name: config.list.restLabel ?? "",
        w: rest,
        color: config.colors.rest,
        isRest: true,
      });
    }
  }

  // 4. The rest is sorted in like any other entry (REQ L-6). It was appended
  // last, so on a tie it lands behind consumers of equal power.
  sortDescending(entries);

  // 5. Shares over the sum of all entries - without a rest that scales the
  // ring to 100 % on its own (REQ R-3).
  const total = entries.reduce((sum, entry) => sum + entry.w, 0);
  const segments = entries.map((entry) => ({
    key: entry.key,
    share: total > 0 ? entry.w / total : 0,
    color: entry.color,
    entity: entry.entity,
    isRest: entry.isRest,
  }));

  return { entries, segments };
}

function sortDescending(entries: ListEntry[]): ListEntry[] {
  return entries.sort((a, b) => b.w - a.w);
}
