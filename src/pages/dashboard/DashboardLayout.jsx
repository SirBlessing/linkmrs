import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar   from '../../components/Sidebar.jsx';
import BottomNav from '../../components/BottomNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

export default function DashboardLayout() {
  const { shop, logout, updateShop } = useAuth();
  const navigate = useNavigate();

  // Every time the dashboard loads, check the plan status.
  // The backend auto-demotes expired premium accounts when this endpoint is called.
  // This means if a user's premium expired overnight, they are downgraded
  // the next time they open the dashboard — no manual intervention needed.
  useEffect(() => {
    api.getPlanStatus()
      .then((status) => {
        // If backend downgraded the plan, refresh shop state in AuthContext
        if (shop && shop.plan !== status.plan) {
          updateShop({});
        }
      })
      .catch(() => {
        // Silently ignore — plan check is non-critical
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-shell">
      {/* Desktop sidebar */}
      <Sidebar />

      <div className="dashboard-shell__body">
        {/* Mobile top bar */}
        <header className="dashboard-topbar">
          <span className="brand-mark">Linkmrs</span>
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

        {/* Page content */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}