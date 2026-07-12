import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    shopName: '', email: '', password: '', confirm: '', whatsappNumber: '',
  });
  const [error, setError]    = useState('');
  const [submitting, setSub] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSub(true);
    try {
      await register({        // POST /api/auth/register
        shopName:       form.shopName,
        email:          form.email,
        password:       form.password,
        whatsappNumber: form.whatsappNumber,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSub(false);
    }
  };

  return (
    <AuthLayout
      title="Start your journey"
      subtitle="Create an account and launch your storefront in minutes."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="reg-shop">Shop Name</label>
          <input
            id="reg-shop"
            type="text"
            className="field__input"
            placeholder="e.g. Bloom Studio"
            value={form.shopName}
            onChange={set('shopName')}
            required
            autoComplete="organization"
          />
          <p className="field__hint">This becomes your storefront URL: vendly.com/bloom-studio</p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            className="field__input"
            placeholder="name@example.com"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-form__row">
          <div className="field">
            <label className="field__label" htmlFor="reg-pass">Password</label>
            <input
              id="reg-pass"
              type="password"
              className="field__input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set('password')}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="field__input"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="reg-wa">
            WhatsApp Number <span className="field__optional">(optional)</span>
          </label>
          <input
            id="reg-wa"
            type="text"
            className="field__input"
            placeholder="Country code + number, e.g. 15550123456"
            value={form.whatsappNumber}
            onChange={set('whatsappNumber')}
          />
          <p className="field__hint">Orders from your storefront are sent here. You can add this later in Settings.</p>
        </div>

        {error && <p className="field__error field__error--banner">{error}</p>}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={submitting}
        >
          {submitting ? 'Creating your shop…' : 'Create Account'}
          {!submitting && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </form>

      <p className="auth-card__footnote">
        Already have a shop? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
