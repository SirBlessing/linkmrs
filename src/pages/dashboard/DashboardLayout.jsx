import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar  from '../../components/Sidebar.jsx';
import BottomNav from '../../components/BottomNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardLayout() {
  const { shop, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-shell">
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="dashboard-shell__body">
        {/* Mobile top bar */}
        <header className="dashboard-topbar">
          <span className="brand-mark">Vendly</span>
          <div className="dashboard-topbar__actions">
            {shop && (
              <Link
                to={`/shop/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn"
                aria-label="View storefront"
              >
                <span className="material-symbols-outlined">open_in_new</span>
              </Link>
            )}
            <button
              type="button"
              className="icon-btn"
              aria-label="Log out"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Page content injected here by react-router */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
