import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const FREE_FEATURES = [
  { icon: 'check_circle', text: 'One Vendly storefront link' },
  { icon: 'check_circle', text: 'Up to 10 products' },
  { icon: 'check_circle', text: 'WhatsApp checkout' },
  { icon: 'check_circle', text: 'Order management dashboard' },
  { icon: 'check_circle', text: 'Basic analytics' },
  { icon: 'check_circle', text: 'Listed on Discover' },
  { icon: 'block',        text: 'Custom domain', muted: true },
  { icon: 'block',        text: 'Remove Vendly branding', muted: true },
  { icon: 'block',        text: 'Unlimited products', muted: true },
];

const PRO_FEATURES = [
  { icon: 'check_circle', text: 'Everything in Free' },
  { icon: 'check_circle', text: 'Unlimited products' },
  { icon: 'check_circle', text: 'Custom domain (.shop)' },
  { icon: 'check_circle', text: 'Remove Vendly branding' },
  { icon: 'check_circle', text: 'Full analytics suite' },
  { icon: 'check_circle', text: 'Priority support' },
  { icon: 'check_circle', text: 'Featured placement on Discover' },
];

const FAQS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Free plan is completely free forever. No card required, no hidden trials.'
  },
  {
    q: 'What happens when I hit 10 products on the Free plan?',
    a: 'You\'ll need to delete an existing product to add a new one. Upgrade to Pro for unlimited products.'
  },
  {
    q: 'Can customers pay online?',
    a: 'Vendly routes orders through WhatsApp. You handle payment however you and your customer prefer — bank transfer, cash on delivery, mobile money — keeping things flexible for every market.'
  },
  {
    q: 'Can I change my shop name?',
    a: 'Yes, you can update your shop name any time in Settings. Your storefront URL (slug) stays the same so you never break old links.'
  },
  {
    q: 'Is my data safe?',
    a: 'All passwords are hashed with bcrypt. JWTs expire after 7 days. We don\'t sell your data or your customers\' data to anyone.'
  },
];

export default function PricingPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">Simple, transparent pricing</h1>
          <p>No hidden fees. No forced upgrades. Start free and grow at your own pace.</p>
        </div>

        <div className="static-page__body">
          <div className="pricing-grid">
            {/* Free */}
            <div className="pricing-card">
              <span className="pricing-card__tier">Free</span>
              <div className="pricing-card__price"><span>$0</span>/forever</div>
              <ul className="pricing-card__list">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className={f.muted ? 'is-muted' : ''}>
                    <span className="material-symbols-outlined">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn--ghost btn--block">Get Started Free</Link>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-card--featured">
              <span className="pricing-card__badge">Most Popular</span>
              <span className="pricing-card__tier">Pro</span>
              <div className="pricing-card__price"><span>$12</span>/month</div>
              <ul className="pricing-card__list">
                {PRO_FEATURES.map((f) => (
                  <li key={f.text}>
                    <span className="material-symbols-outlined">{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn--secondary btn--block">Start Pro Trial</Link>
            </div>
          </div>

          {/* FAQs */}
          <section className="static-section">
            <h2 className="heading-md">Frequently asked questions</h2>
            <div className="faq-list">
              {FAQS.map((faq) => (
                <div className="faq-item" key={faq.q}>
                  <h3 className="faq-item__q">{faq.q}</h3>
                  <p className="faq-item__a">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="static-section static-section--cta">
            <h2 className="heading-md">Still have questions?</h2>
            <p>We're happy to help you figure out which plan is right for you.</p>
            <Link to="/contact" className="btn btn--primary">Contact Us</Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
