import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { saveUser, money } from '../utils/storage';
import { CheckCircleIcon, CloseIcon, PlusIcon, TargetIcon } from '../components/Icons';

export default function Goals() {
  const { currentUser, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('0');
  const [message, setMessage] = useState('');

  // Deposit to goal modal or quick add
  const [activeGoalIndex, setActiveGoalIndex] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  const goals = currentUser?.goals || [];

  const totalSaved = goals.reduce((s, g) => s + Number(g.saved || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target || 0), 0);
  const completedCount = goals.filter(
    (g) => Number(g.saved || 0) >= Number(g.target || 1)
  ).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !target) return;

    const newGoal = {
      name: name.trim(),
      target: Number(target),
      saved: Number(saved || 0)
    };

    const updatedGoals = [...goals, newGoal];
    saveUser({
      ...currentUser,
      goals: updatedGoals
    });

    refreshUser();
    setMessage('Goal added successfully.');
    setName('');
    setTarget('');
    setSaved('0');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteGoal = (index) => {
    if (window.confirm('Delete this goal?')) {
      const updatedGoals = goals.filter((_, i) => i !== index);
      saveUser({
        ...currentUser,
        goals: updatedGoals
      });
      refreshUser();
    }
  };

  const handleAddSavings = (e) => {
    e.preventDefault();
    if (activeGoalIndex === null || !addAmount) return;

    const updatedGoals = [...goals];
    updatedGoals[activeGoalIndex] = {
      ...updatedGoals[activeGoalIndex],
      saved: Number(updatedGoals[activeGoalIndex].saved || 0) + Number(addAmount)
    };

    saveUser({
      ...currentUser,
      goals: updatedGoals
    });

    refreshUser();
    setActiveGoalIndex(null);
    setAddAmount('');
  };

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar
          title="Savings Goals"
          eyebrow="FINANCIAL GOALS"
          subtitle="Define milestones, allocate deposits, and watch your progress grow."
        />

        <section className="kpi-strip">
          <div className="kpi-mini-card dark">
            <span>Total Saved Across Goals</span>
            <strong>{money(totalSaved)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Combined Goal Targets</span>
            <strong>{money(totalTarget)}</strong>
          </div>
          <div className="kpi-mini-card">
            <span>Completed Goals</span>
            <strong style={{ color: 'var(--success)' }}>
              {completedCount} / {goals.length}
            </strong>
          </div>
        </section>

        <section className="feature-grid">
          <div className="panel">
            <span className="eyebrow">NEW MILESTONE</span>
            <h2>Set a savings goal</h2>
            <p className="muted" style={{ marginTop: '6px' }}>
              Define a target amount and track every contribution toward it.
            </p>

            <form id="goalForm" className="form-stack" onSubmit={handleSubmit}>
              <label>
                Goal name
                <input
                  id="goalName"
                  required
                  placeholder="New laptop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Target amount (₹)
                <input
                  id="goalTarget"
                  type="number"
                  min="1"
                  required
                  placeholder="50000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </label>

              <label>
                Current saved (₹)
                <input
                  id="goalSaved"
                  type="number"
                  min="0"
                  required
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                />
              </label>

              <button className="primary-btn" type="submit">
                Add goal <span>→</span>
              </button>

              {message && (
                <p id="goalMessage" className="form-message message-success">
                  <CheckCircleIcon size={16} />
                  {message}
                </p>
              )}
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">PROGRESS</span>
                <h2>Your goals</h2>
              </div>
              <span className="pill">{goals.length} goals</span>
            </div>

            <div id="goalList">
              {goals.length ? (
                goals.map((g, idx) => {
                  const targetNum = Number(g.target) || 1;
                  const savedNum = Number(g.saved) || 0;
                  const p = Math.min(100, Math.round((savedNum / targetNum) * 100));
                  const isCompleted = savedNum >= targetNum;

                  return (
                    <div key={idx} className="feature-item">
                      <div className="feature-item-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '14.5px' }}>{g.name}</strong>
                          {isCompleted && (
                            <span className="status-badge ok">Reached! ✓</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => {
                              setActiveGoalIndex(idx);
                              setAddAmount('');
                            }}
                          >
                            <PlusIcon size={13} /> Add
                          </button>
                          <button
                            type="button"
                            className="tx-action-btn"
                            title="Delete goal"
                            aria-label={`Delete ${g.name}`}
                            onClick={() => handleDeleteGoal(idx)}
                          >
                            <CloseIcon size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="progress">
                        <i
                          style={{
                            width: `${p}%`,
                            background: isCompleted ? '#15803d' : undefined
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '7px',
                          fontSize: '12px',
                          color: 'var(--muted)'
                        }}
                      >
                        <span className="tabular-nums">
                          {money(savedNum)} / {money(targetNum)}
                        </span>
                        <strong style={{ color: 'var(--ink)' }}>{p}%</strong>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <TargetIcon size={20} />
                  </div>
                  <strong>No goals added yet</strong>
                  <span>Create a savings target on the left to start tracking progress.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Add Savings Modal */}
        {activeGoalIndex !== null && (
          <div className="modal-overlay" onClick={() => setActiveGoalIndex(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add to &ldquo;{goals[activeGoalIndex]?.name}&rdquo;</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  aria-label="Close modal"
                  onClick={() => setActiveGoalIndex(null)}
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSavings} className="form-stack">
                <label>
                  Amount to deposit (₹)
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Enter amount"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                  />
                </label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="primary-btn" type="submit" style={{ flex: 1 }}>
                    Add savings <span>✓</span>
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setActiveGoalIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}
