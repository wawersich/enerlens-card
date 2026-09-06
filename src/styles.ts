import { css } from "lit";

/**
 * The SVG scales with the card, the nodes on top of it do not: their sizes are
 * CSS pixels, clamped so text stays legible on a phone (REQ K-12, ENT-20).
 * `--el-scale` is set from the measured width so lines and dots can follow the
 * drawing while text does not.
 */
export const styles = css`
  :host {
    --el-node-size: clamp(58px, calc(88px * var(--el-scale, 1)), 88px);
    --el-value-size: clamp(12px, calc(13px * var(--el-scale, 1)), 15px);
    --el-label-size: clamp(11px, calc(11px * var(--el-scale, 1)), 13px);
    --el-line: var(--divider-color, rgba(127, 127, 127, 0.3));
    display: block;
  }

  ha-card {
    /* Labels sit outside the drawing, so nothing may be clipped. */
    overflow: visible;
  }

  .body {
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
    flex: 1 1 250px;
    min-width: 210px;
    max-width: 400px;
    /* Room for the labels, which reach beyond the drawing. */
    padding: 18px 8px 22px;
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

  .link {
    fill: none;
    stroke: var(--el-line);
    stroke-width: calc(2px / var(--el-scale, 1));
    stroke-linecap: round;
  }

  .link.active {
    opacity: 0.55;
  }

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
     Low opacity so the numbers on top stay readable. */
  .node .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0 0 999px 999px;
    opacity: 0.22;
    pointer-events: none;
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
    max-width: calc(var(--el-node-size) * 1.55);
    overflow-wrap: anywhere;
  }

  .label-name {
    white-space: nowrap;
  }

  .label-state {
    opacity: 0.85;
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
    flex: 1 1 175px;
    min-width: 165px;
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
    min-height: 34px;
    font-variant-numeric: tabular-nums;
  }

  .row .swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex: none;
  }

  .row .name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
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
