/**
 * Minimal subset of the Home Assistant frontend types we rely on.
 * Kept local on purpose: `custom-card-helpers` lags behind current HA releases
 * and pulls in dependencies we do not need.
 */
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
  };
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale: { language: string };
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

/** Configuration accepted by <enerlens-card>. */
export interface EnerLensCardConfig extends LovelaceCardConfig {
  title?: string;
  /** Sensor delivering PV production in W. Always positive. */
  solar?: string;
  /** Sensor delivering grid power in W. Positive = import, negative = export. */
  grid?: string;
  /** Sensor delivering battery power in W. Positive = charging, negative = discharging. */
  battery?: string;
  /** Sensor delivering house consumption in W. Derived from the others when omitted. */
  house?: string;
  /** Battery state of charge in %, shown underneath the battery node. */
  battery_soc?: string;
  /** Hide flows carrying less than this many watts. */
  min_flow_w?: number;
}

/** One node of the flow diagram. */
export interface FlowNode {
  key: "solar" | "grid" | "battery" | "house";
  label: string;
  icon: string;
  power: number;
  x: number;
  y: number;
}
