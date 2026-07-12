import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SettingsPage() {
  const { shop, updateShop } = useAuth();
  const logoInputRef = useRef(null);

  const [form, setForm] = useState({
    shopName: '', bio: '', location: '', currency: '$', whatsappNumber: '', logo: '',
  });
  const [isSaving, setSaving] = useState(false);
  const [error,    setError]  = useState('');
  const [saved,    setSaved]  = useState(false);
  const [copied,   setCopied] = useState(false);

  // Pre-fill form whenever the shop loads or changes
  useEffect(() => {
    if (shop) {
      setForm({
        shopName:       shop.shopName       || '',
        bio:            shop.bio            || '',
        location:       shop.location       || '',
        currency:       shop.currency       || '$',
        whatsappNumber: shop.whatsappNumber || '',
        logo:           shop.logo           || '',
      });
    }
  }, [shop]);

  const set = (f) => (e) => {
    setSaved(false);
    setForm((p) => ({ ...p, [f]: e.target.value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setSaved(false); setForm((p) => ({ ...p, logo: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await updateShop({          // PATCH /api/shops/me
        ...form,
        whatsappNumber: form.whatsappNumber.replace(/[^0-9]/g, ''),
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/shop/${shop.slug}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!shop) return null;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">Settings</h1>
          <p className="page__subtitle">
            Update your shop profile. Changes appear on your storefront immediately.
          </p>
        </div>
      </header>

      {/* Store link */}
      <div className="dashboard__card dashboard__link-card">
        <div className="dashboard__link-info">
          <p className="field__label">Your storefront link (permanent)</p>
          <p className="dashboard__link-url">vendly.com/{shop.slug}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--pill"
            onClick={copyLink}
          >
            <span className="material-symbols-outlined">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <Link
            to={`/shop/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--sm btn--pill"
          >
            <span className="material-symbols-outlined">open_in_new</span>
            Visit
          </Link>
        </div>
      </div>

      {/* Profile form */}
      <section className="dashboard__card">
        <div className="dashboard__card-header">
          <span className="material-symbols-outlined dashboard__card-icon">storefront</span>
          <h2 className="heading-md">Shop Profile</h2>
        </div>

        <form className="product-form" onSubmit={handleSubmit} noValidate>
          {/* Logo + shop name side by side */}
          <div className="settings-identity">
            <button
              type="button"
              className="settings-avatar-btn"
              onClick={() => logoInputRef.current?.click()}
              aria-label="Change shop logo"
            >
              <img src={form.logo} alt="Shop logo" className="settings-avatar" />
              <span className="settings-avatar__edit">
                <span className="material-symbols-outlined">photo_camera</span>
              </span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={handleLogoUpload}
            />
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label" htmlFor="s-name">Shop Name</label>
              <input
                id="s-name"
                type="text"
                className="field__input"
                value={form.shopName}
                onChange={set('shopName')}
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="field">
            <label className="field__label" htmlFor="s-bio">Bio</label>
            <textarea
              id="s-bio"
              className="field__input field__textarea"
              rows={3}
              placeholder="Tell customers what makes your shop special…"
              value={form.bio}
              onChange={set('bio')}
            />
          </div>

          {/* Location + Currency */}
          <div className="product-form__row">
            <div className="field">
              <label className="field__label" htmlFor="s-location">Location</label>
              <input
                id="s-location"
                type="text"
                className="field__input"
                placeholder="City, Country"
                value={form.location}
                onChange={set('location')}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="s-currency">Currency Symbol</label>
              <input
                id="s-currency"
                type="text"
                className="field__input"
                maxLength={3}
                placeholder="$"
                value={form.currency}
                onChange={set('currency')}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="field">
            <label className="field__label" htmlFor="s-wa">WhatsApp Number</label>
            <input
              id="s-wa"
              type="text"
              className="field__input"
              placeholder="Country code + number, e.g. 15550123456"
              value={form.whatsappNumber}
              onChange={set('whatsappNumber')}
            />
            <p className="field__hint">
              Customers' orders are sent to this number via WhatsApp.
            </p>
          </div>

          {/* Errors / success */}
          {error && (
            <p className="field__error field__error--banner">{error}</p>
          )}
          {saved && (
            <div className="banner banner--success" style={{ margin: 0 }}>
              <span className="material-symbols-outlined">check_circle</span>
              Profile saved successfully.
            </div>
          )}

          <div className="product-form__actions">
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
