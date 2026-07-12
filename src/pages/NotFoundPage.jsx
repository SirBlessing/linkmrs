import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="page-shell">
      <Navbar />
      <main className="status-page">
        <span className="material-symbols-outlined status-page__icon">search_off</span>
        <h1 className="heading-lg">404 — Page not found</h1>
        <p className="status-page__text">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="status-page__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Go back
          </button>
          <Link to="/" className="btn btn--primary">Back to home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
