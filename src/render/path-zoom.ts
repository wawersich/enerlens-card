/**
 * Works around a WebKit bug that puts the dots beside their lines when the page
 * is zoomed (issue #7: https://github.com/wawersich/enerlens-card/issues/7).
 *
 * The dots run along `offset-path: path(...)`, given in the SVG's own user
 * units. Chrome and Firefox keep it there at any zoom - the SVG grows with the
 * page, and the path with it. WebKit (Safari on the Mac with Cmd +/-, GNOME
 * Web with Ctrl +/-) multiplies the path by the zoom a second time: at 150 %
 * every dot sits at 1.5 times its place, measured from the SVG's top left
 * corner, so it drifts down and to the right of its line; below 100 % up and
 * to the left. At 100 % all browsers agree. Safari's "Aa" zoom on iPhone and
 * iPad works differently and does not trigger it. WebKit fixed the same
 * mistake for `clip-path: path()` in 2020
 * (https://bugs.webkit.org/show_bug.cgi?id=217311), not for `offset-path`.
 *
 * Guessing the zoom would be fragile, so the card asks the browser instead: a
 * hidden probe rides a path to a known point, and where it ends up says how
 * much the browser stretches paths. The paths handed to the
 * dots are divided by that factor, and the browser's own mistake carries them
 * back onto the lines. Where nothing is stretched - Chrome, and a WebKit that
 * has fixed the bug - the factor is 1 and the paths stay as they are. Only
 * WebKit measures at all (`mayStretchPaths`), so the other engines never run
 * this code. It can only go once no supported WebKit stretches paths any more.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
/** The probe's target, in user units. Float boxes resolve it finely enough. */
const PROBE_AT = 400;
/** How far the middle mark may stray, as a share of the distance it halves. */
const MIDDLE_TOLERANCE = 0.002;

/**
 * Whether this browser is WebKit, the only engine with the bug - Safari on Mac,
 * iPhone and iPad, GNOME Web, the Home Assistant app on Apple devices, and the
 * browsers on iOS that build on WebKit (where another engine is allowed, it
 * reports its own vendor and is rightly left out). Elsewhere the card does not measure, so a measurement
 * that goes wrong cannot touch dots that were right (Markus, 16.10.2026).
 *
 * `navigator.vendor` is frozen by the HTML standard to one of three strings:
 * "Apple Computer, Inc." in WebKit, hard-coded there for every port; "Google
 * Inc." in Chromium; "" in Firefox. It only decides whether to measure - the
 * measurement still decides the factor. A browser that reports the wrong
 * vendor is harmless either way: a WebKit taken for another engine stays as
 * before the fix, another engine taken for WebKit measures 1.
 */
export function mayStretchPaths(): boolean {
  return typeof navigator !== "undefined" && /^Apple/.test(navigator.vendor ?? "");
}

/**
 * How much this browser stretches an `offset-path` inside `svg`: 1 where it
 * does not, the effective zoom in an affected WebKit (page zoom times any CSS
 * `zoom` above the card). Undefined while there is nothing to measure - the SVG
 * not laid out yet, no motion paths at all - or nothing to trust: a 3D
 * transform above the card.
 *
 * Hidden marks, all measured the same way, as boxes on screen: one at the
 * origin, one drawn at (PROBE_AT, PROBE_AT), and the probe sent there along a
 * path. Without the bug the probe covers the drawn mark; with it, it lands k
 * times as far from the origin. Measuring all of them the same way matters: a
 * scaled, rotated or skewed element above the card - card-mod, a dialog
 * growing as it opens - moves them alike and cancels out. Mapping one box back
 * through getScreenCTM() did not: WebKit leaves the scale of such an element
 * out of that matrix, and read it as a zoom (review of the first fix,
 * 16.10.2026).
 *
 * A perspective above the card does not cancel out: it keeps the marks on one
 * line, but no longer evenly spaced along it, and k comes out wrong. A fourth
 * mark halfway between origin and target catches that - in a flat transform it
 * stays exactly in the middle, under a perspective it moves off (measured in
 * WebKit: 0.000 % flat, 0.8 % for a 5 degree tilt, 7.9 % for 25 degrees).
 */
export function measurePathZoom(svg: SVGSVGElement): number | undefined {
  const mark = (x = 0, y = 0) => {
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(x));
    circle.setAttribute("cy", String(y));
    circle.setAttribute("r", "1");
    return circle;
  };
  const probe = document.createElementNS(SVG_NS, "g");
  probe.style.offsetPath = `path("M${PROBE_AT},${PROBE_AT} L${PROBE_AT},${PROBE_AT + 1}")`;
  probe.style.offsetRotate = "0deg";
  probe.style.offsetDistance = "0%";
  probe.appendChild(mark());
  const target = mark(PROBE_AT, PROBE_AT);
  const origin = mark();
  const middle = mark(PROBE_AT / 2, PROBE_AT / 2);
  const marks = document.createElementNS(SVG_NS, "g");
  marks.style.visibility = "hidden";
  marks.style.pointerEvents = "none";
  marks.append(probe, target, origin, middle);
  svg.appendChild(marks);
  try {
    const centre = (el: Element) => {
      const box = el.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2, w: box.width };
    };
    const o = centre(origin);
    const t = centre(target);
    const p = centre(probe);
    if (!(t.w > 0)) return undefined;
    // Where the probe went, as a multiple of where it should have gone.
    const tx = t.x - o.x;
    const ty = t.y - o.y;
    const px = p.x - o.x;
    const py = p.y - o.y;
    const length2 = tx * tx + ty * ty;
    if (!(length2 > 0)) return undefined;
    // Not flat: the middle mark has left the middle (see above).
    const m = centre(middle);
    const offMiddle = Math.hypot(m.x - (o.x + t.x) / 2, m.y - (o.y + t.y) / 2);
    if (offMiddle > MIDDLE_TOLERANCE * Math.sqrt(length2)) return undefined;
    const k = (px * tx + py * ty) / length2;
    // A browser without motion paths leaves the probe at the origin; a probe
    // off the line through the target is not this bug either.
    if (!(k > 0.1 && k < 10) || Math.abs(px * ty - py * tx) / length2 > 0.01 * k) return undefined;
    // Sub-pixel noise is not a zoom.
    return Math.abs(k - 1) < 0.002 ? 1 : k;
  } finally {
    marks.remove();
  }
}

/**
 * The path to hand an affected WebKit so that its stretch lands the dots on
 * the drawn line. Divides every number, which is right for the absolute
 * M, L and C commands the card draws with - not for arcs or relative ones.
 */
export function unzoomPath(d: string, zoom: number): string {
  if (zoom === 1) return d;
  return d.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi, (n) =>
    String(Number((Number(n) / zoom).toFixed(2))),
  );
}
