import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { money } from '../utils/storage';
import { IncomeExpenseBarChart, CategoryDonutChart } from '../components/Charts';
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  WalletIcon,
  PieChartIcon,
  BarChartIcon,
  ChevronRightIcon,
  SparklesIcon,
  ListIcon
} from '../components/Icons';

export default function Dashboard() {
  const { currentUser } = useAuth();

  const transactions = currentUser?.transactions || [];
  const accounts = currentUser?.accounts || [
    { id: 'cash', name: 'Cash', type: 'Cash' },
    { id: 'bank', name: 'Bank Account', type: 'Bank' }
  ];
  const budgets = currentUser?.budgets || {};
  const goals = currentUser?.goals || [];

  const totalIn = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalEx = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = totalIn - totalEx;

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;
  const savingsRate = totalIn > 0 ? Math.round(((totalIn - totalEx) / totalIn) * 100) : 0;

  const recent = [...transactions].reverse().slice(0, 5);

  const getAccountName = (accVal) => {
    const found = accounts.find((a) => a.id === accVal || a.name === accVal);
    return found ? found.name : accVal || 'Cash';
  };

  // Monthly / overall category spending for Donut Chart & Budget Overview
  const categoryTotals = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const c = t.category || 'Other';
      categoryTotals[c] = (categoryTotals[c] || 0) + Number(t.amount || 0);
    });

  const donutItems = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const budgetEntries = Object.entries(budgets).slice(0, 4);

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar subtitle="Track your cashflow, budgets, and savings goals in one place." />

        {/* Hero KPI Row */}
        <section className="hero-grid">
          <div className="balance-card">
            <div className="card-head">
              <div>
                <span className="eyebrow light">TOTAL BALANCE</span>
                <span className="balance-date">
                  {accounts.length} active {accounts.length === 1 ? 'account' : 'accounts'}
                </span>
              </div>
              <span className="balance-icon">
                <WalletIcon size={20} />
              </span>
            </div>

            <div className="big-balance" id="balance">
              {money(balance)}
            </div>

            <div className="balance-footer">
              <span className="savings-rate-badge">
                {totalIn > 0 ? `${savingsRate}% net margin` : 'Available after expenses'}
              </span>
              <Link to="/transactions">
                View activity <ChevronRightIcon size={14} />
              </Link>
            </div>
          </div>

          <div className="side-stat income-stat">
            <div className="stat-top-row">
              <span className="stat-icon">
                <ArrowUpRightIcon size={20} />
              </span>
              <span className="stat-trend-tag positive">
                {incomeCount} {incomeCount === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <div>
              <small>Total income</small>
              <strong id="income">{money(totalIn)}</strong>
              <span className="stat-sub">All recorded inflows</span>
            </div>
          </div>

          <div className="side-stat expense-stat">
            <div className="stat-top-row">
              <span className="stat-icon">
                <ArrowDownRightIcon size={20} />
              </span>
              <span className="stat-trend-tag negative">
                {expenseCount} {expenseCount === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <div>
              <small>Total expenses</small>
              <strong id="expense">{money(totalEx)}</strong>
              <span className="stat-sub">All recorded outflows</span>
            </div>
          </div>
        </section>

        {/* Income vs Expenses Chart & Quick Actions */}
        <section className="content-grid">
          <div className="panel chart-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">CASHFLOW ANALYTICS</span>
                <h2>Income vs Expenses</h2>
              </div>
              <span className="pill">Monthly trend</span>
            </div>

            <IncomeExpenseBarChart transactions={transactions} />

            <div className="legend">
              <span>
                <i className="legend-dot income-dot" />
                Income ({money(totalIn)})
              </span>
              <span>
                <i className="legend-dot expense-dot" />
                Expenses ({money(totalEx)})
              </span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">QUICK ACTIONS</span>
                <h2>Manage activity</h2>
              </div>
            </div>

            <div className="quick-actions">
              <Link to="/income" className="quick-card">
                <span className="quick-icon income-bg">
                  <ArrowUpRightIcon size={19} />
                </span>
                <div>
                  <strong>Add income</strong>
                  <small>Record salary, freelance, or deposits</small>
                </div>
                <ChevronRightIcon size={16} />
              </Link>

              <Link to="/expense" className="quick-card">
                <span className="quick-icon expense-bg">
                  <ArrowDownRightIcon size={19} />
                </span>
                <div>
                  <strong>Add expense</strong>
                  <small>Log daily purchases or bills</small>
                </div>
                <ChevronRightIcon size={16} />
              </Link>

              <Link to="/budgets" className="quick-card">
                <span className="quick-icon neutral-bg">
                  <PieChartIcon size={19} />
                </span>
                <div>
                  <strong>Configure budgets</strong>
                  <small>Set category spending caps</small>
                </div>
                <ChevronRightIcon size={16} />
              </Link>

              <Link to="/reports" className="quick-card">
                <span className="quick-icon neutral-bg">
                  <BarChartIcon size={19} />
                </span>
                <div>
                  <strong>Export reports</strong>
                  <small>Download CSV insights</small>
                </div>
                <ChevronRightIcon size={16} />
              </Link>
            </div>

            <div className="budget-note">
              <span>
                <SparklesIcon size={16} />
              </span>
              <div>
                <strong>Private &amp; instant</strong>
                <small>All balances and analytics update locally in real time.</small>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Overview Grid: Spending Donut, Budget Overview, Savings Progress */}
        <section className="dashboard-secondary-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">SPENDING OVERVIEW</span>
                <h2>By category</h2>
              </div>
              <Link className="text-link" to="/reports" style={{ fontSize: '12px' }}>
                Details &rarr;
              </Link>
            </div>

            <CategoryDonutChart
              items={donutItems}
              centerLabel="Spent"
              centerValue={money(totalEx)}
            />
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">BUDGET OVERVIEW</span>
                <h2>Monthly limits</h2>
              </div>
              <Link className="text-link" to="/budgets" style={{ fontSize: '12px' }}>
                Manage &rarr;
              </Link>
            </div>

            {budgetEntries.length > 0 ? (
              <div>
                {budgetEntries.map(([cat, limit]) => {
                  const lim = Number(limit) || 0;
                  const spentAmt = categoryTotals[cat] || 0;
                  const pct = Math.min(100, lim > 0 ? Math.round((spentAmt / lim) * 100) : 0);
                  const over = spentAmt > lim;

                  return (
                    <div key={cat} className="feature-item">
                      <div className="feature-item-head">
                        <strong style={{ fontSize: '13.5px' }}>{cat}</strong>
                        <span className="tabular-nums">
                          {money(spentAmt)} / {money(lim)}
                        </span>
                      </div>
                      <div className="progress">
                        <i
                          style={{
                            width: `${pct}%`,
                            background: over ? '#dc2626' : undefined
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <PieChartIcon size={20} />
                </div>
                <strong>No budgets configured</strong>
                <span>Set monthly spending limits to track category usage.</span>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">SAVINGS PROGRESS</span>
                <h2>Active goals</h2>
              </div>
              <Link className="text-link" to="/goals" style={{ fontSize: '12px' }}>
                All goals &rarr;
              </Link>
            </div>

            {goals.length > 0 ? (
              <div>
                {goals.slice(0, 4).map((g, idx) => {
                  const targetNum = Number(g.target) || 1;
                  const savedNum = Number(g.saved) || 0;
                  const pct = Math.min(100, Math.round((savedNum / targetNum) * 100));
                  return (
                    <div key={idx} className="feature-item">
                      <div className="feature-item-head">
                        <strong style={{ fontSize: '13.5px' }}>{g.name}</strong>
                        <span className="tabular-nums">{pct}%</span>
                      </div>
                      <div className="progress">
                        <i style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ display: 'block', marginTop: '6px', fontSize: '11.5px' }}>
                        {money(savedNum)} saved of {money(targetNum)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <SparklesIcon size={20} />
                </div>
                <strong>No savings goals yet</strong>
                <span>Create a target in Goals to monitor your progress here.</span>
              </div>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="panel transactions-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">RECENT ACTIVITY</span>
              <h2>Latest transactions</h2>
            </div>
            <Link className="secondary-btn" to="/transactions">
              See all transactions <ChevronRightIcon size={15} />
            </Link>
          </div>

          <div id="recentTransactions" className="transaction-list">
            {recent.length ? (
              recent.map((t) => (
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
                      <span>{t.date || 'No date'}</span>
                      {t.category && <span className="tx-pill">{t.category}</span>}
                      {t.account && (
                        <span className="tx-pill">{getAccountName(t.account)}</span>
                      )}
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
                <strong>No transactions yet</strong>
                <span>Add your first income or expense to populate your activity feed.</span>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
