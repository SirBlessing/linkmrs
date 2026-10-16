import React, { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const EXAMPLES = [
  'I sell handmade ankara bags and earrings in Lagos. My bags cost between ₦8,000 and ₦25,000.',
  'I bake custom cakes and chin chin in Abuja. I deliver within Abuja only.',
  'I sell fairly used laptops and phone accessories in Port Harcourt.',
];

export default function AiShopBuilder({ onDone }) {
  const { updateShop } = useAuth();

  const [step,        setStep]        = useState('input');   // input | preview | done
  const [description, setDescription] = useState('');
  const [preview,     setPreview]     = useState(null);
  const [generating,  setGenerating]  = useState(false);
  const [applying,    setApplying]    = useState(false);
  const [error,       setError]       = useState('');
  const [appliedCount, setCount]      = useState(0);

  const generate = async () => {
    if (!description.trim()) { setError('Describe your business first.'); return; }
    setError('');
    setGenerating(true);
    try {
      const data = await api.aiBuildShop({ description });
      setPreview(data);
      setStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const applyToShop = async () => {
    if (!preview) return;
    setApplying(true);
    setError('');

    let created = 0;

    // 1. Save the AI-generated bio
    try {
      await updateShop({ bio: preview.shopBio });
    } catch {
      // non-fatal — continue to products
    }

    // 2. Create each product one by one
    for (const p of preview.products) {
      try {
        await api.createProduct({
          name:        p.name,
          price:       p.price,
          description: p.description,
        });
        created += 1;
      } catch {
        // hit limit or other error — stop silently
        break;
      }
    }

    setCount(created);
    setApplying(false);
    setStep('done');
  };

  const editProduct = (index, field, value) => {
    setPreview((prev) => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === index ? { ...p, [field]: field === 'price' ? Number(value) : value } : p
      ),
    }));
  };

  const removeProduct = (index) => {
    setPreview((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="ai-builder">
      <div className="ai-builder__header">
        <span className="material-symbols-outlined ai-builder__icon">auto_awesome</span>
        <div>
          <h2 className="heading-md">AI Shop Builder</h2>
          <p>Describe your business in one paragraph. AI builds your shop for you.</p>
        </div>
      </div>

      {error && (
        <div className="banner banner--warning">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* ── Step 1: Input ── */}
      {step === 'input' && (
        <div className="ai-builder__step">
          <div className="field">
            <label className="field__label" htmlFor="ai-desc">
              Describe your business
            </label>
            <textarea
              id="ai-desc"
              className="field__input field__textarea"
              rows={4}
              placeholder="e.g. I sell handmade ankara bags and earrings in Lagos. My bags go from ₦8,000 to ₦25,000…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="ai-builder__examples">
            <p className="ai-builder__examples-label">Try an example:</p>
            <div className="ai-builder__examples-list">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="ai-quick-prompt"
                  onClick={() => setDescription(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={generate}
            disabled={generating || !description.trim()}
          >
            {generating ? (
              <>
                <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff', borderWidth: '2px' }} />
                Generating your shop…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate My Shop
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Step 2: Preview & Edit ── */}
      {step === 'preview' && preview && (
        <div className="ai-builder__step">
          <div className="ai-builder__preview-badge">
            <span className="material-symbols-outlined">check_circle</span>
            AI generated your shop — review and edit before publishing
          </div>

          {/* Bio preview */}
          <div className="field">
            <label className="field__label">Shop Bio (AI generated)</label>
            <textarea
              className="field__input field__textarea"
              rows={3}
              value={preview.shopBio}
              onChange={(e) => setPreview((p) => ({ ...p, shopBio: e.target.value }))}
            />
          </div>

          {/* Products preview */}
          <div className="ai-builder__products">
            <p className="field__label" style={{ marginBottom: '0.75rem' }}>
              Products ({preview.products.length})
            </p>
            {preview.products.map((product, i) => (
              <div className="ai-builder__product" key={i}>
                <div className="ai-builder__product-fields">
                  <input
                    type="text"
                    className="field__input"
                    value={product.name}
                    onChange={(e) => editProduct(i, 'name', e.target.value)}
                    placeholder="Product name"
                  />
                  <input
                    type="number"
                    className="field__input"
                    value={product.price}
                    onChange={(e) => editProduct(i, 'price', e.target.value)}
                    placeholder="Price"
                    style={{ maxWidth: '120px' }}
                  />
                </div>
                <textarea
                  className="field__input field__textarea"
                  rows={2}
                  value={product.description}
                  onChange={(e) => editProduct(i, 'description', e.target.value)}
                  placeholder="Description"
                />
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => removeProduct(i)}
                  aria-label="Remove product"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>

          <div className="ai-builder__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setStep('input')}
              disabled={applying}
            >
              ← Start over
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={applyToShop}
              disabled={applying}
            >
              {applying ? (
                <>
                  <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff', borderWidth: '2px' }} />
                  Publishing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Publish to My Shop
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && (
        <div className="ai-builder__done">
          <span className="material-symbols-outlined ai-builder__done-icon">rocket_launch</span>
          <h2 className="heading-md">Your shop is live!</h2>
          <p>
            Bio updated and <strong>{appliedCount} product{appliedCount !== 1 ? 's' : ''}</strong> added to your storefront.
          </p>
          <div className="ai-builder__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setStep('input'); setDescription(''); setPreview(null); }}
            >
              Build again
            </button>
            {onDone && (
              <button type="button" className="btn btn--primary" onClick={onDone}>
                <span className="material-symbols-outlined">open_in_new</span>
                View Storefront
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}