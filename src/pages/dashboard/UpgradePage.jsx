import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

const PREMIUM_PRICE    = 2000;
const PREMIUM_PRODUCTS = 40;
const FREE_PRODUCTS    = 5;
const PLAN_DAYS        = 30;

export default function UpgradePage() {
  const { user, shop, updateShop } = useAuth();
  const navigate = useNavigate();

  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getPlanStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = () => {
    if (!window.PaystackPop) {
      setError('Paystack failed to load. Check your internet and try again.');
      return;
    }
    setPaying(true);
    setError('');

    const handler = window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      email:    user?.email,
      amount:   PREMIUM_PRICE * 100,   // kobo
      currency: 'NGN',
      ref:      `linkmrs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      metadata: { shopId: shop?._id, shopName: shop?.shopName },
      onClose: () => setPaying(false),
      callback: async (response) => {
        try {
          const data = await api.verifyPayment(response.reference);
          setSuccess(data.message || 'Upgrade successful! You can now add up to 40 products.');
          setStatus((prev) => ({ ...prev, plan: 'premium', isPremium: true, productLimit: PREMIUM_PRODUCTS, daysRemaining: PLAN_DAYS }));
          await updateShop({});
        } catch (err) {
          setError(`Verification failed. Contact support with reference: ${response.reference}`);
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
          <span className="material-symbols-outlined">error</span>{error}
        </div>
      )}
      {success && (
        <div className="banner banner--success">
          <span className="material-symbols-outlined">check_circle</span>{success}
        </div>
      )}

      {loading ? (
        <div className="page__loading"><span className="spinner" /></div>
      ) : (
        <>
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
                  </strong>{' '}
                  ({status.daysRemaining} day{status.daysRemaining !== 1 ? 's' : ''} left).
                </p>
                <p style={{ color: 'var(--c-muted)', marginTop: '0.25rem' }}>
                  Renewing early extends from your current expiry — you won't lose any days.
                </p>
              </div>
            </div>
          )}

          <div className="upgrade-grid">
            {/* Free card */}
            <div className={`upgrade-card ${!isPremium ? 'upgrade-card--current' : ''}`}>
              {!isPremium && <span className="upgrade-card__badge upgrade-card__badge--current">Current Plan</span>}
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
                {!isPremium ? 'Current Plan' : 'Free Plan'}
              </button>
            </div>

            {/* Premium card */}
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
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={handleUpgrade}
                disabled={paying}
              >
                {paying
                  ? 'Opening payment…'
                  : isPremium
                    ? `Renew — ₦${PREMIUM_PRICE.toLocaleString()}`
                    : `Upgrade — ₦${PREMIUM_PRICE.toLocaleString()}`}
                {!paying && <span className="material-symbols-outlined">workspace_premium</span>}
              </button>
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