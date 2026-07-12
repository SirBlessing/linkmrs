import React from 'react';
import { formatPrice } from '../utils.js';

export default function ProductCard({ product, currency, quantity, onAdd }) {
  return (
    <article className="storefront-card">
      <div className="storefront-card__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="storefront-card__img"
          loading="lazy"
        />
        {quantity > 0 && (
          <span className="storefront-card__badge">{quantity} in bag</span>
        )}
      </div>

      <div className="storefront-card__body">
        <div className="storefront-card__info">
          <h3 className="storefront-card__name">{product.name}</h3>
          <p className="storefront-card__desc">{product.description}</p>
        </div>
        <div className="storefront-card__footer">
          <span className="storefront-card__price">
            {formatPrice(product.price, currency)}
          </span>
          <button
            type="button"
            className="storefront-card__add"
            onClick={() => onAdd(product.id)}
            aria-label={`Add ${product.name} to bag`}
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
