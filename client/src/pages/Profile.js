import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/services';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.length < 2) { setErrors({ name: 'Name must be at least 2 characters' }); return; }
    setLoading(true);
    try {
      const res = await authService.updateProfile({ name });
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setErrors({});
    } catch { toast.error('Could not update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!passForm.currentPassword) e2.currentPassword = 'Required';
    if (passForm.newPassword.length < 6) e2.newPassword = 'Min 6 characters';
    if (passForm.newPassword !== passForm.confirmNew) e2.confirmNew = 'Passwords do not match';
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setPassLoading(true);
    try {
      await authService.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed! Please log in again.');
      setPassForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not change password'); }
    finally { setPassLoading(false); }
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--background)' }}>
      <div className="page-header">
        <div className="container"><h1>👤 Profile Settings</h1><p>Manage your account information</p></div>
      </div>
      <div className="container" style={{ maxWidth: 680, padding: '2rem 1.5rem' }}>

        {/* Profile info */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1.25rem' }}>Account Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--charcoal-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: 56, height: 56, background: 'var(--green-600)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
                <span className={`badge ${user?.role === 'admin' ? 'badge-approved' : 'badge-active'}`} style={{ marginTop: '4px' }}>{user?.role}</span>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Display Name</label>
                <input className={`form-control ${errors.name ? 'error' : ''}`} value={name} onChange={e => { setName(e.target.value); setErrors({}); }} />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Email Address</label>
                <input className="form-control" value={user?.email} disabled style={{ opacity: 0.6 }} />
                <p className="form-hint">Email cannot be changed.</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
            </form>
          </div>
        </div>

        {/* Change password */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1.25rem' }}>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              {['currentPassword', 'newPassword', 'confirmNew'].map((field, i) => (
                <div className="form-group" key={field} style={{ marginBottom: '1rem' }}>
                  <label className="form-label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
                  <input type="password" className={`form-control ${errors[field] ? 'error' : ''}`}
                    value={passForm[field]} onChange={e => { setPassForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: '' })); }} />
                  {errors[field] && <p className="form-error">{errors[field]}</p>}
                </div>
              ))}
              <button type="submit" className="btn btn-primary" disabled={passLoading}>{passLoading ? 'Changing…' : 'Change Password'}</button>
            </form>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: '#fca5a5' }}>
          <div className="card-body">
            <h3 style={{ color: '#dc2626', marginBottom: '0.75rem' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>Logging out will end your current session.</p>
            <button className="btn btn-danger" onClick={() => { if (window.confirm('Are you sure you want to log out?')) logout(); }}>
              🚪 Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
