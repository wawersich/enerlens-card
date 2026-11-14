/**
 * Geometry of the fans and of the lists beside the drawing, kept apart from
 * the DOM so it can be tested on its own (REQ L-16, L-17, PV-7).
 *
 * Everything is in the overlay's CSS pixels, y downwards.
 */

export interface Point {
  x: number;
  y: number;
}

/** A circle the lines keep clear of; `r` already holds the clearance. */
export interface Obstacle extends Point {
  r: number;
}

/** Steepest exit against the horizontal, in degrees (L-16). */
const MAX_EXIT_DEG = 80;

/**
 * Where a fan leaves its node (L-16): perpendicular to the circle, towards
 * the middle of its rows - unweighted, since a strong first row pulled the
 * exit too far up (Markus, 24.10.2026). `side` is 1 for rows to the right,
 * -1 for rows to the left (mirrored, AN-3); `rowX` is where the rows start.
 * No rows, or rows level with the node: three (or nine) o'clock.
 */
export function exitDirection(
  centre: Point,
  rowYs: readonly number[],
  side: 1 | -1,
  rowX = centre.x + side * 200,
): Point {
  if (rowYs.length === 0) return { x: side, y: 0 };
  const y = rowYs.reduce((sum, value) => sum + value, 0) / rowYs.length;
  const dx = Math.max(1, side * (rowX - centre.x));
  const limit = (MAX_EXIT_DEG * Math.PI) / 180;
  const angle = Math.max(-limit, Math.min(limit, Math.atan2(y - centre.y, dx)));
  // A level exit stays exactly level: no hairline tilt from rounding.
  if (Math.abs(angle) < 1e-9) return { x: side, y: 0 };
  return { x: side * Math.cos(angle), y: Math.sin(angle) };
}

const f = (v: number) => v.toFixed(1);

/**
 * One fan line: out of the node along `dir` - a short straight piece first
 * when the exit is not level, so it leaves perpendicular to the circle -
 * then bending to the row's height over 60 % of the way (40 to 160 px) and
 * running straight into the row (L-13). Rows to the left are mirrored.
 */
export function fanPath(origin: Point, dir: Point, row: Point, lead = 10): string {
  const straight = dir.y === 0 ? 0 : lead;
  const p = { x: origin.x + dir.x * straight, y: origin.y + dir.y * straight };
  const side = row.x < p.x ? -1 : 1;
  const span = Math.abs(row.x - p.x);
  const knee = Math.min(160, Math.max(40, span * 0.6));
  const kx = p.x + side * Math.min(knee, span);
  const c = knee / 2;
  const head =
    straight > 0
      ? `M${f(origin.x)},${f(origin.y)} L${f(p.x)},${f(p.y)}`
      : `M${f(origin.x)},${f(origin.y)}`;
  return `${head} C${f(p.x + Math.abs(dir.x) * side * c)},${f(p.y + dir.y * c)} ${f(kx - side * c)},${f(row.y)} ${f(kx)},${f(row.y)} L${f(row.x)},${f(row.y)}`;
}

/** The bend of a line from the split point (xs, y0) to a row, as on `trunkPath`. */
function kneeOf(xs: number, rowX: number, side: 1 | -1): number {
  return Math.max(8, Math.min(side * (rowX - xs), 160));
}

/**
 * Points along a path of M, L and C commands as this module writes them -
 * enough to tell whether a line comes near something.
 */
export function samplePath(d: string, steps = 24): Point[] {
  const out: Point[] = [];
  const tokens = d.match(/[MLC]|-?\d+(?:\.\d+)?/g) ?? [];
  let at: Point = { x: 0, y: 0 };
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === "M") {
      at = { x: num(), y: num() };
      out.push(at);
    } else if (command === "L") {
      const to = { x: num(), y: num() };
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        out.push({ x: at.x + (to.x - at.x) * t, y: at.y + (to.y - at.y) * t });
      }
      at = to;
    } else if (command === "C") {
      const c1 = { x: num(), y: num() };
      const c2 = { x: num(), y: num() };
      const to = { x: num(), y: num() };
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const u = 1 - t;
        out.push({
          x: u * u * u * at.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
          y: u * u * u * at.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y,
        });
      }
      at = to;
    }
  }
  return out;
}

/**
 * Where the PV lines part (PV-7): all of them run level from the node to one
 * point and fan out from there, so none crosses another. The point lies as
 * close to the node as it can and moves out only as far as needed for every
 * line to keep clear of the obstacles (the neighbour node on the rows' side)
 * and out of `noGo` (where the other fan runs). With few rows it stays at
 * the node; with more of them reaching down past the house it moves out.
 * Tested on the very lines `trunkPath` draws.
 */
export function splitPoint(
  origin: Point,
  rowYs: readonly number[],
  rowX: number,
  side: 1 | -1,
  obstacles: readonly Obstacle[],
  noGo?: (x: number, y: number) => boolean,
  dir: Point = { x: side, y: 0 },
  lead = 10,
): number {
  const hits = (xs: number) =>
    rowYs.some((y) =>
      samplePath(trunkPath(origin, dir, xs, { x: rowX, y }, lead)).some(
        (pt) =>
          obstacles.some((o) => Math.hypot(pt.x - o.x, pt.y - o.y) < o.r) ||
          (noGo?.(pt.x, pt.y) ?? false),
      ),
    );
  const last = rowX - side * 8;
  let xs = origin.x;
  while (side * (last - xs) > 0 && hits(xs)) xs += side * 2;
  return side * (xs - last) > 0 ? last : xs;
}

/**
 * A PV line through the split point (PV-7): out of the node along `dir`
 * (L-16), level to `xs`, then the bend to the row. At the node itself it is
 * the plain fan path.
 */
export function trunkPath(origin: Point, dir: Point, xs: number, row: Point, lead = 10): string {
  const side = row.x < origin.x ? -1 : 1;
  if (side * (xs - origin.x) < 1) return fanPath(origin, dir, row, lead);
  const straight = dir.y === 0 ? 0 : lead;
  const p = { x: origin.x + dir.x * straight, y: origin.y + dir.y * straight };
  const run = Math.max(0, side * (xs - p.x));
  const ease = side * Math.min(20, run / 2);
  const trunk =
    straight > 0
      ? `L${f(p.x)},${f(p.y)} C${f(p.x + ease)},${f(p.y)} ${f(xs - ease)},${f(p.y)} ${f(xs)},${f(p.y)}`
      : `L${f(xs)},${f(p.y)}`;
  const k = kneeOf(xs, row.x, side as 1 | -1);
  const c = side * (k / 2);
  const kx = xs + side * k;
  return `M${f(origin.x)},${f(origin.y)} ${trunk} C${f(xs + c)},${f(p.y)} ${f(kx - c)},${f(row.y)} ${f(kx)},${f(row.y)} L${f(row.x)},${f(row.y)}`;
}

export interface Block {
  /** Where the layout put it. */
  top: number;
  height: number;
  /** Centre height of its node. */
  node: number;
}

/**
 * One list alone on its side of the drawing (AN-3, L-17): taller than the
 * drawing it stays where the layout put it, otherwise as near the middle of
 * its node as it can, never past the drawing's top or bottom. Returns how far
 * to move it.
 */
export function placeBlock(drawing: { top: number; bottom: number }, block: Block): number {
  if (block.height > drawing.bottom - drawing.top) return 0;
  const top = Math.min(
    drawing.bottom - block.height,
    Math.max(drawing.top, block.node - block.height / 2),
  );
  return Math.round(top - block.top);
}

/**
 * Two lists on one side of the drawing (L-17): together taller than the
 * drawing they stay where the layout put them - the drawing stands in their
 * middle. Otherwise each one as near the middle of its node as it can, never
 * past the drawing's top or bottom, parting where they meet only as far as
 * they must. Returns how far to move each.
 */
export function placeBlocks(p: {
  drawing: { top: number; bottom: number };
  pv: Block;
  consumers: Block;
  gap: number;
}): { pv: number; consumers: number } {
  const { drawing, pv, consumers, gap } = p;
  if (pv.height + gap + consumers.height > drawing.bottom - drawing.top) {
    return { pv: 0, consumers: 0 };
  }
  let pvTop = pv.node - pv.height / 2;
  let consumersTop = consumers.node - consumers.height / 2;
  const overlap = pvTop + pv.height + gap - consumersTop;
  if (overlap > 0) {
    pvTop -= overlap / 2;
    consumersTop += overlap / 2;
  }
  if (pvTop < drawing.top) {
    consumersTop = Math.max(consumersTop, drawing.top + pv.height + gap);
    pvTop = drawing.top;
  }
  if (consumersTop + consumers.height > drawing.bottom) {
    consumersTop = drawing.bottom - consumers.height;
    pvTop = Math.min(pvTop, consumersTop - gap - pv.height);
  }
  return { pv: Math.round(pvTop - pv.top), consumers: Math.round(consumersTop - consumers.top) };
}

/** A box a line must not run through - a node's label (L-16). */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** One row a radial line runs to. */
export interface RadialRow extends Point {
  key: string;
}

/** Room around a label a line keeps clear of. */
const BOX_MARGIN = 3;
/** Steps from the line's own angle to the horizontal when it has to turn. */
const TURN_STEPS = 40;

/**
 * One radial line (L-16, 13.11.2026): out of the circle on its own radius at
 * `angle` - 0 towards the rows, positive downwards, mirrored for rows on the
 * left - a short straight piece along it, then a curve that runs level into
 * the row.
 */
export function radialPath(
  centre: Point,
  radius: number,
  side: 1 | -1,
  angle: number,
  row: Point,
  lead = 10,
): string {
  const dir = { x: side * Math.cos(angle), y: Math.sin(angle) };
  const s = { x: centre.x + dir.x * radius, y: centre.y + dir.y * radius };
  const straight =
    Math.abs(angle) < 1e-9 ? 0 : Math.min(lead, Math.max(0, side * (row.x - s.x) - 4));
  const p = { x: s.x + dir.x * straight, y: s.y + dir.y * straight };
  const span = Math.max(1, side * (row.x - p.x));
  const reach = Math.hypot(row.x - p.x, row.y - p.y);
  const out = Math.min(80, Math.max(6, reach * 0.4));
  const into = Math.min(80, Math.max(6, span * 0.45));
  const head = straight > 0 ? `M${f(s.x)},${f(s.y)} L${f(p.x)},${f(p.y)}` : `M${f(s.x)},${f(s.y)}`;
  return `${head} C${f(p.x + dir.x * out)},${f(p.y + dir.y * out)} ${f(row.x - side * into)},${f(row.y)} ${f(row.x)},${f(row.y)}`;
}

/** Whether two polylines cross - touching or running together does not count. */
export function crosses(a: readonly Point[], b: readonly Point[]): boolean {
  const turn = (p: Point, q: Point, r: Point) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  for (let i = 1; i < a.length; i++) {
    const p1 = a[i - 1];
    const p2 = a[i];
    for (let j = 1; j < b.length; j++) {
      const q1 = b[j - 1];
      const q2 = b[j];
      if (
        Math.max(p1.x, p2.x) < Math.min(q1.x, q2.x) ||
        Math.max(q1.x, q2.x) < Math.min(p1.x, p2.x)
      )
        continue;
      if (
        Math.max(p1.y, p2.y) < Math.min(q1.y, q2.y) ||
        Math.max(q1.y, q2.y) < Math.min(p1.y, p2.y)
      )
        continue;
      const d1 = turn(q1, q2, p1);
      const d2 = turn(q1, q2, p2);
      const d3 = turn(p1, p2, q1);
      const d4 = turn(p1, p2, q2);
      if (
        ((d1 > 1e-6 && d2 < -1e-6) || (d1 < -1e-6 && d2 > 1e-6)) &&
        ((d3 > 1e-6 && d4 < -1e-6) || (d3 < -1e-6 && d4 > 1e-6))
      )
        return true;
    }
  }
  return false;
}

export interface RadialFan {
  centre: Point;
  radius: number;
  /** 1: rows to the right of the node, -1: to the left (AN-3). */
  side: 1 | -1;
  rows: readonly RadialRow[];
  /** Other nodes, `r` already holding the clearance (radius + 14 px). */
  obstacles: readonly Obstacle[];
  /** Node labels the lines must not run through. */
  boxes?: readonly Box[];
  /** Where no line may go (the strip the other fan starts in, PV-7). */
  noGo?: (x: number, y: number) => boolean;
  /** Lines already drawn by the other fan; none may be crossed. */
  others?: readonly string[];
  lead?: number;
  /**
   * Draw radially even where the checks fail - while rows glide, after the
   * fan was found clear at rest, so a line does not flip between two looks
   * mid-move (L-16).
   */
  force?: boolean;
}

/**
 * A whole fan of radial lines (L-16): each line leaves on its own radius
 * towards its row, at most 80 degrees from the horizontal. A line that would
 * come near another node or run through a label turns towards the rows, step
 * by step, until it is clear; the lines then keep the order of their rows -
 * a turned line takes along every line between it and the horizontal - so
 * none crosses another. Is no such fan to be had, or would it cross the other
 * fan, the answer is undefined and the card draws the fan as before.
 * Returns one path per row key.
 */
export function radialFan(fan: RadialFan): Map<string, string> | undefined {
  const { centre, radius, side, obstacles, boxes = [], noGo, others = [], lead = 10 } = fan;
  const limit = (MAX_EXIT_DEG * Math.PI) / 180;
  const rows = [...fan.rows].sort((a, b) => a.y - b.y);
  const blocked = (d: string) =>
    samplePath(d).some(
      (pt) =>
        obstacles.some((o) => Math.hypot(pt.x - o.x, pt.y - o.y) < o.r) ||
        boxes.some(
          (b) =>
            pt.x > b.left - BOX_MARGIN &&
            pt.x < b.right + BOX_MARGIN &&
            pt.y > b.top - BOX_MARGIN &&
            pt.y < b.bottom + BOX_MARGIN,
        ) ||
        (noGo?.(pt.x, pt.y) ?? false),
    );
  const path = (row: RadialRow, angle: number) =>
    radialPath(centre, radius, side, angle, row, lead);
  let clear = true;
  const angles = rows.map((row) => {
    const own = Math.max(
      -limit,
      Math.min(limit, Math.atan2(row.y - centre.y, Math.max(1, side * (row.x - centre.x)))),
    );
    for (let i = 0; i <= TURN_STEPS; i++) {
      const angle = own * (1 - i / TURN_STEPS);
      if (!blocked(path(row, angle))) return angle;
    }
    clear = false;
    return 0;
  });
  // Keep the order: below the node from the bottom up, above it from the top down.
  for (let i = angles.length - 2; i >= 0; i--) {
    if (angles[i] > 0) angles[i] = Math.min(angles[i], angles[i + 1]);
  }
  for (let i = 1; i < angles.length; i++) {
    if (angles[i] < 0) angles[i] = Math.max(angles[i], angles[i - 1]);
  }
  const paths = rows.map((row, i) => path(row, angles[i]));
  if (!fan.force) {
    if (!clear || paths.some(blocked)) return undefined;
    const sampled = paths.map((d) => samplePath(d));
    for (let i = 0; i < sampled.length; i++) {
      for (let j = i + 1; j < sampled.length; j++) {
        if (crosses(sampled[i], sampled[j])) return undefined;
      }
    }
    const theirs = others.map((d) => samplePath(d));
    if (sampled.some((mine) => theirs.some((t) => crosses(mine, t)))) return undefined;
  }
  return new Map(rows.map((row, i) => [row.key, paths[i]]));
}
