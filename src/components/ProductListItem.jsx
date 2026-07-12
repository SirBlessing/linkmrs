import React from 'react';
import { formatPrice } from '../utils.js';

export default function ProductListItem({ product, currency, onEdit, onDelete, isDeleting }) {
  return (
    <div className="product-row">
      <div className="product-row__img">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-row__info">
        <p className="product-row__name">{product.name}</p>
        <p className="product-row__desc">{product.description}</p>
      </div>

      <p className="product-row__price">{formatPrice(product.price, currency)}</p>

      <div className="product-row__actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={`Edit ${product.name}`}
          onClick={() => onEdit(product)}
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          aria-label={`Delete ${product.name}`}
          onClick={() => onDelete(product.id)}
          disabled={isDeleting}
        >
          <span className="material-symbols-outlined">
            {isDeleting ? 'hourglass_top' : 'delete'}
          </span>
        </button>
      </div>
    </div>
  );
}
