import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api/client.js';

function ShopCard({ shop }) {
  return (
    <Link to={`/shop/${shop.slug}`} className="shop-card">
      {/* Preview images strip */}
      <div className="shop-card__images">
        {shop.previewImages?.length > 0 ? (
          shop.previewImages.map((img, i) => (
            <img key={i} src={img} alt="" className="shop-card__preview-img" />
          ))
        ) : (
          <div className="shop-card__img-placeholder">
            <span className="material-symbols-outlined">storefront</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="shop-card__body">
        <img src={shop.logo} alt={shop.shopName} className="shop-card__logo" />
        <div className="shop-card__info">
          <h3 className="shop-card__name">{shop.shopName}</h3>
          {shop.location && (
            <p className="shop-card__location">
              <span className="material-symbols-outlined">location_on</span>
              {shop.location}
            </p>
          )}
          <div className="shop-card__meta">
            <span>{shop.productCount} product{shop.productCount !== 1 ? 's' : ''}</span>
            {shop.orderCount > 0 && (
              <span className="shop-card__sales">· {shop.orderCount} sale{shop.orderCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <span className="shop-card__cta">
          Visit shop
          <span className="material-symbols-outlined">arrow_forward</span>
        </span>
      </div>
    </Link>
  );
}

function ShopSection({ title, icon, shops, emptyText }) {
  if (shops.length === 0) return null;
  return (
    <section className="discover__section">
      <div className="discover__section-head">
        <span className="material-symbols-outlined">{icon}</span>
        <h2 className="heading-md">{title}</h2>
      </div>
      <div className="discover__grid">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </section>
  );
}

export default function DiscoverPage() {
  const [data, setData]       = useState({ featured: [], popular: [], newest: [] });
  const [isLoading, setLoad]  = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.getDiscover()           // GET /api/shops/discover
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  const isEmpty =
    !isLoading &&
    data.featured.length === 0 &&
    data.popular.length === 0 &&
    data.newest.length === 0;

  return (
    <div className="page-shell">
      <Navbar />

      <main className="discover">
        <div className="discover__hero">
          <h1 className="heading-lg">Discover Shops</h1>
          <p>Browse vendor storefronts. Find something you'll love.</p>
        </div>

        {error && (
          <div className="section-inner">
            <div className="banner banner--warning">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="full-page-loader" style={{ minHeight: '40vh' }}>
            <span className="spinner" />
            <p>Loading shops…</p>
          </div>
        ) : isEmpty ? (
          <div className="discover__empty">
            <span className="material-symbols-outlined">storefront</span>
            <h2 className="heading-md">No shops yet</h2>
            <p>Be the first to create one.</p>
            <Link to="/register" className="btn btn--primary">Create Your Shop</Link>
          </div>
        ) : (
          <div className="section-inner">
            <ShopSection title="Featured" icon="star" shops={data.featured} />
            <ShopSection title="Most Popular" icon="trending_up" shops={data.popular} />
            <ShopSection title="Newest Shops" icon="fiber_new" shops={data.newest} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
