import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  TargetIcon,
  BarChartIcon
} from '../components/Icons';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const clamped = Math.max(1, score);
    if (clamped <= 1) return { level: 1, cls: 'weak', label: 'Weak' };
    if (clamped <= 2) return { level: 2, cls: 'medium', label: 'Fair' };
    return { level: clamped, cls: 'strong', label: 'Strong' };
  };

  const strength = getStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = signup(name, email, password);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        navigate('/');
      }, 550);
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

            <span className="eyebrow">GET STARTED IN SECONDS</span>
            <h1>
              Build better
              <br />
              <span>money habits.</span>
            </h1>
            <p>
              Start tracking every rupee with automated category insights, recurring bill
              reminders, and personal savings targets.
            </p>

            <div className="auth-features">
              <div className="auth-feature-pill">
                <BarChartIcon size={16} />
                <span>Real-time cashflow &amp; CSV reports</span>
              </div>
              <div className="auth-feature-pill">
                <TargetIcon size={16} />
                <span>Custom savings goals &amp; budget alerts</span>
              </div>
            </div>
          </div>

          <div className="auth-orbit">
            <div className="orbit-card">
              <div className="orbit-dot">+</div>
              <small>Monthly Budget Tracker</small>
              <strong className="tabular-nums">₹24,580</strong>
              <span>Under budget &middot; On track</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="mobile-brand">
            <div className="brand-mark">ET</div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Expense Tracker</strong>
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                Create your account
              </small>
            </div>
          </div>

          <span className="eyebrow">CREATE ACCOUNT</span>
          <h2>Sign up</h2>
          <p className="muted">Your financial data stays privately inside your browser.</p>

          <form id="signupForm" className="form-stack" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                id="signupName"
                type="text"
                placeholder="Alex Morgan"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              Email address
              <input
                id="signupEmail"
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
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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
              {password && (
                <div className="password-strength">
                  <div className="password-strength-bars">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={step <= strength.level ? `filled ${strength.cls}` : ''}
                      />
                    ))}
                  </div>
                  <small>{strength.label}</small>
                </div>
              )}
            </label>

            {message.text && (
              <p
                id="signupMessage"
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
              {submitting ? 'Creating account...' : 'Create account'}
              <span>{submitting ? <span className="spinner-ring sm" /> : '→'}</span>
            </button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
