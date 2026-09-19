/**
 * The shape of a moving dot, as numbers.
 *
 * A dot is a circle with a lighter core towards its front, and optionally a
 * glow around it. That is all - there is no trail any more. The card and the
 * design tool both draw it, so the arithmetic lives here once and neither can
 * quietly drift away from the other.
 *
 * Nothing in here touches the DOM: it answers with plain numbers, and who turns
 * them into circles is the caller's business. The tool builds SVG in a page of
 * its own, the card builds it in a shadow root, and both get the same picture
 * out of the same values.
 */

/** One circle of a dot, drawn in the order the list gives. */
export interface DotRing {
  /** Radius, in whatever unit the caller passed the diameter in. */
  r: number;
  colour: string;
  opacity: number;
  /** How far ahead of the dot's centre this ring sits, in the same unit. */
  forward: number;
}

export interface DotInput {
  /** Diameter of the dot, in the caller's own unit. */
  dot: number;
  /** Lighter rings inside the dot; 0 for a plain circle. */
  caps: number;
  /** Diameter of the innermost ring as a share of the dot, 0..1. */
  core: number;
  /** How far the core is mixed towards white, 0..1. */
  coreLight: number;
  /** How far the core sits towards the front of the dot, 0..1. */
  bias: number;
  colour: string;
}

/** Mixes a colour towards white; amount 0..1. Anything but #rrggbb passes through. */
export function lighten(colour: string, amount: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(colour)) return colour;
  const value = Number.parseInt(colour.slice(1), 16);
  const parts = [16, 8, 0].map((shift) => {
    const channel = (value >> shift) & 255;
    return Math.round(channel + (255 - channel) * amount);
  });
  return `rgb(${parts.join(",")})`;
}

/**
 * The circles one dot is made of: the dot itself, then the rings of its core
 * from the outside in.
 *
 * Each ring is smaller, lighter and a little further forward than the one
 * before. Pushed forward they light only the front of the dot, which is what
 * actually burns on something moving fast - the back keeps its colour. Few
 * rings give visible steps, many a smooth core; the opacity per ring is chosen
 * so the centre comes out equally bright either way.
 */
export function dotRings(input: DotInput): DotRing[] {
  const r = input.dot / 2;
  const rings: DotRing[] = [{ r, colour: input.colour, opacity: 1, forward: 0 }];
  const caps = Math.floor(input.caps);
  if (caps <= 0 || input.core <= 0 || input.coreLight <= 0) return rings;

  const perCap = 1 - 0.15 ** (1 / caps);
  for (let k = 1; k <= caps; k++) {
    const t = k / caps;
    const size = 1 - t * (1 - input.core);
    rings.push({
      r: r * size,
      colour: lighten(input.colour, input.coreLight * t),
      opacity: perCap,
      forward: input.bias * r * (1 - size),
    });
  }
  return rings;
}

/** Glow builds, as stored in a design. */
export const GLOW_OFF = 0;
export const GLOW_BLUR = 1;
export const GLOW_DRAWN = 2;

/** Blur radii in CSS pixels at strength 60. */
export const BLUR_RADII = [3, 8] as const;
/** Radius of the drawn halo as a share of the dot's own radius. */
export const HALO_R = 3.4;
/** Stops of the drawn halo at strength 60; opacity scales from there. */
export const HALO_STOPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0.55],
  [0.3, 0.42],
  [0.62, 0.12],
  [1, 0],
];

/**
 * The blur filter for a lane, or "" when this ground does not ask for one.
 *
 * `unit` is how long one CSS pixel is in the caller's coordinates, so the glow
 * keeps its size on screen whatever the card has been scaled to.
 *
 * A glow is light that is added, and on white paper nothing can be brighter
 * than the ground - there it can only come out darker. That is a limit of the
 * medium, not of the setting, which is why the strength is kept per ground.
 */
export function glowFilter(
  glow: number,
  glowStrength: number,
  colour: string,
  unit: number,
): string {
  if (glow !== GLOW_BLUR || glowStrength <= 0) return "";
  const k = glowStrength / 60;
  return BLUR_RADII.map(
    (radius) => `drop-shadow(0 0 ${(radius * k * unit).toFixed(1)}px ${colour})`,
  ).join(" ");
}

/**
 * The stops of the drawn halo at this strength.
 *
 * Stacked circles would show as rings; a gradient has no edges. And because the
 * halo rides inside the dot's own group, it costs no animation of its own and
 * can never come apart from the dot it belongs to.
 */
export function haloStops(glowStrength: number): Array<[number, number]> {
  const k = glowStrength / 60;
  return HALO_STOPS.map(([offset, opacity]) => [offset, Math.min(opacity * k, 1)]);
}
