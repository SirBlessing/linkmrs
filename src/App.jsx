import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute   from './components/ProtectedRoute.jsx';

// Public pages
import LandingPage      from './pages/LandingPage.jsx';
import DiscoverPage     from './pages/DiscoverPage.jsx';
import AboutPage        from './pages/AboutPage.jsx';
import PricingPage      from './pages/PricingPage.jsx';
import ContactPage      from './pages/ContactPage.jsx';
import TermsPage        from './pages/TermsPage.jsx';
import PrivacyPage      from './pages/PrivacyPage.jsx';
import StorefrontPage   from './pages/StorefrontPage.jsx';
import LoginPage        from './pages/LoginPage.jsx';
import RegisterPage     from './pages/RegisterPage.jsx';
import NotFoundPage     from './pages/NotFoundPage.jsx';

// Dashboard (protected)
import DashboardLayout  from './pages/dashboard/DashboardLayout.jsx';
import OverviewPage     from './pages/dashboard/OverviewPage.jsx';
import ProductsPage     from './pages/dashboard/ProductsPage.jsx';
import OrdersPage       from './pages/dashboard/OrdersPage.jsx';
import AnalyticsPage    from './pages/dashboard/AnalyticsPage.jsx';
import SettingsPage     from './pages/dashboard/SettingsPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────── */}
      <Route path="/"           element={<LandingPage />} />
      <Route path="/discover"   element={<DiscoverPage />} />
      <Route path="/about"      element={<AboutPage />} />
      <Route path="/pricing"    element={<PricingPage />} />
      <Route path="/contact"    element={<ContactPage />} />
      <Route path="/terms"      element={<TermsPage />} />
      <Route path="/privacy"    element={<PrivacyPage />} />
      <Route path="/shop/:slug" element={<StorefrontPage />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />

      {/* ── Protected dashboard ────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index            element={<OverviewPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="orders"    element={<OrdersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings"  element={<SettingsPage />} />
      </Route>

      {/* ── 404 ────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
