/**
 * <enerlens-card> - energy flow card for Home Assistant.
 *
 * M0 scaffold: registers the element and renders an empty card. The pieces
 * behind it (model, breakdown, flows, rendering) arrive with the later steps.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { CARD_NAME, CARD_VERSION, EDITOR_NAME, REPO_URL } from "./const";
import type { HomeAssistant, RawConfig } from "./types";

class EnerLensCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: RawConfig;

  setConfig(config: RawConfig): void {
    if (!config) throw new Error("Missing configuration");
    this._config = config;
  }

  /** Height in Masonry views, in 50 px units. */
  getCardSize(): number {
    return 7;
  }

  /** Sizing in Sections views. The card needs the full section width (REQ K-12, I-3). */
  getGridOptions(): Record<string, unknown> {
    return { columns: 12, min_columns: 12, rows: "auto" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement(EDITOR_NAME);
  }

  static getStubConfig(): Record<string, unknown> {
    return { entities: {} };
  }

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`<ha-card .header=${this._config.title ?? "EnerLens"}></ha-card>`;
  }
}

if (!customElements.get(CARD_NAME)) {
  customElements.define(CARD_NAME, EnerLensCard);
}

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}
const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards || [];
if (!w.customCards.some((c) => c.type === CARD_NAME)) {
  w.customCards.push({
    type: CARD_NAME,
    name: "EnerLens Card",
    description: "Energy flow with a consumer breakdown - PV, battery, heat pump and grid.",
    preview: true,
    documentationURL: REPO_URL,
  });
}

console.info(
  `%c ENERLENS-CARD %c ${CARD_VERSION} `,
  "color:#fff;background:#03a9f4;font-weight:700",
  "color:#03a9f4;background:#fff;font-weight:700",
);
