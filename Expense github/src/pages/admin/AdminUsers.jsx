import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getUsers, deleteUser, money } from '../../utils/storage';
import { SearchIcon, TrashIcon, UsersIcon } from '../../components/Icons';

export default function AdminUsers() {
  const [usersList, setUsersList] = useState(getUsers());
  const [searchTerm, setSearchTerm] = useState('');

  const reloadData = () => {
    setUsersList(getUsers());
  };

  const handleDeleteUser = (email) => {
    if (window.confirm('Delete this user?')) {
      deleteUser(email);
      reloadData();
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTxCount = usersList.reduce(
    (sum, u) => sum + (u.transactions || []).length,
    0
  );

  return (
    <div className="app-page">
      <Sidebar role="admin" />
      <main className="main">
        <Navbar
          title="User Management"
          eyebrow="ADMIN MODULE"
          subtitle="Search, inspect, and manage registered user accounts."
        />

        <section className="kpi-strip">
          <div className="kpi-mini-card dark">
            <span>Total Registered Users</span>
            <strong>{usersList.length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Matching Search</span>
            <strong>{filteredUsers.length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Total User Records</span>
            <strong>{totalTxCount}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">USER DIRECTORY</span>
              <h2>Registered users ({usersList.length})</h2>
            </div>

            <div className="search-box">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div id="usersList" className="admin-table-wrap">
            {filteredUsers.length ? (
              <table className="fintech-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Accounts</th>
                    <th>Transactions</th>
                    <th>Net Balance</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
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
                        <td>{(u.accounts || []).length}</td>
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
                <strong>
                  {usersList.length === 0
                    ? 'No registered users'
                    : 'No users matching search'}
                </strong>
                <span>
                  {usersList.length === 0
                    ? 'Users who sign up will appear here.'
                    : 'Try searching with a different name or email address.'}
                </span>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
