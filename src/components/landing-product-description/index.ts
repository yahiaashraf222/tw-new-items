/**
 * Landing product description – title, text, highlight.
 * Follows Salla Twilight component conventions: strict typing, default values.
 * @see https://docs.salla.dev/doc-422580
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export interface LandingProductDescriptionConfig {
  /** Title. Default: "" */
  title?: string;
  /** Description text. Default: "" */
  text?: string;
  /** Highlight line. Default: "" */
  highlight?: string;
}

const DEFAULT_CONFIG: LandingProductDescriptionConfig = { title: '', text: '', highlight: '' };

export default class LandingProductDescription extends LitElement {
  @property({ type: Object }) data: LandingProductDescriptionConfig = DEFAULT_CONFIG;

  static styles = css`
    :host { display: block; }
    .product-desc-box {
      background: #fff; border: 1px solid #eaeaea; border-radius: 12px;
      padding: 20px 15px; margin: 15px 0; text-align: center; direction: rtl; line-height: 1.8;
    }
    .desc-title { font-size: 16px; font-weight: 900; color: #000; margin-bottom: 12px; }
    .desc-text { font-size: 14px; color: #444; margin-bottom: 10px; }
    .desc-highlight { font-size: 14px; font-weight: 700; color: #000; }
    @media (min-width: 768px) {
      .product-desc-box { padding: 15px 12px; }
      .desc-title { font-size: 19px; }
      .desc-text { font-size: 16px; line-height: 2.1; }
    }
  `;

  render() {
    const cfg = this.data ?? DEFAULT_CONFIG;
    const title = cfg.title ?? '';
    const text = cfg.text ?? '';
    const highlight = cfg.highlight ?? '';
    return html`
      <div class="product-desc-box">
        ${title ? html`<div class="desc-title">${title}</div>` : ''}
        ${text ? html`<div class="desc-text">${text}</div>` : ''}
        ${highlight ? html`<div class="desc-highlight">${highlight}</div>` : ''}
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
