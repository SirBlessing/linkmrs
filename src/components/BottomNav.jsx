import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/dashboard',            end: true, icon: 'dashboard',    label: 'Home'      },
  { to: '/dashboard/products',              icon: 'inventory_2',   label: 'Products'  },
  { to: '/dashboard/orders',                icon: 'shopping_cart', label: 'Orders'    },
  { to: '/dashboard/ai',                    icon: 'smart_toy',     label: 'AI Coach'  },
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
            `bottom-nav__item${isActive ? ' is-active' : ''}${label === 'AI Coach' ? ' bottom-nav__item--ai' : ''}`
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}