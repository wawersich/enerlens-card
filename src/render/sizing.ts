/**
 * How dots and lines follow the card's size (REQ K-12, changed 16.10.2026,
 * issues #10 and #12).
 *
 * The base sizes - dots 10 px or the design's own, connection lines 3 px, fan
 * lines 2 px - hold at full node size, where the plot is as wide as the
 * viewBox (scale 1, nodes 123 px). They used to hold at every size, and on a
 * small card - the list beside the cross, scale about 0.6 - the dots looked
 * like thick beads next to nodes of 77 px. Shrinking with the card fully
 * (factor s) made them too thin there; the square root keeps them in
 * between: about 77 % at scale 0.6. Chosen side by side on a demo page with
 * the real card. On top of that the configured percentages.
 */
export function growth(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  // The plot never gets wider than the viewBox; should it, the base size holds.
  return Math.sqrt(Math.min(scale, 1));
}

/** Factors on the base size of dots and lines, for a plot at this scale. */
export function sizeFactors(
  scale: number,
  flow: { dotSize: number; lineWidth: number },
): { dot: number; line: number } {
  const g = growth(scale);
  // Rounded: a width change of a fraction of a pixel must not repaint every
  // dot, and a thousandth of the size is far below what a screen can show.
  const round = (v: number) => Math.round(v * 1000) / 1000;
  return { dot: round((flow.dotSize / 100) * g), line: round((flow.lineWidth / 100) * g) };
}
