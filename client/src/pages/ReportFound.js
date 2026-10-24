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

export default function ReportFound() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '', date: '', location: '',
    additionalInfo: '', storageInfo: ''
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
    setPreviews(files.map(f => URL.createObjectURL(f)));
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
      fd.append('type', 'found');
      images.forEach(img => fd.append('images', img));
      const res = await itemService.createItem(fd);
      toast.success('Found item reported successfully!');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report.');
    } finally { setLoading(false); }
  };

  const field = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div className="report-page page-wrapper">
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)' }}>
        <div className="container">
          <h1>🟢 Report a Found Item</h1>
          <p>Help reunite someone with their lost belonging by reporting what you've found</p>
        </div>
      </div>

      <div className="container">
        <div className="report-layout">
          <form className="report-form" onSubmit={handleSubmit} noValidate>
            <div className="alert alert-info" style={{ marginBottom: '0.5rem' }}>
              <strong>🔒 Privacy reminder:</strong> Do not publish full serial numbers, complete ID details, or private information. These should be saved for ownership verification only.
            </div>

            <div className="form-section">
              <h3 className="form-section-title">📋 Item Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input className={`form-control ${errors.title ? 'error' : ''}`}
                    placeholder="e.g. Black Headphones, ID Card" value={form.title} onChange={e => field('title', e.target.value)} />
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className={`form-control ${errors.category ? 'error' : ''}`}
                    value={form.category} onChange={e => field('category', e.target.value)}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="form-error">{errors.category}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className={`form-control ${errors.description ? 'error' : ''}`} rows={5}
                  placeholder="Describe general appearance — color, size, brand. Omit unique details (serial, ID number) that can verify ownership."
                  value={form.description} onChange={e => field('description', e.target.value)} />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">📍 When &amp; Where Found</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Date Found *</label>
                  <input type="date" className={`form-control ${errors.date ? 'error' : ''}`}
                    max={today} value={form.date} onChange={e => field('date', e.target.value)} />
                  {errors.date && <p className="form-error">{errors.date}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Location Found *</label>
                  <input className={`form-control ${errors.location ? 'error' : ''}`}
                    placeholder="e.g. Computer Lab Block B, Main Gate"
                    value={form.location} onChange={e => field('location', e.target.value)} />
                  {errors.location && <p className="form-error">{errors.location}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">📸 Photo (optional)</h3>
              <div className="form-group">
                <div className="image-upload-area" onClick={() => document.getElementById('found-images').click()}>
                  <input id="found-images" type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                  <div className="upload-prompt">
                    <span className="upload-icon">📷</span>
                    <p>Click to upload photos</p>
                    <p className="text-xs text-muted">Max 4 images, 5MB each</p>
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
              <h3 className="form-section-title">📦 Storage &amp; Handover</h3>
              <div className="form-group">
                <label className="form-label">Where is the item stored?</label>
                <input className="form-control" placeholder="e.g. Submitted to Admin Office, With me"
                  value={form.storageInfo} onChange={e => field('storageInfo', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Safe Characteristics</label>
                <textarea className="form-control" rows={3}
                  placeholder="Any other characteristics that would help the owner identify it without giving away unique secrets"
                  value={form.additionalInfo} onChange={e => field('additionalInfo', e.target.value)} />
              </div>
            </div>

            <div className="form-submit-row">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ background: 'var(--green-700)' }} disabled={loading}>
                {loading ? <><span className="spinner spinner-sm" /> Submitting…</> : '🟢 Submit Found Report'}
              </button>
            </div>
          </form>

          <aside className="report-tips">
            <div className="tips-card">
              <h4>🟢 Reporting a Found Item</h4>
              <ul>
                <li>Describe without revealing unique identifiers</li>
                <li>Note where you found it</li>
                <li>Mention where it's currently stored</li>
                <li>Upload a photo to help the owner recognize it</li>
              </ul>
            </div>
            <div className="tips-card warning-card">
              <h4>⚠️ What NOT to share publicly</h4>
              <ul>
                <li>Full ID or card numbers</li>
                <li>Serial numbers of electronics</li>
                <li>Personal details of the owner</li>
                <li>Complete bank card info</li>
              </ul>
              <p style={{ marginTop: '0.5rem' }}>Keep these for verification when a claim is submitted.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
