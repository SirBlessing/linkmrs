import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice } from '../../utils.js';

export default function AnalyticsPage() {
  const { shop } = useAuth();
  const [data,      setData]    = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error,     setError]   = useState('');

  useEffect(() => {
    api.getAnalytics()         // GET /api/analytics
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxDay     = data ? Math.max(1, ...data.ordersByDay.map((d) => d.count))  : 1;
  const maxProduct = data?.topProducts?.length
    ? Math.max(...data.topProducts.map((p) => p.quantity))
    : 1;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Analytics</h1>
          <p className="page__subtitle">
            Real numbers from your actual orders — updated live.
          </p>
        </div>
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
          {/* Summary stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-card__label">Total Revenue</span>
              <span className="stat-card__value">
                {formatPrice(data.totalSales, shop?.currency)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Total Orders</span>
              <span className="stat-card__value">{data.totalOrders}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Completed</span>
              <span className="stat-card__value">{data.completedCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Pending</span>
              <span className="stat-card__value stat-card__value--warn">
                {data.pendingCount}
              </span>
            </div>
          </div>

          {/* Orders last 7 days — bar chart */}
          <section className="dashboard__card">
            <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>
              Orders — last 7 days
            </h2>
            <div className="bar-chart">
              {data.ordersByDay.map((day) => (
                <div className="bar-chart__col" key={day.date}>
                  <div className="bar-chart__track">
                    <div
                      className="bar-chart__fill"
                      style={{ height: `${(day.count / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="bar-chart__value">{day.count}</span>
                  <span className="bar-chart__label">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Top products */}
          <section className="dashboard__card">
            <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>
              Top Products
            </h2>

            {data.topProducts.length === 0 ? (
              <p className="dashboard__empty">
                No sales recorded yet. Orders from your storefront will appear here.
              </p>
            ) : (
              <div className="top-products">
                {data.topProducts.map((product, i) => (
                  <div className="top-product-row" key={product.name}>
                    <div className="top-product-row__head">
                      <div className="top-product-row__name">
                        <span className="top-product-row__rank">#{i + 1}</span>
                        {product.name}
                      </div>
                      <div className="top-product-row__stats">
                        <span>{product.quantity} sold</span>
                        <strong>{formatPrice(product.revenue, shop?.currency)}</strong>
                      </div>
                    </div>
                    <div className="top-product-row__track">
                      <div
                        className="top-product-row__fill"
                        style={{ width: `${(product.quantity / maxProduct) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Status breakdown */}
          <section className="dashboard__card">
            <h2 className="heading-md" style={{ marginBottom: '1rem' }}>
              Order Status Breakdown
            </h2>
            <div className="status-breakdown">
              {[
                { label: 'Pending',   value: data.pendingCount,   cls: 'pending'   },
                { label: 'Shipped',   value: data.shippedCount,   cls: 'shipped'   },
                { label: 'Completed', value: data.completedCount, cls: 'completed' },
              ].map((s) => (
                <div className="status-breakdown__row" key={s.label}>
                  <span className={`status-badge status-badge--${s.cls}`}>{s.label}</span>
                  <div className="status-breakdown__bar-wrap">
                    <div
                      className="status-breakdown__bar"
                      style={{
                        width: data.totalOrders
                          ? `${(s.value / data.totalOrders) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <span className="status-breakdown__count">{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
