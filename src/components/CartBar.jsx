import React from 'react';
import { formatPrice } from '../utils.js';

export default function CartBar({ totalItems, totalPrice, currency, onOpenCart }) {
  return (
    <div className={`cart-bar${totalItems > 0 ? ' is-visible' : ''}`}>
      <button type="button" className="cart-bar__inner" onClick={onOpenCart}>
        <div className="cart-bar__icon-wrap">
          <span className="material-symbols-outlined">shopping_bag</span>
          {totalItems > 0 && (
            <span className="cart-bar__count">{totalItems}</span>
          )}
        </div>
        <div className="cart-bar__text">
          <span className="cart-bar__items">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in bag
          </span>
          <span className="cart-bar__total">
            {formatPrice(totalPrice, currency)}
          </span>
        </div>
        <span className="material-symbols-outlined cart-bar__chevron">
          expand_less
        </span>
      </button>

      <button
        type="button"
        className="cart-bar__checkout"
        onClick={onOpenCart}
      >
        <span className="material-symbols-outlined">chat</span>
        Order via WhatsApp
      </button>
    </div>
  );
}
