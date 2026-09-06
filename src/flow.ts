/**
 * Distributes power onto the six connections and turns that into dot parameters.
 * Owner: agent 3. REQ 4.5, 4.6, P-1 - P-4.
 */
import type { Config, DotPlan, Flows, Model } from "./types";

/**
 * Priority order per REQ 4.5, each step `min(source left, sink left)`.
 * At most one direction per connection; no flow out of an empty source.
 */
export function computeFlows(_model: Model): Flows {
  throw new Error("TODO: agent 3");
}

/** Dot count and speed per connection (REQ 4.6). Connections below `flow.minW` are omitted. */
export function planDots(_flows: Flows, _config: Config): DotPlan[] {
  throw new Error("TODO: agent 3");
}
