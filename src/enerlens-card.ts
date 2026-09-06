/**
 * <enerlens-card> - energy flow card for Home Assistant.
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { collectEntityIds, normalizeConfig } from "./config";
import { CARD_NAME, CARD_VERSION, EDITOR_NAME, REPO_URL } from "./const";
import { computeFlows } from "./flow";
import { buildModel } from "./model";
import { renderCross } from "./render/cross";
import { VIEW_W } from "./render/geometry";
import { styles } from "./styles";
import { type Config, ConfigError, type HomeAssistant, type Model, type RawConfig } from "./types";

class EnerLensCard extends LitElement {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _model: { state: true },
  };

  private _hass?: HomeAssistant;
  private _config?: Config;
  private _rawConfig?: RawConfig;
  private _entityIds: string[] = [];
  private _model?: Model;
  private _resizeObserver?: ResizeObserver;

  set hass(hass: HomeAssistant) {
    const previous = this._hass;
    this._hass = hass;
    if (!this._config) return;
    // Only rebuild when one of our entities actually changed (REQ T-3).
    if (previous && !this._entitiesChanged(previous, hass)) return;
    this._model = buildModel(hass, this._config);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private _entitiesChanged(a: HomeAssistant, b: HomeAssistant): boolean {
    for (const id of this._entityIds) {
      if (a.states[id] !== b.states[id]) return true;
    }
    return false;
  }

  setConfig(config: RawConfig): void {
    // Structural problems throw so HA shows its error card; runtime problems
    // never do - they are rendered inside the card (REQ E-1).
    this._config = normalizeConfig(config, this._hass);
    this._rawConfig = config;
    this._entityIds = collectEntityIds(this._config);
    if (this._hass) this._model = buildModel(this._hass, this._config);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Text keeps a minimum size in CSS pixels while the drawing scales, so the
    // card stays legible on a phone (REQ K-12).
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) this.style.setProperty("--el-scale", String(width / VIEW_W));
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  getCardSize(): number {
    return 7;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 12, min_columns: 12, rows: "auto" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement(EDITOR_NAME);
  }

  static getStubConfig(
    _hass: HomeAssistant,
    entities: string[] = [],
    entitiesFallback: string[] = [],
  ): Record<string, unknown> {
    const pool = [...entities, ...entitiesFallback].filter((id) => id.startsWith("sensor."));
    return {
      entities: {
        solar: pool[0] ?? "sensor.solar_power",
        grid: pool[1] ?? "sensor.grid_power",
      },
    };
  }

  render(): TemplateResult | typeof nothing {
    if (!this._hass || !this._config) return nothing;
    const model = this._model ?? buildModel(this._hass, this._config);
    const flows = computeFlows(model);
    const active = new Set(Object.keys(flows));

    return html`
      <ha-card .header=${this._rawConfig?.title}>
        <div class="body">${renderCross(model, this._config, this._hass, active)}</div>
      </ha-card>
    `;
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

export { ConfigError, type Config };
