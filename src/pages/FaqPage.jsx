import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is Linkmrs?',
        a: 'Linkmrs gives micro-vendors a shareable storefront link they can put in their Instagram bio, WhatsApp status, or anywhere online. Customers browse your products, add to bag, and send their order straight to your WhatsApp — no app download, no complicated checkout.',
      },
      {
        q: 'Do I need technical skills to use Linkmrs?',
        a: 'None at all. If you can fill in a form and upload a photo, you can set up your shop. Most vendors are live within 5 minutes of signing up.',
      },
      {
        q: 'Is Linkmrs free to use?',
        a: 'Yes. The Free plan is free forever — no credit card, no trial period, no hidden fees. You get one storefront link and up to 5 active products. Upgrade to Premium at any time for ₦2,000/month to list up to 40 products.',
      },
      {
        q: 'What does my storefront link look like?',
        a: 'Your link is linkmrs.com/your-shop-name. It is generated automatically when you register and never changes, even if you update your shop name later.',
      },
    ],
  },
  {
    category: 'Products & Inventory',
    items: [
      {
        q: 'How many products can I have?',
        a: 'The Free plan supports up to 5 active products. Upgrade to Premium (₦2,000/month) for up to 40 products. On the Free plan you can delete old products to make room for new ones.',
      },
      {
        q: 'Can I add product photos?',
        a: 'Yes. You can upload a photo when adding or editing any product. If you skip the photo, Linkmrs uses a clean placeholder automatically. Supported formats are PNG and JPG.',
      },
      {
        q: 'Can I edit or delete a product after adding it?',
        a: 'Yes. From your dashboard Products page you can edit the name, price, description, or photo of any product, or delete it entirely, at any time. Changes appear on your storefront immediately.',
      },
      {
        q: 'What currency can I use?',
        a: 'Any. You set your own currency symbol in Settings (e.g. ₦, $, £, €, KSh, GH₵). Linkmrs does not process payments — it just displays prices and sends the order to your WhatsApp, so any currency works.',
      },
    ],
  },
  {
    category: 'Orders & WhatsApp',
    items: [
      {
        q: 'How does WhatsApp checkout work?',
        a: 'When a customer taps "Order via WhatsApp" on your storefront, Linkmrs records the order in your dashboard and opens WhatsApp with a pre-written message listing the items, quantities, and total. The customer sends it to your WhatsApp number and you take it from there.',
      },
      {
        q: 'Do I need WhatsApp Business or will regular WhatsApp work?',
        a: 'Either works. Just make sure you enter your WhatsApp number in Settings (with country code, e.g. 2348012345678) so orders are routed to the right number.',
      },
      {
        q: 'Where do I manage orders?',
        a: 'The Orders page in your dashboard lists all orders with their status. You can mark orders as Confirmed, Shipped, or Completed, and cancel them if needed. You can also filter by status to see only pending or in-progress orders.',
      },
      {
        q: 'Can I message a customer directly from the dashboard?',
        a: 'Yes. On any order that includes the customer\'s phone number, there is a WhatsApp button that opens a direct conversation with them.',
      },
    ],
  },
  {
    category: 'Premium Plan',
    items: [
      {
        q: 'What does Premium cost?',
        a: 'Premium costs ₦2,000 per 30 days. Payment is handled securely by Paystack and accepts debit/credit cards, bank transfer, and USSD.',
      },
      {
        q: 'What do I get with Premium?',
        a: 'Premium gives you up to 40 products (vs 5 on Free), priority placement on the Discover page, a Premium badge on your storefront, and full analytics.',
      },
      {
        q: 'What happens when Premium expires?',
        a: 'Your shop goes back to the Free plan. Your existing products stay — you just can\'t add new ones above 5 until you renew. Renewing early extends from your current expiry date so you never lose days.',
      },
      {
        q: 'Where do I upgrade?',
        a: 'Go to your dashboard and click "Upgrade" in the sidebar, or tap the upgrade banner on your Overview page. You can also go directly to linkmrs.com/dashboard/upgrade.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    items: [
      {
        q: 'Can I change my shop name?',
        a: 'Yes, any time in Settings. Your storefront URL is set once when you register and never changes — so updating your shop name will not break any links you have already shared.',
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'Go to the Login page and tap "Forgot password?" — or visit linkmrs.com/forgot-password. Enter your email and we will send you a reset link.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Email privacy@linkmrs.com with your registered email address and we will delete your account and all associated data within 30 days.',
      },
      {
        q: 'Is my data safe?',
        a: 'Passwords are hashed with bcrypt before storage. Auth tokens expire after 7 days. We do not sell your data or your customers\' data to anyone. See our Privacy Policy for full details.',
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-accordion${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="faq-accordion__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="material-symbols-outlined faq-accordion__icon">
          {open ? 'remove' : 'add'}
        </span>
      </button>
      {open && <p className="faq-accordion__answer">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState('');

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search.trim() ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">Frequently Asked Questions</h1>
          <p>
            Everything you need to know about Linkmrs. Can't find your answer?{' '}
            <Link to="/contact">Contact us</Link>.
          </p>

          <div className="faq-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              className="faq-search__input"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="static-page__body static-page__body--narrow">
          {filtered.length === 0 ? (
            <div className="faq-no-results">
              <span className="material-symbols-outlined">search_off</span>
              <p>No questions match "<strong>{search}</strong>"</p>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setSearch('')}
              >
                Clear search
              </button>
            </div>
          ) : (
            filtered.map((cat) => (
              <section key={cat.category} className="static-section">
                <h2 className="heading-md">{cat.category}</h2>
                <div className="faq-accordion-list">
                  {cat.items.map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </section>
            ))
          )}

          <section className="static-section static-section--cta">
            <h2 className="heading-md">Still have questions?</h2>
            <p>Our team is happy to help. Reach out and we'll get back to you within one business day.</p>
            <div className="static-section__actions">
              <Link to="/contact" className="btn btn--primary">
                <span className="material-symbols-outlined">mail</span>
                Contact Us
              </Link>
              <Link to="/register" className="btn btn--ghost">
                Create Your Shop
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}