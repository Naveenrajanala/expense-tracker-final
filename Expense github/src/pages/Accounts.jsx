import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { saveUser, money } from '../utils/storage';
import {
  BankIcon,
  WalletIcon,
  CreditCardIcon,
  CheckCircleIcon,
  CloseIcon
} from '../components/Icons';

export default function Accounts() {
  const { currentUser, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');
  const [message, setMessage] = useState('');

  const accounts = currentUser?.accounts || [
    { id: 'cash', name: 'Cash', type: 'Cash' },
    { id: 'bank', name: 'Bank Account', type: 'Bank' }
  ];
  const transactions = currentUser?.transactions || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const newAccount = {
      id: 'a' + Date.now(),
      name: name.trim(),
      type
    };

    const updated = [...accounts, newAccount];
    saveUser({
      ...currentUser,
      accounts: updated
    });

    refreshUser();
    setMessage('Account added.');
    setName('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAccount = (accId) => {
    if (accounts.length <= 1) {
      alert('You must have at least one account.');
      return;
    }
    if (window.confirm('Delete this account?')) {
      const updated = accounts.filter((a) => a.id !== accId);
      saveUser({
        ...currentUser,
        accounts: updated
      });
      refreshUser();
    }
  };

  const getAccountBalance = (acc) => {
    return transactions
      .filter((t) => t.account === acc.id || t.account === acc.name)
      .reduce((s, t) => s + (t.type === 'income' ? 1 : -1) * Number(t.amount || 0), 0);
  };

  const totalAcrossAccounts = accounts.reduce((sum, acc) => sum + getAccountBalance(acc), 0);

  const renderTypeIcon = (t) => {
    if (t === 'Bank') return <BankIcon size={14} />;
    if (t === 'Credit Card') return <CreditCardIcon size={14} />;
    return <WalletIcon size={14} />;
  };

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar
          title="Accounts & Wallets"
          eyebrow="MULTI-ACCOUNT"
          subtitle="Organize your bank accounts, cash, digital wallets, and cards."
        />

        <section className="kpi-strip">
          <div className="kpi-mini-card dark">
            <span>Combined Account Balance</span>
            <strong>{money(totalAcrossAccounts)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Configured Accounts</span>
            <strong>{accounts.length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Linked Transactions</span>
            <strong>{transactions.length}</strong>
          </div>
        </section>

        <section className="feature-grid">
          <div className="panel">
            <span className="eyebrow">NEW ACCOUNT</span>
            <h2>Add account</h2>
            <p className="muted" style={{ marginTop: '6px' }}>
              Track cash, bank, wallet or credit card balances separately.
            </p>

            <form id="accountForm" className="form-stack" onSubmit={handleSubmit}>
              <label>
                Account name
                <input
                  id="accountName"
                  required
                  placeholder="Savings Account"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Account type
                <select
                  id="accountType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <button className="primary-btn" type="submit">
                Add account <span>→</span>
              </button>

              {message && (
                <p id="accountMessage" className="form-message message-success">
                  <CheckCircleIcon size={16} />
                  {message}
                </p>
              )}
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">YOUR ACCOUNTS</span>
                <h2>Account balances</h2>
              </div>
              <span className="pill">{accounts.length} active</span>
            </div>

            <div id="accountList" className="accounts-cards-grid">
              {accounts.map((a, idx) => {
                const bal = getAccountBalance(a);
                const txCount = transactions.filter(
                  (t) => t.account === a.id || t.account === a.name
                ).length;

                return (
                  <div
                    key={a.id}
                    className={`account-wallet-card ${idx === 0 ? 'primary-wallet' : ''}`}
                  >
                    <div className="account-card-top">
                      <span className="account-type-tag">
                        {renderTypeIcon(a.type)}
                        {a.type}
                      </span>
                      {accounts.length > 1 && (
                        <button
                          type="button"
                          className="tx-action-btn"
                          title="Delete account"
                          aria-label={`Delete ${a.name}`}
                          onClick={() => handleDeleteAccount(a.id)}
                        >
                          <CloseIcon size={13} />
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="account-bal-label">
                        {a.name} &middot; {txCount} {txCount === 1 ? 'record' : 'records'}
                      </span>
                      <strong className="account-bal-val">{money(bal)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
