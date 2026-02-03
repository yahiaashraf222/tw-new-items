/**
 * Wraps Salla's native Add Product component for landing pages.
 * Follows Salla Twilight component conventions: strict typing, default values.
 * @see https://docs.salla.dev/doc-422580
 * Set product_id in config on landing page; leave empty on product page to use current product.
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export interface LandingAddToCartConfig {
  /** Product ID – required on landing page; leave empty on product page. Default: "" */
  product_id?: string;
  /** Default quantity. Default: 1 */
  quantity?: number;
  /** Custom button label (optional; Salla add product has its own labels) */
  buttonLabel?: string;
}

const DEFAULT_CONFIG: LandingAddToCartConfig = { product_id: '', quantity: 1 };

export default class LandingAddToCart extends LitElement {
  @property({ type: Object }) data: LandingAddToCartConfig = DEFAULT_CONFIG;

  static styles = css`
    :host { display: block; }
    .landing-add-to-cart-wrapper {
      background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #eaeaea;
      margin: 15px 0 20px; direction: rtl;
    }
    .landing-add-to-cart-wrapper salla-add-product,
    .landing-add-to-cart-wrapper ::part(button) {
      width: 100%;
    }
    /* When Salla injects salla-add-product, ensure full width button */
    .landing-add-to-cart-wrapper ::slotted([slot="add-button"]) {
      width: 100%;
    }
  `;

  render() {
    const cfg = this.data ?? DEFAULT_CONFIG;
    const productId = cfg.product_id ?? '';
    const quantity = cfg.quantity ?? 1;

    return html`
      <div class="landing-add-to-cart-wrapper">
        <!-- Salla native Add Product: uses product ID from config or page context when empty.
             See https://docs.salla.dev/doc-422692 (Add Product) for API. -->
        <salla-add-product
          product-id="${productId}"
          quantity="${quantity}"
          support-sticky-bar
        ></salla-add-product>
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
