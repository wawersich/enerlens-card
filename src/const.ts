// The dev build rewrites these three literals to a suffixed variant
// (CARD_SUFFIX in rollup.config.js), so a locally built card can be loaded
// next to the official HACS one without both claiming the same element name.
export const CARD_NAME = "enerlens-card";
export const EDITOR_NAME = "enerlens-card-editor";
export const CARD_LABEL = "EnerLens Card";
export const CARD_VERSION = "0.1.0";
export const REPO_URL = "https://github.com/wawersich/enerlens-card";
/** Replaced by the build with the git revision; stays a placeholder in tests. */
export const BUILD_ID = "__BUILD_ID__";
