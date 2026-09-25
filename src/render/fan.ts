import type { FlowDesign, FlowDesignGround } from "../types";
/**
 * The fan: one line from the house node to each list row, with dots running
 * along it.
 *
 * Only drawn when the list sits beside the cross. The list is HTML in normal
 * flow while the cross is SVG, so there is no shared coordinate system - the
 * layer measures both and draws in CSS pixels on its own overlay.
 *
 * Like the connection dots, the elements are managed imperatively: a Lit
 * re-render would recreate them and restart every animation (REQ P-6).
 */
import { GLOW_DRAWN, HALO_R, dotRings, glowFilter, haloStops } from "./dot-shape";
import { resolveColour } from "./ground";

const SVG_NS = "http://www.w3.org/2000/svg";
const BASE_MS = 5000;

interface FanRow {
  key: string;
  /** Row centre, relative to the overlay. */
  y: number;
  x: number;
  color: string;
  count: number;
  durationS: number;
  /** Set when nothing flows: "show" draws the line neutral, "dim" fainter. */
  inactive?: "show" | "dim";
}

interface FanLine {
  path: SVGPathElement;
  /** Holds this row's dots, and carries their glow filter. */
  group: SVGGElement;
  dots: SVGGElement[];
  animations: Animation[];
  count: number;
  /** What the dots were painted for - repainted only when one of these moves. */
  paintKey?: string;
  /** The dot colour as the browser reads it; undefined until it answered. */
  mixFrom?: string;
}

export class FanLayer {
  private readonly lines = new Map<string, FanLine>();
  private paused = false;
  private dotRadius = 5;
  private design?: FlowDesign;
  private dark = true;
  /** One colour for every dot, or undefined to follow each row (P-13). */
  private dotColor?: string;
  private defs?: SVGDefsElement;

  constructor(private readonly svg: SVGSVGElement) {}

  /** The design the rows follow, or undefined for the plain dots (P-10). */
  setDesign(design: FlowDesign | undefined, dark: boolean): void {
    if (design === this.design && dark === this.dark) return;
    this.design = design;
    this.dark = dark;
    // The dots are repainted on the next update, which happens on every tick
    // anyway; clearing the key is what makes that update notice.
    for (const line of this.lines.values()) line.paintKey = undefined;
  }

  /** One colour for every dot on the card, or undefined to follow the row. */
  setDotColor(colour: string | undefined): void {
    if (colour === this.dotColor) return;
    this.dotColor = colour;
    for (const line of this.lines.values()) line.paintKey = undefined;
  }

  private ground(): FlowDesignGround | undefined {
    return this.dark ? this.design?.dark : this.design?.light;
  }

  /**
   * Redraws the fan for the given rows. `origin` is where the lines start -
   * the right edge of the house node, relative to the overlay.
   */
  update(
    rows: FanRow[],
    origin: { x: number; y: number },
    size: { width: number; height: number },
    animate: boolean,
  ): void {
    this.svg.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
    this.svg.setAttribute("width", String(size.width));
    this.svg.setAttribute("height", String(size.height));

    const seen = new Set<string>();
    for (const row of rows) {
      seen.add(row.key);
      const d = this.pathFor(origin, row);
      const line = this.lines.get(row.key) ?? this.createLine(row.key);
      line.path.setAttribute("d", d);
      // Colour through CSS classes rather than the attribute, so the neutral
      // shade can be a theme variable (attributes do not resolve var()).
      line.path.setAttribute("class", `fan-line${row.inactive ? ` inactive-${row.inactive}` : ""}`);
      line.path.style.stroke = row.inactive ? "" : row.color;

      // A design asks for a quieter line to stand out against; without one
      // the line keeps the opacity the stylesheet gives it (P-5, P-10).
      const ground = row.inactive ? undefined : this.ground();
      line.path.style.opacity = ground ? String(ground.line / 100) : "";

      while (line.dots.length > row.count) {
        line.dots.pop()?.remove();
        line.animations.pop()?.cancel();
      }
      while (line.dots.length < row.count) {
        line.dots.push(this.createDot(line, row.key));
      }

      // Repainting means rebuilding a handful of circles, so it is done when
      // something they depend on moved - not on every tick.
      // The line keeps the flow's colour; only the dots on it may differ.
      const dotColour = this.dotColor ?? row.color;
      const paintKey = [dotColour, this.dotRadius, ground ? this.design?.id : "", this.dark].join(
        "|",
      );
      const moved = line.paintKey !== paintKey;
      line.paintKey = paintKey;
      if (moved) line.mixFrom = undefined;
      // Read once per line, not per dot: the answer is the same for all of
      // them and asking costs a layout. Asked again on the next update while
      // the browser has none yet, as on the cross (issue #3).
      const resolved = line.mixFrom === undefined ? resolveColour(this.svg, dotColour) : undefined;
      if (resolved) line.mixFrom = resolved;
      const repaint = moved || resolved !== undefined;
      const mixFrom = line.mixFrom ?? dotColour;
      if (repaint) this.applyGlow(line, dotColour, ground);

      const countChanged = line.count !== row.count;
      const rate = BASE_MS / 1000 / Math.max(row.durationS, 0.01);
      for (const [i, dot] of line.dots.entries()) {
        if (repaint) this.paintDot(dot, dotColour, ground, mixFrom);
        // The path changes with every relayout, so it is set on the element
        // rather than kept in a stylesheet. `auto` turns the dot with the row,
        // so a ring pushed forward is pushed along it.
        dot.style.offsetPath = `path("${d}")`;
        dot.style.offsetRotate = "auto";

        // Same guard as the list: no Web Animations means static dots, not a
        // crash (REQ N-5, and the fallback chain of decision 003).
        if (!animate || typeof dot.animate !== "function") {
          line.animations[i]?.cancel();
          line.animations[i] = undefined as unknown as Animation;
          dot.style.offsetDistance = `${(100 * i) / row.count}%`;
          continue;
        }

        let animation = line.animations[i];
        if (!animation) {
          animation = dot.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], {
            duration: BASE_MS,
            iterations: Number.POSITIVE_INFINITY,
            easing: "linear",
          });
          line.animations[i] = animation;
          if (this.paused) animation.pause();
        }
        // The plain setter, never updatePlaybackRate: that hands over a rate
        // some later frame applies, and recomputes that one animation's start
        // time when it does. Rate and spacing are set together, in one task,
        // so the dots cannot slowly drift out of their even spread.
        animation.playbackRate = rate;
        if (countChanged || !line.animations[i]) {
          animation.currentTime = (BASE_MS * i) / row.count;
        }
      }
      line.count = row.count;
    }

    for (const [key, line] of this.lines) {
      if (seen.has(key)) continue;
      for (const a of line.animations) a?.cancel();
      for (const dot of line.dots) dot.remove();
      line.group.remove();
      line.path.remove();
      this.lines.delete(key);
    }
  }

  /**
   * Leaves the node sideways, bends to the row's height over the first part of
   * the way, then runs straight into the row. The bend takes 60 % of the
   * distance (40 to 160 px), the straight run the rest - the lines fan out
   * right after the house, and the dots settle on the straight stretch (L-13).
   */
  private pathFor(origin: { x: number; y: number }, row: FanRow): string {
    const span = row.x - origin.x;
    const knee = Math.min(160, Math.max(40, span * 0.6));
    const kx = origin.x + Math.min(knee, span);
    const c = knee / 2;
    const f = (v: number) => v.toFixed(1);
    return `M${f(origin.x)},${f(origin.y)} C${f(origin.x + c)},${f(origin.y)} ${f(kx - c)},${f(row.y)} ${f(kx)},${f(row.y)} L${f(row.x)},${f(row.y)}`;
  }

  private createLine(key: string): FanLine {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", "fan-line");
    path.setAttribute("fill", "none");
    // The row this line belongs to. Nothing in the card reads it back, but it
    // makes the overlay legible in the inspector and lets the hero exporter
    // pair a dot with its line without comparing path strings - which differ
    // between the attribute and the computed style ("190.0" against "190").
    path.dataset.key = key;
    this.svg.appendChild(path);
    const group = document.createElementNS(SVG_NS, "g");
    this.svg.appendChild(group);
    const line: FanLine = { path, group, dots: [], animations: [], count: 0 };
    this.lines.set(key, line);
    return line;
  }

  /** A radial gradient for the drawn halo, one per colour and strength. */
  private haloGradient(colour: string, ground: FlowDesignGround): string {
    const id = `fan-${colour.replace(/[^a-z0-9]/gi, "")}-${ground.glowStrength}`;
    if (!this.defs) {
      this.defs = document.createElementNS(SVG_NS, "defs");
      this.svg.appendChild(this.defs);
    }
    if (!this.defs.querySelector(`#${id}`)) {
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

  /** The blur, one filter for the whole row rather than one per dot. */
  private applyGlow(line: FanLine, colour: string, ground: FlowDesignGround | undefined): void {
    line.group.style.filter = ground ? glowFilter(ground.glow, ground.glowStrength, colour, 1) : "";
  }

  /**
   * The circles one dot is made of. Without a design that is a single one -
   * the same plain dot the rows have always carried.
   */
  private paintDot(
    dot: SVGGElement,
    colour: string,
    ground: FlowDesignGround | undefined,
    mixFrom: string,
  ): void {
    while (dot.firstChild) dot.removeChild(dot.firstChild);
    // The size comes from the design, as it does on the cross - not from the
    // layer's own default, or the rows would carry different dots.
    const r = ground ? ground.dot / 2 : this.dotRadius;

    if (ground && ground.glow === GLOW_DRAWN && ground.glowStrength > 0) {
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("r", (r * HALO_R).toFixed(2));
      halo.setAttribute("fill", `url(#${this.haloGradient(colour, ground)})`);
      dot.appendChild(halo);
    }

    for (const ring of dotRings({
      dot: 2 * r,
      caps: ground ? (this.design?.shape.caps ?? 0) : 0,
      core: (ground?.core ?? 0) / 100,
      coreLight: (ground?.coreLight ?? 0) / 100,
      bias: (this.design?.shape.bias ?? 0) / 100,
      colour,
      mixFrom,
    })) {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", ring.forward.toFixed(2));
      circle.setAttribute("r", ring.r.toFixed(2));
      circle.setAttribute("fill", ring.colour);
      if (ring.opacity < 1) circle.setAttribute("fill-opacity", ring.opacity.toFixed(3));
      dot.appendChild(circle);
    }
  }

  private createDot(line: FanLine, key: string): SVGGElement {
    const dot = document.createElementNS(SVG_NS, "g");
    dot.setAttribute("class", "fan-dot");
    // The row this dot belongs to. Nothing in the card reads it back, but it
    // lets the hero exporter pair a dot with its line.
    dot.dataset.key = key;
    line.group.appendChild(dot);
    return dot;
  }

  setDotRadius(px: number): void {
    this.dotRadius = px;
  }

  pause(): void {
    if (this.paused) return;
    this.paused = true;
    for (const line of this.lines.values()) {
      for (const a of line.animations) a?.pause();
    }
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const line of this.lines.values()) {
      for (const a of line.animations) a?.play();
    }
  }

  destroy(): void {
    for (const line of this.lines.values()) {
      for (const a of line.animations) a?.cancel();
      for (const dot of line.dots) dot.remove();
      line.group.remove();
      line.path.remove();
    }
    this.lines.clear();
    this.defs?.remove();
    this.defs = undefined;
  }
}
