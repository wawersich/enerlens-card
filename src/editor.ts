/**
 * <enerlens-card-editor> - the GUI editor.
 * M0 scaffold; the ha-form schema arrives with step M9 (REQ E-3, E-4).
 */
import { LitElement, type TemplateResult, html, nothing } from "lit";
import { EDITOR_NAME } from "./const";
import type { HomeAssistant, RawConfig } from "./types";

class EnerLensCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: RawConfig;

  setConfig(config: RawConfig): void {
    this._config = config;
  }

  render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`<div>Editor folgt in Schritt M9.</div>`;
  }
}

if (!customElements.get(EDITOR_NAME)) {
  customElements.define(EDITOR_NAME, EnerLensCardEditor);
}
