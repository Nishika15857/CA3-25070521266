import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('password')) setErrors({ password: msg });
      else setErrors({ email: msg });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <Link to="/" className="auth-logo">
              <span>🔁</span> CampusLoop
            </Link>
          </div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to manage your reports and claims</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email" type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="pass-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>

          <div className="demo-creds">
            <p className="demo-label">🧪 Demo Credentials</p>
            <button className="demo-btn" onClick={() => setForm({ email: 'demo@campusloop.com', password: 'Demo@123456' })}>
              User: demo@campusloop.com / Demo@123456
            </button>
            <button className="demo-btn" onClick={() => setForm({ email: 'admin@campusloop.com', password: 'Admin@123456' })}>
              Admin: admin@campusloop.com / Admin@123456
            </button>
          </div>
        </div>

        <div className="auth-side">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=800&fit=crop" alt="Campus" />
          <div className="auth-side-overlay">
            <h3>Reuniting lost belongings</h3>
            <p>Join thousands of students using CampusLoop to find their lost items.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
