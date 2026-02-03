import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { FALLBACK_EXPERT_BANNER, FALLBACK_EXPERT_BANNER_ALT } from '../../lib/fallback-data.js';

export interface ExpertCard {
  title?: string;
  paragraphs?: string[];
  highlight?: string;
}

export interface LandingExpertSectionConfig {
  bannerImage?: string;
  bannerAlt?: string;
  cards?: ExpertCard[];
}

export default class LandingExpertSection extends LitElement {
  @property({ type: Object }) data?: LandingExpertSectionConfig;

  static styles = css`
    :host { display: block; }
    .expert-section { margin-top: 25px; direction: rtl; }
    .expert-banner-img {
      width: 100%; border-radius: 12px; margin-bottom: 20px; display: block; height: auto;
    }
    .expert-grid { display: flex; gap: 15px; flex-direction: column; }
    .expert-card {
      background: #f5f5f5; border: 1px solid #ccc; border-radius: 12px; padding: 20px;
      flex: 1; text-align: right; font-size: 13px; line-height: 1.8; color: #333;
    }
    .expert-title {
      font-weight: 900; font-size: 16px; margin-bottom: 12px; color: #000; display: block;
    }
    .expert-text p { margin-bottom: 10px; }
    .expert-highlight-box {
      background: #fff; padding: 12px; border-radius: 8px; margin-top: 15px;
      font-weight: bold; font-size: 13px; border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    }
    @media (min-width: 768px) { .expert-card { font-size: 14px; } }
  `;

  /** Normalize cards: Salla form builder sends collection with paragraphs_json (JSON string). */
  private _normalizeCards(raw: unknown): ExpertCard[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((c: Record<string, unknown>) => {
      let paragraphs: string[] = [];
      if (Array.isArray((c as { paragraphs?: string[] }).paragraphs)) {
        paragraphs = (c as { paragraphs: string[] }).paragraphs;
      } else if (typeof (c as { paragraphs_json?: string }).paragraphs_json === 'string') {
        try {
          const parsed = JSON.parse((c as { paragraphs_json: string }).paragraphs_json);
          paragraphs = Array.isArray(parsed) ? parsed : [];
        } catch {
          paragraphs = [];
        }
      }
      return {
        title: (c as { title?: string }).title,
        paragraphs: paragraphs.length ? paragraphs : undefined,
        highlight: (c as { highlight?: string }).highlight,
      };
    });
  }

  render() {
    const banner = (this.data?.bannerImage?.trim() || FALLBACK_EXPERT_BANNER);
    const bannerAlt = (this.data?.bannerAlt?.trim() || FALLBACK_EXPERT_BANNER_ALT);
    const cards = this._normalizeCards(this.data?.cards);

    return html`
      <div class="expert-section">
        ${banner ? html`
          <img src="${banner}" alt="${bannerAlt}" class="expert-banner-img" loading="lazy" />
        ` : ''}
        <div class="expert-grid">
          ${cards.map((card) => html`
            <div class="expert-card">
              ${card.title ? html`<span class="expert-title">${card.title}</span>` : ''}
              ${card.paragraphs?.length ? html`
                <div class="expert-text">
                  ${card.paragraphs.map((p) => html`<p>${p}</p>`)}
                </div>
              ` : ''}
              ${card.highlight ? html`
                <div class="expert-highlight-box">${card.highlight}</div>
              ` : ''}
            </div>
          `)}
        </div>
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
