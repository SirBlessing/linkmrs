import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

const PREMIUM_PRICE    = 2000;
const PREMIUM_PRODUCTS = 40;
const FREE_PRODUCTS    = 5;
const PLAN_DAYS        = 30;

export default function UpgradePage() {
  const { user, shop, updateShop } = useAuth();

  const [status,        setStatus]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [paying,        setPaying]        = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  useEffect(() => {
    api.getPlanStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Wait for Paystack script — falls back to injecting it dynamically
  useEffect(() => {
    if (window.PaystackPop) { setPaystackReady(true); return; }
    let tries = 0;
    const interval = setInterval(() => {
      tries += 1;
      if (window.PaystackPop) {
        setPaystackReady(true);
        clearInterval(interval);
      } else if (tries > 16) {
        const script = document.createElement('script');
        script.src     = 'https://js.paystack.co/v1/inline.js';
        script.onload  = () => setPaystackReady(true);
        script.onerror = () => setError('Paystack could not be loaded. Please refresh and try again.');
        document.head.appendChild(script);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = () => {
    if (!paystackReady || !window.PaystackPop) {
      setError('Payment system still loading. Please wait a moment and try again.');
      return;
    }
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError('Paystack public key is not configured. Contact support.');
      return;
    }

    setPaying(true);
    setError('');

    // Plain function — Paystack rejects async callbacks
    function onPaymentSuccess(response) {
      api
        .verifyPayment(response.reference)
        .then((data) => {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + PLAN_DAYS);
          setSuccess(data.message || 'Upgrade successful! You can now add up to 40 products.');
          setStatus((prev) => ({
            ...prev,
            plan:          'premium',
            isPremium:     true,
            productLimit:  PREMIUM_PRODUCTS,
            daysRemaining: PLAN_DAYS,
            planExpiresAt: expiresAt.toISOString(),
          }));
          return updateShop({});
        })
        .catch(() => {
          setError(`Payment received but verification failed. Contact support with reference: ${response.reference}`);
        })
        .finally(() => setPaying(false));
    }

    const handler = window.PaystackPop.setup({
      key:      publicKey,
      email:    user?.email,
      amount:   PREMIUM_PRICE * 100,
      currency: 'NGN',
      ref:      `linkmrs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      onClose:  function () { setPaying(false); },
      callback: onPaymentSuccess,
    });

    handler.openIframe();
  };

  const isPremium = status?.isPremium;

  const expiryDate = status?.planExpiresAt
    ? new Date(status.planExpiresAt).toLocaleDateString(undefined, {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Plan &amp; Billing</h1>
          <p className="page__subtitle">Manage your Linkmrs subscription.</p>
        </div>
      </header>

      {error && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Success and premium active — same green banner style */}
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
          {/* ── PREMIUM ACTIVE STATE ─────────────────────────────────── */}
          {isPremium ? (
            <>
              <div className="banner banner--success" style={{ alignItems: 'flex-start', gap: '1rem', padding: '1.25rem 1.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', flexShrink: 0 }}>
                  workspace_premium
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <strong style={{ fontSize: '1.0625rem', fontFamily: 'var(--font-display)' }}>
                    You're on Premium — active until {expiryDate}
                  </strong>
                  <span style={{ fontSize: '0.875rem', opacity: 0.85 }}>
                    {status.daysRemaining} day{status.daysRemaining !== 1 ? 's' : ''} remaining.
                    You can add up to <strong>40 products</strong>.
                    Your plan renews automatically when it expires — come back here to renew.
                  </span>
                </div>
              </div>

              {/* Plan comparison — no upgrade button while active */}
              <div className="upgrade-grid">
                <div className="upgrade-card">
                  <div className="upgrade-card__header">
                    <h2 className="upgrade-card__tier">Free</h2>
                    <div className="upgrade-card__price"><span>₦0</span><small>/forever</small></div>
                  </div>
                  <ul className="upgrade-card__features">
                    <li><span className="material-symbols-outlined">check_circle</span>Up to <strong>{FREE_PRODUCTS} products</strong></li>
                    <li><span className="material-symbols-outlined">check_circle</span>Storefront link</li>
                    <li><span className="material-symbols-outlined">check_circle</span>WhatsApp checkout</li>
                    <li><span className="material-symbols-outlined">check_circle</span>Order management</li>
                    <li><span className="material-symbols-outlined">check_circle</span>Basic analytics</li>
                  </ul>
                </div>

                <div className="upgrade-card upgrade-card--premium upgrade-card--current">
                  <span className="upgrade-card__badge upgrade-card__badge--current">Active Plan</span>
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

                  {/* No button — they already paid. Just show expiry info */}
                  <div className="upgrade-active-footer">
                    <span className="material-symbols-outlined">schedule</span>
                    Expires {expiryDate} · Come back then to renew
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── FREE PLAN STATE — show upgrade option ───────────────── */
            <>
              <div className="upgrade-grid">
                {/* Free card */}
                <div className="upgrade-card upgrade-card--current">
                  <span className="upgrade-card__badge upgrade-card__badge--current">Current Plan</span>
                  <div className="upgrade-card__header">
                    <h2 className="upgrade-card__tier">Free</h2>
                    <div className="upgrade-card__price"><span>₦0</span><small>/forever</small></div>
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
                    Current Plan
                  </button>
                </div>

                {/* Premium card */}
                <div className="upgrade-card upgrade-card--premium">
                  <span className="upgrade-card__badge">Recommended</span>
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

                  {/* Bright amber upgrade button */}
                  <button
                    type="button"
                    className="upgrade-pay-btn"
                    onClick={handleUpgrade}
                    disabled={paying || !paystackReady}
                  >
                    {paying ? (
                      <>
                        <span className="spinner" style={{ width: '1.1rem', height: '1.1rem', borderWidth: '2px', borderTopColor: '#3a2c00' }} />
                        Processing…
                      </>
                    ) : !paystackReady ? (
                      'Loading payment…'
                    ) : (
                      <>
                        <span className="material-symbols-outlined">workspace_premium</span>
                        Upgrade Now — ₦{PREMIUM_PRICE.toLocaleString()}
                      </>
                    )}
                  </button>
                  <p className="upgrade-card__note">
                    Secure payment via Paystack · Card, bank transfer &amp; USSD
                  </p>
                </div>
              </div>
            </>
          )}

          {/* FAQ — always visible */}
          <section className="dashboard__card">
            <h2 className="heading-md" style={{ marginBottom: '1rem' }}>Common questions</h2>
            <div className="upgrade-faq">
              {[
                ['Can I pay again while already on Premium?', 'No. Your current plan stays active until it expires. Come back to this page after expiry to renew.'],
                ['What happens when Premium expires?', 'Your shop automatically goes back to Free (5 products). Your existing products stay — you just can\'t add new ones above 5 until you renew.'],
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