import { css } from "lit";

/**
 * The SVG scales with the card, the nodes on top of it do not: their sizes are
 * CSS pixels, clamped so text stays legible on a phone (REQ K-12, ENT-20).
 * `--el-scale` is set from the measured width so lines and dots can follow the
 * drawing while text does not.
 */
export const styles = css`
  :host {
    /* One size for all four nodes (REQ K-14): 2 × NODE_R viewBox units at the
       measured scale, plus 11 px so the ring inside the house keeps its stroke
       at small sizes; never below 70 px, where the figure stops being legible. */
    --el-node-size: max(70px, calc(112px * var(--el-scale, 1) + 11px));
    --el-value-size: clamp(12px, calc(13px * var(--el-scale, 1)), 15px);
    /* 12 px matches power-flow-card-plus, whose labels this sits next to on
       many dashboards. Fixed rather than scaled: the original does not scale
       either, and text below a circle has no reason to shrink with it. */
    --el-label-size: 12px;
    --el-list-size: 12px;
    --el-line: var(--divider-color, rgba(127, 127, 127, 0.3));
    display: block;
  }

  ha-card {
    /* Labels sit outside the drawing, so nothing may be clipped. */
    overflow: visible;
  }

  /* Overlay for the fan: spans the whole card body so it can reach from the
     house node into the list. Never takes clicks - the rows underneath do. */
  svg.fan {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }

  .fan-line {
    stroke-width: 2px;
    opacity: 0.45;
    fill: none;
  }

  /* Title left, mode chips right. Below about 400 px the chips drop onto their
     own line rather than squeezing the title (REQ V-2). */
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 12px;
    padding: 12px 16px 0;
  }

  .title {
    font-size: 20px;
    font-weight: 400;
    letter-spacing: -0.012em;
    color: var(--ha-card-header-color, var(--primary-text-color));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Mode chips and the list filter share one row at the right of the header. */
  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
  }

  /* A round chip: same height and border as the mode chips beside it. */
  .filter-toggle {
    font: inherit;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    background: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: 18px;
  }

  .filter-toggle.on {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .filter-toggle:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .modes {
    display: flex;
    /* Measured: 4 px left the chips closer than the 8 px I-3 asks between targets. */
    gap: 8px;
    flex: none;
  }

  .mode {
    font: inherit;
    font-size: 12px;
    line-height: 1;
    /* 36 px so the chips stay reachable on a phone (REQ I-3). */
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    background: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    font-variant-numeric: tabular-nums;
  }

  .mode.on {
    border-color: var(--primary-color);
    color: var(--primary-color);
    font-weight: 500;
  }

  .mode:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Shown when the selector is hidden but a mean is active (REQ V-3). */
  .mode-note {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }


  .body {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 20px;
    padding: 4px 16px 16px;
  }

  /* Flex bases decide when the list wraps below the cross. Home Assistant caps
     a section column at roughly 500 px, leaving ~460 px of content - so the two
     bases plus the gap have to stay under that, or the list never sits beside
     the cross in a sections view (REQ L-1). */
  .cross {
    /* The cross grows twice as fast as the list when there is room to spare:
       the drawing carries the picture, the list only needs enough width for a
       name and a value. */
    flex: 2 1 250px;
    min-width: 210px;
    max-width: 400px;
    /* Room for the labels, which reach beyond the drawing, and for the large
       nodes, which overhang the viewBox by a few units. */
    padding: 26px 8px 28px;
  }

  /* Positioning context for the nodes: exactly the area the SVG covers. */
  .plot {
    position: relative;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  /* Segments animate their length and position, so a consumer's slice grows or
     shrinks into place rather than snapping (REQ R-4). */
  /* The ring stands in for the border: its box is the node's outer box, which
     from inside the padding edge means 2 px beyond on every side. Below the
     icon and figure (z-index), above the node's background. */
  .node .ring {
    position: absolute;
    left: -2px;
    top: -2px;
    /* Explicit size, not derived from the insets: an SVG is a replaced element,
       and WebKit gives an absolutely positioned one its intrinsic 300 x 150
       instead of stretching it between left and right - the ring then sat off
       to the lower right and too large on iOS while Chromium looked fine. */
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    z-index: 0;
    pointer-events: none;
    overflow: visible;
  }

  .ring-seg {
    fill: none;
    /* stroke-width is set per render in viewBox units (ringGeometry). */
    stroke-linecap: butt;
    transition:
      stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .ring-seg {
      transition: none;
    }
  }

  .link {
    fill: none;
    stroke: var(--el-line);
    stroke-width: calc(3px / var(--el-scale, 1));
    stroke-linecap: round;
  }

  /* Dimmed so the dots stand out - but not so far that the hue disappears.
     At 0.55 the colour washed out to grey on a dark background, where the line
     blends into the card instead of the page. */
  /* Connections without flow, per flow.inactive_lines (REQ P-9). "hide" never
     reaches the stylesheet - those paths are not rendered at all. */
  .link.inactive-dim {
    opacity: 0.25;
  }

  .link.active {
    opacity: 0.8;
  }

  /* No CSS radius here: dots.ts sets the r attribute from the measured scale.
     The CSS geometry property with calc() is unreliable in WebKit and would
     leave the dots tiny or invisible on iOS (REQ K-12). */

  /* One node: icon, value, label - a fixed-size box centred on its coordinate. */
  .node {
    position: absolute;
    transform: translate(-50%, -50%);
    width: var(--el-node-size);
    height: var(--el-node-size);
    border-radius: 50%;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border: 2px solid var(--el-line);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  /* Fill level rises from the bottom with the state of charge (REQ K-5).
     The clip is what makes it read as a filled circle: without it the
     rectangle juts out past the rim and looks like a plinth. The node itself
     cannot clip, because the label sits outside it. */
  .node .fill-clip {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
  }

  .node .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.22;
    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Two tap targets on the battery: charge above, power below. Rectangles that
     reach past the circle, because the visible shape is too small for 44 px on
     a phone (REQ I-2, I-3, ENT-5). */
  .hit {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: max(44px, 100%);
    min-height: 44px;
    background: none;
    border: 0;
    padding: 0;
    margin: 0;
    cursor: pointer;
    border-radius: 8px;
  }

  .hit.upper {
    bottom: 50%;
    top: -22px;
  }

  .hit.lower {
    top: 50%;
    bottom: -22px;
  }

  .hit:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .node > ha-icon,
  .node > .value {
    position: relative;
    z-index: 1;
  }

  .node ha-icon {
    --mdc-icon-size: calc(var(--el-node-size) * 0.3);
    display: flex;
    color: var(--el-line);
  }

  .node .value {
    font-size: var(--el-value-size);
    font-weight: 500;
    line-height: 1.1;
    /* Numbers stay in the theme text colour - the state colours would not reach
       the required contrast as text (REQ C-5, ENT-18). */
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .node .value.unavailable {
    color: var(--secondary-text-color);
  }

  /* Label sits outside the circle: above for solar, below for the others. */
  /* Two lines instead of one long one, and never wider than about one and a
     half circles - otherwise the text reaches into the neighbouring node. */
  .label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: var(--el-label-size);
    line-height: 1.25;
    color: var(--secondary-text-color);
    text-align: center;
    /* Wide enough for the longest state word ("Einspeisung"). Words are never
       broken apart - a hyphen-less split reads as gibberish. Long consumer
       names are cut with an ellipsis instead. */
    max-width: min(150px, calc(var(--el-node-size) * 2));
    overflow-wrap: normal;
  }

  .label-state {
    opacity: 0.85;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-name {
    white-space: nowrap;
  }

  .node.solar .label {
    bottom: calc(100% + 4px);
  }

  .node:not(.solar) .label {
    top: calc(100% + 4px);
  }

  .label .derived {
    opacity: 0.7;
  }

  /* Beside the house node on a wide card, underneath it on a narrow one.
     The flex basis is the switch: below roughly 500 px of content the list
     wraps to its own line (REQ L-1). */
  .list {
    flex: 1 1 150px;
    min-width: 145px;
    align-self: center;
  }

  .list-title {
    margin: 0 0 2px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  /* No rules between rows: the swatches group the list well enough and
     separators only add height. Rows are 34 px, but the tap target below
     stretches past them to keep 44 px of reachable height (REQ I-3, L-9). */
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    /* Set per list from the row count, see rowHeight() in render/list.ts. */
    min-height: var(--el-row-h, 34px);
    font-size: var(--el-list-size);
    font-variant-numeric: tabular-nums;
  }

  /* One 18 px slot whether it holds the dot or an icon, so lanes and names
     line up across rows that differ (seen on the reference dashboard). */
  .row .swatch {
    flex: none;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: 18px;
  }

  .row .swatch.dot::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: currentColor;
  }

  /* Short run of wire per row, only in the stacked layout. Width is fixed so
     every row reads at the same scale - the dots' speed carries the figure,
     not the length. */
  .lane {
    position: relative;
    flex: none;
    /* Fallback width for browsers without subgrid (below). With subgrid the
       lane fills whatever the name and value columns leave over. */
    width: clamp(48px, 16%, 88px);
    height: 3px;
    border-radius: 1.5px;
    background: var(--divider-color, rgba(127, 127, 127, 0.25));
    overflow: visible;
  }

  .lane-dot {
    position: absolute;
    top: 50%;
    left: 0;
    /* Same 12 px as the dots on the connections (K-12) - the lanes are the
       same movement, and smaller dots there read as a different thing. */
    width: 12px;
    height: 12px;
    margin-top: -6px;
    margin-left: -6px;
    border-radius: 50%;
    animation-name: lane-run;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes lane-run {
    from {
      left: 0;
    }
    to {
      left: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lane-dot {
      animation: none;
      left: 50%;
    }
  }

  .row .name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
  }

  /* Stacked below the cross the list has the whole card width. The rows become
     a grid with shared columns: mark | lane | name | value. The name column is
     as wide as the longest name, the value column as wide as the widest figure,
     and the lane takes everything that is left - on a phone three times what
     the fixed width gave it. Browsers without subgrid keep the flex rows. */
  @supports (grid-template-columns: subgrid) {
    .list.stacked .rows {
      display: grid;
      /* The longest name decides: its column is as wide as it needs, the value
         column as wide as the widest figure, and the lane takes the rest. */
      grid-template-columns: 18px minmax(48px, 1fr) minmax(0, max-content) max-content;
      column-gap: 9px;
    }

    .list.stacked .row {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      align-items: center;
    }

    .list.stacked .lane {
      width: auto;
    }
  }

  .row .row-value {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  /* The rest entry is a computed figure, not a measurement - kept quieter. */
  .row.rest .name,
  .row.rest .row-value {
    color: var(--secondary-text-color);
  }

  /* Covers the row and reaches 5 px beyond it top and bottom, so a 34 px row
     still offers a 44 px target. Neighbouring targets touch rather than
     overlap, so a tap never hits the wrong row. */
  .row-hit {
    position: absolute;
    inset: -5px 0;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  .row-hit:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;
