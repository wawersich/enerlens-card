/**
 * The consumer ring inside the house node: one segment per list entry, sized
 * by its share of the house value (REQ R-1 to R-6).
 *
 * It takes the place of the house node's coloured border: its outer edge is the
 * node's outer edge, so all four nodes share one outer diameter and one contour
 * weight (K-14). Drawn as its own small SVG inside the node: the ring must
 * paint above the node's background and below its icon and figure, which the
 * cross SVG underneath the nodes cannot do.
 *
 * Segments carry the same keys as the list rows, so a consumer keeps its
 * segment across updates and the transition animates instead of jumping.
 */
import { type TemplateResult, html, nothing, svg } from "lit";
import type { Segment } from "../types";

/** Stroke in CSS px (REQ K-12: ring >= 8 px). */
export const RING_STROKE_PX = 11;
/** The ring's box is the node's outer box (it replaces the border), so nothing
 *  is inset. Kept as a named constant because styles.ts mirrors it. */
export const RING_INSET_PX = 0;

/** Gap between segments and the shortest arc, as fractions of the circumference
 *  (REQ R-2). A hairline segment reads as a rendering artefact; the share it
 *  borrows comes off the largest segment, so the ring still closes. */
const GAP_FRACTION = 0.0085;
const MIN_ARC_FRACTION = 0.017;

/**
 * Stroke width and radius in the ring's own 100-unit viewBox, from the node's
 * drawn size. Everything stays in user units - no vector-effect, no CSS calc
 * on SVG geometry, both of which WebKit has rendered unreliably before
 * (decision 003, dots.ts). The outer edge of the stroke lands exactly on the
 * box, which sits RING_INSET_PX inside the node's outer edge.
 */
export function ringGeometry(nodePx: number): { r: number; strokeWidth: number } {
  const innerPx = Math.max(1, nodePx - 2 * RING_INSET_PX);
  const strokeWidth = RING_STROKE_PX * (100 / innerPx);
  return { r: 50 - strokeWidth / 2, strokeWidth };
}

export function renderRing(
  allSegments: Segment[],
  enabled: boolean,
  nodePx: number,
): TemplateResult | typeof nothing {
  // Entries at 0 W (only there with the filter lifted, REQ L-12) would each
  // still claim a gap; a ring of gaps says nothing, so they are skipped here.
  const segments = allSegments.filter((s) => s.share > 0);
  if (!enabled || segments.length === 0) return nothing;

  const { r, strokeWidth } = ringGeometry(nodePx);
  const circumference = 2 * Math.PI * r;
  const gap = circumference * GAP_FRACTION;
  const minArc = circumference * MIN_ARC_FRACTION;
  // A single segment gets no gap - a full circle should close (REQ R-2).
  const gaps = segments.length > 1 ? segments.length * gap : 0;
  const available = circumference - gaps;

  // Give tiny segments their floor, then take it back from the biggest one.
  const lengths = segments.map((s) => s.share * available);
  let borrowed = 0;
  for (const [i, length] of lengths.entries()) {
    if (length > 0 && length < minArc) {
      borrowed += minArc - length;
      lengths[i] = minArc;
    }
  }
  if (borrowed > 0) {
    const biggest = lengths.indexOf(Math.max(...lengths));
    lengths[biggest] = Math.max(minArc, lengths[biggest] - borrowed);
  }

  let offset = 0;
  const arcs = segments.map((segment, index) => {
    const length = lengths[index];
    const dash = `${length.toFixed(2)} ${(circumference - length).toFixed(2)}`;
    const arc = svg`<circle
      class="ring-seg"
      data-key=${segment.key}
      r=${r.toFixed(2)}
      cx="50"
      cy="50"
      stroke-width=${strokeWidth.toFixed(2)}
      stroke=${segment.color}
      stroke-dasharray=${dash}
      stroke-dashoffset=${(-offset).toFixed(2)}
    ></circle>`;
    offset += length + (segments.length > 1 ? gap : 0);
    return arc;
  });

  // Rotated so the first segment starts at twelve o'clock (REQ R-2).
  return html`<svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(-90 50 50)">${arcs}</g>
  </svg>`;
}
