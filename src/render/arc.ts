/**
 * The arched list (REQ LZ-17): beside the drawing the rows stand on an arc
 * around their node - the consumers around the house, the PV rows around PV.
 * The row level with the node stays out, the others move in towards the
 * drawing the further they are from it, into the room the fan lines run in.
 *
 * Pure geometry in the card's CSS pixels, apart from the DOM so it can be
 * tested; the card measures the layout without the arc and writes the shift.
 */

export interface ArcBlock {
  /** 1: rows right of the node, -1: left of it (AN-3). */
  side: 1 | -1;
  /** Centre height of the node. */
  nodeY: number;
  /** The node's edge towards the rows - for PV rows the neighbour's too. */
  nodeEdge: number;
  /** Where the rows begin on the node's side, without the arc. */
  rowsEdge: number;
  /** Centre heights of the rows. */
  rows: readonly number[];
  /** The tightest circle allowed, grown with the card (K-12). */
  minRadius: number;
}

/** The arc: the farthest any row moves in, and the radius of its circle. */
export interface Arc {
  M: number;
  R: number;
}

/**
 * The arc for a block: at most half the free room, reached by the outermost
 * row unless the circle would be tighter than allowed - so long lists bend
 * gently and short ones close to the node hardly at all, never with a kink.
 * One row, or no room: no arc.
 */
export function arcGeometry(block: ArcBlock): Arc {
  const free = block.side * (block.rowsEdge - block.nodeEdge);
  if (block.rows.length < 2 || !(free > 0)) return { M: 0, R: block.minRadius };
  const M = free / 2;
  const far = Math.max(...block.rows.map((y) => Math.abs(y - block.nodeY)));
  return { M, R: Math.max(block.minRadius, (far * far + M * M) / (2 * M)) };
}

/** How far a row `d` above or below the node's centre moves in. */
export function arcShift(d: number, arc: Arc): number {
  if (arc.M <= 0) return 0;
  const dd = Math.min(Math.abs(d), arc.R);
  return Math.min(arc.M, arc.R - Math.sqrt(arc.R * arc.R - dd * dd));
}

/** The glide's curve, cubic-bezier(0.4, 0, 0.2, 1) (L-8), at time `t` in 0..1. */
function glideCurve(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const bez = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) * (1 - s) + 3 * b * s * s * (1 - s) + s * s * s;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (bez(0.4, 0.2, mid) < t) lo = mid;
    else hi = mid;
  }
  return bez(0, 1, (lo + hi) / 2);
}

/** The arc on its way from one shape to the next, `t` from 0 to 1. */
export function arcEase(from: Arc, to: Arc, t: number): Arc {
  if (t <= 0) return from;
  if (t >= 1) return to;
  const k = glideCurve(t);
  return { M: from.M + (to.M - from.M) * k, R: from.R + (to.R - from.R) * k };
}
