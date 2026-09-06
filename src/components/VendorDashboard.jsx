import React, { useRef, useState } from 'react';
import ProductForm from './ProductForm.jsx';
import ProductListItem from './ProductListItem.jsx';
import ShopProfileCard from './ShopProfileCard.jsx';
import PhonePreview from './PhonePreview.jsx';
import BottomNav from './BottomNav.jsx';
import { MAX_PRODUCTS } from '../data/initialData.js';

export default function VendorDashboard({
  products,
  shopProfile,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateProfile,
  onPreviewAddToCart,
  previewCart,
  onGoToStorefront
}) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [limitNotice, setLimitNotice] = useState('');
  const profileRef = useRef(null);
  const formSectionRef = useRef(null);

  const isLimitReached = products.length >= MAX_PRODUCTS;

  const openAddForm = () => {
    if (isLimitReached) {
      setLimitNotice(`You\u2019ve reached the ${MAX_PRODUCTS}-product limit on the Free plan. Delete a product to add a new one.`);
      setTimeout(() => setLimitNotice(''), 3500);
      return;
    }
    setEditingProduct(null);
    setFormOpen(true);
    formSectionRef.current && formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
    formSectionRef.current && formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (data) => {
    const result = editingProduct
      ? onUpdateProduct(editingProduct.id, data)
      : onAddProduct(data);

    if (!result.ok) {
      setLimitNotice(result.message);
      setTimeout(() => setLimitNotice(''), 3500);
      return;
    }
    closeForm();
  };

  const handleDelete = (id) => {
    const product = products.find((p) => p.id === id);
    const confirmed = window.confirm(`Remove "${product ? product.name : 'this product'}" from your shop?`);
    if (confirmed) onDeleteProduct(id);
  };

  const scrollToProfile = () => {
    profileRef.current && profileRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItems = [
    { key: 'home', icon: 'dashboard', label: 'Home', onClick: () => {} },
    { key: 'store', icon: 'storefront', label: 'Store', onClick: onGoToStorefront },
    { key: 'orders', icon: 'receipt_long', label: 'Orders', onClick: () => {} },
    { key: 'profile', icon: 'person', label: 'Profile', onClick: scrollToProfile }
  ];

  return (
    <div className="dashboard">
      {/* Desktop sidebar */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__sidebar-brand">
          <h1 className="brand-mark">Linkmrs</h1>
          <p className="dashboard__sidebar-tagline">Global Micro-Vendor</p>
        </div>

        <nav className="dashboard__sidebar-nav">
          <a className="sidebar-link" href="#dashboard-overview" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </a>
          <a className="sidebar-link sidebar-link--active" href="#products" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">inventory_2</span> Products
          </a>
          <a className="sidebar-link" href="#orders" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">shopping_cart</span> Orders
          </a>
          <a className="sidebar-link" href="#analytics" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">bar_chart</span> Analytics
          </a>
          <a className="sidebar-link" href="#settings" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">settings</span> Settings
          </a>
        </nav>

        <div className="dashboard__sidebar-footer">
          <button type="button" className="btn btn--primary btn--block" onClick={scrollToProfile}>
            View Store Link
          </button>
          <div className="dashboard__sidebar-meta">
            <a className="sidebar-link sidebar-link--muted" href="#help" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">help</span> Help
            </a>
            <a className="sidebar-link sidebar-link--muted" href="#storefront" onClick={(e) => { e.preventDefault(); onGoToStorefront(); }}>
              <span className="material-symbols-outlined">open_in_new</span> View Storefront
            </a>
          </div>
        </div>
      </aside>

      {/* Main canvas */}
      <main className="dashboard__main">
        <header className="dashboard__header">
          <div>
            <h2 className="heading-lg">Inventory Management</h2>
            <p className="dashboard__header-subtitle">Manage your catalog and sales links.</p>
          </div>
          <div className="dashboard__header-actions">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button type="button" className="dashboard__header-avatar" onClick={scrollToProfile} aria-label="Shop profile">
              <img src={shopProfile.logo} alt="" />
            </button>
          </div>
        </header>

        {limitNotice && (
          <div className="banner banner--warning" role="alert">
            <span className="material-symbols-outlined">error</span>
            {limitNotice}
          </div>
        )}

        <section className="dashboard__card" ref={profileRef} id="profile">
          <div className="dashboard__card-header">
            <span className="material-symbols-outlined dashboard__card-icon">storefront</span>
            <h3 className="heading-md">Shop Profile</h3>
          </div>
          <ShopProfileCard shopProfile={shopProfile} onUpdateProfile={onUpdateProfile} />
        </section>

        <section className="dashboard__card" ref={formSectionRef}>
          <div className="dashboard__card-header dashboard__card-header--split">
            <div className="dashboard__card-header">
              <span className="material-symbols-outlined dashboard__card-icon">
                {editingProduct ? 'edit' : 'add_circle'}
              </span>
              <h3 className="heading-md">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            </div>
            <button type="button" className="btn btn--primary btn--desktop-only" onClick={openAddForm}>
              <span className="material-symbols-outlined">add</span>
              New Product
            </button>
          </div>

          <div className="dashboard__inline-form">
            <ProductForm
              isOpen
              onClose={closeForm}
              onSubmit={handleSubmit}
              editingProduct={editingProduct}
              currency={shopProfile.currency}
              isLimitReached={isLimitReached}
            />
          </div>
        </section>

        <section className="dashboard__card dashboard__card--list">
          <div className="dashboard__card-header dashboard__card-header--split">
            <h3 className="heading-md">Active Products</h3>
            <span className="pill-counter">{products.length} of {MAX_PRODUCTS} slots used</span>
          </div>

          {products.length === 0 ? (
            <p className="dashboard__empty">No products yet. Tap \u201cNew Product\u201d to add your first item.</p>
          ) : (
            <div className="product-list">
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  currency={shopProfile.currency}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Desktop-only live preview */}
      <PhonePreview products={products} shopProfile={shopProfile} cart={previewCart} />

      {/* Mobile-only floating action button */}
      <button type="button" className="fab" onClick={openAddForm} aria-label="Add new product">
        <span className="material-symbols-outlined">add</span>
      </button>

      <BottomNav items={navItems} activeKey="home" />

      {/* Mobile bottom-sheet form (also renders the backdrop) */}
      <div className="dashboard__mobile-form">
        <ProductForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          currency={shopProfile.currency}
          isLimitReached={isLimitReached}
        />
      </div>
    </div>
  );
}
