import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    close();
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={close}>Vendly</Link>

        {/* Desktop links */}
        <div className="navbar__links">
          <NavLink to="/discover" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>Discover</NavLink>
          <NavLink to="/about"    className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>About</NavLink>
          <NavLink to="/pricing"  className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>Pricing</NavLink>
        </div>

        {/* Desktop actions */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__link">Dashboard</Link>
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar__link">Log in</Link>
              <Link to="/register" className="btn btn--primary btn--sm btn--pill">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="navbar__hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="navbar__mobile">
          <NavLink to="/discover" className="navbar__mobile-link" onClick={close}>Discover</NavLink>
          <NavLink to="/about"    className="navbar__mobile-link" onClick={close}>About</NavLink>
          <NavLink to="/pricing"  className="navbar__mobile-link" onClick={close}>Pricing</NavLink>
          <NavLink to="/contact"  className="navbar__mobile-link" onClick={close}>Contact</NavLink>
          <div className="navbar__mobile-divider" />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__mobile-link" onClick={close}>Dashboard</Link>
              <button type="button" className="navbar__mobile-link navbar__mobile-link--danger" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar__mobile-link" onClick={close}>Log in</Link>
              <Link to="/register" className="navbar__mobile-link navbar__mobile-link--primary" onClick={close}>Create Shop</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
