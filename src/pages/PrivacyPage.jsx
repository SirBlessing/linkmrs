import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="static-page__body static-page__body--narrow static-page__body--legal">
          <section className="static-section">
            <h2>What data we collect</h2>
            <p>When you register, we collect your email address, shop name, and optional WhatsApp number. When you add products, we store product names, descriptions, prices, and any images you upload. When customers place orders through your storefront, we store order details including customer name and phone number.</p>
          </section>
          <section className="static-section">
            <h2>How we use your data</h2>
            <p>We use your data solely to operate the Vendly service — authenticating your account, displaying your storefront, routing orders, and generating your analytics. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>
          <section className="static-section">
            <h2>Data storage and security</h2>
            <p>Passwords are hashed with bcrypt before storage. Authentication tokens expire after 7 days. We use industry-standard practices to protect your data, but no system is 100% secure.</p>
          </section>
          <section className="static-section">
            <h2>Cookies and local storage</h2>
            <p>Vendly stores your authentication token in your browser's local storage to keep you logged in. We do not use tracking cookies or third-party analytics services.</p>
          </section>
          <section className="static-section">
            <h2>Customer data (orders)</h2>
            <p>When a customer places an order on your storefront, their name and phone number are stored so you can view order history in your dashboard. This data belongs to you as the vendor. We do not contact your customers independently.</p>
          </section>
          <section className="static-section">
            <h2>Your rights</h2>
            <p>You may request deletion of your account and all associated data at any time by contacting us at <a href="mailto:privacy@vendly.com">privacy@vendly.com</a>. We will process deletion requests within 30 days.</p>
          </section>
          <section className="static-section">
            <h2>Changes to this policy</h2>
            <p>We will notify registered users of material changes to this policy by updating the "last updated" date above. Continued use of the service constitutes acceptance.</p>
          </section>
          <section className="static-section">
            <h2>Contact</h2>
            <p>Privacy concerns? Reach us at <a href="mailto:privacy@vendly.com">privacy@vendly.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
