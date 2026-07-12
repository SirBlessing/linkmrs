import React from 'react';
import { formatPrice } from '../utils.js';

export default function CartSheet({
  isOpen, onClose,
  lineItems, totalItems, totalPrice, currency,
  onIncrement, onDecrement,
  customerName, customerPhone,
  onCustomerNameChange, onCustomerPhoneChange,
  onCheckout, isPlacingOrder, checkoutError,
}) {
  return (
    <>
      <div
        className={`sheet-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`cart-sheet${isOpen ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Your bag">
        <div className="sheet-handle" aria-hidden="true" />

        <div className="cart-sheet__header">
          <h2 className="heading-md">Your Bag</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {lineItems.length === 0 ? (
          <p className="cart-sheet__empty">
            Your bag is empty. Add a product to get started.
          </p>
        ) : (
          <>
            {/* Line items */}
            <ul className="cart-sheet__list">
              {lineItems.map((item) => (
                <li className="cart-line" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-line__img" />
                  <div className="cart-line__info">
                    <p className="cart-line__name">{item.name}</p>
                    <p className="cart-line__price">
                      {formatPrice(item.price, currency)} each
                    </p>
                  </div>
                  <div className="cart-line__qty">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onDecrement(item.id)}
                      aria-label={`Remove one ${item.name}`}
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="qty-btn__value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onIncrement(item.id)}
                      aria-label={`Add another ${item.name}`}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Customer contact (optional) */}
            <div className="cart-sheet__contact">
              <div className="field">
                <label className="field__label" htmlFor="cs-name">
                  Your name <span className="field__optional">(optional)</span>
                </label>
                <input
                  id="cs-name"
                  type="text"
                  className="field__input"
                  placeholder="So the seller knows who's ordering"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="cs-phone">
                  Phone <span className="field__optional">(optional)</span>
                </label>
                <input
                  id="cs-phone"
                  type="text"
                  className="field__input"
                  placeholder="For delivery follow-up"
                  value={customerPhone}
                  onChange={(e) => onCustomerPhoneChange(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {checkoutError && (
          <p className="field__error field__error--banner">{checkoutError}</p>
        )}

        <div className="cart-sheet__footer">
          <div className="cart-sheet__total-row">
            <span>Total ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            <span className="cart-sheet__total-value">
              {formatPrice(totalPrice, currency)}
            </span>
          </div>
          <button
            type="button"
            className="btn btn--secondary btn--block"
            disabled={lineItems.length === 0 || isPlacingOrder}
            onClick={onCheckout}
          >
            <span className="material-symbols-outlined">chat</span>
            {isPlacingOrder ? 'Placing order…' : 'Send Order via WhatsApp'}
          </button>
        </div>
      </div>
    </>
  );
}
