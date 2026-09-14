import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api/client.js';

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSub]   = useState(false);
  const [error, setError]     = useState('');
  const [sending, setSending] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim())    { setError('Please enter your name.');    return; }
    if (!form.email.trim())   { setError('Please enter your email.');   return; }
    if (!form.message.trim()) { setError('Please enter your message.'); return; }

    setSending(true);
    try {
      await api.sendContact(form);   // POST /api/contact
      setSub(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="static-page">
        <div className="static-page__hero">
          <h1 className="heading-lg">Get in touch</h1>
          <p>Questions, feedback, or just want to say hello — we read every message.</p>
        </div>

        <div className="static-page__body static-page__body--narrow">

          {/* Contact channels */}
          <div className="contact-channels">
            <div className="contact-channel">
              <span className="material-symbols-outlined">mail</span>
              <div>
                <strong>Email</strong>
                <p>hello@linkmrs.com</p>
              </div>
            </div>
            <div className="contact-channel">
              <span className="material-symbols-outlined">chat</span>
              <div>
                <strong>WhatsApp</strong>
                <p>Available to vendors</p>
              </div>
            </div>
            <div className="contact-channel">
              <span className="material-symbols-outlined">schedule</span>
              <div>
                <strong>Response time</strong>
                <p>Within 1–2 business days</p>
              </div>
            </div>
          </div>

          {/* Success state */}
          {submitted ? (
            <div className="contact-success">
              <span className="material-symbols-outlined contact-success__icon">
                mark_email_read
              </span>
              <h2 className="heading-md">Message sent!</h2>
              <p>Thanks for reaching out. We'll get back to you within 1–2 business days.</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setSub(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form__row">
                <div className="field">
                  <label className="field__label" htmlFor="c-name">
                    Your Name <span className="field__required">*</span>
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    className="field__input"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="c-email">
                    Email Address <span className="field__required">*</span>
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    className="field__input"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="c-subject">
                  Subject <span className="field__optional">(optional)</span>
                </label>
                <input
                  id="c-subject"
                  type="text"
                  className="field__input"
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={set('subject')}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="c-message">
                  Message <span className="field__required">*</span>
                </label>
                <textarea
                  id="c-message"
                  className="field__input field__textarea"
                  rows={6}
                  placeholder="Tell us how we can help…"
                  value={form.message}
                  onChange={set('message')}
                  required
                />
              </div>

              {error && (
                <p className="field__error field__error--banner">{error}</p>
              )}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff', borderWidth: '2px' }} />
                    Sending…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}