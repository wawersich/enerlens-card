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
import { uiLanguage } from "./localize";
import type { FlowDesign, HomeAssistant } from "./types";

/** The plain dots of every version before designs existed. */
export const NO_DESIGN = "none";

/** A design written before a value existed still has to work (P-10). */
function withDefaults(list: FlowDesign[]): FlowDesign[] {
  for (const design of list) {
    // bias used to live in a block of its own, next to the trail values.
    const legacy = (design as { spur?: { bias?: number } }).spur;
    if (typeof design.shape?.bias !== "number" && typeof legacy?.bias === "number") {
      design.shape.bias = legacy.bias;
    }
    if (typeof design.shape?.bias !== "number") design.shape.bias = 0;
    if (typeof design.shape?.caps !== "number") design.shape.caps = 0;
    for (const ground of [design.dark, design.light]) {
      if (typeof ground?.line !== "number") ground.line = 80;
    }
  }
  return list;
}

let designs: FlowDesign[] = withDefaults((bundled as { designs: FlowDesign[] }).designs);
let loading: Promise<void> | undefined;

export function flowDesigns(): readonly FlowDesign[] {
  return designs;
}

/** The design for an id, or undefined for "none" and anything unknown. */
export function flowDesign(id: string | undefined): FlowDesign | undefined {
  if (!id || id === NO_DESIGN) return undefined;
  return designs.find((entry) => entry.id === id);
}

/**
 * What to call a design in the interface the user is looking at.
 *
 * `name` is the German name, `name_en` the one for everybody else - not just
 * for English. The card speaks two languages and falls back to English for any
 * third, so an Italian reads an English interface; handing them the German
 * name there would be the one combination nobody asked for.
 *
 * A name like "Electron" has nothing to translate, so the second one is
 * optional and the first stands in for it.
 */
export function designName(design: FlowDesign, hass?: HomeAssistant): string {
  const english = design.name_en?.trim();
  if (!english) return design.name;
  return uiLanguage(hass) === "de" ? design.name : english;
}

/** Shallow check that a fetched entry is shaped like a design. */
function isDesign(value: unknown): value is FlowDesign {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.id !== "string" || !entry.id) return false;
  return ["shape", "dark", "light"].every(
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
        if (usable.length) designs = withDefaults(usable);
      })
      .catch(() => {
        /* no file next to the card: the compiled-in designs stand */
      });
  }
  return loading;
}
