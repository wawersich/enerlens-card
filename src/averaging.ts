/**
 * Time-weighted moving averages for the view modes.
 * Owner: agent 5. REQ 4.8, V-4 - V-10.
 */
import type { AveragingStatus, HomeAssistant, Sample } from "./types";

/**
 * Ring buffer per entity plus the window mean over it.
 *
 * Values are held step-wise: a sample is in effect from its timestamp until the
 * next one, the last one until `now`. Unavailable stretches carry no weight
 * (REQ V-7) - they are not interpolated over.
 */
export class AveragingBuffer {
  /** `windowMs` is the long window; older samples are dropped (REQ V-10). */
  constructor(_windowMs: number) {
    throw new Error("TODO: agent 5");
  }

  /** Records a value for one entity. `null` marks unavailable. */
  push(_entityId: string, _t: number, _v: number | null): void {
    throw new Error("TODO: agent 5");
  }

  /**
   * Time-weighted mean over (now - windowMs, now], or null when nothing in the
   * window was available (REQ 4.8).
   */
  mean(_entityId: string, _windowMs: number, _now: number): number | null {
    throw new Error("TODO: agent 5");
  }

  status(_now: number): AveragingStatus {
    throw new Error("TODO: agent 5");
  }

  /** Drops everything older than the window - called on every tick. */
  prune(_now: number): void {
    throw new Error("TODO: agent 5");
  }
}

/**
 * Fetches recent history for all entities in one call and returns it per entity.
 * Rejects after `timeoutMs` so a slow recorder cannot hold up the card (REQ V-6).
 */
export function fetchHistory(
  _hass: HomeAssistant,
  _entityIds: string[],
  _minutes: number,
  _timeoutMs?: number,
): Promise<Record<string, Sample[]>> {
  throw new Error("TODO: agent 5");
}
