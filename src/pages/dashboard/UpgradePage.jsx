import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

const PREMIUM_PRICE    = 2000;
const PREMIUM_PRODUCTS = 40;
const FREE_PRODUCTS    = 5;
const PLAN_DAYS        = 30;

export default function UpgradePage() {
  const { user, shop, updateShop } = useAuth();

  const [status,         setStatus]         = useState(null);
  const [loading,        setLoading]         = useState(true);
  const [paying,         setPaying]          = useState(false);
  const [paystackReady,  setPaystackReady]   = useState(false);
  const [error,          setError]           = useState('');
  const [success,        setSuccess]         = useState('');

  // Load current plan status
  useEffect(() => {
    api.getPlanStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Make sure Paystack script is loaded — check every 300ms for up to 10s
  useEffect(() => {
    if (window.PaystackPop) { setPaystackReady(true); return; }

    let tries = 0;
    const interval = setInterval(() => {
      tries += 1;
      if (window.PaystackPop) {
        setPaystackReady(true);
        clearInterval(interval);
      } else if (tries > 33) {
        // Still not loaded after 10s — inject the script dynamically as fallback
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => setPaystackReady(true);
        script.onerror = () => setError('Paystack could not be loaded. Please refresh the page and try again.');
        document.head.appendChild(script);
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = () => {
    if (!paystackReady || !window.PaystackPop) {
      setError('Paystack is still loading. Please wait a moment and try again.');
      return;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError('Paystack public key is not configured. Please contact support.');
      return;
    }

    setPaying(true);
    setError('');

    const handler = window.PaystackPop.setup({
      key:      publicKey,
      email:    user?.email,
      amount:   PREMIUM_PRICE * 100,  // convert to kobo
      currency: 'NGN',
      ref:      `linkmrs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      metadata: {
        custom_fields: [
          { display_name: 'Shop Name', variable_name: 'shop_name', value: shop?.shopName || '' },
        ],
      },
      onClose: () => {
        setPaying(false);
      },
      callback: async (response) => {
        try {
          const data = await api.verifyPayment(response.reference);
          setSuccess(data.message || 'Upgrade successful! You can now add up to 40 products.');
          setStatus((prev) => ({
            ...prev,
            plan: 'premium',
            isPremium: true,
            productLimit: PREMIUM_PRODUCTS,
            daysRemaining: PLAN_DAYS,
          }));
          await updateShop({});
        } catch (err) {
          setError(
            `Payment received but verification failed. Contact support with reference: ${response.reference}`
          );
        } finally {
          setPaying(false);
        }
      },
    });

    handler.openIframe();
  };

  const isPremium = status?.isPremium;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Upgrade to Premium</h1>
          <p className="page__subtitle">Unlock more products and grow your shop.</p>
        </div>
      </header>

      {error && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="banner banner--success">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}

      {loading ? (
        <div className="page__loading"><span className="spinner" /></div>
      ) : (
        <>
          {/* Active premium notice */}
          {isPremium && (
            <div className="upgrade-active">
              <span className="material-symbols-outlined upgrade-active__icon">workspace_premium</span>
              <div>
                <h2 className="heading-md">You're on Premium</h2>
                <p>
                  Active until{' '}
                  <strong>
                    {new Date(status.planExpiresAt).toLocaleDateString(undefined, {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </strong>
                  {' '}({status.daysRemaining} day{status.daysRemaining !== 1 ? 's' : ''} left).
                </p>
                <p style={{ color: 'var(--c-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  Renewing early extends from your current expiry — you won't lose any days.
                </p>
              </div>
            </div>
          )}

          {/* Plan cards */}
          <div className="upgrade-grid">

            {/* Free */}
            <div className={`upgrade-card ${!isPremium ? 'upgrade-card--current' : ''}`}>
              {!isPremium && (
                <span className="upgrade-card__badge upgrade-card__badge--current">Current Plan</span>
              )}
              <div className="upgrade-card__header">
                <h2 className="upgrade-card__tier">Free</h2>
                <div className="upgrade-card__price">
                  <span>₦0</span><small>/forever</small>
                </div>
              </div>
              <ul className="upgrade-card__features">
                <li><span className="material-symbols-outlined">check_circle</span>Up to <strong>{FREE_PRODUCTS} products</strong></li>
                <li><span className="material-symbols-outlined">check_circle</span>Storefront link</li>
                <li><span className="material-symbols-outlined">check_circle</span>WhatsApp checkout</li>
                <li><span className="material-symbols-outlined">check_circle</span>Order management</li>
                <li><span className="material-symbols-outlined">check_circle</span>Basic analytics</li>
                <li className="is-muted"><span className="material-symbols-outlined">block</span>Priority on Discover</li>
                <li className="is-muted"><span className="material-symbols-outlined">block</span>Premium badge</li>
              </ul>
              <button type="button" className="btn btn--ghost btn--block" disabled>
                {!isPremium ? 'Current Plan' : 'Free Plan'}
              </button>
            </div>

            {/* Premium */}
            <div className={`upgrade-card upgrade-card--premium ${isPremium ? 'upgrade-card--current' : ''}`}>
              {isPremium
                ? <span className="upgrade-card__badge upgrade-card__badge--current">Current Plan</span>
                : <span className="upgrade-card__badge">Recommended</span>
              }
              <div className="upgrade-card__header">
                <h2 className="upgrade-card__tier">Premium</h2>
                <div className="upgrade-card__price">
                  <span>₦{PREMIUM_PRICE.toLocaleString()}</span>
                  <small>/{PLAN_DAYS} days</small>
                </div>
              </div>
              <ul className="upgrade-card__features">
                <li><span className="material-symbols-outlined">check_circle</span>Up to <strong>{PREMIUM_PRODUCTS} products</strong></li>
                <li><span className="material-symbols-outlined">check_circle</span>Everything in Free</li>
                <li><span className="material-symbols-outlined">check_circle</span>Priority on Discover</li>
                <li><span className="material-symbols-outlined">check_circle</span>Premium badge</li>
                <li><span className="material-symbols-outlined">check_circle</span>Full analytics</li>
                <li><span className="material-symbols-outlined">check_circle</span>Priority support</li>
              </ul>

              {/* THE UPGRADE BUTTON — bright amber so it pops on dark background */}
              <button
                type="button"
                className="upgrade-pay-btn"
                onClick={handleUpgrade}
                disabled={paying || !paystackReady}
              >
                {paying ? (
                  <>
                    <span className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderTopColor: '#003434' }} />
                    Opening payment…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">workspace_premium</span>
                    {isPremium
                      ? `Renew Premium — ₦${PREMIUM_PRICE.toLocaleString()}`
                      : `Upgrade Now — ₦${PREMIUM_PRICE.toLocaleString()}`}
                  </>
                )}
              </button>

              {!paystackReady && !paying && (
                <p className="upgrade-card__note" style={{ color: 'rgba(255,255,255,.5)' }}>
                  Loading payment system…
                </p>
              )}

              <p className="upgrade-card__note">
                Secure payment via Paystack · Card, bank transfer &amp; USSD accepted
              </p>
            </div>
          </div>

          {/* FAQ */}
          <section className="dashboard__card">
            <h2 className="heading-md" style={{ marginBottom: '1rem' }}>Common questions</h2>
            <div className="upgrade-faq">
              {[
                ['What happens when premium expires?', 'Your shop goes back to Free (5 products). Your existing products stay — you just can\'t add new ones above 5 until you renew.'],
                ['Can I renew before expiry?', 'Yes. Renewing early extends from your current expiry date so you never lose days.'],
                ['What payment methods work?', 'Debit/credit card, bank transfer, USSD and all major Nigerian banks via Paystack.'],
                ['Is payment secure?', 'Yes. All payments go through Paystack — we never see or store your card details.'],
              ].map(([q, a]) => (
                <div className="upgrade-faq__item" key={q}>
                  <strong>{q}</strong>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}