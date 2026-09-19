/**
 * Filter, limit, rest entry, sorting, ring shares.
 * Owner: agent 3. REQ 4.4, L-3 - L-6, R-2, R-3.
 */
import { dotParams } from "./flow";
import {
  type Breakdown,
  type Config,
  type ListEntry,
  type Model,
  REST_KEY,
  type Segment,
} from "./types";

/**
 * One selection: filter by threshold, keep the strongest `maxConsumers`, add
 * the rest, sort descending (REQ 4.4, L-3 to L-6).
 *
 * `showAll` lifts threshold and limit (REQ L-12): a consumer that was busy a
 * minute ago is otherwise gone from the list before one can tap its history.
 */
function select(model: Model, config: Config, showAll: boolean): ListEntry[] {
  // 1. Candidates: available and at or above the threshold - the consumer's
  // own if it has one, else the global one (REQ L-3). A standby draw that is
  // real but uninteresting (a heat pump idling at 25 W) is hidden this way.
  const candidates: ListEntry[] = [];
  for (const consumer of model.consumers) {
    if (!consumer.reading.available) continue;
    if (!showAll && consumer.reading.w < (consumer.minW ?? config.minConsumerW)) continue;
    candidates.push({
      key: consumer.key,
      name: consumer.name,
      w: consumer.reading.w,
      color: consumer.color,
      entity: consumer.entity,
      icon: consumer.icon,
      isRest: false,
    });
  }

  // 2. Strongest `maxConsumers` (REQ L-4). Array.sort is stable, so consumers
  // of equal power keep their configured order.
  const shown = sortDescending(candidates).slice(
    0,
    showAll ? Number.POSITIVE_INFINITY : config.maxConsumers,
  );

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
        // Unset the list falls back to the plain dot, as it always did.
        icon: config.icons.rest,
        isRest: true,
      });
    }
  }

  // 4. The rest is sorted in like any other entry (REQ L-6). It was appended
  // last, so on a tie it lands behind consumers of equal power.
  return sortDescending(entries);
}

/**
 * Segments for the rows whose line is actually carrying something.
 *
 * A row below `flow.min_w` is drawn with a grey, dotless line - it is present,
 * but nothing flows on it. Giving it a coloured ring segment said the opposite,
 * and the minimum arc made a single watt as wide as a real contributor
 * (REQ R-2, changed 12.09.2026). The test is `dotParams`, the same call that
 * decides whether the line runs, so the two can never drift apart.
 *
 * Shares are taken over the sum of the segments themselves - without a rest
 * that scales the ring to 100 % on its own (REQ R-3).
 */
function toSegments(entries: ListEntry[], config: Config): Segment[] {
  const active = entries.filter((entry) => dotParams(entry.w, config) !== null);
  const total = active.reduce((sum, entry) => sum + entry.w, 0);
  return active.map((entry) => ({
    key: entry.key,
    share: total > 0 ? entry.w / total : 0,
    color: entry.color,
    entity: entry.entity,
    isRest: entry.isRest,
  }));
}

/**
 * List rows and ring segments for one tick.
 *
 * One selection, two views of it: every row the filter lets through goes into
 * the list, and those of them that carry something also get a ring segment
 * (see `toSegments`).
 */
export function buildBreakdown(model: Model, config: Config, showAll = false): Breakdown {
  const entries = select(model, config, showAll);
  return { entries, segments: toSegments(entries, config) };
}

function sortDescending(entries: ListEntry[]): ListEntry[] {
  return entries.sort((a, b) => b.w - a.w);
}

/**
 * Keeps the order and the selection of an existing breakdown, but refreshes
 * every figure from a newer model.
 *
 * The list therefore shows live values while rows only move on the tick
 * (REQ L-7): a reading may change every second without the rows reshuffling,
 * and a consumer that drops below the threshold stays visible until the next
 * tick re-selects. Its segment does go, though, at the same moment its line
 * turns grey - ring and line always tell the same story.
 */
export function refreshBreakdownValues(
  breakdown: Breakdown,
  model: Model,
  config: Config,
): Breakdown {
  const live = new Map<string, number>();
  for (const consumer of model.consumers) {
    if (consumer.reading.available) live.set(consumer.key, consumer.reading.w);
  }

  const entries = breakdown.entries.map((entry) =>
    entry.isRest ? entry : { ...entry, w: live.get(entry.key) ?? entry.w },
  );

  // The rest keeps absorbing whatever the shown consumers do not account for.
  const shown = entries.filter((e) => !e.isRest).reduce((sum, e) => sum + e.w, 0);
  const restIndex = entries.findIndex((e) => e.isRest);
  if (restIndex >= 0) {
    const rest = model.house.available ? model.house.w - shown : entries[restIndex].w;
    entries[restIndex] = { ...entries[restIndex], w: Math.max(0, rest) };
  }

  return { entries, segments: toSegments(entries, config) };
}
