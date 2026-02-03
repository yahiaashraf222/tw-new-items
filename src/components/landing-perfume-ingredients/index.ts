/**
 * Landing perfume ingredients – cards with sections and ingredient items.
 * Follows Salla Twilight component conventions: strict typing, default values.
 * @see https://docs.salla.dev/doc-422580
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export interface IngredientItem {
  image: string;
  name: string;
}

export interface IngredientSection {
  title: string;
  items: IngredientItem[];
}

export interface PerfumeCard {
  title: string;
  sections: IngredientSection[];
}

export interface LandingPerfumeIngredientsConfig {
  /** Perfume cards (sections_json as JSON string in form builder). Default: [] */
  cards?: PerfumeCard[] | Record<string, unknown>[];
}

const DEFAULT_CONFIG: LandingPerfumeIngredientsConfig = { cards: [] };

export default class LandingPerfumeIngredients extends LitElement {
  @property({ type: Object }) data: LandingPerfumeIngredientsConfig = DEFAULT_CONFIG;

  static styles = css`
    :host { display: block; }
    .perfume-ingredients-section { direction: rtl; text-align: right; margin: 15px 0; }
    .perfume-card {
      background: #fff; border: 1px solid #eaeaea; border-radius: 12px;
      padding: 20px 15px; margin-bottom: 15px;
    }
    .perfume-card-title {
      font-size: 24px; font-weight: 900; color: #000; text-align: center;
      margin-bottom: 10px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0;
    }
    .ing-main-title { font-size: 20px; font-weight: 800; margin-bottom: 18px; color: #333; text-align: center; }
    .ing-section-title {
      font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #555;
      text-align: center; padding: 8px 15px; border-radius: 20px;
    }
    .ing-notes-container {
      display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-bottom: 25px;
    }
    .ingredient-item { display: flex; flex-direction: column; align-items: center; width: 80px; }
    .ingredient-img {
      width: 65px; height: 65px; object-fit: contain; margin-bottom: 8px; transition: transform 0.3s;
    }
    .ingredient-item:hover .ingredient-img { transform: scale(1.1); }
    .ingredient-name { font-size: 15px; color: #333; font-weight: 700; text-align: center; }
  `;

  /** Normalize cards: Salla form builder sends collection with sections_json (JSON string). */
  private _normalizeCards(raw: unknown): PerfumeCard[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((c: Record<string, unknown>) => {
      let sections: IngredientSection[] = [];
      if (Array.isArray((c as { sections?: IngredientSection[] }).sections)) {
        sections = (c as { sections: IngredientSection[] }).sections;
      } else if (typeof (c as { sections_json?: string }).sections_json === 'string') {
        try {
          const parsed = JSON.parse((c as { sections_json: string }).sections_json);
          sections = Array.isArray(parsed) ? parsed : [];
        } catch {
          sections = [];
        }
      }
      return { title: (c as { title?: string }).title ?? '', sections };
    });
  }

  render() {
    const cfg = this.data ?? DEFAULT_CONFIG;
    const cards = this._normalizeCards(cfg.cards);
    if (!cards.length) return html`<div class="perfume-ingredients-section"></div>`;

    return html`
      <div class="perfume-ingredients-section">
        ${cards.map((card) => html`
          <div class="perfume-card">
            <div class="perfume-card-title">${card.title}</div>
            <div class="ing-main-title">مكونات العطر:</div>
            ${card.sections?.map((sec) => html`
              <div class="ing-section-title">${sec.title}</div>
              <div class="ing-notes-container">
                ${sec.items?.map((item) => html`
                  <div class="ingredient-item">
                    <img src="${item.image}" alt="${item.name}" class="ingredient-img" loading="lazy" />
                    <span class="ingredient-name">${item.name}</span>
                  </div>
                `) ?? ''}
              </div>
            `) ?? ''}
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
