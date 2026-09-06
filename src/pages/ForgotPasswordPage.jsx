import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');
  const [sending,   setSending]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    // Simulate — replace with POST /api/auth/forgot-password when you add email sending
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {submitted ? (
        <div className="forgot-success">
          <span className="material-symbols-outlined forgot-success__icon">
            mark_email_read
          </span>
          <h3 className="heading-md">Check your inbox</h3>
          <p>
            If <strong>{email}</strong> is registered, you'll receive a
            password reset link within a few minutes.
          </p>
          <p className="forgot-success__hint">Don't see it? Check your spam folder.</p>
          <Link to="/login" className="btn btn--ghost btn--block">Back to Log In</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="fp-email">Email Address</label>
            <input
              id="fp-email"
              type="email"
              className="field__input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          {error && <p className="field__error field__error--banner">{error}</p>}

          <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
            {sending ? 'Sending…' : 'Send Reset Link'}
            {!sending && <span className="material-symbols-outlined">send</span>}
          </button>

          <Link to="/login" className="btn btn--ghost btn--block">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Log In
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}