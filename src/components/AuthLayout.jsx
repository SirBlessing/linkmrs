import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout">
      {/* Left side — brand panel (desktop only) */}
      <aside className="auth-layout__brand">
        <Link to="/" className="auth-layout__brand-logo">Vendly</Link>
        <div className="auth-layout__brand-copy">
          <h1>Empowering the next generation of commerce.</h1>
          <p>
            Everything you need to turn your passion into a professional
            business. Simple. Scalable. Yours.
          </p>
        </div>
        <div className="auth-layout__brand-stats">
          <div className="auth-layout__stat">
            <strong>Free</strong>
            <span>to start</span>
          </div>
          <div className="auth-layout__stat">
            <strong>10</strong>
            <span>products free</span>
          </div>
          <div className="auth-layout__stat">
            <strong>0</strong>
            <span>payment gateway needed</span>
          </div>
        </div>
      </aside>

      {/* Right side — form panel */}
      <section className="auth-layout__panel">
        <Link to="/" className="auth-layout__mobile-brand">Vendly</Link>

        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-card__tabs">
            <NavLink
              to="/login"
              className={({ isActive }) => `auth-card__tab${isActive ? ' is-active' : ''}`}
            >
              Log In
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `auth-card__tab${isActive ? ' is-active' : ''}`}
            >
              Register
            </NavLink>
          </div>

          <div className="auth-card__header">
            <h2 className="heading-md">{title}</h2>
            <p>{subtitle}</p>
          </div>

          {children}
        </div>

        <p className="auth-layout__footer-note">
          By continuing you agree to our{' '}
          <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </div>
  );
}
