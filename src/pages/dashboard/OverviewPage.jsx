import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice, formatDate, STATUS_LABELS } from '../../utils.js';

export default function OverviewPage() {
  const { shop } = useAuth();

  const [analytics,    setAnalytics]  = useState({ totalSales: 0, totalOrders: 0, pendingCount: 0, productCount: 0, ordersByDay: [], topProducts: [] });
  const [recentOrders, setOrders]     = useState([]);
  const [isLoading,    setLoading]    = useState(true);
  const [error,        setError]      = useState('');
  const [copied,       setCopied]     = useState(false);

  const now       = new Date();
  const isPremium = shop?.plan === 'premium' && shop?.planExpiresAt && new Date(shop.planExpiresAt) > now;
  const daysLeft  = isPremium
    ? Math.ceil((new Date(shop.planExpiresAt) - now) / (1000 * 60 * 60 * 24))
    : 0;

  useEffect(() => {
    let live = true;
    Promise.all([api.getAnalytics(), api.listOrders()])
      .then(([a, o]) => { if (!live) return; setAnalytics(a); setOrders(o.orders.slice(0, 5)); })
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, []);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/shop/${shop.slug}`); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Overview</h1>
          <p className="page__subtitle">Here's how your shop is doing right now.</p>
        </div>
        {shop && (
          <Link to={`/shop/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
            <span className="material-symbols-outlined">open_in_new</span>
            View Storefront
          </Link>
        )}
      </header>

      {/* ── Upgrade banner (free users) ── */}
      {!isPremium && !isLoading && (
        <div className="upgrade-banner">
          <div className="upgrade-banner__left">
            <span className="material-symbols-outlined">workspace_premium</span>
            <div>
              <p className="upgrade-banner__title">You're on the Free plan</p>
              <p className="upgrade-banner__sub">
                Limited to <strong>5 products</strong>. Upgrade to Premium for just{' '}
                <strong>₦2,000/month</strong> and list up to 40 products.
              </p>
            </div>
          </div>
          <Link to="/dashboard/upgrade" className="btn btn--primary btn--sm btn--pill">
            Upgrade Now
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* ── Premium expiry warning (7 days or less) ── */}
      {isPremium && daysLeft <= 7 && (
        <div className="upgrade-banner upgrade-banner--warn">
          <div className="upgrade-banner__left">
            <span className="material-symbols-outlined">schedule</span>
            <div>
              <p className="upgrade-banner__title">Premium expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
              <p className="upgrade-banner__sub">Renew now to keep your 40-product limit without any interruption.</p>
            </div>
          </div>
          <Link to="/dashboard/upgrade" className="btn btn--primary btn--sm btn--pill">
            Renew Premium
          </Link>
        </div>
      )}

      {error && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>{error}
        </div>
      )}

      {isLoading ? (
        <div className="page__loading"><span className="spinner" /></div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-card__label">Total Sales</span>
              <span className="stat-card__value">{formatPrice(analytics.totalSales, shop?.currency)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Total Orders</span>
              <span className="stat-card__value">{analytics.totalOrders}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Pending</span>
              <span className="stat-card__value stat-card__value--warn">{analytics.pendingCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Products</span>
              <span className="stat-card__value">
                {analytics.productCount}
                <span className="stat-card__of"> / {isPremium ? 40 : 5}</span>
              </span>
            </div>
          </div>

          {shop && (
            <div className="dashboard__card dashboard__link-card">
              <div className="dashboard__link-info">
                <p className="field__label">Your storefront link</p>
                <p className="dashboard__link-url">linkmrs.com/{shop.slug}</p>
              </div>
              <button type="button" className="btn btn--primary btn--sm btn--pill" onClick={copyLink}>
                <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          <section className="dashboard__card">
            <div className="dashboard__card-header dashboard__card-header--split">
              <h2 className="heading-md">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-btn">
                All orders <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="dashboard__empty">
                No orders yet.{' '}
                {shop && <Link to={`/shop/${shop.slug}`} target="_blank">Share your storefront</Link>}{' '}
                to start selling.
              </p>
            ) : (
              <div className="order-list">
                {recentOrders.map((order) => (
                  <div className="order-row" key={order.id || order._id}>
                    <div className="order-row__info">
                      <p className="order-row__customer">{order.customerName || 'Anonymous'}</p>
                      <p className="order-row__meta">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`status-badge status-badge--${order.status}`}>{STATUS_LABELS[order.status]}</span>
                    <span className="order-row__total">{formatPrice(order.total, order.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard__card">
            <div className="dashboard__card-header">
              <h2 className="heading-md">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/dashboard/products" className="quick-action">
                <span className="material-symbols-outlined">add_circle</span>
                <span>Add Product</span>
              </Link>
              <Link to="/dashboard/orders" className="quick-action">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>View Orders</span>
              </Link>
              <Link to="/dashboard/analytics" className="quick-action">
                <span className="material-symbols-outlined">bar_chart</span>
                <span>Analytics</span>
              </Link>
              <Link to="/dashboard/upgrade" className="quick-action quick-action--premium">
                <span className="material-symbols-outlined">workspace_premium</span>
                <span>{isPremium ? 'Premium ✓' : 'Upgrade'}</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}