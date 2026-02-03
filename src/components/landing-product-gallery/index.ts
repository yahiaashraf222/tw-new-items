import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { FALLBACK_IMAGES } from '../../lib/fallback-data.js';

export interface LandingProductGalleryConfig {
  images?: string[];
}

export default class LandingProductGallery extends LitElement {
  @property({ type: Object }) data?: LandingProductGalleryConfig;
  private _lightboxOpen = false;
  private _currentIndex = 0;
  private _images: string[] = [];

  static styles = css`
        :host { display: block; }
        .custom-slider-wrapper {
          display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
          scroll-behavior: smooth; -webkit-overflow-scrolling: touch; width: 100%;
          scrollbar-width: none; border-radius: 8px;
        }
        .custom-slider-wrapper::-webkit-scrollbar { display: none; }
        .custom-slide {
          flex: 0 0 100%; width: 100%; scroll-snap-align: center; cursor: zoom-in;
        }
        .custom-slide img {
          width: 100%; height: auto; object-fit: contain; display: block; border-radius: 8px;
        }
        .custom-thumbs-container {
          display: flex; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;
        }
        .custom-thumb-item {
          width: 80px; height: 80px; border: 2px solid #ddd; border-radius: 8px;
          cursor: pointer; object-fit: cover; opacity: 0.6; transition: all 0.3s;
        }
        .custom-thumb-item.active { border-color: #000; opacity: 1; transform: scale(1.05); }
        .custom-thumb-item:hover { opacity: 1; }
        .fslightbox-container {
          display: none; position: fixed; z-index: 999999; top: 0; left: 0;
          width: 100%; height: 100%; background: rgba(0,0,0,0.95);
          align-items: center; justify-content: center;
        }
        .fslightbox-container.active { display: flex !important; }
        .fslightbox-close-btn {
          position: absolute; top: 20px; right: 20px; background: transparent;
          border: none; cursor: pointer; padding: 10px; z-index: 1000000;
        }
        .fslightbox-close-btn svg { width: 32px; height: 32px; fill: #fff; }
        .fslightbox-image {
          max-width: 90%; max-height: 90vh; object-fit: contain; border-radius: 8px;
          animation: fade-in 0.3s;
        }
        .lightbox-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9); border: none; width: 50px; height: 50px;
          border-radius: 50%; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: 0.3s; z-index: 1000001;
        }
        .lightbox-nav:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
        .lightbox-prev { left: 20px; }
        .lightbox-next { right: 20px; }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `;

  /** Normalize images: Salla form builder sends collection as [{ image: "url" }, ...] or legacy string[]. */
  private _normalizeImages(cfg: unknown): string[] {
    if (!Array.isArray(cfg)) return [];
    return cfg
      .map((i: unknown) => (typeof i === 'string' ? i : (i as { image?: string; url?: string })?.image ?? (i as { image?: string; url?: string })?.url ?? ''))
      .filter(Boolean);
  }

  private _getImages(): string[] {
    const normalized = this._normalizeImages(this.data?.images);
    return normalized.length > 0 ? normalized : FALLBACK_IMAGES;
  }

  connectedCallback() {
    super.connectedCallback();
    this._images = this._getImages();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('data')) {
      this._images = this._getImages();
    }
  }

  private _openLightbox(index: number) {
    this._currentIndex = index;
    this._lightboxOpen = true;
  }

  private _closeLightbox() {
    this._lightboxOpen = false;
  }

  private _next() {
    this._currentIndex = (this._currentIndex + 1) % this._images.length;
  }

  private _prev() {
    this._currentIndex = (this._currentIndex - 1 + this._images.length) % this._images.length;
  }

  private _goToSlide(index: number) {
    this._currentIndex = index;
    const slide = this.shadowRoot?.getElementById(`slide-index-${index}`);
    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  render() {
    if (!this._images.length) {
      return html`<div class="custom-slider-wrapper"><p>لا توجد صور</p></div>`;
    }
    return html`
      <div class="custom-slider-wrapper">
        ${this._images.map((url, i) => html`
          <div class="custom-slide" id="slide-index-${i}" @click=${() => this._openLightbox(i)}>
            <img src="${url}" alt="صورة المنتج ${i + 1}" loading="lazy" />
          </div>
        `)}
      </div>
      <div class="custom-thumbs-container">
        ${this._images.map((url, i) => html`
          <img
            class="custom-thumb-item ${this._currentIndex === i ? 'active' : ''}"
            src="${url}"
            alt=""
            @click=${(e: Event) => { e.stopPropagation(); this._goToSlide(i); }}
          />
        `)}
      </div>
      <div class="fslightbox-container ${this._lightboxOpen ? 'active' : ''}" @click=${(e: Event) => e.target === e.currentTarget && this._closeLightbox()}>
        <button class="fslightbox-close-btn" type="button" @click=${this._closeLightbox} aria-label="إغلاق">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M17.885 16l7.057-7.057c0.521-0.521 0.521-1.364 0-1.885s-1.364-0.521-1.885 0l-7.057 7.057-7.057-7.057c-0.521-0.521-1.364-0.521-1.885 0s-0.521 1.364 0 1.885l7.057 7.057-7.057 7.057c-0.521 0.521-0.521 1.364 0 1.885 0.26 0.26 0.601 0.391 0.943 0.391s0.683-0.131 0.943-0.391l7.057-7.057 7.057 7.057c0.26 0.26 0.601 0.391 0.943 0.391s0.683-0.131 0.943-0.391c0.521-0.521 0.521-1.364 0-1.885z"/></svg>
        </button>
        <button class="lightbox-nav lightbox-prev" @click=${this._prev} aria-label="السابق">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button class="lightbox-nav lightbox-next" @click=${this._next} aria-label="التالي">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
        </button>
        <img class="fslightbox-image" src="${this._images[this._currentIndex]}" alt="Product Image" />
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
