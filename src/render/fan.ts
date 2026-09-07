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
}

interface FanLine {
  path: SVGPathElement;
  dots: SVGCircleElement[];
  animations: Animation[];
  count: number;
}

export class FanLayer {
  private readonly lines = new Map<string, FanLine>();
  private paused = false;
  private dotRadius = 5;

  constructor(private readonly svg: SVGSVGElement) {}

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
      line.path.setAttribute("stroke", row.color);

      while (line.dots.length > row.count) {
        line.dots.pop()?.remove();
        line.animations.pop()?.cancel();
      }
      while (line.dots.length < row.count) {
        line.dots.push(this.createDot(row.color));
      }

      const countChanged = line.count !== row.count;
      for (const [i, dot] of line.dots.entries()) {
        dot.setAttribute("fill", row.color);
        dot.setAttribute("r", String(this.dotRadius));
        // The path changes with every relayout, so it is set on the element
        // rather than kept in a stylesheet.
        dot.style.offsetPath = `path("${d}")`;
        dot.style.offsetRotate = "0deg";

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
          animation.currentTime = (BASE_MS * i) / row.count;
          line.animations[i] = animation;
          if (this.paused) animation.pause();
        } else if (countChanged) {
          animation.currentTime = (BASE_MS * i) / row.count;
        }
        animation.updatePlaybackRate(BASE_MS / 1000 / row.durationS);
      }
      line.count = row.count;
    }

    for (const [key, line] of this.lines) {
      if (seen.has(key)) continue;
      for (const a of line.animations) a?.cancel();
      for (const dot of line.dots) dot.remove();
      line.path.remove();
      this.lines.delete(key);
    }
  }

  /** Horizontal bezier: leaves the node sideways, arrives at the row sideways. */
  private pathFor(origin: { x: number; y: number }, row: FanRow): string {
    const dx = Math.max(24, (row.x - origin.x) * 0.55);
    return `M${origin.x.toFixed(1)},${origin.y.toFixed(1)} C${(origin.x + dx).toFixed(1)},${origin.y.toFixed(1)} ${(row.x - dx).toFixed(1)},${row.y.toFixed(1)} ${row.x.toFixed(1)},${row.y.toFixed(1)}`;
  }

  private createLine(key: string): FanLine {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", "fan-line");
    path.setAttribute("fill", "none");
    this.svg.appendChild(path);
    const line: FanLine = { path, dots: [], animations: [], count: 0 };
    this.lines.set(key, line);
    return line;
  }

  private createDot(color: string): SVGCircleElement {
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("class", "fan-dot");
    dot.setAttribute("r", String(this.dotRadius));
    dot.setAttribute("fill", color);
    this.svg.appendChild(dot);
    return dot;
  }

  setDotRadius(px: number): void {
    this.dotRadius = px;
  }

  pause(): void {
    if (this.paused) return;
    this.paused = true;
    for (const line of this.lines.values()) for (const a of line.animations) a?.pause();
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const line of this.lines.values()) for (const a of line.animations) a?.play();
  }

  destroy(): void {
    for (const line of this.lines.values()) {
      for (const a of line.animations) a?.cancel();
      for (const dot of line.dots) dot.remove();
      line.path.remove();
    }
    this.lines.clear();
  }
}
