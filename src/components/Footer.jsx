import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="brand-mark">Vendly</Link>
          <p className="footer__tagline">
            Your shop, in one link. Built for micro-vendors everywhere.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <p className="footer__col-title">Platform</p>
            <Link to="/discover">Discover Shops</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Vendors</p>
            <Link to="/register">Create Shop</Link>
            <Link to="/login">Log In</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Legal</p>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {year} Vendly. All rights reserved.</p>
      </div>
    </footer>
  );
}
