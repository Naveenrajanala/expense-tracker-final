import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { money } from '../utils/storage';
import { LogOutIcon, ShieldIcon } from '../components/Icons';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const name = currentUser?.name || 'User';
  const email = currentUser?.email || 'user@example.com';
  const avatar = name.trim().charAt(0).toUpperCase() || 'U';

  const transactions = currentUser?.transactions || [];
  const totalIn = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalEx = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = totalIn - totalEx;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar
          title="Profile & Settings"
          eyebrow="ACCOUNT"
          subtitle="Manage your personal account overview and local session."
        />

        <section className="kpi-strip cols-4">
          <div className="kpi-mini-card dark">
            <span>Net Balance</span>
            <strong>{money(balance)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Transactions</span>
            <strong>{transactions.length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Accounts</span>
            <strong>{(currentUser?.accounts || []).length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Savings Goals</span>
            <strong>{(currentUser?.goals || []).length}</strong>
          </div>
        </section>

        <section className="profile-grid">
          <div className="panel profile-card">
            <span className="avatar large" id="profileAvatar">
              {avatar}
            </span>
            <span className="eyebrow">YOUR PROFILE</span>
            <h2 id="profileName">{name}</h2>
            <p id="profileEmail" className="muted">
              {email}
            </p>
            <button
              className="lime-btn"
              type="button"
              onClick={handleLogout}
              style={{ marginTop: '22px' }}
            >
              <LogOutIcon size={16} />
              Log out
            </button>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">ACCOUNT SUMMARY</span>
                <h2>Account details</h2>
              </div>
              <span className="status-badge ok">
                <ShieldIcon size={13} /> Local Sync Active
              </span>
            </div>

            <div className="detail-list">
              <div>
                <span>Full Name</span>
                <strong id="detailName">{name}</strong>
              </div>
              <div>
                <span>Email Address</span>
                <strong id="detailEmail">{email}</strong>
              </div>
              <div>
                <span>Total Transactions</span>
                <strong>{transactions.length} records</strong>
              </div>
              <div>
                <span>Accounts Configured</span>
                <strong>{(currentUser?.accounts || []).length} accounts</strong>
              </div>
              <div>
                <span>Active Budgets</span>
                <strong>{Object.keys(currentUser?.budgets || {}).length} categories</strong>
              </div>
              <div>
                <span>Recurring Reminders</span>
                <strong>{(currentUser?.recurring || []).length} reminders</strong>
              </div>
              <div>
                <span>Storage Engine</span>
                <strong>Local browser storage</strong>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
