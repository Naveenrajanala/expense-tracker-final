import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { saveUser, money } from '../utils/storage';
import { CheckCircleIcon, CloseIcon, PieChartIcon } from '../components/Icons';

export default function Budgets() {
  const { currentUser, refreshUser } = useAuth();

  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const budgets = currentUser?.budgets || {};
  const transactions = currentUser?.transactions || [];

  const spent = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Other';
      spent[cat] = (spent[cat] || 0) + Number(t.amount || 0);
    });

  const categories = Object.keys(budgets);
  const totalBudgeted = categories.reduce((sum, cat) => sum + Number(budgets[cat] || 0), 0);
  const totalSpentInBudgets = categories.reduce((sum, cat) => sum + (spent[cat] || 0), 0);
  const exceededCount = categories.filter(
    (cat) => (spent[cat] || 0) > Number(budgets[cat] || 0)
  ).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    const updatedBudgets = {
      ...budgets,
      [category]: Number(amount)
    };

    saveUser({
      ...currentUser,
      budgets: updatedBudgets
    });

    refreshUser();
    setMessage('Budget saved successfully.');
    setAmount('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteBudget = (cat) => {
    if (window.confirm(`Delete budget for ${cat}?`)) {
      const updatedBudgets = { ...budgets };
      delete updatedBudgets[cat];
      saveUser({
        ...currentUser,
        budgets: updatedBudgets
      });
      refreshUser();
    }
  };

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar
          title="Budget Management"
          eyebrow="BUDGET PLANNER"
          subtitle="Set monthly spending caps by category and track utilization in real time."
        />

        <section className="kpi-strip">
          <div className="kpi-mini-card dark">
            <span>Total Monthly Budget</span>
            <strong>{money(totalBudgeted)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Spent Across Budgets</span>
            <strong>{money(totalSpentInBudgets)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Exceeded Categories</span>
            <strong style={{ color: exceededCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {exceededCount}
            </strong>
          </div>
        </section>

        <section className="feature-grid">
          <div className="panel">
            <span className="eyebrow">BUDGET PLANNER</span>
            <h2>Set monthly budgets</h2>
            <p className="muted" style={{ marginTop: '6px' }}>
              Create or update spending limits for each expense category.
            </p>

            <form id="budgetForm" className="form-stack" onSubmit={handleSubmit}>
              <label>
                Category
                <select
                  id="budgetCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Monthly limit (₹)
                <input
                  id="budgetAmount"
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>

              <button className="primary-btn" type="submit">
                Save budget <span>→</span>
              </button>

              {message && (
                <p id="budgetMessage" className="form-message message-success">
                  <CheckCircleIcon size={16} />
                  {message}
                </p>
              )}
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">TRACKING</span>
                <h2>Budget status</h2>
              </div>
              <span className="pill">{categories.length} active</span>
            </div>

            <div id="budgetList">
              {categories.length ? (
                categories.map((cat) => {
                  const lim = Number(budgets[cat]) || 0;
                  const v = spent[cat] || 0;
                  const p = Math.min(100, lim ? (v / lim) * 100 : 0);
                  const isOver = v > lim;
                  const isNear = !isOver && p >= 80;
                  const remaining = lim - v;

                  return (
                    <div key={cat} className="feature-item">
                      <div className="feature-item-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '14px' }}>{cat}</strong>
                          {isOver ? (
                            <span className="status-badge over">Exceeded!</span>
                          ) : isNear ? (
                            <span className="status-badge warn">Near limit</span>
                          ) : (
                            <span className="status-badge ok">On track</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums">
                            {money(v)} / {money(lim)}
                          </span>
                          <button
                            type="button"
                            className="tx-action-btn"
                            title="Remove budget"
                            aria-label={`Remove ${cat} budget`}
                            onClick={() => handleDeleteBudget(cat)}
                          >
                            <CloseIcon size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="progress">
                        <i
                          style={{
                            width: `${p}%`,
                            background: isOver
                              ? '#dc2626'
                              : isNear
                              ? '#d97706'
                              : undefined
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '7px',
                          fontSize: '11.5px',
                          color: 'var(--muted)'
                        }}
                      >
                        <span>{Math.round(p)}% used</span>
                        <span>
                          {remaining >= 0
                            ? `${money(remaining)} remaining`
                            : `${money(Math.abs(remaining))} over limit`}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <PieChartIcon size={20} />
                  </div>
                  <strong>No budgets set yet</strong>
                  <span>Choose a category on the left to set your first monthly cap.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
