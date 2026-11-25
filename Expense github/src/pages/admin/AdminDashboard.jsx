import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { getUsers, deleteUser, money } from '../../utils/storage';
import { IncomeExpenseBarChart, CategoryDonutChart } from '../../components/Charts';
import {
  UsersIcon,
  ListIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  TrashIcon,
  LogOutIcon,
  ChevronRightIcon
} from '../../components/Icons';

export default function AdminDashboard() {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState(getUsers());

  const reloadData = () => {
    setUsersList(getUsers());
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleDeleteUser = (email) => {
    if (window.confirm('Delete this user?')) {
      deleteUser(email);
      reloadData();
    }
  };

  const allTx = usersList.flatMap((u) =>
    (u.transactions || []).map((t) => ({
      ...t,
      ownerName: u.name || 'User',
      ownerEmail: u.email
    }))
  );

  const totalIncome = allTx
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpenses = allTx
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const catTotals = {};
  allTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const c = t.category || 'Other';
      catTotals[c] = (catTotals[c] || 0) + Number(t.amount || 0);
    });
  const donutItems = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const recentAllTx = [...allTx].reverse().slice(0, 5);

  return (
    <div className="app-page">
      <Sidebar role="admin" />
      <main className="main">
        <Navbar
          title="Admin Overview"
          eyebrow="ADMIN MODULE"
          subtitle="Monitor registered users, platform cashflow, and transaction logs."
        />

        <section className="admin-hero">
          <div>
            <span className="eyebrow">SYSTEM CONTROL</span>
            <h2>Platform overview</h2>
            <p className="muted">
              Real-time snapshot of all Expense Tracker users and financial records.
            </p>
          </div>
          <button className="lime-btn" type="button" onClick={handleLogout}>
            <LogOutIcon size={16} />
            Log out
          </button>
        </section>

        <section className="admin-stats">
          <div className="admin-stat">
            <div className="stat-top-row" style={{ marginBottom: '10px' }}>
              <span className="stat-icon" style={{ background: 'var(--lime-50)', color: 'var(--lime-700)' }}>
                <UsersIcon size={18} />
              </span>
            </div>
            <span>Total Registered Users</span>
            <strong id="totalUsers">{usersList.length}</strong>
          </div>

          <div className="admin-stat">
            <div className="stat-top-row" style={{ marginBottom: '10px' }}>
              <span className="stat-icon" style={{ background: '#eef4f1', color: 'var(--forest-800)' }}>
                <ListIcon size={18} />
              </span>
            </div>
            <span>Total Transactions</span>
            <strong id="totalTransactions">{allTx.length}</strong>
          </div>

          <div className="admin-stat">
            <div className="stat-top-row" style={{ marginBottom: '10px' }}>
              <span className="stat-icon" style={{ background: 'var(--lime-50)', color: 'var(--success)' }}>
                <ArrowUpRightIcon size={18} />
              </span>
            </div>
            <span>Total Income</span>
            <strong id="totalIncome">{money(totalIncome)}</strong>
          </div>

          <div className="admin-stat">
            <div className="stat-top-row" style={{ marginBottom: '10px' }}>
              <span className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <ArrowDownRightIcon size={18} />
              </span>
            </div>
            <span>Total Expenses</span>
            <strong id="totalExpenses">{money(totalExpenses)}</strong>
          </div>
        </section>

        {/* Platform Charts */}
        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">STATISTICS</span>
                <h2>Platform cashflow</h2>
              </div>
              <span className="pill">All users</span>
            </div>
            <IncomeExpenseBarChart transactions={allTx} height={220} />
            <div className="legend">
              <span>
                <i className="legend-dot income-dot" />
                Income ({money(totalIncome)})
              </span>
              <span>
                <i className="legend-dot expense-dot" />
                Expenses ({money(totalExpenses)})
              </span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">ANALYTICS</span>
                <h2>Expense categories</h2>
              </div>
            </div>
            <CategoryDonutChart
              items={donutItems}
              centerLabel="Platform Spend"
              centerValue={money(totalExpenses)}
            />
          </div>
        </section>

        {/* User Management Table */}
        <section className="panel admin-users-panel" style={{ marginBottom: '20px' }}>
          <div className="panel-head">
            <div>
              <span className="eyebrow">USER MANAGEMENT</span>
              <h2>Registered users</h2>
            </div>
            <Link className="secondary-btn" to="/admin/users">
              View all users <ChevronRightIcon size={15} />
            </Link>
          </div>

          <div id="usersList" className="admin-table-wrap">
            {usersList.length ? (
              <table className="fintech-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Records</th>
                    <th>Net Balance</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => {
                    const txs = u.transactions || [];
                    const uIn = txs
                      .filter((t) => t.type === 'income')
                      .reduce((s, t) => s + Number(t.amount || 0), 0);
                    const uEx = txs
                      .filter((t) => t.type === 'expense')
                      .reduce((s, t) => s + Number(t.amount || 0), 0);
                    const initial = (u.name || 'U').trim().charAt(0).toUpperCase();

                    return (
                      <tr key={u.email}>
                        <td>
                          <div className="user-cell">
                            <span className="avatar">{initial}</span>
                            <strong>{u.name || 'User'}</strong>
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                        <td>
                          <span className="tx-pill">{txs.length} records</span>
                        </td>
                        <td className="tabular-nums" style={{ fontWeight: 700 }}>
                          {money(uIn - uEx)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDeleteUser(u.email)}
                          >
                            <TrashIcon size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <UsersIcon size={20} />
                </div>
                <strong>No registered users</strong>
                <span>Registered user accounts will appear here once created.</span>
              </div>
            )}
          </div>
        </section>

        {/* Transaction Monitoring Preview */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">TRANSACTION MONITORING</span>
              <h2>Recent platform activity</h2>
            </div>
            <Link className="secondary-btn" to="/admin/transactions">
              Monitor all <ChevronRightIcon size={15} />
            </Link>
          </div>

          <div className="transaction-list">
            {recentAllTx.length ? (
              recentAllTx.map((t) => (
                <div key={t.id} className="transaction-row">
                  <span className={`tx-icon ${t.type}`}>
                    {t.type === 'income' ? (
                      <ArrowUpRightIcon size={19} />
                    ) : (
                      <ArrowDownRightIcon size={19} />
                    )}
                  </span>
                  <div>
                    <div className="tx-title">
                      {t.source || t.note || t.category || 'Transaction'}
                    </div>
                    <div className="tx-meta">
                      <span>{t.ownerName}</span>
                      <span>&middot;</span>
                      <span>{t.ownerEmail}</span>
                      {t.date && <span className="tx-pill">{t.date}</span>}
                    </div>
                  </div>
                  <strong className={`tx-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '−'} {money(t.amount)}
                  </strong>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ListIcon size={20} />
                </div>
                <strong>No platform transactions yet</strong>
                <span>User transactions will appear here for monitoring.</span>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
