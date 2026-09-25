// The dev build rewrites these three literals to a suffixed variant
// (CARD_SUFFIX in rollup.config.js), so a locally built card can be loaded
// next to the official HACS one without both claiming the same element name.
export const CARD_NAME = "enerlens-card";
export const EDITOR_NAME = "enerlens-card-editor";
export const CARD_LABEL = "EnerLens Card";
export const CARD_VERSION = "0.5.4";
export const REPO_URL = "https://github.com/wawersich/enerlens-card";
/** Replaced by the build with the git revision; stays a placeholder in tests. */
export const BUILD_ID = "__BUILD_ID__";
/**
 * Where the local build fetches flow designs from, so a design saved in the
 * tool shows up after a reload without rebuilding. Empty in a release build:
 * there the designs are compiled in, and a request that could only fail has no
 * business running on someone else's dashboard.
 */
export const LIVE_DESIGNS_URL = "";
