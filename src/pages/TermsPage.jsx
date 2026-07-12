import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function TermsPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="static-page__body static-page__body--narrow static-page__body--legal">
          <section className="static-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By creating a Vendly account or using the Vendly platform ("Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>
          <section className="static-section">
            <h2>2. Description of Service</h2>
            <p>Vendly provides micro-vendors with a hosted storefront page, order management tools, and analytics. The Service facilitates order communication via WhatsApp but does not process payments.</p>
          </section>
          <section className="static-section">
            <h2>3. Accounts and Registration</h2>
            <p>You must provide accurate information when registering. You are responsible for maintaining the security of your account and all activity that occurs under it. Notify us immediately of any unauthorised access.</p>
          </section>
          <section className="static-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to use the Service to sell counterfeit goods, illegal items, or anything that violates applicable law. Vendly reserves the right to suspend or terminate accounts that violate this policy without notice.</p>
          </section>
          <section className="static-section">
            <h2>5. Product Listings</h2>
            <p>You are solely responsible for the accuracy of product descriptions, pricing, and images you upload. Vendly does not verify product listings and accepts no liability for disputes between vendors and customers.</p>
          </section>
          <section className="static-section">
            <h2>6. Free Plan Limitations</h2>
            <p>Free accounts are limited to 10 active products. Vendly reserves the right to modify plan limits with reasonable notice to users.</p>
          </section>
          <section className="static-section">
            <h2>7. Intellectual Property</h2>
            <p>You retain ownership of all content you upload. By uploading content, you grant Vendly a non-exclusive licence to display that content on the platform. Vendly's own branding, code, and design remain our intellectual property.</p>
          </section>
          <section className="static-section">
            <h2>8. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. Vendly does not guarantee uptime, accuracy of analytics, or uninterrupted access.</p>
          </section>
          <section className="static-section">
            <h2>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Vendly shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>
          <section className="static-section">
            <h2>10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised terms.</p>
          </section>
          <section className="static-section">
            <h2>11. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:legal@vendly.com">legal@vendly.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
