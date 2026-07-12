import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || '/dashboard';

  const [form, setForm]      = useState({ email: '', password: '' });
  const [error, setError]    = useState('');
  const [submitting, setSub] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSub(true);
    try {
      await login(form);            // POST /api/auth/login
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSub(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your vendor dashboard."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            className="field__input"
            placeholder="name@example.com"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="field__input"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="field__error field__error--banner">{error}</p>}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Continue to Dashboard'}
          {!submitting && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </form>

      <p className="auth-card__footnote">
        Don't have a shop yet? <Link to="/register">Create one free</Link>
      </p>
    </AuthLayout>
  );
}
