import React, { useEffect, useRef, useState } from 'react';

const EMPTY = { name: '', price: '', description: '', image: '' };

export default function ProductForm({
  editingProduct,
  onSubmit,
  onCancel,
  currency = '$',
  serverError,
}) {
  const [form,       setForm]  = useState(EMPTY);
  const [errors,     setErrors] = useState({});
  const [submitting, setSub]    = useState(false);
  const fileRef = useRef(null);
  const isEditing = Boolean(editingProduct);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name:        editingProduct.name        || '',
        price:       String(editingProduct.price ?? ''),
        description: editingProduct.description || '',
        image:       editingProduct.image       || '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editingProduct]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                               errs.name        = 'Product name is required.';
    if (!form.price || isNaN(+form.price) || +form.price <= 0) errs.price = 'Enter a valid price above 0.';
    if (!form.description.trim())                        errs.description = 'Add a short description.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSub(true);
    try {
      await onSubmit({
        name:        form.name.trim(),
        price:       Number(form.price),
        description: form.description.trim(),
        image:       form.image || undefined,
      });
      setForm(EMPTY);
      setErrors({});
    } catch {
      // serverError prop will show the API error message
    } finally {
      setSub(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="product-form__row">
        {/* Name */}
        <div className="field">
          <label className="field__label" htmlFor="pf-name">Product Name</label>
          <input
            id="pf-name"
            type="text"
            className={`field__input${errors.name ? ' has-error' : ''}`}
            placeholder="e.g. Handcrafted Candle"
            value={form.name}
            onChange={set('name')}
          />
          {errors.name && <p className="field__error">{errors.name}</p>}
        </div>

        {/* Price */}
        <div className="field">
          <label className="field__label" htmlFor="pf-price">Price ({currency})</label>
          <div className="field__prefix-wrap">
            <span className="field__prefix">{currency}</span>
            <input
              id="pf-price"
              type="number"
              min="0"
              step="0.01"
              className={`field__input field__input--prefixed${errors.price ? ' has-error' : ''}`}
              placeholder="0.00"
              value={form.price}
              onChange={set('price')}
            />
          </div>
          {errors.price && <p className="field__error">{errors.price}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="field">
        <label className="field__label" htmlFor="pf-desc">Description</label>
        <textarea
          id="pf-desc"
          className={`field__input field__textarea${errors.description ? ' has-error' : ''}`}
          rows={3}
          placeholder="Describe what makes this product special…"
          value={form.description}
          onChange={set('description')}
        />
        {errors.description && <p className="field__error">{errors.description}</p>}
      </div>

      {/* Image upload */}
      <div className="field">
        <span className="field__label">Product Image (optional)</span>
        <button
          type="button"
          className="dropzone"
          onClick={() => fileRef.current?.click()}
        >
          {form.image ? (
            <img src={form.image} alt="Preview" className="dropzone__preview" />
          ) : (
            <>
              <span className="material-symbols-outlined dropzone__icon">cloud_upload</span>
              <p className="dropzone__label">Click to upload a photo</p>
              <p className="dropzone__hint">PNG, JPG — a placeholder is used if left blank</p>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleImage}
        />
      </div>

      {/* Server-level error (e.g. product cap) */}
      {serverError && (
        <p className="field__error field__error--banner">{serverError}</p>
      )}

      <div className="product-form__actions">
        {isEditing && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
