import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  WalletIcon
} from '../components/Icons';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = login(email, password);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 450);
    } else {
      setSubmitting(false);
      setMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand">
          <div className="auth-brand-top">
            <div className="brand-row">
              <div className="brand-mark">ET</div>
              <div className="brand-name-stack">
                <strong>Expense Tracker</strong>
                <small>Personal Finance Suite</small>
              </div>
            </div>

            <span className="eyebrow">SMART MONEY MANAGEMENT</span>
            <h1>
              Take control of
              <br />
              <span>your money.</span>
            </h1>
            <p>
              Track income, categorize daily expenses, manage multiple accounts, and hit your
              savings goals from one calm fintech workspace.
            </p>

            <div className="auth-features">
              <div className="auth-feature-pill">
                <WalletIcon size={16} />
                <span>Multi-account balances &amp; monthly budgets</span>
              </div>
              <div className="auth-feature-pill">
                <ShieldIcon size={16} />
                <span>100% private local browser persistence</span>
              </div>
            </div>
          </div>

          <div className="auth-orbit">
            <div className="orbit-card">
              <div className="orbit-dot">₹</div>
              <small>Net Balance Overview</small>
              <strong className="tabular-nums">₹48,260</strong>
              <span>
                <ArrowUpRightIcon size={14} /> 12.8% savings velocity
              </span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="mobile-brand">
            <div className="brand-mark">ET</div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Expense Tracker</strong>
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                Personal Finance Suite
              </small>
            </div>
          </div>

          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in</h2>
          <p className="muted">Enter your account credentials to open your dashboard.</p>

          <form id="loginForm" className="form-stack" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                id="loginEmail"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              Password
              <div className="input-wrap">
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              </div>
            </label>

            {message.text && (
              <p
                id="loginMessage"
                className={`form-message ${
                  message.type === 'success' ? 'message-success' : 'message-error'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircleIcon size={16} />
                ) : (
                  <AlertCircleIcon size={16} />
                )}
                {message.text}
              </p>
            )}

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
              <span>{submitting ? <span className="spinner-ring sm" /> : '→'}</span>
            </button>
          </form>

          <p className="switch-text">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </p>

          <Link className="admin-link" to="/admin/login">
            <ShieldIcon size={15} />
            <span>Sign in to Admin Console</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
