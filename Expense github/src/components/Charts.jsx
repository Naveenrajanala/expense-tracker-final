import React, { useState } from 'react';
import { money } from '../utils/storage';

const CHART_COLORS = [
  '#143D30',
  '#84CC16',
  '#10B981',
  '#4D7C0F',
  '#0F766E',
  '#65A30D',
  '#334155',
  '#D97706'
];

export function formatShortCurrency(value) {
  const num = Number(value || 0);
  if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  return `₹${Math.round(num)}`;
}

/**
 * Interactive grouped bar + trend chart for Income vs Expenses across months.
 * Falls back gracefully when there are 0 or 1 months of transactions.
 */
export function IncomeExpenseBarChart({ transactions = [], height = 230 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Group transactions by YYYY-MM
  const monthMap = {};
  transactions.forEach((t) => {
    const rawDate = t.date || '';
    const key = rawDate.length >= 7 ? rawDate.slice(0, 7) : 'Current';
    if (!monthMap[key]) {
      monthMap[key] = { key, income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthMap[key].income += Number(t.amount || 0);
    } else if (t.type === 'expense') {
      monthMap[key].expense += Number(t.amount || 0);
    }
  });

  let series = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
  if (series.length > 6) {
    series = series.slice(-6);
  }

  // If no transactions, show clean baseline bars for the last 4 months
  if (series.length === 0) {
    const now = new Date();
    series = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return { key: `${y}-${m}`, income: 0, expense: 0 };
    });
  }

  const formatMonthLabel = (key) => {
    if (key === 'Current' || !key.includes('-')) return key;
    const [y, m] = key.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const maxVal = Math.max(
    1000,
    ...series.map((s) => Math.max(s.income, s.expense))
  );
  // Round maxVal up nicely
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const niceMax = Math.ceil(maxVal / magnitude) * magnitude;

  const yTicks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  const padLeft = 52;
  const padRight = 18;
  const padTop = 14;
  const padBottom = 30;
  const vbWidth = 560;
  const vbHeight = height;
  const plotW = vbWidth - padLeft - padRight;
  const plotH = vbHeight - padTop - padBottom;
  const groupW = plotW / series.length;
  const barW = Math.min(26, Math.max(12, groupW * 0.24));
  const gap = 6;

  return (
    <div className="fintech-chart-container" id="moneyChart">
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="fintech-svg-chart"
        role="img"
        aria-label="Income vs Expenses chart"
      >
        <defs>
          <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#143D30" />
            <stop offset="100%" stopColor="#1E5B47" />
          </linearGradient>
          <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8F135" />
            <stop offset="100%" stopColor="#9ED119" />
          </linearGradient>
        </defs>

        {/* Grid lines & Y-axis labels */}
        {yTicks.map((tick, i) => {
          const y = padTop + (i / 4) * plotH;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={vbWidth - padRight}
                y2={y}
                stroke="#E5EBE6"
                strokeDasharray={i === 4 ? '0' : '4 4'}
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10.5"
                fill="#73837D"
                fontWeight="600"
              >
                {formatShortCurrency(tick)}
              </text>
            </g>
          );
        })}

        {/* Grouped Bars */}
        {series.map((item, idx) => {
          const centerX = padLeft + idx * groupW + groupW / 2;
          const incH = Math.max(item.income > 0 ? 4 : 2, (item.income / niceMax) * plotH);
          const expH = Math.max(item.expense > 0 ? 4 : 2, (item.expense / niceMax) * plotH);
          const incX = centerX - barW - gap / 2;
          const expX = centerX + gap / 2;
          const incY = padTop + plotH - incH;
          const expY = padTop + plotH - expH;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={item.key}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && (
                <rect
                  x={padLeft + idx * groupW + 4}
                  y={padTop}
                  width={groupW - 8}
                  height={plotH}
                  rx="8"
                  fill="#F1F5F2"
                />
              )}
              <rect
                x={incX}
                y={incY}
                width={barW}
                height={incH}
                rx="6"
                fill="url(#incomeBarGrad)"
                opacity={item.income > 0 ? 1 : 0.25}
              />
              <rect
                x={expX}
                y={expY}
                width={barW}
                height={expH}
                rx="6"
                fill="url(#expenseBarGrad)"
                opacity={item.expense > 0 ? 1 : 0.35}
              />
              <text
                x={centerX}
                y={vbHeight - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isHovered ? '700' : '600'}
                fill={isHovered ? '#0B221B' : '#6D7D77'}
              >
                {formatMonthLabel(item.key)}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIdx !== null && series[hoveredIdx] && (
        <div className="chart-tooltip">
          <strong>{formatMonthLabel(series[hoveredIdx].key)}</strong>
          <div className="chart-tooltip-row">
            <span className="dot-forest" /> Income: <b>{money(series[hoveredIdx].income)}</b>
          </div>
          <div className="chart-tooltip-row">
            <span className="dot-lime" /> Expenses: <b>{money(series[hoveredIdx].expense)}</b>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Clean SVG Donut Chart for Spending Categories or Allocation Breakdown.
 */
export function CategoryDonutChart({ items = [], centerLabel = 'Total', centerValue = '₹0' }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const size = 156;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="donut-layout">
      <div className="donut-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EEF2EE"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            items.map((item, idx) => {
              const pct = item.value / total;
              const dashLength = pct * circumference;
              const offset = -cumulativeOffset;
              cumulativeOffset += dashLength;
              return (
                <circle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${Math.max(0, dashLength - 2)} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
            })}
        </svg>
        <div className="donut-center">
          <small>{centerLabel}</small>
          <strong>{centerValue}</strong>
        </div>
      </div>

      <div className="donut-legend">
        {items.length > 0 && total > 0 ? (
          items.slice(0, 5).map((item, idx) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.label} className="donut-legend-row">
                <div className="donut-legend-left">
                  <span
                    className="donut-swatch"
                    style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="donut-label">{item.label}</span>
                </div>
                <div className="donut-legend-right">
                  <strong>{money(item.value)}</strong>
                  <small>{pct}%</small>
                </div>
              </div>
            );
          })
        ) : (
          <div className="donut-empty-note">Add expenses to see category distribution.</div>
        )}
      </div>
    </div>
  );
}
