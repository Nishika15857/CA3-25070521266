import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject required';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await contactService.submitContact(form);
      setSubmitted(true);
      toast.success('Message sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message');
    } finally { setLoading(false); }
  };

  const field = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div className="page-wrapper" style={{ background: 'var(--background)' }}>
      <div className="page-header">
        <div className="container"><h1>📬 Contact Us</h1><p>Have a question or need help? We're here for you.</p></div>
      </div>
      <div className="container" style={{ maxWidth: 800, padding: '3rem 1.5rem' }}>
        {submitted ? (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <div className="empty-state-icon">✅</div>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
            <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Send Another</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.75rem' }}>Get in Touch</h2>
              <p style={{ marginBottom: '2rem' }}>Fill out the form and our team will respond within 24 hours.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: '🏢', title: 'CampusLoop', desc: 'Smart Campus Lost & Found Portal' },
                  { icon: '📧', title: 'Email', desc: 'support@campusloop.app' },
                  { icon: '🕐', title: 'Response Time', desc: 'Usually within 24 hours' },
                  { icon: '🔗', title: 'Quick Help', desc: <><Link to="/safety" style={{ color: 'var(--green-600)' }}>Safety Guidelines</Link> · <Link to="/about" style={{ color: 'var(--green-600)' }}>About Us</Link></> },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem' }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.125rem', color: 'var(--text-primary)' }}>{item.title}</p>
                      <p style={{ fontSize: '0.875rem' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
              {[
                { key: 'name', label: 'Your Name', type: 'text', placeholder: 'Full name' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                { key: 'subject', label: 'Subject', type: 'text', placeholder: 'How can we help?' },
              ].map(f => (
                <div className="form-group" key={f.key} style={{ marginBottom: '1rem' }}>
                  <label className="form-label">{f.label} *</label>
                  <input type={f.type} className={`form-control ${errors[f.key] ? 'error' : ''}`}
                    placeholder={f.placeholder} value={form[f.key]} onChange={e => field(f.key, e.target.value)} />
                  {errors[f.key] && <p className="form-error">{errors[f.key]}</p>}
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Message *</label>
                <textarea className={`form-control ${errors.message ? 'error' : ''}`} rows={5}
                  placeholder="Describe your question or issue in detail…"
                  value={form.message} onChange={e => field('message', e.target.value)} />
                {errors.message && <p className="form-error">{errors.message}</p>}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending…' : '📨 Send Message'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
