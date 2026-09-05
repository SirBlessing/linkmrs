import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';
import { formatPrice } from '../../utils.js';

const PREMIUM_PRICE    = 5000;   // ₦5,000 — change this to whatever you want
const PREMIUM_PRODUCTS = 40;
const PLAN_DAYS        = 30;

export default function UpgradePage() {
  const { user, shop, updateShop } = useAuth();
  const navigate = useNavigate();

  const [status,    setStatus]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // Load current plan status
  useEffect(() => {
    api.getPlanStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = () => {
    if (!window.PaystackPop) {
      setError('Paystack failed to load. Check your internet connection and try again.');
      return;
    }

    setPaying(true);
    setError('');

    const handler = window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      email:    user.email,
      amount:   PREMIUM_PRICE * 100,   // Paystack uses kobo (multiply by 100)
      currency: 'NGN',
      ref:      `linkmrs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      metadata: {
        shopId:   shop?._id,
        shopName: shop?.shopName,
      },
      onClose: () => {
        setPaying(false);
      },
      callback: async (response) => {
        try {
          const data = await api.verifyPayment(response.reference);
          await updateShop({});   // refresh shop state in AuthContext
          setSuccess(data.message || 'Upgrade successful! You can now add up to 40 products.');
          setStatus((prev) => ({ ...prev, plan: 'premium', isPremium: true, productLimit: PREMIUM_PRODUCTS }));
        } catch (err) {
          setError(err.message || 'Payment verification failed. Contact support with your reference: ' + response.reference);
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
          <p className="page__subtitle">
            Unlock more products and grow your shop faster.
          </p>
        </div>
      </header>

      {/* Load Paystack inline script */}
      <script src="https://js.paystack.co/v1/inline.js" async />

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
          {/* Current plan status */}
          {isPremium && (
            <div className="dashboard__card upgrade-active">
              <span className="material-symbols-outlined upgrade-active__icon">
                workspace_premium
              </span>
              <div>
                <h2 className="heading-md">You're on Premium</h2>
                <p>
                  Your plan is active until{' '}
                  <strong>
                    {new Date(status.planExpiresAt).toLocaleDateString(undefined, {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </strong>
                  {' '}({status.daysRemaining} day{status.daysRemaining !== 1 ? 's' : ''} remaining).
                </p>
                <p style={{ marginTop: '0.5rem', color: 'var(--c-muted)' }}>
                  You can add up to <strong>{PREMIUM_PRODUCTS} products</strong>.
                  Renewing before expiry will extend from your current expiry date.
                </p>
              </div>
            </div>
          )}

          {/* Plan comparison */}
          <div className="upgrade-grid">
            {/* Free */}
            <div className={`upgrade-card ${!isPremium ? 'upgrade-card--current' : ''}`}>
              {!isPremium && <span className="upgrade-card__badge upgrade-card__badge--current">Current Plan</span>}
              <div className="upgrade-card__header">
                <h2 className="upgrade-card__tier">Free</h2>
                <div className="upgrade-card__price">
                  <span>₦0</span>
                  <small>/forever</small>
                </div>
              </div>
              <ul className="upgrade-card__features">
                <li><span className="material-symbols-outlined">check_circle</span>Up to <strong>10 products</strong></li>
                <li><span className="material-symbols-outlined">check_circle</span>1 storefront link</li>
                <li><span className="material-symbols-outlined">check_circle</span>WhatsApp checkout</li>
                <li><span className="material-symbols-outlined">check_circle</span>Order management</li>
                <li><span className="material-symbols-outlined">check_circle</span>Basic analytics</li>
                <li className="is-muted"><span className="material-symbols-outlined">block</span>Priority on Discover</li>
                <li className="is-muted"><span className="material-symbols-outlined">block</span>Premium badge</li>
              </ul>
              <div className="upgrade-card__action">
                <button type="button" className="btn btn--ghost btn--block" disabled>
                  {!isPremium ? 'Current Plan' : 'Downgrade'}
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className={`upgrade-card upgrade-card--premium ${isPremium ? 'upgrade-card--current' : ''}`}>
              {isPremium && <span className="upgrade-card__badge upgrade-card__badge--current">Current Plan</span>}
              {!isPremium && <span className="upgrade-card__badge">Recommended</span>}
              <div className="upgrade-card__header">
                <h2 className="upgrade-card__tier">Premium</h2>
                <div className="upgrade-card__price">
                  <span>{formatPrice(PREMIUM_PRICE, '₦')}</span>
                  <small>/{PLAN_DAYS} days</small>
                </div>
              </div>
              <ul className="upgrade-card__features">
                <li><span className="material-symbols-outlined">check_circle</span>Up to <strong>{PREMIUM_PRODUCTS} products</strong></li>
                <li><span className="material-symbols-outlined">check_circle</span>Everything in Free</li>
                <li><span className="material-symbols-outlined">check_circle</span>Priority listing on Discover</li>
                <li><span className="material-symbols-outlined">check_circle</span>Premium badge on storefront</li>
                <li><span className="material-symbols-outlined">check_circle</span>Full analytics suite</li>
                <li><span className="material-symbols-outlined">check_circle</span>Priority support</li>
              </ul>
              <div className="upgrade-card__action">
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={handleUpgrade}
                  disabled={paying}
                >
                  {paying ? 'Opening payment…' : isPremium ? `Renew — ₦${PREMIUM_PRICE.toLocaleString()}` : `Upgrade — ₦${PREMIUM_PRICE.toLocaleString()}`}
                  {!paying && <span className="material-symbols-outlined">workspace_premium</span>}
                </button>
                <p className="upgrade-card__note">
                  Secure payment via Paystack. Card, bank transfer, or USSD accepted.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="dashboard__card">
            <h2 className="heading-md" style={{ marginBottom: '1rem' }}>Common questions</h2>
            <div className="upgrade-faq">
              <div className="upgrade-faq__item">
                <strong>What happens when premium expires?</strong>
                <p>Your shop goes back to Free. Your existing products stay — you just can't add new ones above 10 until you renew.</p>
              </div>
              <div className="upgrade-faq__item">
                <strong>Can I renew before it expires?</strong>
                <p>Yes. Renewing early extends from your current expiry date, not today — so you never lose days.</p>
              </div>
              <div className="upgrade-faq__item">
                <strong>What payment methods are accepted?</strong>
                <p>Debit/credit card, bank transfer, USSD, and all major Nigerian banks via Paystack.</p>
              </div>
              <div className="upgrade-faq__item">
                <strong>Is payment secure?</strong>
                <p>Yes. All payments are handled by Paystack — we never store your card details.</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}