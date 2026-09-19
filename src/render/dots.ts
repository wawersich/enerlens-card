/**
 * The dots travelling along the connections.
 *
 * Lit does not own these elements: a template re-render would recreate them and
 * restart every animation, which is exactly what REQ P-6 forbids. The layer is
 * therefore managed imperatively - the card hands it a plan, it reconciles.
 *
 * One layer draws both the plain dot and every design (P-10). A design only
 * adds circles inside the dot and a glow around it; without one the layer draws
 * the single 10 px circle it always has. There is no second layer to switch to,
 * and therefore no way for the two to fall out of step.
 *
 * Everything that belongs to one dot sits in one group, moved by a single
 * animation along the path. The core cannot slide out of its circle and the
 * halo cannot lag behind - which is what killed the trail this replaced.
 */
import type { ColorKey, Config, DotPlan, FlowDesign, FlowDesignGround } from "../types";
import { GLOW_DRAWN, HALO_R, dotRings, glowFilter, haloStops } from "./dot-shape";
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
  el: SVGGElement;
  animation?: Animation;
}

interface Link {
  /** Holds the dots of one connection, and carries their glow filter. */
  group: SVGGElement;
  dots: Dot[];
  durationS: number;
  colorKey: ColorKey;
  colour: string;
  count: number;
}

/** Same 10 px as the colour mark in the list - one dot size everywhere (K-12). */
const DOT_PX = 10;

export class DotLayer {
  private readonly links = new Map<string, Link>();
  private paused = false;
  /** Card width divided by the viewBox width - user units per CSS pixel. */
  private scale = 1;
  private design?: FlowDesign;
  private dark = true;
  private defs?: SVGDefsElement;

  constructor(
    private readonly container: SVGGElement,
    private readonly technique: DotTechnique,
  ) {}

  /**
   * Sizes live in user units and would shrink with the card. Working them out
   * from the measured scale keeps a constant size on screen - the CSS geometry
   * property `r` with calc() is not reliable in WebKit.
   */
  setScale(scale: number): void {
    if (!Number.isFinite(scale) || scale <= 0 || scale === this.scale) return;
    this.scale = scale;
    this.repaint();
  }

  /**
   * Which design to draw, and which half of it. Compared by identity, not by
   * id: reloading the design file hands back a new object under the same id,
   * and comparing ids there would leave the old values on screen.
   */
  setDesign(design: FlowDesign | undefined, dark: boolean): void {
    if (design === this.design && dark === this.dark) return;
    this.design = design;
    this.dark = dark;
    this.repaint();
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
      const colour = config.colors[plan.colorKey];
      const recolour = link.colour !== colour;
      link.colour = colour;

      // The phase of the first dot anchors the group: it never moves, the
      // others are spaced from it. Without this the survivors of a count
      // change keep their old spacing and the gaps go ragged.
      const anchor = this.phaseOf(link.dots[0]);

      while (link.dots.length > plan.count) {
        const removed = link.dots.pop();
        removed?.animation?.cancel();
        removed?.el.remove();
      }
      while (link.dots.length < plan.count) {
        link.dots.push(this.createDot(link, plan, link.dots.length, plan.count, animate, anchor));
      }

      const rate = BASE_MS / 1000 / Math.max(plan.durationS, 0.01);
      for (const [i, dot] of link.dots.entries()) {
        if (recolour) this.paint(link, dot);
        if (this.canAnimate(dot, animate)) {
          if (!dot.animation) dot.animation = this.startAnimation(link, dot, i, plan.count, anchor);
          // The plain setter, never updatePlaybackRate: that one hands over a
          // *pending* rate which some later frame applies, recomputing that one
          // animation's start time as it does. Dots set that way slowly lose
          // their spacing. Setting rate and phase together, in one task, leaves
          // nothing that could add up.
          else dot.animation.playbackRate = rate;
          this.setPhase(dot.animation, i, plan.count, anchor);
        } else {
          // Reduced motion or no support: spread evenly and leave them (P-7).
          dot.animation?.cancel();
          dot.animation = undefined;
          dot.el.style.offsetDistance = `${(100 * i) / plan.count}%`;
        }
      }
      if (recolour) this.applyGlow(link);

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
      link.group.remove();
      this.links.delete(id);
    }
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
      link.group.remove();
    }
    this.links.clear();
    this.defs?.remove();
    this.defs = undefined;
  }

  // --- internals ----------------------------------------------------------

  /** The half of the design that applies, or nothing without a design. */
  private ground(): FlowDesignGround | undefined {
    if (!this.design) return undefined;
    return this.dark ? this.design.dark : this.design.light;
  }

  /** Redraws every dot without touching a single animation. */
  private repaint(): void {
    for (const link of this.links.values()) {
      for (const dot of link.dots) this.paint(link, dot);
      this.applyGlow(link);
    }
  }

  private createLink(plan: DotPlan): Link {
    const group = document.createElementNS(SVG_NS, "g");
    this.container.appendChild(group);
    const link: Link = {
      group,
      dots: [],
      durationS: plan.durationS,
      colorKey: plan.colorKey,
      colour: "",
      count: 0,
    };
    this.links.set(plan.connection, link);
    return link;
  }

  /**
   * May this dot move? Old engines and test DOMs have no Web Animations, and
   * there the dots stand still, evenly spread, rather than the card failing
   * (REQ P-7).
   */
  private canAnimate(dot: Dot, animate: boolean): boolean {
    return this.technique === "waapi" && animate && typeof dot.el.animate === "function";
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
    link: Link,
    plan: DotPlan,
    index: number,
    count: number,
    animate: boolean,
    anchor = 0,
  ): Dot {
    const el = document.createElementNS(SVG_NS, "g");
    el.setAttribute("class", "dot");
    // The path lives in user units, so the dot travels in the drawing's own
    // coordinates and needs no conversion when the card resizes. `auto` turns
    // the group with the lane, so a ring pushed forward is pushed along it -
    // and a circle does not mind being turned.
    el.style.offsetPath = `path("${PATHS[plan.connection]}")`;
    el.style.offsetRotate = "auto";
    el.style.offsetDistance = `${100 * ((anchor + index / count) % 1)}%`;
    link.group.appendChild(el);
    const dot: Dot = { el };
    this.paint(link, dot);
    if (this.canAnimate(dot, animate)) {
      dot.animation = this.startAnimation(link, dot, index, count, anchor);
    }
    return dot;
  }

  private startAnimation(
    link: Link,
    dot: Dot,
    index: number,
    count: number,
    anchor = 0,
  ): Animation {
    const animation = dot.el.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], {
      duration: BASE_MS,
      iterations: Number.POSITIVE_INFINITY,
      easing: "linear",
    });
    animation.playbackRate = BASE_MS / 1000 / Math.max(link.durationS, 0.01);
    // Stagger by phase instead of by delay: a delay is recomputed on every rate
    // change, a currentTime offset survives it.
    this.setPhase(animation, index, count, anchor);
    if (this.paused) animation.pause();
    return animation;
  }

  /** The circles one dot is made of. Without a design that is a single one. */
  private paint(link: Link, dot: Dot): void {
    while (dot.el.firstChild) dot.el.removeChild(dot.el.firstChild);
    const ground = this.ground();
    const colour = link.colour;
    const r = (ground?.dot ?? DOT_PX) / 2 / this.scale;

    if (ground && ground.glow === GLOW_DRAWN && ground.glowStrength > 0) {
      // The halo rides inside the dot's own group: no edges, no animation of
      // its own, and nothing that could come apart from the dot it surrounds.
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("r", (r * HALO_R).toFixed(2));
      halo.setAttribute("fill", `url(#${this.haloGradient(colour, ground)})`);
      dot.el.appendChild(halo);
    }

    for (const ring of dotRings({
      dot: 2 * r,
      caps: this.design?.shape.caps ?? 0,
      core: (ground?.core ?? 0) / 100,
      coreLight: (ground?.coreLight ?? 0) / 100,
      bias: (this.design?.shape.bias ?? 0) / 100,
      colour,
    })) {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", ring.forward.toFixed(2));
      circle.setAttribute("r", ring.r.toFixed(2));
      circle.setAttribute("fill", ring.colour);
      if (ring.opacity < 1) circle.setAttribute("fill-opacity", ring.opacity.toFixed(3));
      dot.el.appendChild(circle);
    }
  }

  /** The blur, one filter for the whole lane rather than one per dot. */
  private applyGlow(link: Link): void {
    const ground = this.ground();
    link.group.style.filter = ground
      ? glowFilter(ground.glow, ground.glowStrength, link.colour, 1 / this.scale)
      : "";
  }

  /** A radial gradient for the drawn halo, one per colour and strength. */
  private haloGradient(colour: string, ground: FlowDesignGround): string {
    const id = `el-halo-${colour.replace(/[^a-z0-9]/gi, "")}-${ground.glowStrength}`;
    if (!this.defs) {
      this.defs = document.createElementNS(SVG_NS, "defs");
      this.container.appendChild(this.defs);
    }
    if (!this.defs.querySelector(`#${CSS.escape(id)}`)) {
      const gradient = document.createElementNS(SVG_NS, "radialGradient");
      gradient.setAttribute("id", id);
      for (const [offset, opacity] of haloStops(ground.glowStrength)) {
        const stop = document.createElementNS(SVG_NS, "stop");
        stop.setAttribute("offset", String(offset));
        stop.setAttribute("stop-color", colour);
        stop.setAttribute("stop-opacity", String(opacity));
        gradient.appendChild(stop);
      }
      this.defs.appendChild(gradient);
    }
    return id;
  }
}
