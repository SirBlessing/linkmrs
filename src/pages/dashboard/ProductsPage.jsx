import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ProductForm from '../../components/ProductForm.jsx';
import ProductListItem from '../../components/ProductListItem.jsx';

const MAX = 10;

export default function ProductsPage() {
  const { shop } = useAuth();
  const [products,   setProducts] = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [loadErr,    setLoadErr]  = useState('');
  const [editing,    setEditing]  = useState(null);
  const [formErr,    setFormErr]  = useState('');
  const [deletingId, setDel]      = useState(null);

  const load = () => {
    setLoading(true);
    api.listProducts()                    // GET /api/products
      .then((d) => setProducts(d.products))
      .catch((e) => setLoadErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (payload) => {
    setFormErr('');
    try {
      if (editing) {
        const { product } = await api.updateProduct(editing.id, payload); // PUT /api/products/:id
        setProducts((p) => p.map((x) => x.id === product.id ? product : x));
        setEditing(null);
      } else {
        const { product } = await api.createProduct(payload);             // POST /api/products
        setProducts((p) => [product, ...p]);
      }
    } catch (e) {
      setFormErr(e.message);
      throw e; // keep form open so user sees the error
    }
  };

  const handleDelete = async (id) => {
    const p = products.find((x) => x.id === id);
    if (!window.confirm(`Remove "${p?.name || 'this product'}" from your shop?`)) return;
    setDel(id);
    try {
      await api.deleteProduct(id);          // DELETE /api/products/:id
      setProducts((prev) => prev.filter((x) => x.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      setLoadErr(e.message);
    } finally {
      setDel(null);
    }
  };

  const startEdit = (product) => {
    setEditing(product);
    setFormErr('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditing(null); setFormErr(''); };

  const atLimit = products.length >= MAX;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Products</h1>
          <p className="page__subtitle">
            Manage your catalogue. Up to {MAX} products on the Free plan.
          </p>
        </div>
        <span className="pill-counter">{products.length} / {MAX}</span>
      </header>

      {loadErr && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>
          {loadErr}
        </div>
      )}

      {/* Add / Edit form */}
      <section className="dashboard__card">
        <div className="dashboard__card-header">
          <span className="material-symbols-outlined dashboard__card-icon">
            {editing ? 'edit' : 'add_circle'}
          </span>
          <h2 className="heading-md">
            {editing ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        {!editing && atLimit ? (
          <p className="dashboard__empty">
            You've reached the {MAX}-product limit on the Free plan.
            Delete a product to add a new one.
          </p>
        ) : (
          <ProductForm
            editingProduct={editing}
            onSubmit={handleSubmit}
            onCancel={cancelEdit}
            currency={shop?.currency || '$'}
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
          <p className="dashboard__empty">
            No products yet. Add your first item using the form above.
          </p>
        ) : (
          <div className="product-list">
            {products.map((p) => (
              <ProductListItem
                key={p.id}
                product={p}
                currency={shop?.currency || '$'}
                onEdit={startEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === p.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
