import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getUsers, adminDeleteTransaction, money } from '../../utils/storage';
import { ListIcon, SearchIcon, TrashIcon } from '../../components/Icons';

export default function AdminTransactions() {
  const [usersList, setUsersList] = useState(getUsers());
  const [filterType, setFilterType] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const reloadData = () => {
    setUsersList(getUsers());
  };

  const handleDeleteTx = (txId) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      adminDeleteTransaction(txId);
      reloadData();
    }
  };

  // Compile all transactions with their owner
  const allTx = usersList
    .flatMap((u) =>
      (u.transactions || []).map((t) => ({
        ...t,
        ownerName: u.name || 'User',
        ownerEmail: u.email
      }))
    )
    .reverse();

  let filtered = allTx;
  if (filterType !== 'all') {
    filtered = filtered.filter((t) => t.type === filterType);
  }
  if (userFilter !== 'all') {
    filtered = filtered.filter(
      (t) => t.ownerEmail.toLowerCase() === userFilter.toLowerCase()
    );
  }
  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.ownerName.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.source || '').toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q)
    );
  }

  const filteredVolume = filtered.reduce((s, t) => s + Number(t.amount || 0), 0);

  return (
    <div className="app-page">
      <Sidebar role="admin" />
      <main className="main">
        <Navbar
          title="Transaction Monitoring"
          eyebrow="ADMIN MODULE"
          subtitle="Audit and moderate transactions across all registered user accounts."
        />

        <section className="kpi-strip">
          <div className="kpi-mini-card dark">
            <span>Filtered Transactions</span>
            <strong>{filtered.length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Filtered Volume</span>
            <strong>{money(filteredVolume)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Monitored Users</span>
            <strong>{usersList.length}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">ALL ACTIVITY</span>
              <h2>All transactions ({filtered.length})</h2>
              <p className="muted" style={{ marginTop: '4px' }}>
                Transactions recorded by all registered users.
              </p>
            </div>

            <div className="filter-row">
              <button
                type="button"
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-btn ${filterType === 'income' ? 'active' : ''}`}
                onClick={() => setFilterType('income')}
              >
                Income
              </button>
              <button
                type="button"
                className={`filter-btn ${filterType === 'expense' ? 'active' : ''}`}
                onClick={() => setFilterType('expense')}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="toolbar-row">
            <div className="search-box">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search by user, category, or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="fintech-select"
              style={{ width: 'auto', minWidth: '185px', padding: '10px 14px' }}
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              {usersList.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </div>

          <div id="adminTransactionsList" className="admin-table-wrap">
            {filtered.length ? (
              <table className="fintech-table">
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong style={{ display: 'block' }}>{t.ownerName}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {t.ownerEmail}
                        </span>
                      </td>
                      <td>
                        <span className={`tx-pill ${t.type}`}>
                          {t.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td>
                        <strong>{t.source || t.note || t.category || 'Transaction'}</strong>
                        {t.category && (
                          <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>
                            {t.category}
                          </span>
                        )}
                      </td>
                      <td
                        className={`tabular-nums ${
                          t.type === 'income' ? 'tx-amount income' : 'tx-amount expense'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '−'} {money(t.amount)}
                      </td>
                      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {t.date || 'No date'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDeleteTx(t.id)}
                        >
                          <TrashIcon size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ListIcon size={20} />
                </div>
                <strong>No transactions recorded</strong>
                <span>Matching transactions from registered users will appear here.</span>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
