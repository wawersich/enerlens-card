/**
 * The dots travelling along the connections.
 *
 * Lit does not own these elements: a template re-render would recreate them and
 * restart every animation, which is exactly what REQ P-6 forbids. The layer is
 * therefore managed imperatively - the card hands it a plan, it reconciles.
 *
 * Speed changes go through `updatePlaybackRate` only. Rewriting the duration
 * (SMIL `dur`, CSS `animation-duration`) makes the browser recompute the
 * animation "as if it always had that value", which jumps the dot.
 */
import type { ColorKey, Config, DotPlan } from "../types";
import { PATHS } from "./geometry";

const SVG_NS = "http://www.w3.org/2000/svg";
/** Reference duration; actual speed is a playback rate relative to this. */
const BASE_MS = 5000;

export type DotTechnique = "waapi" | "static";

/** Once per session: does this browser do motion paths and playback rates? */
export function detectTechnique(): DotTechnique {
  const supportsPath =
    typeof CSS !== "undefined" && CSS.supports?.("offset-path", 'path("M 0 0 L 1 1")');
  const supportsAnimate = typeof Element !== "undefined" && "animate" in Element.prototype;
  return supportsPath && supportsAnimate ? "waapi" : "static";
}

interface Dot {
  el: SVGCircleElement;
  animation?: Animation;
}

interface Link {
  dots: Dot[];
  durationS: number;
  colorKey: ColorKey;
  count: number;
}

/** Dot diameter in CSS pixels (REQ K-12). */
/** Same 10 px as the colour mark in the list - one dot size everywhere (K-12). */
const DOT_PX = 10;

export class DotLayer {
  private readonly links = new Map<string, Link>();
  private paused = false;
  /** Card width divided by the viewBox width - user units per CSS pixel. */
  private scale = 1;

  constructor(
    private readonly container: SVGGElement,
    private readonly technique: DotTechnique,
  ) {}

  /**
   * The radius lives in user units and would shrink with the card. Setting it
   * as an attribute from the measured scale keeps a constant size on screen -
   * the CSS geometry property `r` with calc() is not reliable in WebKit.
   */
  setScale(scale: number): void {
    if (!Number.isFinite(scale) || scale <= 0 || scale === this.scale) return;
    this.scale = scale;
    for (const link of this.links.values()) {
      for (const dot of link.dots) dot.el.setAttribute("r", this.radius());
    }
  }

  private radius(): string {
    return (DOT_PX / 2 / this.scale).toFixed(2);
  }

  /**
   * Reconciles the running dots with a new plan. Existing dots keep their
   * animation and only change rate and colour; the count changes by adding or
   * removing at the end, so the surviving dots never lose their phase.
   */
  update(plans: DotPlan[], config: Config, animate: boolean): void {
    const seen = new Set<string>();

    for (const plan of plans) {
      seen.add(plan.connection);
      const link = this.links.get(plan.connection) ?? this.createLink(plan);
      const color = config.colors[plan.colorKey];

      const countChanged = link.count !== plan.count;
      // The phase of the first dot anchors the group: it never moves, the others
      // are spaced from it. Without this the survivors of a count change keep
      // their old spacing and the gaps go ragged.
      const anchor = this.phaseOf(link.dots[0]);

      while (link.dots.length > plan.count) {
        const removed = link.dots.pop();
        removed?.animation?.cancel();
        removed?.el.remove();
      }
      while (link.dots.length < plan.count) {
        link.dots.push(this.createDot(plan, link.dots.length, plan.count, animate, anchor));
      }

      for (const [i, dot] of link.dots.entries()) {
        dot.el.setAttribute("fill", color);
        if (this.technique === "waapi" && animate) {
          if (!dot.animation) dot.animation = this.startAnimation(dot, i, plan.count, anchor);
          // Speed changes go through the rate only - rewriting the duration would
          // move the dot (REQ P-6). Spacing is only redone when the count changed.
          else if (countChanged) this.setPhase(dot.animation, i, plan.count, anchor);
          dot.animation.updatePlaybackRate(BASE_MS / 1000 / plan.durationS);
        } else {
          // Reduced motion or no support: spread evenly and leave them (REQ P-7).
          dot.animation?.cancel();
          dot.animation = undefined;
          dot.el.style.offsetDistance = `${(100 * i) / plan.count}%`;
        }
      }

      link.durationS = plan.durationS;
      link.colorKey = plan.colorKey;
      link.count = plan.count;
    }

    for (const [id, link] of this.links) {
      if (seen.has(id)) continue;
      for (const dot of link.dots) {
        dot.animation?.cancel();
        dot.el.remove();
      }
      this.links.delete(id);
    }
  }

  private createLink(plan: DotPlan): Link {
    const link: Link = { dots: [], durationS: plan.durationS, colorKey: plan.colorKey, count: 0 };
    this.links.set(plan.connection, link);
    return link;
  }

  /** Current position of a dot as a fraction of one lap, 0..1. */
  private phaseOf(dot: Dot | undefined): number {
    const time = dot?.animation?.currentTime;
    if (typeof time !== "number") return 0;
    return (((time % BASE_MS) + BASE_MS) % BASE_MS) / BASE_MS;
  }

  private setPhase(animation: Animation, index: number, count: number, anchor: number): void {
    animation.currentTime = ((anchor + index / count) % 1) * BASE_MS;
  }

  private createDot(
    plan: DotPlan,
    index: number,
    count: number,
    animate: boolean,
    anchor = 0,
  ): Dot {
    const el = document.createElementNS(SVG_NS, "circle");
    el.setAttribute("class", "dot");
    el.setAttribute("r", this.radius());
    // The path lives in user units, so the dot travels in the drawing's own
    // coordinates and needs no conversion when the card resizes.
    el.style.offsetPath = `path("${PATHS[plan.connection]}")`;
    el.style.offsetRotate = "0deg";
    el.style.offsetDistance = `${100 * ((anchor + index / count) % 1)}%`;
    this.container.appendChild(el);
    const dot: Dot = { el };
    if (this.technique === "waapi" && animate) {
      dot.animation = this.startAnimation(dot, index, count, anchor);
    }
    return dot;
  }

  private startAnimation(dot: Dot, index: number, count: number, anchor = 0): Animation {
    const animation = dot.el.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], {
      duration: BASE_MS,
      iterations: Number.POSITIVE_INFINITY,
      easing: "linear",
    });
    // Stagger by phase instead of by delay: a delay is recomputed on every rate
    // change, a currentTime offset survives it.
    this.setPhase(animation, index, count, anchor);
    if (this.paused) animation.pause();
    return animation;
  }

  /** Stops the clock while the card is off-screen or hidden (REQ P-8). */
  pause(): void {
    if (this.paused) return;
    this.paused = true;
    for (const link of this.links.values()) {
      for (const dot of link.dots) dot.animation?.pause();
    }
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const link of this.links.values()) {
      for (const dot of link.dots) dot.animation?.play();
    }
  }

  destroy(): void {
    for (const link of this.links.values()) {
      for (const dot of link.dots) {
        dot.animation?.cancel();
        dot.el.remove();
      }
    }
    this.links.clear();
  }
}
