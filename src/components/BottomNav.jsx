import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/dashboard',            end: true, icon: 'dashboard',    label: 'Overview'  },
  { to: '/dashboard/products',              icon: 'inventory_2',   label: 'Products'  },
  { to: '/dashboard/orders',                icon: 'shopping_cart', label: 'Orders'    },
  { to: '/dashboard/analytics',             icon: 'bar_chart',     label: 'Analytics' },
  { to: '/dashboard/settings',              icon: 'settings',      label: 'Settings'  },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Dashboard navigation">
      {NAV.map(({ to, end, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? ' is-active' : ''}`
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
