import React, { useRef, useState } from 'react';
import { buildStoreUrl } from '../utils.js';

export default function ShopProfileCard({ shopProfile, onUpdateProfile }) {
  const [copied, setCopied] = useState(false);
  const logoInputRef = useRef(null);
  const storeUrl = buildStoreUrl(shopProfile.shopName);

  const handleCopy = async () => {
    const fullUrl = `https://${storeUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch (err) {
      // Clipboard API can be unavailable (e.g. insecure context) - fail silently,
      // the link text is still visible and selectable for manual copying.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdateProfile({ logo: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-card">
      <div className="profile-card__identity">
        <button
          type="button"
          className="profile-card__avatar-btn"
          onClick={() => logoInputRef.current && logoInputRef.current.click()}
          aria-label="Change shop logo"
        >
          <img src={shopProfile.logo} alt={`${shopProfile.shopName} logo`} className="profile-card__avatar" />
          <span className="profile-card__avatar-edit material-symbols-outlined">photo_camera</span>
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleLogoUpload}
        />

        <div className="profile-card__fields">
          <label className="field__label" htmlFor="shop-name">Shop Name</label>
          <input
            id="shop-name"
            className="field__input"
            type="text"
            value={shopProfile.shopName}
            onChange={(e) => onUpdateProfile({ shopName: e.target.value })}
          />
        </div>
      </div>

      <div className="profile-card__grid">
        <div className="field">
          <label className="field__label" htmlFor="shop-bio">Bio</label>
          <textarea
            id="shop-bio"
            className="field__input field__textarea"
            rows={2}
            value={shopProfile.bio}
            onChange={(e) => onUpdateProfile({ bio: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="shop-location">Location</label>
          <input
            id="shop-location"
            className="field__input"
            type="text"
            value={shopProfile.location}
            onChange={(e) => onUpdateProfile({ location: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="shop-currency">Currency Symbol</label>
          <input
            id="shop-currency"
            className="field__input"
            type="text"
            maxLength={3}
            value={shopProfile.currency}
            onChange={(e) => onUpdateProfile({ currency: e.target.value || '$' })}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="shop-whatsapp">WhatsApp Number</label>
          <input
            id="shop-whatsapp"
            className="field__input"
            type="text"
            placeholder="Country code + number, e.g. 15550123456"
            value={shopProfile.whatsappNumber}
            onChange={(e) => onUpdateProfile({ whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
          />
        </div>
      </div>

      <div className="profile-card__link">
        <div className="profile-card__link-text">
          <span className="field__label">Store Link</span>
          <span className="profile-card__link-url">{storeUrl}</span>
        </div>
        <button type="button" className="btn btn--primary btn--pill" onClick={handleCopy}>
          <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
