/**
 * happy-dom lays nothing out, so every box is empty. This stands in for the
 * boxes an SVG mark gets on screen, in a browser that stretches motion paths
 * by `stretch` (WebKit's zoom bug, issue #7) - 1 is a browser without it.
 * `above` is a transform of an element above the card: it moves every mark
 * alike, as a scaled card-mod or an opening dialog does. `tilt` adds a
 * perspective on top - straight lines stay straight, even spacing does not.
 */
export interface Stretch {
  stretch: number;
  above: [a: number, b: number, c: number, d: number, e: number, f: number];
  tilt: number;
}

export function emulateStretch(initial: Partial<Stretch> = {}): Stretch & { restore(): void } {
  const proto = Element.prototype;
  const original = proto.getBoundingClientRect;
  const state = {
    stretch: 1,
    above: [1, 0, 0, 1, 0, 0] as Stretch["above"],
    tilt: 0,
    ...initial,
    restore: () => {
      proto.getBoundingClientRect = original;
    },
  };
  const box = (x: number, y: number) => {
    const [a, b, c, d, e, f] = state.above;
    const w = 1 + state.tilt * y;
    const sx = (a * x + c * y + e) / w;
    const sy = (b * x + d * y + f) / w;
    return { left: sx - 1, top: sy - 1, width: 2, height: 2, right: sx + 1, bottom: sy + 1 };
  };
  const ridden = (el: Element) => {
    const path = (el as SVGElement).style?.offsetPath;
    if (!path) return undefined;
    const [x, y] = (path.match(/-?[\d.]+/g) ?? []).map(Number);
    return [x * state.stretch, y * state.stretch] as const;
  };
  proto.getBoundingClientRect = function (this: Element) {
    if (this.namespaceURI !== "http://www.w3.org/2000/svg" || this.localName === "svg") {
      return original.call(this);
    }
    const at = ridden(this) ??
      (this.parentElement ? ridden(this.parentElement) : undefined) ?? [
        Number(this.getAttribute("cx") ?? 0),
        Number(this.getAttribute("cy") ?? 0),
      ];
    return box(at[0], at[1]) as DOMRect;
  };
  return state;
}

/**
 * Pretends to be a browser of the given engine: "Apple Computer, Inc." is
 * WebKit, "Google Inc." Chromium, "" Firefox. Returns the way back.
 */
export function emulateVendor(vendor: string): () => void {
  const own = Object.getOwnPropertyDescriptor(navigator, "vendor");
  Object.defineProperty(navigator, "vendor", { value: vendor, configurable: true });
  return () => {
    if (own) Object.defineProperty(navigator, "vendor", own);
    else Reflect.deleteProperty(navigator, "vendor");
  };
}
