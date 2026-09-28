import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

const PREMIUM_PRICE    = 2000;
const PREMIUM_PRODUCTS = 40;
const FREE_PRODUCTS    = 5;
const PLAN_DAYS        = 30;

export default function UpgradePage() {
  const { user, shop, updateShop } = useAuth();

  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getPlanStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div className="page__loading"><span className="spinner" /></div>
      ) : (
        <>
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
                  </span>
                </div>
              </div>

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
                  <div className="upgrade-active-footer">
                    <span className="material-symbols-outlined">schedule</span>
                    Expires {expiryDate} · Come back then to renew
                  </div>
                </div>
              </div>
            </>
          ) : (
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

              {/* Premium card — upgrade disabled */}
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

                {/* DISABLED STATE */}
                <div className="upgrade-disabled">
                  <span className="material-symbols-outlined">workspace_premium</span>
                  <p className="upgrade-disabled__title">Premium upgrades temporarily disabled</p>
                  <p className="upgrade-disabled__sub">We're working on something. Check back soon.</p>
                </div>

                <p className="upgrade-card__note">
                  Secure payment via Paystack · Card, bank transfer &amp; USSD
                </p>
              </div>
            </div>
          )}

          {/* FAQ */}
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