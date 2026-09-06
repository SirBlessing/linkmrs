import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function LandingPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__copy">
              <span className="eyebrow">Infrastructure for micro-vendors</span>
              <h1 className="hero__headline">Your shop,<br />in one link</h1>
              <p className="hero__sub">
                Empower your micro-business with a managed storefront, real-time
                inventory, and WhatsApp checkout — all from a single shareable link.
              </p>
              <div className="hero__actions">
                <Link to="/register" className="btn btn--primary btn--lg">
                  Start Selling Free
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link to="/discover" className="btn btn--ghost btn--lg">Browse Shops</Link>
              </div>
            </div>
            <div className="hero__visual" aria-hidden="true">
              <div className="hero__card">
                <div className="hero__card-header">
                  <span className="material-symbols-outlined">storefront</span>
                  <div>
                    <p className="hero__card-title">Studio Curate</p>
                    <p className="hero__card-url">linkmrs.com/studio-curate</p>
                  </div>
                </div>
                <div className="hero__card-stats">
                  <div className="hero__stat"><strong>₦124,000</strong><span>This week</span></div>
                  <div className="hero__stat"><strong>14</strong><span>Orders</span></div>
                  <div className="hero__stat"><strong>8/40</strong><span>Products</span></div>
                </div>
                <div className="hero__card-order">
                  <span className="material-symbols-outlined">chat</span>
                  <span>New order from Jane B.</span>
                  <span className="status-badge status-badge--pending">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features" id="features">
          <div className="section-inner">
            <div className="section-head">
              <h2 className="heading-lg">Built for modern commerce</h2>
              <p>Skip the social media clutter. A rock-solid framework your business needs to grow.</p>
            </div>
            <div className="bento-grid">
              <div className="bento-card bento-card--wide">
                <span className="material-symbols-outlined bento-card__icon">link</span>
                <h3 className="heading-md">One Link, Full Storefront</h3>
                <p>Turn your Instagram bio into a high-converting product page. Customers browse, add to bag, and order via WhatsApp — all in one place.</p>
              </div>
              <div className="bento-card bento-card--dark">
                <span className="material-symbols-outlined bento-card__icon">inventory_2</span>
                <h3 className="heading-md">Smart Inventory</h3>
                <p>Free plan gives you 5 products. Upgrade to Premium for up to 40. Add images, prices and descriptions — changes go live instantly.</p>
              </div>
              <div className="bento-card">
                <span className="material-symbols-outlined bento-card__icon">chat</span>
                <h3 className="heading-md">WhatsApp Checkout</h3>
                <p>Every order lands in your WhatsApp as a clean itemised summary. No payment gateway needed.</p>
              </div>
              <div className="bento-card bento-card--gold bento-card--wide">
                <span className="material-symbols-outlined bento-card__icon">bar_chart</span>
                <h3 className="heading-md">Real Analytics</h3>
                <p>Live sales totals, order volume and best-selling products — computed from your actual orders. No vanity numbers.</p>
              </div>
              <div className="bento-card">
                <span className="material-symbols-outlined bento-card__icon">explore</span>
                <h3 className="heading-md">Discover Directory</h3>
                <p>Your shop appears on the Linkmrs Discover page automatically so new customers can find you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-it-works">
          <div className="section-inner">
            <div className="section-head">
              <h2 className="heading-lg">Up and running in 3 steps</h2>
            </div>
            <div className="steps">
              <div className="step">
                <div className="step__number">1</div>
                <h3 className="heading-md">Create your shop</h3>
                <p>Sign up with your shop name and WhatsApp number. Get your unique link immediately.</p>
              </div>
              <div className="step">
                <div className="step__number">2</div>
                <h3 className="heading-md">Add your products</h3>
                <p>Upload photos, set prices, write descriptions. Your storefront updates in real time.</p>
              </div>
              <div className="step">
                <div className="step__number">3</div>
                <h3 className="heading-md">Share and sell</h3>
                <p>Drop your link in your Instagram bio or WhatsApp status. Orders arrive in your inbox.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="pricing" id="pricing">
          <div className="section-inner">
            <div className="section-head">
              <h2 className="heading-lg">Transparent pricing</h2>
              <p>No hidden fees. No credit card needed to start.</p>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card">
                <span className="pricing-card__tier">Free</span>
                <div className="pricing-card__price"><span>₦0</span>/forever</div>
                <ul className="pricing-card__list">
                  <li><span className="material-symbols-outlined">check_circle</span>Up to 5 products</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Single Linkmrs link</li>
                  <li><span className="material-symbols-outlined">check_circle</span>WhatsApp checkout</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Order management</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Basic analytics</li>
                  <li className="is-muted"><span className="material-symbols-outlined">block</span>Custom domain</li>
                </ul>
                <Link to="/register" className="btn btn--ghost btn--block">Get Started Free</Link>
              </div>
              <div className="pricing-card pricing-card--featured">
                <span className="pricing-card__badge">Popular</span>
                <span className="pricing-card__tier">Premium</span>
                <div className="pricing-card__price"><span>₦2,000</span>/month</div>
                <ul className="pricing-card__list">
                  <li><span className="material-symbols-outlined">check_circle</span>Up to 40 products</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Everything in Free</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Priority on Discover</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Premium badge</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Full analytics</li>
                  <li><span className="material-symbols-outlined">check_circle</span>Priority support</li>
                </ul>
                <Link to="/register" className="btn btn--secondary btn--block">Start Free, Upgrade Anytime</Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-band">
          <div className="section-inner cta-band__inner">
            <h2 className="heading-lg">Ready to start selling?</h2>
            <p>Join vendors already using Linkmrs. Free to start, no credit card required.</p>
            <Link to="/register" className="btn btn--primary btn--lg">
              Create Your Shop
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}