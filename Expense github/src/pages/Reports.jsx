import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { money } from '../utils/storage';
import { IncomeExpenseBarChart, CategoryDonutChart } from '../components/Charts';
import { DownloadIcon, PieChartIcon, WalletIcon } from '../components/Icons';

export default function Reports() {
  const { currentUser } = useAuth();

  const transactions = currentUser?.transactions || [];
  const accounts = currentUser?.accounts || [
    { id: 'cash', name: 'Cash', type: 'Cash' },
    { id: 'bank', name: 'Bank Account', type: 'Bank' }
  ];

  const totalIn = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalEx = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = totalIn - totalEx;

  // Spending by category
  const cats = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const c = t.category || 'Other';
      cats[c] = (cats[c] || 0) + Number(t.amount || 0);
    });

  const catRows = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const maxCat = catRows[0]?.[1] || 1;
  const donutItems = catRows.map(([label, value]) => ({ label, value }));

  const handleExportCsv = () => {
    const rows = [
      ['Date', 'Type', 'Amount', 'Category', 'Description', 'Account'],
      ...transactions.map((t) => [
        t.date || '',
        t.type,
        t.amount,
        t.category || '',
        t.source || t.note || '',
        t.account || 'Cash'
      ])
    ];

    const csvContent = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expense-tracker-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-page">
      <Sidebar role="user" />
      <main className="main">
        <Navbar
          title="Financial Reports"
          eyebrow="INSIGHTS & EXPORTS"
          subtitle="Analyze spending patterns, account balances, and export CSV statements."
        />

        <section className="panel" style={{ marginBottom: '20px' }}>
          <div className="panel-head">
            <div>
              <span className="eyebrow">EXECUTIVE SUMMARY</span>
              <h2>Financial report</h2>
              <p className="muted" style={{ marginTop: '4px' }}>
                Review your complete inflow, outflow, and category performance.
              </p>
            </div>
            <button
              className="lime-btn"
              id="exportCsv"
              type="button"
              onClick={handleExportCsv}
            >
              <DownloadIcon size={16} />
              Export CSV
            </button>
          </div>

          <div className="report-stats" id="reportStats">
            <div className="kpi-mini-card">
              <span>Total income</span>
              <strong style={{ color: 'var(--success)' }}>{money(totalIn)}</strong>
            </div>
            <div className="kpi-mini-card">
              <span>Total expenses</span>
              <strong>{money(totalEx)}</strong>
            </div>
            <div className="kpi-mini-card dark">
              <span>Net balance</span>
              <strong>{money(balance)}</strong>
            </div>
            <div className="kpi-mini-card">
              <span>Transactions</span>
              <strong>{transactions.length}</strong>
            </div>
          </div>

          <div className="content-grid" style={{ marginBottom: 0 }}>
            <div className="panel" style={{ boxShadow: 'none', background: 'var(--surface-subtle)' }}>
              <div className="panel-head">
                <div>
                  <span className="eyebrow">CASHFLOW</span>
                  <h2>Monthly comparison</h2>
                </div>
              </div>
              <IncomeExpenseBarChart transactions={transactions} height={210} />
            </div>

            <div className="panel" style={{ boxShadow: 'none', background: 'var(--surface-subtle)' }}>
              <div className="panel-head">
                <div>
                  <span className="eyebrow">DISTRIBUTION</span>
                  <h2>Category share</h2>
                </div>
              </div>
              <CategoryDonutChart
                items={donutItems}
                centerLabel="Expenses"
                centerValue={money(totalEx)}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="report-grid">
            <div>
              <h3>Spending by category</h3>
              <div id="categoryReport">
                {catRows.length ? (
                  catRows.map(([c, v]) => (
                    <div key={c} className="feature-item">
                      <div className="feature-item-head">
                        <strong>{c}</strong>
                        <span className="tabular-nums">{money(v)}</span>
                      </div>
                      <div className="progress">
                        <i style={{ width: `${Math.min(100, (v / maxCat) * 100)}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <PieChartIcon size={20} />
                    </div>
                    <strong>No expense data</strong>
                    <span>Record expenses to view category breakdowns.</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3>Account summary</h3>
              <div id="accountReport">
                {accounts.length ? (
                  accounts.map((a) => {
                    const v = transactions
                      .filter((t) => t.account === a.id || t.account === a.name)
                      .reduce(
                        (s, t) =>
                          s + (t.type === 'income' ? 1 : -1) * Number(t.amount || 0),
                        0
                      );
                    return (
                      <div key={a.id} className="feature-item">
                        <div className="feature-item-head">
                          <div>
                            <strong>{a.name}</strong>
                            <span style={{ display: 'block', fontSize: '11.5px' }}>
                              {a.type}
                            </span>
                          </div>
                          <strong className="tabular-nums" style={{ fontSize: '15px' }}>
                            {money(v)}
                          </strong>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <WalletIcon size={20} />
                    </div>
                    <strong>No accounts found</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
