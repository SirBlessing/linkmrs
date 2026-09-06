import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">About Linkmrs</h1>
          <p>We built the storefront tool we wished existed when we were starting out.</p>
        </div>

        <div className="static-page__body">
          <section className="static-section">
            <h2 className="heading-md">Our mission</h2>
            <p>
              Linkmrs exists to give micro-entrepreneurs — the seamstress in Lagos, the
              ceramics maker in London, the coffee roaster in Nairobi — the same
              commerce infrastructure that large brands take for granted. A clean
              storefront, structured orders, and real analytics. No bloated SaaS
              subscriptions, no design degree required.
            </p>
          </section>

          <section className="static-section">
            <h2 className="heading-md">How it works</h2>
            <div className="steps steps--compact">
              <div className="step">
                <div className="step__number">1</div>
                <div>
                  <h3>Create your shop</h3>
                  <p>Register in 60 seconds. You get a unique link instantly — <strong>Linkmrs.com/your-shop-name</strong>.</p>
                </div>
              </div>
              <div className="step">
                <div className="step__number">2</div>
                <div>
                  <h3>Add your products</h3>
                  <p>Upload photos, set prices, write descriptions. Your live storefront updates as you type.</p>
                </div>
              </div>
              <div className="step">
                <div className="step__number">3</div>
                <div>
                  <h3>Share and sell</h3>
                  <p>Drop your link in your Instagram bio or WhatsApp status. Orders land directly in your WhatsApp inbox.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="static-section">
            <h2 className="heading-md">Why WhatsApp checkout?</h2>
            <p>
              For most micro-vendors, WhatsApp is already where business happens. Customers
              message you, you confirm stock, you arrange delivery. Linkmrs doesn't break that
              flow — it makes it structured. Every order arrives as a clean, itemised message
              with customer details and a total. No payment gateway friction, no abandoned
              carts on complicated checkout pages.
            </p>
          </section>

          <section className="static-section static-section--cta">
            <h2 className="heading-md">Ready to start?</h2>
            <p>Free to use. No credit card. Your shop is live in under two minutes.</p>
            <div className="static-section__actions">
              <Link to="/register" className="btn btn--primary btn--lg">
                Create Your Shop
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/discover" className="btn btn--ghost btn--lg">
                Browse Shops
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
