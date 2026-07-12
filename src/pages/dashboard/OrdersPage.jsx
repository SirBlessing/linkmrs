import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice, formatDate, STATUS_LABELS } from '../../utils.js';

const FILTERS = [
  { key: '',          label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped',   label: 'Shipped'   },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// What the next status action should be for each current status
const NEXT_STATUS = {
  pending:   'confirmed',
  confirmed: 'shipped',
  shipped:   'completed',
};
const NEXT_LABEL = {
  pending:   'Confirm',
  confirmed: 'Mark Shipped',
  shipped:   'Mark Completed',
};

export default function OrdersPage() {
  const { shop } = useAuth();
  const [orders,     setOrders]  = useState([]);
  const [loading,    setLoading] = useState(true);
  const [error,      setError]   = useState('');
  const [filter,     setFilter]  = useState('');
  const [updatingId, setUpdId]   = useState(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    api.listOrders(filter || undefined)   // GET /api/orders?status=...
      .then((d) => live && setOrders(d.orders))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [filter]);

  const changeStatus = async (id, status) => {
    setUpdId(id);
    try {
      const { order } = await api.updateOrderStatus(id, status); // PATCH /api/orders/:id/status
      setOrders((prev) => prev.map((o) => o.id === order.id ? order : o));
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdId(null);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Orders</h1>
          <p className="page__subtitle">
            Manage and fulfil orders placed through your storefront.
          </p>
        </div>
      </header>

      {error && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            type="button"
            className={`filter-tab${filter === f.key ? ' is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="dashboard__card dashboard__card--list">
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : orders.length === 0 ? (
          <p className="dashboard__empty">No orders in this view.</p>
        ) : (
          <div className="order-list order-list--detailed">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                {/* Top row — customer + status */}
                <div className="order-card__top">
                  <div>
                    <p className="order-card__customer">
                      {order.customerName || 'Anonymous customer'}
                    </p>
                    <p className="order-card__meta">
                      {formatDate(order.createdAt)}
                      {order.customerPhone ? ` · ${order.customerPhone}` : ''}
                    </p>
                  </div>
                  <span className={`status-badge status-badge--${order.status}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Line items */}
                <ul className="order-card__items">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      <span>{item.quantity}× {item.name}</span>
                      <span>{formatPrice(item.lineTotal, order.currency)}</span>
                    </li>
                  ))}
                </ul>

                {/* Customer note */}
                {order.note && (
                  <p className="order-card__note">"{order.note}"</p>
                )}

                {/* Bottom row — total + actions */}
                <div className="order-card__bottom">
                  <span className="order-card__total">
                    Total: <strong>{formatPrice(order.total, order.currency)}</strong>
                  </span>
                  <div className="order-card__actions">
                    {/* WhatsApp the customer */}
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--ghost btn--sm"
                      >
                        <span className="material-symbols-outlined">chat</span>
                        WhatsApp
                      </a>
                    )}
                    {/* Cancel */}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={updatingId === order.id}
                        onClick={() => changeStatus(order.id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    )}
                    {/* Advance status */}
                    {NEXT_STATUS[order.status] && (
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={updatingId === order.id}
                        onClick={() => changeStatus(order.id, NEXT_STATUS[order.status])}
                      >
                        {updatingId === order.id ? 'Saving…' : NEXT_LABEL[order.status]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
