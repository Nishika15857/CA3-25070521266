import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to CampusLoop 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally { setLoading(false); }
  };

  const field = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <Link to="/" className="auth-logo"><span>🔁</span> CampusLoop</Link>
          </div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Free to join. Start reporting in seconds.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="name">Display Name</label>
              <input id="name" type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="Your name" value={form.name} onChange={e => field('name', e.target.value)} autoComplete="name" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={e => field('email', e.target.value)} autoComplete="email" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="reg-pass">Password</label>
              <div className="pass-wrap">
                <input id="reg-pass" type={showPass ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Min 6 characters" value={form.password} onChange={e => field('password', e.target.value)} autoComplete="new-password" />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)}>{showPass ? '🙈' : '👁'}</button>
              </div>
              {form.password && (
                <div className="strength-bar">
                  <div className={`strength-fill s${strength}`} />
                  <span className="strength-label">{['', 'Weak', 'Fair', 'Strong'][strength]}</span>
                </div>
              )}
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="confirm-pass">Confirm Password</label>
              <input id="confirm-pass" type="password" className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat password" value={form.confirmPassword} onChange={e => field('confirmPassword', e.target.value)} autoComplete="new-password" />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-privacy">By registering, you agree to use CampusLoop responsibly and follow our <Link to="/safety">safety guidelines</Link>.</p>
        </div>

        <div className="auth-side">
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=800&fit=crop" alt="Campus life" />
          <div className="auth-side-overlay">
            <h3>Lost something on campus?</h3>
            <p>Create a free account and start searching or reporting lost and found items today.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
