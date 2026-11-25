import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from '../../components/Icons';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { isAdmin, adminLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = adminLogin(email, password);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 450);
    } else {
      setSubmitting(false);
      setMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="auth-page admin-auth">
      <div className="auth-card standalone">
        <div className="brand-mark">ET</div>
        <div className="admin-badge-pill">
          <ShieldIcon size={14} />
          <span>RESTRICTED ADMIN PORTAL</span>
        </div>

        <h2 style={{ fontSize: '30px' }}>Admin sign in</h2>
        <p className="muted">
          Authenticate with administrator credentials to monitor users and ledger activity.
        </p>

        <form id="adminLoginForm" className="form-stack" onSubmit={handleSubmit}>
          <label>
            Admin email
            <input
              id="adminEmail"
              type="email"
              required
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <div className="input-wrap">
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
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
              id="adminMessage"
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
            {submitting ? 'Authenticating...' : 'Open admin dashboard'}
            <span>{submitting ? <span className="spinner-ring sm" /> : '→'}</span>
          </button>
        </form>

        <Link className="switch-text" to="/">
          &larr; Back to user login
        </Link>
      </div>
    </div>
  );
}
