/**
 * Landing store features – Tabby & Tamara, fast delivery, etc.
 * Follows Salla Twilight component conventions: strict typing, default values.
 * @see https://docs.salla.dev/doc-422580
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { FALLBACK_FEATURES } from '../../lib/fallback-data.js';

export interface FeatureItem {
  icon?: string;
  title: string;
  subtitle: string;
}

export interface LandingStoreFeaturesConfig {
  /** List of feature items. Default: fallback set when empty. */
  features?: FeatureItem[];
}

const DEFAULT_CONFIG: LandingStoreFeaturesConfig = {};

export default class LandingStoreFeatures extends LitElement {
  @property({ type: Object }) data: LandingStoreFeaturesConfig = DEFAULT_CONFIG;

  static styles = css`
    :host { display: block; }
    .store-features-box {
      background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 15px 0 20px;
      border: 1px solid #f0f0f0;
    }
    .feature-row {
      display: flex; align-items: flex-start; justify-content: flex-end;
      margin-bottom: 18px; direction: rtl;
    }
    .feature-row:last-child { margin-bottom: 0; }
    .feature-icon-wrapper {
      flex-shrink: 0; margin-left: 15px; width: 45px; height: 45px;
      display: flex; align-items: center; justify-content: center;
    }
    .feature-icon-wrapper img { width: 100%; height: 100%; object-fit: contain; }
    .feature-text-content { text-align: right; flex: 1; }
    .feature-title { font-weight: 800; font-size: 16px; color: #000; margin-bottom: 6px; }
    .feature-subtitle { font-size: 13px; color: #555; line-height: 1.6; }
  `;

  render() {
    const cfg = this.data ?? DEFAULT_CONFIG;
    const features = (cfg.features?.length ? cfg.features : FALLBACK_FEATURES) ?? [];
    return html`
      <div class="store-features-box">
        ${features.map((f) => html`
          <div class="feature-row">
            ${f.icon ? html`
              <div class="feature-icon-wrapper">
                <img src="${f.icon}" alt="${f.title}" loading="lazy" />
              </div>
            ` : ''}
            <div class="feature-text-content">
              <div class="feature-title">${f.title}</div>
              <div class="feature-subtitle">${f.subtitle}</div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  static registerSallaComponent(tagName: string) {
    const Salla = (window as any).Salla;
    if (!Salla?.bundles) return Promise.reject(new Error('Salla not ready'));
    const dynamicTagName = `${tagName}-${Math.random().toString(36).substring(2, 8)}`;
    return Salla.bundles.registerComponent(tagName, { component: this, dynamicTagName });
  }
}
