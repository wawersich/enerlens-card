/**
 * The consumer ring inside the house node: one segment per list entry, sized
 * by its share of the house value (REQ R-1 to R-6).
 *
 * It takes the place of the house node's coloured border and is centred on it:
 * the ring's middle runs where the other nodes' 2 px border runs, half the
 * stroke outside the circle, half inside (K-14). The eye reads the ring's
 * centre line as the contour, so the house looks the same size as its
 * neighbours - with the ring's outer edge on the contour it looked smaller. Drawn as its own small SVG inside the node: the ring must
 * paint above the node's background and below its icon and figure, which the
 * cross SVG underneath the nodes cannot do.
 *
 * Segments carry the same keys as the list rows, so a consumer keeps its
 * segment across updates and RingAnimator moves it instead of jumping. With
 * `ring.animation: fade` the circles belong to places instead, and a reorder
 * blends their colours (R-4).
 */
import { type TemplateResult, html, nothing, svg } from "lit";
import { repeat } from "lit/directives/repeat.js";
import type { RingAnimation, Segment } from "../types";

/** How long a segment takes to glide to a new length and place (REQ R-4):
 *  RingAnimator gets it 95 % of the way there in this time. */
export const RING_GLIDE_MS = 1500;

/** Stroke in CSS px (REQ K-12: ring >= 8 px). */
export const RING_STROKE_PX = 11;
/** The ring's box reaches half a stroke beyond the node's outer box on every
 *  side, so the stroke is centred on the contour. styles.ts mirrors this. */
export const RING_INSET_PX = -RING_STROKE_PX / 2;

/** Gap between segments and the shortest arc, as fractions of the circumference
 *  (REQ R-2). A hairline segment reads as a rendering artefact; the share it
 *  borrows comes off the largest segment, so the ring still closes.
 *
 *  The floor went from 1.7 % to 1.4 % on 12.09.2026: since the ring describes
 *  the filtered selection, its smallest segment is at least `min_consumer_w`
 *  and no longer a stray watt, so less inflation is needed. It stays clearly
 *  wider than a gap (1.4 % = 5.0 deg against 0.85 % = 3.1 deg) - below about
 *  1 % a minimum segment stops reading as a segment and starts reading as the
 *  gap next to it. Less borrowing also distorts the largest segment less. */
const GAP_FRACTION = 0.0085;
const MIN_ARC_FRACTION = 0.014;

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
  mode: RingAnimation = "overtake",
  /** Whether the card moves at all (P-7) - only then do colours blend. */
  fading = false,
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
    const arc = { segment, index, length: lengths[index], offset };
    offset += arc.length + (segments.length > 1 ? gap : 0);
    return arc;
  });
  // The circles carry where they are to be, not where they are drawn:
  // RingAnimator moves stroke-dasharray and stroke-dashoffset there, all of
  // them from one progress (R-4). Bound here, Lit would set them at once.
  //
  // Laid out in display order, but put in the DOM in a fixed one. Where a
  // segment sits is its dash offset alone; the DOM order only decides which
  // one paints on top. Sorted by display order, a reorder would make Lit move
  // elements around for nothing, and the paint order would change with the
  // data.
  //
  // Fading, a circle is a place rather than a consumer: it stays where it is,
  // takes on the colour of whoever stands there now, and the stylesheet blends
  // the colour over. Places never pass one another, so nothing dives, and the
  // DOM is already in a fixed order - the order of the places.
  const byPlace = mode === "fade";
  if (!byPlace) {
    arcs.sort((a, b) =>
      a.segment.key < b.segment.key ? -1 : a.segment.key > b.segment.key ? 1 : 0,
    );
  }

  // Rotated so the first segment starts at twelve o'clock (REQ R-2).
  return html`<svg class="ring ${byPlace && fading ? "fade" : ""}" viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(-90 50 50)">${repeat(
      arcs,
      (arc) => (byPlace ? `slot-${arc.index}` : arc.segment.key),
      (arc) => svg`<circle
        class="ring-seg"
        data-key=${arc.segment.key}
        data-index=${arc.index}
        r=${r.toFixed(2)}
        cx="50"
        cy="50"
        stroke-width=${strokeWidth.toFixed(2)}
        stroke=${arc.segment.color}
        data-length=${arc.length.toFixed(2)}
        data-offset=${arc.offset.toFixed(2)}
        data-circ=${circumference.toFixed(2)}
      ></circle>`,
    )}</g>
  </svg>`;
}

/** Room left between the inner lane and the ring it dives under, in CSS px. */
const LANE_CLEARANCE_PX = 2;

/**
 * How far a segment shrinks towards the centre while it overtakes (R-4).
 *
 * Scaled about the centre, a segment keeps its angles - so its place on the
 * ring - and radius and stroke shrink together. The inner lane has to clear the
 * ring by a stroke, and a fixed factor does not: on a 70 px node 0.8 would
 * still overlap it. Solved for the stroke's outer edge on the inner lane
 * sitting LANE_CLEARANCE_PX inside the ring's inner edge, then clamped so a
 * large node does not dive deeper than it needs to.
 */
export function laneScale(nodePx: number): number {
  const r = nodePx / 2;
  const half = RING_STROKE_PX / 2;
  const scale = (r - half - LANE_CLEARANCE_PX) / (r + half);
  return Math.min(0.85, Math.max(0.6, scale));
}

/** Critically damped: 95 % of the way in RING_GLIDE_MS, from wherever it was. */
const OMEGA = 4.74 / (RING_GLIDE_MS / 1000);
/**
 * Closer than this, in viewBox units, and a segment counts as arrived - well
 * under a tenth of a pixel. Finer would keep the frame loop running for seconds
 * after anything visible has changed, and live values arrive every second.
 */
const SETTLED = 0.05;
/**
 * Longest step taken at once. The step is exact, so no size of it can
 * overshoot; the cap only stops the ring from leaping after a stalled main
 * thread. Kept well above a slow device's frame, which would otherwise stretch
 * the glide beyond RING_GLIDE_MS.
 */
const MAX_STEP_S = 0.25;
/** The dive's own spring is quicker: 95 % of the way down or up in this time. */
const DIVE_OMEGA = 4.74 / 0.3;

/** Where a value is drawn, how fast it moves, and where it is headed. */
interface Axis {
  x: number;
  v: number;
  to: number;
}

interface Dive {
  /** The segments it overtakes; it stays under until it is clear of all of them. */
  passing: SVGCircleElement[];
  /** Scale of the segment, 1 on the ring, the lane's scale when under. */
  scale: Axis;
}

interface Drawn {
  len: Axis;
  off: Axis;
  circ: number;
  dive?: Dive;
  /** What was last written, so an unchanged frame writes nothing. */
  written?: string;
}

/** Time and frames, swappable so tests can step through a glide. */
export interface RingClock {
  now(): number;
  frame(callback: () => void): number;
  cancel(id: number): void;
}

const BROWSER_CLOCK: RingClock = {
  now: () => performance.now(),
  frame: (callback) => requestAnimationFrame(() => callback()),
  cancel: (id) => cancelAnimationFrame(id),
};

/**
 * Moves the ring's segments to where the render put them (R-4).
 *
 * Every segment, and both its length and its offset, follow the same
 * critically damped spring. Because that motion is linear, the gap between
 * two neighbours follows the same spring towards the same gap - so it stays
 * exact however often new values arrive, which is every second or so. Per
 * segment CSS transitions did not: each restarted only when its own rounded
 * value changed, the neighbours drifted apart and the gaps showed 0 or double.
 * A spring also carries its speed into a new target, so a retarget does not
 * brake the ring the way a restarted ease would.
 *
 * A segment that moves forward overtakes on an inner lane, and stays there
 * until it is past everyone it overtakes - measured on the ring, not on a
 * clock or on its own way. A new value one second into a reorder can lengthen
 * the way, or leave the overtaker nearly where it is while the one it passes
 * travels the long way round beneath it; anything timed would surface in the
 * middle of the passing. The depth has a quicker spring of its own, so it
 * never jumps.
 *
 * Known and accepted, because each is a few frames in a rare transition and
 * the ring always ends exactly on its targets (R-4): segments on the lane can
 * cross each other there (two overtakers, or b, c and d in [a,b,c,d] to
 * [c,d,b,a]); a swap reversed within the glide lets the two meet at the same
 * depth for a moment; an overtaker lies over its neighbour for the first few
 * frames before it is deep enough; and a segment born in the same update as a
 * reorder can grow into one that falls back past it.
 */
export class RingAnimator {
  private readonly drawn = new WeakMap<SVGCircleElement, Drawn>();
  /** Display index at the last update, per element. */
  private readonly shownAt = new WeakMap<SVGCircleElement, number>();
  private shown: SVGCircleElement[] = [];
  private lane = 0.8;
  private pending?: number;
  private last = 0;

  constructor(
    private readonly clock: RingClock | undefined = typeof requestAnimationFrame === "function"
      ? BROWSER_CLOCK
      : undefined,
  ) {}

  /** Call after every render. Does nothing that is not needed. */
  update(root: ParentNode, animate: boolean, nodePx: number): void {
    const targets = [...root.querySelectorAll<SVGCircleElement>("svg.ring circle.ring-seg")]
      .map((el) => ({
        el,
        index: Number(el.dataset.index),
        len: Number(el.dataset.length),
        off: Number(el.dataset.offset),
        circ: Number(el.dataset.circ),
      }))
      .sort((a, b) => a.index - b.index);
    this.lane = laneScale(nodePx);

    // Ranks among the segments that were there before and still are. Raw
    // indices would make every segment behind a vanished one "move forward"
    // without having passed anybody.
    const kept = targets.filter((t) => this.drawn.has(t.el));
    const before = [...kept].sort(
      (a, b) => (this.shownAt.get(a.el) ?? 0) - (this.shownAt.get(b.el) ?? 0),
    );
    const rankBefore = new Map(before.map((t, rank) => [t.el, rank]));
    const rankNow = new Map(kept.map((t, rank) => [t.el, rank]));
    for (const t of targets) this.shownAt.set(t.el, t.index);
    this.shown = targets.map((t) => t.el);

    // Nothing to move from: the ring is new, it changed size, or it is to
    // stand still (P-7, and off-screen P-8). Straight to the targets.
    const resized = kept.some((t) => this.drawn.get(t.el)?.circ !== t.circ);
    if (!animate || !this.clock || kept.length === 0 || resized) {
      for (const t of targets) {
        this.drawn.set(t.el, { len: axis(t.len), off: axis(t.off), circ: t.circ });
      }
      this.halt();
      return;
    }

    for (const [i, t] of targets.entries()) {
      const drawn = this.drawn.get(t.el);
      if (!drawn) {
        this.drawn.set(t.el, this.born(targets, i));
        continue;
      }
      drawn.len.to = t.len;
      drawn.off.to = t.off;
      const was = rankBefore.get(t.el) ?? 0;
      const is = rankNow.get(t.el) ?? 0;
      // Whom it passes now: in front of it before, behind it now.
      const passing = kept
        .filter((o) => (rankBefore.get(o.el) ?? 0) < was && (rankNow.get(o.el) ?? 0) > is)
        .map((o) => o.el);
      // Those it was still passing stay on the list while they are behind it;
      // a later reorder that puts one ahead again takes it off, or the dive
      // would wait for a passing that never ends. Already under, it carries on
      // from its depth instead of surfacing and diving again.
      const still = (drawn.dive?.passing ?? []).filter(
        (o) => rankNow.has(o) && (rankNow.get(o) ?? 0) > is && !passing.includes(o),
      );
      if (passing.length + still.length > 0) {
        // Fresh dives set off at speed: from rest the spring would still be
        // near the ring when the overtaker first touches its neighbour.
        // Starting at -(1 - lane) * omega makes the way down a plain
        // exponential, fastest at the start and without overshoot.
        const scale = drawn.dive?.scale ?? {
          x: 1,
          v: -(1 - this.lane) * DIVE_OMEGA,
          to: this.lane,
        };
        scale.to = this.lane;
        drawn.dive = { passing: [...passing, ...still], scale };
      } else if (drawn.dive) {
        drawn.dive.passing = [];
      }
    }
    this.draw();
    // A render with nothing new asks for no frame.
    const busy = this.shown.some((el) => {
      const drawn = this.drawn.get(el);
      return (
        drawn !== undefined &&
        (!arrived(drawn.len) || !arrived(drawn.off) || drawn.dive !== undefined)
      );
    });
    if (busy) this.run();
  }

  /**
   * A segment that was not there before: it grows out of nothing where it
   * will stand, behind the drawn end of the one before it. Written at its
   * target, it would lie over neighbours that are still on their way.
   *
   * It also has to move with them. Started at rest between neighbours in
   * motion, the one ahead would run into it and a hole would open behind -
   * so it takes the speed of the place it is born into: its start moves with
   * the end of the one before, and its end with the start of the one after.
   * Then its gaps follow the same spring as all others.
   */
  private born(
    targets: Array<{ el: SVGCircleElement; len: number; off: number; circ: number }>,
    i: number,
  ): Drawn {
    const t = targets[i];
    const prev = i > 0 ? this.drawn.get(targets[i - 1].el) : undefined;
    // The next segment that is already drawn - across twelve o'clock the one
    // after the last is the first, and one born later in this update is not
    // there yet.
    let next: Drawn | undefined;
    let wraps = false;
    for (let k = 1; k < targets.length && !next; k++) {
      next = this.drawn.get(targets[(i + k) % targets.length].el);
      wraps = i + k >= targets.length;
    }
    const prevEnd = prev ? prev.off.x + prev.len.x : 0;
    // Only the gap that is actually drawn there, at most a full one. Several
    // new segments side by side share it, and a ring of one - a full circle
    // without a gap - lends none; a gap each would put the last of them over
    // the segment after.
    const room = next ? (wraps ? t.circ : 0) + next.off.x - prevEnd : 0;
    const gap = prev ? Math.min(t.circ * GAP_FRACTION, Math.max(0, room)) : 0;
    const speed = prev ? prev.off.v + prev.len.v : 0;
    // Not clamped at zero - the motion has to stay linear to keep the gaps;
    // draw() never paints a negative length.
    const nextSpeed = next ? next.off.v : speed;
    // Born right behind an overtaker, it rides along with it: on the ring it
    // would run over the very segments the overtaker dives under.
    const dive = prev?.dive
      ? { passing: [...prev.dive.passing], scale: { ...prev.dive.scale } }
      : undefined;
    return {
      len: { x: 0, v: nextSpeed - speed, to: t.len },
      off: { x: prevEnd + gap, v: speed, to: t.off },
      circ: t.circ,
      dive,
    };
  }

  /** Puts every segment where it belongs and stops - on disconnect, and when
   *  the card goes out of sight (P-8). */
  stop(): void {
    for (const el of this.shown) {
      const drawn = this.drawn.get(el);
      if (drawn) settle(drawn);
    }
    this.halt();
  }

  private halt(): void {
    if (this.pending !== undefined) this.clock?.cancel(this.pending);
    this.pending = undefined;
    for (const el of this.shown) {
      const drawn = this.drawn.get(el);
      if (drawn) drawn.dive = undefined;
    }
    this.draw();
  }

  private run(): void {
    if (this.pending !== undefined || !this.clock) return;
    this.last = this.clock.now();
    this.pending = this.clock.frame(() => this.frame());
  }

  private frame(): void {
    this.pending = undefined;
    if (!this.clock) return;
    const now = this.clock.now();
    const dt = Math.min(MAX_STEP_S, Math.max(0, (now - this.last) / 1000));
    this.last = now;

    let moving = false;
    for (const el of this.shown) {
      const drawn = this.drawn.get(el);
      if (!drawn) continue;
      step(drawn.len, dt);
      step(drawn.off, dt);
      if (!arrived(drawn.len) || !arrived(drawn.off)) moving = true;
    }
    // All at once or not at all: one segment snapping ahead of its
    // neighbours would open the gap this is here to keep.
    if (!moving) {
      for (const el of this.shown) {
        const drawn = this.drawn.get(el);
        // The dive is left alone: it surfaces on its own spring.
        if (drawn) Object.assign(drawn, { len: axis(drawn.len.to), off: axis(drawn.off.to) });
      }
    }
    for (const el of this.shown) {
      const drawn = this.drawn.get(el);
      if (drawn?.dive) this.dip(el, drawn, drawn.dive, dt);
      if (drawn?.dive) moving = true;
    }
    this.draw();
    if (moving) this.pending = this.clock.frame(() => this.frame());
  }

  /** Under while it is not yet clear of those it passes, then back up. */
  private dip(el: SVGCircleElement, drawn: Drawn, dive: Dive, dt: number): void {
    const gap = drawn.circ * GAP_FRACTION;
    const end = drawn.off.x + drawn.len.x;
    // Clear of one when its own end, plus half a gap, lies before that one's
    // start: the gap between them is back.
    dive.passing = dive.passing.filter((o) => {
      const other = this.shown.includes(o) ? this.drawn.get(o) : undefined;
      return other !== undefined && o !== el && end + gap / 2 > other.off.x;
    });
    dive.scale.to = dive.passing.length > 0 ? this.lane : 1;
    step(dive.scale, dt, DIVE_OMEGA);
    if (dive.passing.length === 0 && arrived(dive.scale, 0.001, DIVE_OMEGA)) drawn.dive = undefined;
  }

  private draw(): void {
    for (const el of this.shown) {
      const drawn = this.drawn.get(el);
      if (!drawn) continue;
      const len = Math.max(0, Math.min(drawn.circ, drawn.len.x));
      const dash = `${len.toFixed(2)} ${(drawn.circ - len).toFixed(2)}`;
      const offset = (-drawn.off.x).toFixed(2);
      const scale = drawn.dive ? drawn.dive.scale.x.toFixed(3) : "";
      const written = `${dash}|${offset}|${scale}`;
      if (written === drawn.written) continue;
      drawn.written = written;
      el.setAttribute("stroke-dasharray", dash);
      el.setAttribute("stroke-dashoffset", offset);
      // An attribute rather than CSS: no transform-origin or transform-box,
      // which WebKit has handled unreliably on SVG (decision 003). The centre
      // is the same for this and the rotation of the group around it.
      if (scale)
        el.setAttribute("transform", `translate(50 50) scale(${scale}) translate(-50 -50)`);
      else el.removeAttribute("transform");
    }
  }
}

function axis(value: number): Axis {
  return { x: value, v: 0, to: value };
}

function settle(drawn: Drawn): void {
  drawn.len = axis(drawn.len.to);
  drawn.off = axis(drawn.off.to);
  drawn.dive = undefined;
}

function arrived(a: Axis, near = SETTLED, omega = OMEGA): boolean {
  return Math.abs(a.x - a.to) < near && Math.abs(a.v) < near * omega;
}

/**
 * One exact step of a critically damped spring towards its target. Exact
 * rather than integrated, so the size of a frame changes nothing - and
 * linear in position, speed and target, which is what keeps the gaps.
 */
function step(a: Axis, dt: number, omega = OMEGA): void {
  const e = a.x - a.to;
  const c = a.v + omega * e;
  const k = Math.exp(-omega * dt);
  a.x = a.to + (e + c * dt) * k;
  a.v = (a.v - omega * c * dt) * k;
}
