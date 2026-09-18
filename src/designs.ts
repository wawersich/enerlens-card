/**
 * The flow designs: how the dots look (P-10).
 *
 * The designs are compiled in - one file stays one file, and HACS installs the
 * bundle and nothing else. The local build additionally reloads them from disk
 * at runtime (LIVE_DESIGNS_URL), so a design saved in tools/leuchtspur/ shows up
 * after a page reload without a rebuild.
 */
import { LIVE_DESIGNS_URL } from "./const";
import bundled from "./flow-designs.json";
import type { FlowDesign } from "./types";

/** The plain dots of every version before designs existed. */
export const NO_DESIGN = "none";

let designs: FlowDesign[] = (bundled as { designs: FlowDesign[] }).designs;
let loading: Promise<void> | undefined;

export function flowDesigns(): readonly FlowDesign[] {
  return designs;
}

/** The design for an id, or undefined for "none" and anything unknown. */
export function flowDesign(id: string | undefined): FlowDesign | undefined {
  if (!id || id === NO_DESIGN) return undefined;
  return designs.find((entry) => entry.id === id);
}

/** Shallow check that a fetched entry is shaped like a design. */
function isDesign(value: unknown): value is FlowDesign {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.id !== "string" || !entry.id) return false;
  return ["shape", "spur", "dark", "light"].every(
    (key) => typeof entry[key] === "object" && entry[key] !== null,
  );
}

/**
 * Reloads the designs from disk in a local build. Resolves either way: the
 * bundled list stays in place if the file is missing or unreadable, and it runs
 * at most once per page.
 */
export function loadLiveDesigns(): Promise<void> {
  if (!LIVE_DESIGNS_URL) return Promise.resolve();
  if (!loading) {
    loading = fetch(LIVE_DESIGNS_URL, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        const list = (data as { designs?: unknown })?.designs;
        if (!Array.isArray(list)) return;
        const usable = list.filter(isDesign);
        if (usable.length) designs = usable;
      })
      .catch(() => {
        /* no file next to the card: the compiled-in designs stand */
      });
  }
  return loading;
}
