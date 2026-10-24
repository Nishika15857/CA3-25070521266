import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../services/services';
import toast from 'react-hot-toast';
import './ReportForm.css';

const CATEGORIES = [
  'Electronics','Books & Stationery','Bags & Luggage','Clothing & Accessories',
  'ID & Documents','Keys','Wallet & Money','Water Bottle',
  'Headphones & Earbuds','Spectacles','Sports Equipment','Jewellery','Other'
];

export default function ReportLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '', date: '', location: '',
    additionalInfo: '', contactMethod: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.category) e.category = 'Please select a category';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.date) e.date = 'Date is required';
    else if (new Date(form.date) > new Date()) e.date = 'Date cannot be in the future';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo(0, 0); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('type', 'lost');
      images.forEach(img => fd.append('images', img));
      const res = await itemService.createItem(fd);
      toast.success('Lost item reported successfully!');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit report.';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const field = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div className="report-page page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>🔴 Report a Lost Item</h1>
          <p>Provide as much detail as possible to help others identify your item</p>
        </div>
      </div>

      <div className="container">
        <div className="report-layout">
          <form className="report-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3 className="form-section-title">📋 Basic Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Item Name *</label>
                  <input id="title" className={`form-control ${errors.title ? 'error' : ''}`}
                    placeholder="e.g. Blue Backpack, Silver Keys" value={form.title} onChange={e => field('title', e.target.value)} />
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category *</label>
                  <select id="category" className={`form-control ${errors.category ? 'error' : ''}`}
                    value={form.category} onChange={e => field('category', e.target.value)}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="form-error">{errors.category}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Detailed Description *</label>
                <textarea id="description" className={`form-control ${errors.description ? 'error' : ''}`}
                  rows={5} placeholder="Describe color, size, brand, distinctive features…"
                  value={form.description} onChange={e => field('description', e.target.value)} />
                {errors.description && <p className="form-error">{errors.description}</p>}
                <p className="form-hint">{form.description.length}/1000 characters</p>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">📍 When &amp; Where</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date Lost *</label>
                  <input id="date" type="date" className={`form-control ${errors.date ? 'error' : ''}`}
                    max={today} value={form.date} onChange={e => field('date', e.target.value)} />
                  {errors.date && <p className="form-error">{errors.date}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Approximate Location *</label>
                  <input id="location" className={`form-control ${errors.location ? 'error' : ''}`}
                    placeholder="e.g. Library Ground Floor, Block B Canteen"
                    value={form.location} onChange={e => field('location', e.target.value)} />
                  {errors.location && <p className="form-error">{errors.location}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">📸 Photo (optional)</h3>
              <div className="form-group">
                <label className="form-label">Upload up to 4 images</label>
                <div className="image-upload-area" onClick={() => document.getElementById('images').click()}>
                  <input id="images" type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                  <div className="upload-prompt">
                    <span className="upload-icon">📷</span>
                    <p>Click to upload images (max 4, 5MB each)</p>
                    <p className="text-xs text-muted">JPEG, PNG, WebP supported</p>
                  </div>
                </div>
                {previews.length > 0 && (
                  <div className="image-previews">
                    {previews.map((url, i) => (
                      <div key={i} className="preview-wrap">
                        <img src={url} alt={`Preview ${i+1}`} />
                        <button type="button" className="remove-img" onClick={() => removeImage(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">ℹ️ Additional Details</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="additionalInfo">Additional Identifying Information</label>
                <textarea id="additionalInfo" className="form-control" rows={3}
                  placeholder="Any other details that would help identify the item (contents, stickers, damage, etc.)"
                  value={form.additionalInfo} onChange={e => field('additionalInfo', e.target.value)} />
                <p className="form-hint">Keep sensitive serial numbers private — they can be used to verify ownership.</p>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contactMethod">Preferred Contact Method</label>
                <input id="contactMethod" className="form-control"
                  placeholder="e.g. Email me at..., WhatsApp on..."
                  value={form.contactMethod} onChange={e => field('contactMethod', e.target.value)} />
              </div>
            </div>

            <div className="form-submit-row">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner spinner-sm" /> Submitting…</> : '🔴 Submit Lost Report'}
              </button>
            </div>
          </form>

          <aside className="report-tips">
            <div className="tips-card">
              <h4>💡 Tips for a better report</h4>
              <ul>
                <li>Include brand, color, and size details</li>
                <li>Mention the exact location where you last had it</li>
                <li>Upload a photo if you have one</li>
                <li>Note any distinctive marks or damage</li>
                <li>Keep full serial numbers private</li>
              </ul>
            </div>
            <div className="tips-card warning-card">
              <h4>⚠️ Privacy Reminder</h4>
              <p>Do not include sensitive information like card numbers, passwords, or complete ID numbers in the public description.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
