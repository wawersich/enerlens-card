// The dev build rewrites these literals to a suffixed variant
// (CARD_SUFFIX in rollup.config.js), so a locally built card can be loaded
// next to the official HACS one without both claiming the same element name.
export const CARD_NAME = "enerlens-card";
export const EDITOR_NAME = "enerlens-card-editor";
/** The detail window for grid and battery, opened through HA's dialog manager (DF-2). */
export const DETAIL_NAME = "enerlens-card-detail";
export const CARD_LABEL = "EnerLens Card";
export const CARD_VERSION = "1.3.0";
export const REPO_URL = "https://github.com/wawersich/enerlens-card";
/**
 * What a new card starts with (REQ E-5): placeholders, not guesses. Picking
 * sensors by order or by name finds plausible wrong ones on a large setup.
 * Where these entities really exist they are simply used.
 */
export const STUB_ENTITIES = { solar: "sensor.solar_power", grid: "sensor.grid_power" };
/** Invented readings shown, and marked, while only the placeholders are set (E-5). */
export const EXAMPLE_W = { solar: 3200, grid: 450 };

/** Replaced by the build with the git revision; stays a placeholder in tests. */
export const BUILD_ID = "__BUILD_ID__";
/**
 * Where the local build fetches flow designs from, so a design saved in the
 * tool shows up after a reload without rebuilding. Empty in a release build:
 * there the designs are compiled in, and a request that could only fail has no
 * business running on someone else's dashboard.
 */
export const LIVE_DESIGNS_URL = "";
