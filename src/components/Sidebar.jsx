import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/dashboard',            end: true, icon: 'dashboard',   label: 'Overview'  },
  { to: '/dashboard/products',              icon: 'inventory_2',  label: 'Products'  },
  { to: '/dashboard/orders',                icon: 'shopping_cart', label: 'Orders'    },
  { to: '/dashboard/analytics',             icon: 'bar_chart',    label: 'Analytics' },
  { to: '/dashboard/settings',              icon: 'settings',     label: 'Settings'  },
];

export default function Sidebar() {
  const { shop, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Link to="/" className="brand-mark">Vendly</Link>
        <p className="sidebar__shop-name">{shop?.shopName || 'Your Shop'}</p>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ to, end, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {shop && (
          <Link
            to={`/shop/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--block btn--sm"
          >
            <span className="material-symbols-outlined">open_in_new</span>
            View Storefront
          </Link>
        )}
        <div className="sidebar__meta">
          <Link to="/discover" className="sidebar__link sidebar__link--muted">
            <span className="material-symbols-outlined">explore</span>
            Discover
          </Link>
          <button type="button" className="sidebar__link sidebar__link--muted" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
