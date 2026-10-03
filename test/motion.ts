/**
 * happy-dom has no Web Animations. The card draws no dots where they cannot
 * move (P-7), so tests that look at the card's dots give it a stand-in that
 * accepts every call and moves nothing. Tests that need to read an
 * animation's phase install their own.
 */
export function fakeMotion(): void {
  const proto = Element.prototype as unknown as { animate?: unknown };
  if (typeof proto.animate === "function") return;
  proto.animate = function animate() {
    return {
      currentTime: 0,
      playbackRate: 1,
      pause() {},
      play() {},
      cancel() {},
      finish() {},
      addEventListener() {},
      removeEventListener() {},
    } as unknown as Animation;
  };
}
