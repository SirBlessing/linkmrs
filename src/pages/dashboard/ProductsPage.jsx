import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ProductForm from '../../components/ProductForm.jsx';
import ProductListItem from '../../components/ProductListItem.jsx';

export default function ProductsPage() {
  const { shop } = useAuth();

  const [products,   setProducts] = useState([]);
  const [limit,      setLimit]    = useState(5);
  const [loading,    setLoading]  = useState(true);
  const [loadErr,    setLoadErr]  = useState('');
  const [editing,    setEditing]  = useState(null);
  const [formErr,    setFormErr]  = useState('');
  const [showUpgradeBanner, setShowUpgrade] = useState(false);
  const [deletingId, setDel]      = useState(null);

  const now       = new Date();
  const isPremium = shop?.plan === 'premium' && shop?.planExpiresAt && new Date(shop.planExpiresAt) > now;

  const load = () => {
    setLoading(true);
    api.listProducts()
      .then((d) => { setProducts(d.products); setLimit(d.limit); })
      .catch((e) => setLoadErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (payload) => {
    setFormErr(''); setShowUpgrade(false);
    try {
      if (editing) {
        const { product } = await api.updateProduct(editing.id || editing._id, payload);
        setProducts((p) => p.map((x) => (x.id || x._id) === (product.id || product._id) ? product : x));
        setEditing(null);
      } else {
        const { product } = await api.createProduct(payload);
        setProducts((p) => [product, ...p]);
      }
    } catch (e) {
      if (e.showUpgrade) setShowUpgrade(true);
      setFormErr(e.message);
      throw e;
    }
  };

  const handleDelete = async (id) => {
    const p = products.find((x) => (x.id || x._id) === id);
    if (!window.confirm(`Remove "${p?.name || 'this product'}"?`)) return;
    setDel(id);
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((x) => (x.id || x._id) !== id));
      if ((editing?.id || editing?._id) === id) setEditing(null);
    } catch (e) {
      setLoadErr(e.message);
    } finally {
      setDel(null);
    }
  };

  const atLimit = products.length >= limit;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Products</h1>
          <p className="page__subtitle">
            {isPremium
              ? `Premium plan — up to ${limit} products.`
              : `Free plan — up to ${limit} products.`}
          </p>
        </div>
        <span className="pill-counter">{products.length} / {limit}</span>
      </header>

      {loadErr && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>{loadErr}
        </div>
      )}

      {/* Upgrade prompt when free user hits the limit */}
      {showUpgradeBanner && !isPremium && (
        <div className="upgrade-banner">
          <div className="upgrade-banner__left">
            <span className="material-symbols-outlined">workspace_premium</span>
            <div>
              <p className="upgrade-banner__title">You've reached your 5-product limit</p>
              <p className="upgrade-banner__sub">
                Upgrade to Premium for <strong>₦2,000/month</strong> and list up to <strong>40 products</strong>.
              </p>
            </div>
          </div>
          <Link to="/dashboard/upgrade" className="btn btn--primary btn--sm btn--pill">
            Upgrade Now
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Subtle banner before hitting limit (1 slot left) */}
      {!atLimit && products.length === limit - 1 && !isPremium && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">info</span>
          You have <strong>1 product slot left</strong> on the Free plan.{' '}
          <Link to="/dashboard/upgrade">Upgrade to Premium</Link> to add up to 40.
        </div>
      )}

      {/* Add/Edit form */}
      <section className="dashboard__card">
        <div className="dashboard__card-header">
          <span className="material-symbols-outlined dashboard__card-icon">
            {editing ? 'edit' : 'add_circle'}
          </span>
          <h2 className="heading-md">{editing ? 'Edit Product' : 'Add New Product'}</h2>
        </div>

        {!editing && atLimit ? (
          <div className="limit-reached">
            <span className="material-symbols-outlined limit-reached__icon">inventory_2</span>
            <p className="limit-reached__text">
              {isPremium
                ? `You've reached the ${limit}-product Premium limit.`
                : `You've reached the ${limit}-product Free limit.`}
            </p>
            {!isPremium && (
              <Link to="/dashboard/upgrade" className="btn btn--primary">
                <span className="material-symbols-outlined">workspace_premium</span>
                Upgrade to Premium — ₦2,000/month
              </Link>
            )}
          </div>
        ) : (
          <ProductForm
            editingProduct={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setEditing(null); setFormErr(''); setShowUpgrade(false); }}
            currency={shop?.currency || '₦'}
            serverError={formErr}
          />
        )}
      </section>

      {/* Product list */}
      <section className="dashboard__card dashboard__card--list">
        <div className="dashboard__card-header">
          <h2 className="heading-md">Active Products</h2>
        </div>
        {loading ? (
          <div className="page__loading"><span className="spinner" /></div>
        ) : products.length === 0 ? (
          <p className="dashboard__empty">No products yet. Add your first item using the form above.</p>
        ) : (
          <div className="product-list">
            {products.map((p) => (
              <ProductListItem
                key={p.id || p._id}
                product={p}
                currency={shop?.currency || '₦'}
                onEdit={(prod) => {
                  setEditing(prod); setFormErr(''); setShowUpgrade(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={() => handleDelete(p.id || p._id)}
                isDeleting={deletingId === (p.id || p._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}