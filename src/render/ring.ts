/**
 * The ring around the house node: one segment per list entry, sized by its
 * share of the house value (REQ R-1 to R-6).
 *
 * Segments carry the same keys as the list rows, so a consumer keeps its
 * segment across updates and the transition animates instead of jumping.
 */
import { type SVGTemplateResult, nothing, svg } from "lit";
import type { Segment } from "../types";
import { NODE_POS, RING_R } from "./geometry";

/** Gap between segments, in viewBox units (REQ R-2). */
const GAP = 3;

export function renderRing(
  segments: Segment[],
  enabled: boolean,
): SVGTemplateResult | typeof nothing {
  if (!enabled || segments.length === 0) return nothing;

  const { x, y } = NODE_POS.house;
  const circumference = 2 * Math.PI * RING_R;
  // A single segment gets no gap - a full circle should close (REQ R-2).
  const gaps = segments.length > 1 ? segments.length * GAP : 0;
  const available = circumference - gaps;

  let offset = 0;
  const arcs = segments.map((segment) => {
    const length = segment.share * available;
    const dash = `${length.toFixed(2)} ${(circumference - length).toFixed(2)}`;
    const arc = svg`<circle
      class="ring-seg"
      data-key=${segment.key}
      r=${RING_R}
      cx="0"
      cy="0"
      stroke=${segment.color}
      stroke-dasharray=${dash}
      stroke-dashoffset=${(-offset).toFixed(2)}
    ></circle>`;
    offset += length + (segments.length > 1 ? GAP : 0);
    return arc;
  });

  // Rotated so the first segment starts at twelve o'clock (REQ R-2).
  return svg`<g class="ring" transform="translate(${x},${y}) rotate(-90)">${arcs}</g>`;
}
