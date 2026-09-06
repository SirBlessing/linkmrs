import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const STEPS = [
  {
    number: '01',
    icon: 'person_add',
    title: 'Create your free account',
    desc: 'Sign up with your shop name, email, and WhatsApp number. Takes under 60 seconds — no credit card needed.',
  },
  {
    number: '02',
    icon: 'inventory_2',
    title: 'Add your products',
    desc: 'Upload photos, set prices in Naira, and write short descriptions. Free plan supports 5 products. Upgrade to Premium for 40.',
  },
  {
    number: '03',
    icon: 'link',
    title: 'Share your link',
    desc: 'Copy your unique link (linkmrs.com/your-shop-name) and put it in your Instagram bio, WhatsApp status, or anywhere.',
  },
  {
    number: '04',
    icon: 'shopping_bag',
    title: 'Customers browse and add to bag',
    desc: 'Your customers visit your storefront, browse your products, and add what they want to their bag — no app download needed.',
  },
  {
    number: '05',
    icon: 'chat',
    title: 'Order lands in your WhatsApp',
    desc: 'When they tap "Order via WhatsApp", a beautifully formatted message with all item details and the total is sent straight to your WhatsApp number.',
  },
  {
    number: '06',
    icon: 'dashboard',
    title: 'Manage everything from your dashboard',
    desc: 'Confirm orders, mark them shipped or completed, track your sales, and see which products are selling best — all in one place.',
  },
];

const FAQS = [
  {
    q: 'Do my customers need to download anything?',
    a: 'No. Your storefront works in any browser. Customers just visit your link and tap to order.',
  },
  {
    q: 'Do I need a payment gateway?',
    a: 'No. Linkmrs routes orders through WhatsApp. You and your customer agree on payment however you prefer — bank transfer, cash on delivery, mobile money.',
  },
  {
    q: 'What if I already have a WhatsApp Business account?',
    a: 'Even better. Just enter your WhatsApp Business number when you register and orders go straight there.',
  },
  {
    q: 'Can I change my products any time?',
    a: 'Yes. You can add, edit, or delete products at any time. Changes appear on your storefront immediately.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">How Linkmrs works</h1>
          <p>From sign-up to first sale in under 5 minutes.</p>
        </div>

        <div className="static-page__body">
          {/* Steps */}
          <section className="hiw-steps">
            {STEPS.map((step) => (
              <div className="hiw-step" key={step.number}>
                <div className="hiw-step__left">
                  <div className="hiw-step__number">{step.number}</div>
                  <div className="hiw-step__line" aria-hidden="true" />
                </div>
                <div className="hiw-step__body">
                  <div className="hiw-step__icon-wrap">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <h2 className="heading-md">{step.title}</h2>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* FAQ */}
          <section className="static-section">
            <h2 className="heading-md">Common questions</h2>
            <div className="faq-list">
              {FAQS.map((faq) => (
                <div className="faq-item" key={faq.q}>
                  <h3 className="faq-item__q">{faq.q}</h3>
                  <p className="faq-item__a">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="static-section static-section--cta">
            <h2 className="heading-md">Ready to try it?</h2>
            <p>Free to start. No credit card. Your shop is live in under 2 minutes.</p>
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