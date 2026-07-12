import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice, formatDate, STATUS_LABELS } from '../../utils.js';

export default function OverviewPage() {
  const { shop } = useAuth();
  const [analytics,     setAnalytics]  = useState(null);
  const [recentOrders,  setOrders]     = useState([]);
  const [isLoading,     setLoading]    = useState(true);
  const [error,         setError]      = useState('');
  const [copied,        setCopied]     = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([api.getAnalytics(), api.listOrders()])
      .then(([a, o]) => {
        if (!live) return;
        setAnalytics(a);
        setOrders(o.orders.slice(0, 5));
      })
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, []);

  const copyLink = async () => {
    const url = `${window.location.origin}/shop/${shop.slug}`;
    try { await navigator.clipboard.writeText(url); } catch {}
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
          <Link
            to={`/shop/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost btn--sm"
          >
            <span className="material-symbols-outlined">open_in_new</span>
            View Storefront
          </Link>
        )}
      </header>

      {error && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="page__loading"><span className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-card__label">Total Sales</span>
              <span className="stat-card__value">
                {formatPrice(analytics.totalSales, shop?.currency)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Total Orders</span>
              <span className="stat-card__value">{analytics.totalOrders}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Pending</span>
              <span className="stat-card__value stat-card__value--warn">
                {analytics.pendingCount}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Products</span>
              <span className="stat-card__value">
                {analytics.productCount}
                <span className="stat-card__of"> / 10</span>
              </span>
            </div>
          </div>

          {/* Store link */}
          {shop && (
            <div className="dashboard__card dashboard__link-card">
              <div className="dashboard__link-info">
                <p className="field__label">Your storefront link</p>
                <p className="dashboard__link-url">vendly.com/{shop.slug}</p>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--sm btn--pill"
                onClick={copyLink}
              >
                <span className="material-symbols-outlined">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          {/* Recent orders */}
          <section className="dashboard__card">
            <div className="dashboard__card-header dashboard__card-header--split">
              <h2 className="heading-md">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-btn">
                All orders
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="dashboard__empty">
                No orders yet.{' '}
                {shop && (
                  <Link to={`/shop/${shop.slug}`} target="_blank">
                    Share your storefront
                  </Link>
                )}{' '}
                to start selling.
              </p>
            ) : (
              <div className="order-list">
                {recentOrders.map((order) => (
                  <div className="order-row" key={order.id}>
                    <div className="order-row__info">
                      <p className="order-row__customer">
                        {order.customerName || 'Anonymous customer'}
                      </p>
                      <p className="order-row__meta">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        {' · '}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`status-badge status-badge--${order.status}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="order-row__total">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick actions */}
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
              <Link to="/dashboard/settings" className="quick-action">
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
