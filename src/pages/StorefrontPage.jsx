import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import CartBar from '../components/CartBar.jsx';
import CartSheet from '../components/CartSheet.jsx';
import AiCustomerChat from '../components/AiCustomerChat.jsx';
import { formatPrice } from '../utils.js';

export default function StorefrontPage() {
  const { slug } = useParams();

  const [shop,      setShop]    = useState(null);
  const [products,  setProducts] = useState([]);
  const [isLoading, setLoad]    = useState(true);
  const [loadError, setLoadErr] = useState('');

  const [cart,          setCart]       = useState({});
  const [isCartOpen,    setCartOpen]   = useState(false);
  const [customerName,  setCustName]   = useState('');
  const [customerPhone, setCustPhone]  = useState('');
  const [placing,       setPlacing]    = useState(false);
  const [checkoutError, setChkErr]     = useState('');
  const [orderDone,     setOrderDone]  = useState(false);

  useEffect(() => {
    let live = true;
    setLoad(true); setLoadErr(''); setCart({}); setOrderDone(false);
    api.getShop(slug)
      .then((d) => { if (!live) return; setShop(d.shop); setProducts(d.products); })
      .catch((e) => { if (live) setLoadErr(e.message); })
      .finally(() => { if (live) setLoad(false); });
    return () => { live = false; };
  }, [slug]);

  const lineItems  = useMemo(() => products.filter((p) => cart[p._id] > 0).map((p) => ({ ...p, quantity: cart[p._id] })), [products, cart]);
  const totalItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);
  const totalPrice = useMemo(() => lineItems.reduce((s, i) => s + i.price * i.quantity, 0), [lineItems]);

  const addToCart      = (id) => { setOrderDone(false); setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 })); };
  const removeFromCart = (id) => setCart((p) => {
    if ((p[id] || 0) <= 1) { const n = { ...p }; delete n[id]; return n; }
    return { ...p, [id]: p[id] - 1 };
  });

  const buildMsg = (order) => [
    `🛒 New Order — ${shop.shopName}`,
    '',
    ...order.items.map((i) => `${i.quantity}× ${i.name} — ${formatPrice(i.lineTotal, shop.currency)}`),
    '',
    `Total: ${formatPrice(order.total, shop.currency)}`,
    customerName  ? `From: ${customerName}`   : null,
    customerPhone ? `Phone: ${customerPhone}` : null,
    '',
    'Sent via Linkmrs',
  ].filter((l) => l !== null).join('\n');

  const handleCheckout = async () => {
    if (!lineItems.length) return;
    setChkErr(''); setPlacing(true);
    try {
      const { order, shopWhatsappNumber } = await api.placeOrder({
        shopSlug: slug,
        items: lineItems.map((i) => ({ productId: i._id, quantity: i.quantity })),
        customerName,
        customerPhone,
      });
      if (shopWhatsappNumber) {
        const url = `https://wa.me/${shopWhatsappNumber}?text=${encodeURIComponent(buildMsg(order))}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      setCart({}); setCartOpen(false); setOrderDone(true);
    } catch (e) {
      setChkErr(e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="full-page-loader">
        <span className="spinner" />
        <p>Loading shop…</p>
      </div>
    );
  }

  if (loadError || !shop) {
    return (
      <div className="status-page">
        <span className="material-symbols-outlined status-page__icon">storefront</span>
        <h1 className="heading-lg">Shop not found</h1>
        <p className="status-page__text">{loadError || `No shop at linkmrs.com/${slug}`}</p>
        <div className="status-page__actions">
          <Link to="/discover" className="btn btn--primary">Browse other shops</Link>
          <Link to="/" className="btn btn--ghost">Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront">
      <header className="storefront__topbar">
        <Link to="/" className="brand-mark">Linkmrs</Link>
        <Link to="/discover" className="text-btn">
          <span className="material-symbols-outlined">explore</span>
          Discover
        </Link>
      </header>

      <main className="storefront__main">
        <section className="storefront__hero">
          <div className="storefront__avatar-wrap">
            <img src={shop.logo} alt={`${shop.shopName} logo`} className="storefront__avatar" />
          </div>
          <h1 className="storefront__name">{shop.shopName}</h1>
          <p className="storefront__bio">{shop.bio}</p>
          {shop.location && (
            <div className="storefront__tags">
              <span className="chip">
                <span className="material-symbols-outlined">location_on</span>
                {shop.location}
              </span>
            </div>
          )}
        </section>

        {orderDone && (
          <div className="banner banner--success">
            <span className="material-symbols-outlined">check_circle</span>
            Order sent! WhatsApp should have opened with your order details.
          </div>
        )}

        <section className="storefront__catalog">
          <div className="storefront__catalog-header">
            <h2 className="heading-md">Products</h2>
            <span className="storefront__count">
              {products.length} item{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          {products.length === 0 ? (
            <p className="storefront__empty">This shop hasn't added any products yet.</p>
          ) : (
            <div className="storefront__grid">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={{ ...p, id: p._id }}
                  currency={shop.currency}
                  quantity={cart[p._id] || 0}
                  onAdd={() => addToCart(p._id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Cart */}
      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        currency={shop.currency}
        onOpenCart={() => setCartOpen(true)}
      />
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        lineItems={lineItems}
        totalItems={totalItems}
        totalPrice={totalPrice}
        currency={shop.currency}
        onIncrement={(id) => addToCart(id)}
        onDecrement={removeFromCart}
        customerName={customerName}
        customerPhone={customerPhone}
        onCustomerNameChange={setCustName}
        onCustomerPhoneChange={setCustPhone}
        onCheckout={handleCheckout}
        isPlacingOrder={placing}
        checkoutError={checkoutError}
      />

      {/* AI Customer Chat widget */}
      <AiCustomerChat shopSlug={slug} shopName={shop.shopName} />
    </div>
  );
}