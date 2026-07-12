import React from 'react';
import CustomerStorefront from './CustomerStorefront.jsx';

/**
 * Read-only mirror of the live storefront, shown inside a phone bezel on the
 * desktop dashboard so vendors can see how product/profile edits will look.
 * Interaction is intentionally disabled (pointer-events: none) since this is
 * a preview, not a second instance of the cart.
 */
export default function PhonePreview({ products, shopProfile, cart }) {
  return (
    <aside className="phone-preview">
      <div className="phone-preview__label">
        <span className="material-symbols-outlined">visibility</span>
        Storefront Live Preview
      </div>
      <p className="phone-preview__sublabel">Real-time customer view</p>

      <div className="phone-preview__bezel">
        <div className="phone-preview__notch" />
        <div className="phone-preview__screen">
          <CustomerStorefront
            products={products}
            shopProfile={shopProfile}
            cart={cart}
            onAddToCart={() => {}}
            onDecrementFromCart={() => {}}
            onClearCart={() => {}}
            onBackToDashboard={() => {}}
            embedded
          />
        </div>
      </div>
    </aside>
  );
}
