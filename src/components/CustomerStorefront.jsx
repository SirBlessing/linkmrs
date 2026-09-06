import React, { useMemo, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import CartBar from './CartBar.jsx';
import CartSheet from './CartSheet.jsx';
import BottomNav from './BottomNav.jsx';
import { formatPrice } from '../utils.js';

export default function CustomerStorefront({
  products,
  shopProfile,
  cart,
  onAddToCart,
  onDecrementFromCart,
  onClearCart,
  onBackToDashboard,
  embedded = false
}) {
  const [isCartOpen, setCartOpen] = useState(false);
  const { currency } = shopProfile;

  const lineItems = useMemo(
    () =>
      products
        .filter((p) => cart[p.id] > 0)
        .map((p) => ({ ...p, quantity: cart[p.id] })),
    [products, cart]
  );

  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [lineItems]
  );

  const buildWhatsAppMessage = () => {
    const lines = lineItems.map(
      (item) =>
        `${item.quantity}x ${item.name} \u2014 ${formatPrice(item.price * item.quantity, currency)}`
    );
    return [
      `\uD83D\uDED2 New Order \u2014 ${shopProfile.shopName}`,
      '',
      ...lines,
      '',
      `Total: ${formatPrice(totalPrice, currency)}`,
      '',
      'Sent via Linkmrs'
    ].join('\n');
  };

  const handleCheckout = () => {
    if (lineItems.length === 0) return;
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${shopProfile.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setCartOpen(false);
    onClearCart();
  };

  const navItems = [
    { key: 'home', icon: 'home', label: 'Home', onClick: () => {} },
    { key: 'store', icon: 'storefront', label: 'Store', onClick: () => {} },
    { key: 'orders', icon: 'receipt_long', label: 'Orders', onClick: () => {} },
    { key: 'profile', icon: 'person', label: 'Profile', onClick: onBackToDashboard }
  ];

  return (
    <div className={`storefront ${embedded ? 'storefront--embedded' : ''}`}>
      {!embedded && (
        <header className="storefront__topbar">
          <span className="brand-mark">Linkmrs</span>
          <div className="storefront__topbar-actions">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button type="button" className="icon-btn" aria-label="Account" onClick={onBackToDashboard}>
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>
      )}

      <main className="storefront__main">
        <section className="storefront__hero">
          <div className="storefront__avatar-wrap">
            <img src={shopProfile.logo} alt={`${shopProfile.shopName} logo`} className="storefront__avatar" />
            <span className="storefront__verified material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
          <h1 className="storefront__shop-name">{shopProfile.shopName}</h1>
          <p className="storefront__bio">{shopProfile.bio}</p>
          <div className="storefront__tags">
            <span className="chip">
              <span className="material-symbols-outlined">location_on</span>
              {shopProfile.location}
            </span>
            <span className="chip">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {shopProfile.rating} ({shopProfile.reviewCount})
            </span>
          </div>
        </section>

        <section className="storefront__catalog">
          <div className="storefront__catalog-header">
            <h2 className="heading-md">All Products</h2>
            <button type="button" className="text-btn">
              <span className="material-symbols-outlined">tune</span>
              Filter
            </button>
          </div>

          {products.length === 0 ? (
            <p className="storefront__empty">This shop hasn\u2019t added any products yet.</p>
          ) : (
            <div className="storefront__grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  quantity={cart[product.id] || 0}
                  onAdd={onAddToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        currency={currency}
        embedded={embedded}
        onOpenCart={() => setCartOpen(true)}
        onCheckout={handleCheckout}
      />

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        lineItems={lineItems}
        totalItems={totalItems}
        totalPrice={totalPrice}
        currency={currency}
        onIncrement={onAddToCart}
        onDecrement={onDecrementFromCart}
        onCheckout={handleCheckout}
      />

      {!embedded && <BottomNav items={navItems} activeKey="store" />}
    </div>
  );
}
