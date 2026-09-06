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

  .cross {
    flex: 1 1 300px;
    min-width: 240px;
    max-width: 440px;
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
  .label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--el-label-size);
    line-height: 1.2;
    color: var(--secondary-text-color);
    white-space: nowrap;
    text-align: center;
  }

  .node.solar .label {
    bottom: calc(100% + 4px);
  }

  .node:not(.solar) .label {
    top: calc(100% + 4px);
  }

  .label .derived {
    opacity: 0.75;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;
