import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { saveUser, addTransaction, money } from '../utils/storage';
import { CheckCircleIcon, PlusIcon, RepeatIcon, TrashIcon } from '../components/Icons';

export default function Recurring() {
  const { currentUser, refreshUser } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [date, setDate] = useState(today);
  const [frequency, setFrequency] = useState('Monthly');
  const [message, setMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const recurring = currentUser?.recurring || [];

  const totalScheduled = recurring.reduce((s, r) => s + Number(r.amount || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !date) return;

    const newReminder = {
      name: name.trim(),
      amount: Number(amount),
      category,
      date,
      frequency
    };

    const updated = [...recurring, newReminder];
    saveUser({
      ...currentUser,
      recurring: updated
    });

    refreshUser();
    setMessage('Reminder saved.');
    setName('');
    setAmount('');
    setDate(today);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogExpense = (item) => {
    const defaultAccountId = currentUser?.accounts?.[0]?.id || 'cash';
    addTransaction(currentUser.email, {
      type: 'expense',
      amount: Number(item.amount),
      category: item.category,
      note: item.name,
      date: item.date || today,
      account: defaultAccountId
    });

    refreshUser();
    setActionMessage(`Expense of ${money(item.amount)} recorded for ${item.name}!`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleDeleteReminder = (index) => {
    if (window.confirm('Delete this recurring reminder?')) {
      const updated = recurring.filter((_, i) => i !== index);
      saveUser({
        ...currentUser,
        recurring: updated
      });
      refreshUser();
    }
  };

  const sortedList = [...recurring].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '')
  );

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar
          title="Recurring Bills"
          eyebrow="RECURRING EXPENSES"
          subtitle="Stay ahead of subscriptions, rent, and scheduled payments."
        />

        <section className="kpi-strip">
          <div className="kpi-mini-card dark">
            <span>Scheduled Commitments</span>
            <strong>{money(totalScheduled)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Active Reminders</span>
            <strong>{recurring.length}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Next Due Date</span>
            <strong>{sortedList[0]?.date || '—'}</strong>
          </div>
        </section>

        <section className="feature-grid">
          <div className="panel">
            <span className="eyebrow">NEW SCHEDULE</span>
            <h2>Set a reminder</h2>
            <p className="muted" style={{ marginTop: '6px' }}>
              Keep track of rent, subscriptions, utilities, and repeating expenses.
            </p>

            <form id="recurringForm" className="form-stack" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  id="recurringName"
                  required
                  placeholder="Netflix subscription"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Amount (₹)
                <input
                  id="recurringAmount"
                  type="number"
                  min="1"
                  required
                  placeholder="649"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>

              <label>
                Category
                <select
                  id="recurringCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Next due date
                <input
                  id="recurringDate"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <label>
                Frequency
                <select
                  id="recurringFrequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </label>

              <button className="primary-btn" type="submit">
                Save reminder <span>→</span>
              </button>

              {message && (
                <p id="recurringMessage" className="form-message message-success">
                  <CheckCircleIcon size={16} />
                  {message}
                </p>
              )}
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">REMINDERS</span>
                <h2>Upcoming payments</h2>
              </div>
              <span className="pill">{sortedList.length} scheduled</span>
            </div>

            {actionMessage && (
              <p className="form-message message-success" style={{ marginBottom: '14px' }}>
                <CheckCircleIcon size={16} />
                {actionMessage}
              </p>
            )}

            <div id="recurringList">
              {sortedList.length ? (
                sortedList.map((r, i) => {
                  const originalIndex = recurring.indexOf(r);
                  return (
                    <div key={i} className="feature-item">
                      <div className="feature-item-head">
                        <div>
                          <strong style={{ fontSize: '14.5px', display: 'block' }}>
                            {r.name}
                          </strong>
                          <div className="tx-meta" style={{ marginTop: '4px' }}>
                            <span className="tx-pill">{r.frequency}</span>
                            <span className="tx-pill">{r.category}</span>
                            <span>Due {r.date}</span>
                          </div>
                        </div>
                        <strong className="tabular-nums" style={{ fontSize: '16px' }}>
                          {money(r.amount)}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleLogExpense(r)}
                        >
                          <PlusIcon size={14} /> Add expense
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteReminder(originalIndex >= 0 ? originalIndex : i)
                          }
                        >
                          <TrashIcon size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <RepeatIcon size={20} />
                  </div>
                  <strong>No recurring reminders yet</strong>
                  <span>Add rent or subscriptions to log them with one click.</span>
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
