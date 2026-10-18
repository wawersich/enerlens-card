// @vitest-environment happy-dom
/**
 * A pause - page hidden, connection lost, card taken out of the page, or a
 * device asleep without saying so - is not bridged with the last value: it
 * counts as unavailable until the history has been fetched again, which then
 * describes it in full (REQ V-7, issue #18).
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AveragingBuffer } from "../src/averaging";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

const MIN = 60_000;
const T0 = Date.parse("2026-10-18T20:00:00Z");

describe("gap marks in the averaging buffer (V-7)", () => {
  it("a marked gap carries no weight until the next reading", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    buffer.markGap(T0 + 1 * MIN);
    buffer.push("sensor.pv", T0 + 10 * MIN, 0);
    // 1000 W for one minute, then nothing known until 0 W for five.
    expect(buffer.mean("sensor.pv", 15 * MIN, T0 + 15 * MIN)).toBeCloseTo(1000 / 6);
  });

  it("the fetched history mends it: the value before the pause held on", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    buffer.markGap(T0 + 1 * MIN);
    buffer.push("sensor.pv", T0 + 10 * MIN, 0);
    buffer.push("sensor.pv", T0 + 5 * MIN, 500);
    buffer.healGaps(T0 + 15 * MIN, ["sensor.pv"]);
    // 1000 W for five minutes, 500 W for five, 0 W for five.
    expect(buffer.mean("sensor.pv", 15 * MIN, T0 + 15 * MIN)).toBeCloseTo(500);
  });

  it("mending leaves a sensor's own unavailable stretch alone", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    buffer.push("sensor.pv", T0 + 5 * MIN, null);
    buffer.markGap(T0 + 6 * MIN);
    buffer.push("sensor.pv", T0 + 10 * MIN, 1000);
    buffer.healGaps(T0 + 15 * MIN, ["sensor.pv"]);
    // Unavailable from 5 to 10 min - the sensor said so, the history agrees.
    expect(buffer.mean("sensor.pv", 15 * MIN, T0 + 15 * MIN)).toBeCloseTo(1000);
    expect(buffer.mean("sensor.pv", 5 * MIN, T0 + 10 * MIN)).toBeNull();
  });

  it("an entity the history has no answer for stays unknown across the pause", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    buffer.push("sensor.chatty", T0, 1000);
    buffer.markGap(T0 + 1 * MIN);
    buffer.push("sensor.pv", T0 + 10 * MIN, 0);
    buffer.push("sensor.chatty", T0 + 10 * MIN, 0);
    // The recorder excludes sensor.chatty: nothing came back for it.
    buffer.healGaps(T0 + 15 * MIN, ["sensor.pv"]);
    expect(buffer.mean("sensor.pv", 15 * MIN, T0 + 15 * MIN)).toBeCloseTo(1000 * (2 / 3));
    expect(buffer.mean("sensor.chatty", 15 * MIN, T0 + 15 * MIN)).toBeCloseTo(1000 / 6);
  });

  it("a history asked for before the pause was over mends nothing", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    // Paused from 1 min, back at 10 min - a fetch asked at 5 min ends there.
    buffer.markGap(T0 + 1 * MIN, T0 + 10 * MIN);
    buffer.push("sensor.pv", T0 + 10 * MIN, 0);
    buffer.healGaps(T0 + 5 * MIN, ["sensor.pv"]);
    expect(buffer.mean("sensor.pv", 15 * MIN, T0 + 15 * MIN)).toBeCloseTo(1000 / 6);
  });

  it("forgets a mark once it has left the window", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    buffer.markGap(T0 + 1 * MIN);
    buffer.prune(T0 + 30 * MIN);
    expect((buffer as unknown as { gaps: unknown[] }).gaps).toHaveLength(0);
  });

  it("a mark sits on every entity the buffer knows", () => {
    const buffer = new AveragingBuffer(15 * MIN);
    buffer.push("sensor.pv", T0, 1000);
    buffer.push("sensor.grid", T0, 200);
    buffer.markGap(T0 + 1 * MIN);
    expect(buffer.mean("sensor.pv", 14 * MIN, T0 + 15 * MIN)).toBeNull();
    expect(buffer.mean("sensor.grid", 14 * MIN, T0 + 15 * MIN)).toBeNull();
  });
});

describe("the card fetches the history again after a pause (V-7, issue #18)", () => {
  beforeAll(async () => {
    fakeMotion();
    (globalThis as unknown as Record<string, unknown>).ResizeObserver ??= class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
  };

  let clock = Date.now();
  let hidden = false;
  afterEach(() => {
    vi.restoreAllMocks();
    hidden = false;
    localStorage.removeItem("enerlens-view-mode");
  });

  const settle = async (el: Card) => {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
  };

  function setVisible(visible: boolean): void {
    hidden = !visible;
    document.dispatchEvent(new Event("visibilitychange"));
  }

  async function build(
    mode = "avg_long",
    answer: (start: number) => Record<string, unknown> = () => ({}),
  ) {
    clock = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => clock);
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() =>
      hidden ? "hidden" : "visible",
    );
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    const calls: string[] = [];
    const states: HomeAssistant["states"] = {};
    for (const [id, value] of Object.entries({ "sensor.solar": "1000", "sensor.grid": "200" })) {
      const at = new Date(clock).toISOString();
      states[id] = {
        entity_id: id,
        state: value,
        attributes: { unit_of_measurement: "W" },
        last_changed: at,
        last_updated: at,
      };
    }
    const hass = {
      states,
      locale: { language: "en", number_format: "language" },
      language: "en",
      connected: true,
      callWS: async (msg: { type: string; start_time?: string }) => {
        calls.push(msg.type);
        return answer(Date.parse(msg.start_time ?? "")) as never;
      },
    } as unknown as HomeAssistant;
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
      view: { default_mode: mode },
    });
    el.hass = hass;
    document.body.appendChild(el);
    await settle(el);
    const history = () => calls.filter((t) => t === "history/history_during_period").length;
    return { el, hass, history };
  }

  it("after the page was hidden longer than update_interval_s", async () => {
    const { el, history } = await build();
    expect(history()).toBe(1);
    setVisible(false);
    clock += 3 * MIN;
    setVisible(true);
    await settle(el);
    expect(history()).toBe(2);
    el.remove();
  });

  it("the refetched history fills the pause; what it does not know stays unknown", async () => {
    const answer = (start: number) => ({
      // The recorder answers for the solar sensor only.
      "sensor.solar": [
        { s: "1000", lu: start / 1000 },
        { s: "500", lu: (start + 14 * MIN) / 1000 },
      ],
    });
    const { el, history } = await build("avg_long", answer);
    const buffer = (el as unknown as { _buffer: AveragingBuffer })._buffer;
    setVisible(false);
    clock += 3 * MIN;
    setVisible(true);
    await settle(el);
    expect(history()).toBe(2);
    // Solar: 1000 W held across the pause until the 500 W the history knows.
    expect(buffer.mean("sensor.solar", 2 * MIN, clock)).not.toBeNull();
    // Grid: no answer, so the paused three minutes stay unknown.
    expect(buffer.mean("sensor.grid", 2 * MIN, clock)).toBeNull();
    el.remove();
  });

  it("a tick overdue from the pause does not count it twice", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      const { el, history } = await build();
      setVisible(false);
      clock += 3 * MIN;
      setVisible(true);
      await settle(el);
      expect(history()).toBe(2);
      // The frozen page fires its overdue interval right after waking.
      clock += 100;
      vi.advanceTimersByTime(5_000);
      await settle(el);
      expect(history()).toBe(2);
      el.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it("not after a pause shorter than update_interval_s", async () => {
    const { el, history } = await build();
    setVisible(false);
    clock += 2_000;
    setVisible(true);
    await settle(el);
    expect(history()).toBe(1);
    el.remove();
  });

  it("after Home Assistant lost and found its connection", async () => {
    const { el, hass, history } = await build();
    el.hass = { ...hass, connected: false } as HomeAssistant;
    await settle(el);
    clock += 3 * MIN;
    el.hass = { ...hass, connected: true } as HomeAssistant;
    await settle(el);
    expect(history()).toBe(2);
    el.remove();
  });

  it("after the card was out of the page", async () => {
    const { el, history } = await build();
    el.remove();
    clock += 3 * MIN;
    document.body.appendChild(el);
    await settle(el);
    expect(history()).toBe(2);
    el.remove();
  });

  it("in the current view only the gap is marked - no fetch nobody looks at", async () => {
    const { el, history } = await build("current");
    expect(history()).toBe(0);
    setVisible(false);
    clock += 3 * MIN;
    setVisible(true);
    await settle(el);
    expect(history()).toBe(0);
    const buffer = (el as unknown as { _buffer: AveragingBuffer })._buffer;
    // Nothing known for the paused three minutes.
    expect(buffer.mean("sensor.solar", 2 * MIN, clock)).toBeNull();
    el.remove();
  });

  it("when a tick comes far too late - a device asleep without a word", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      const { el, history } = await build();
      expect(history()).toBe(1);
      clock += 5_000;
      vi.advanceTimersByTime(5_000);
      await settle(el);
      expect(history()).toBe(1);
      clock += 3 * MIN;
      vi.advanceTimersByTime(5_000);
      await settle(el);
      expect(history()).toBe(2);
      el.remove();
    } finally {
      vi.useRealTimers();
    }
  });
});
