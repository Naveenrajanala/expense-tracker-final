import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ListIcon,
  PieChartIcon,
  WalletIcon,
  RepeatIcon,
  BarChartIcon,
  TargetIcon,
  UserIcon,
  UsersIcon,
  LogOutIcon,
  CloseIcon,
  SparklesIcon
} from './Icons';

export default function Sidebar({ role = 'user' }) {
  const { logout, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  const handleLogout = () => {
    setMobileOpen(false);
    if (role === 'admin') {
      adminLogout();
      navigate('/admin/login');
    } else {
      logout();
      navigate('/');
    }
  };

  const brandLink = role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const userLinks = [
    { to: '/dashboard', label: 'Overview', icon: HomeIcon },
    { to: '/income', label: 'Income', icon: ArrowUpRightIcon },
    { to: '/expense', label: 'Expenses', icon: ArrowDownRightIcon },
    { to: '/transactions', label: 'Transactions', icon: ListIcon },
    { to: '/accounts', label: 'Accounts', icon: WalletIcon },
    { to: '/budgets', label: 'Budgets', icon: PieChartIcon },
    { to: '/recurring', label: 'Recurring', icon: RepeatIcon },
    { to: '/reports', label: 'Reports', icon: BarChartIcon },
    { to: '/goals', label: 'Goals', icon: TargetIcon },
    { to: '/profile', label: 'Profile', icon: UserIcon }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: HomeIcon },
    { to: '/admin/users', label: 'Users', icon: UsersIcon },
    { to: '/admin/transactions', label: 'Transactions', icon: ListIcon }
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-head-row">
          <NavLink
            className="side-brand"
            to={brandLink}
            onClick={() => setMobileOpen(false)}
          >
            <span className="brand-mark">ET</span>
            <div className="side-brand-text">
              <strong>Expense Tracker</strong>
              <small>{role === 'admin' ? 'Admin Console' : 'Finance Suite'}</small>
            </div>
          </NavLink>

          <button
            type="button"
            className="sidebar-close-btn"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">
          {role === 'admin' ? 'Administration' : 'Menu'}
        </div>

        <nav>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-item-icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-help">
            <div className="mini-help-head">
              <SparklesIcon size={14} />
              <span>{role === 'admin' ? 'System Monitor' : 'Smart Habits'}</span>
            </div>
            <span>
              {role === 'admin'
                ? 'Audit user accounts and transaction logs in real time.'
                : 'Track daily cashflow and stay ahead of monthly budgets.'}
            </span>
          </div>

          <button className="logout-btn" type="button" onClick={handleLogout}>
            <LogOutIcon size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
