import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemService, claimService, matchService, contactService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';
import './ItemDetails.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop';

const STATUS_BADGE = {
  active: 'badge-active', claimed: 'badge-claimed',
  returned: 'badge-returned', expired: 'badge-expired', removed: 'badge-rejected'
};

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [claimModal, setClaimModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [claimData, setClaimData] = useState({ description: '', verificationDetails: '' });
  const [reportData, setReportData] = useState({ reason: 'spam', details: '' });
  const [submitting, setSubmitting] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchItem(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const res = await itemService.getItem(id);
      setItem(res.data.item);
      setSimilar(res.data.similar || []);
    } catch {
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!user) { toast.error('Login to see smart matches'); return; }
    setMatchLoading(true);
    try {
      const res = await matchService.getMatches(id);
      setMatches(res.data.matches || []);
      if (res.data.matches?.length === 0) toast('No strong matches found yet.', { icon: '🔍' });
    } catch { toast.error('Could not fetch matches'); }
    finally { setMatchLoading(false); }
  };

  const fetchClaims = async () => {
    if (!user) return;
    const isOwner = item?.reporter?._id === user._id;
    if (!isOwner && user.role !== 'admin') return;
    try {
      const res = await claimService.getItemClaims(id);
      setClaims(res.data.claims || []);
    } catch {}
  };

  useEffect(() => {
    if (item) fetchClaims(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [item]);

  const submitClaim = async (e) => {
    e.preventDefault();
    if (claimData.description.length < 20) {
      toast.error('Please provide a more detailed description (min 20 characters)');
      return;
    }
    setSubmitting(true);
    try {
      await claimService.submitClaim({ itemId: id, ...claimData });
      toast.success('Claim submitted successfully!');
      setClaimModal(false);
      setClaimData({ description: '', verificationDetails: '' });
      fetchItem();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit claim');
    } finally { setSubmitting(false); }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.reportItem(id, reportData);
      toast.success('Item reported. Our team will review it.');
      setReportModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await itemService.deleteItem(id);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete item');
    } finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await itemService.updateItem(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchItem();
    } catch { toast.error('Could not update status'); }
  };

  const reviewClaim = async (claimId, status, notes) => {
    try {
      await claimService.reviewClaim(claimId, { status, reviewNotes: notes });
      toast.success('Claim updated!');
      fetchClaims();
      fetchItem();
    } catch { toast.error('Could not update claim'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const formatRelative = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  if (loading) return (
    <div className="page-wrapper loading-center">
      <div className="spinner" />
      <p>Loading item details…</p>
    </div>
  );

  if (!item) return null;

  const isOwner = user && item.reporter?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const canClaim = user && !isOwner && item.type === 'found' && item.status === 'active';
  const images = item.images?.length > 0 ? item.images : [{ url: PLACEHOLDER }];

  return (
    <div className="item-details-page page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/browse">Browse</Link> <span>/</span>
          <span>{item.title}</span>
        </nav>

        <div className="details-grid">
          {/* Left: Images */}
          <div className="details-images">
            <div className="main-image-wrap">
              <img
                src={images[activeImg]?.url || PLACEHOLDER}
                alt={item.title}
                className="main-image"
                onError={e => { e.target.src = PLACEHOLDER; }}
              />
              <span className={`details-type-badge ${item.type}`}>
                {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
              </span>
            </div>
            {images.length > 1 && (
              <div className="thumb-row">
                {images.map((img, i) => (
                  <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt={`${item.title} ${i+1}`} onError={e => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}

            {/* Smart Matches */}
            <div className="match-box">
              <div className="match-box-header">
                <span>🔗 Smart Matching</span>
                <button className="btn btn-secondary btn-sm" onClick={fetchMatches} disabled={matchLoading}>
                  {matchLoading ? '…' : 'Find Matches'}
                </button>
              </div>
              <p className="match-note">Finds potential {item.type === 'lost' ? 'found' : 'lost'} items that may match this listing.</p>
              {matches.length > 0 && (
                <div className="match-results">
                  {matches.map(m => (
                    <Link key={m._id} to={`/items/${m._id}`} className="match-item">
                      <div className="match-score">{m.matchScore}%</div>
                      <div className="match-info">
                        <p className="match-title">{m.title}</p>
                        <p className="match-reasons">{m.matchReasons?.join(' · ')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="details-info">
            <div className="details-header">
              <div className="details-badges">
                <span className={`badge badge-${item.type}`}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span>
                <span className={`badge ${STATUS_BADGE[item.status] || 'badge-active'}`}>{item.status}</span>
              </div>
              <h1 className="details-title">{item.title}</h1>
              <p className="details-category">📂 {item.category}</p>
            </div>

            <div className="details-meta-grid">
              <div className="meta-item"><span className="meta-label">📅 Date</span><span>{formatDate(item.date)}</span></div>
              <div className="meta-item"><span className="meta-label">📍 Location</span><span>{item.location}</span></div>
              <div className="meta-item"><span className="meta-label">👤 Reported by</span><span>{item.reporter?.name || 'Anonymous'}</span></div>
              <div className="meta-item"><span className="meta-label">🗓 Listed</span><span>{formatRelative(item.createdAt)}</span></div>
              <div className="meta-item full"><span className="meta-label">🔖 Ref ID</span><span className="ref-id">#{item._id?.slice(-8).toUpperCase()}</span></div>
            </div>

            <div className="divider" />

            <div className="details-section">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            {item.additionalInfo && (
              <div className="details-section">
                <h3>Additional Information</h3>
                <p>{item.additionalInfo}</p>
              </div>
            )}

            {item.storageInfo && (
              <div className="details-section">
                <h3>📦 Where It's Stored</h3>
                <p>{item.storageInfo}</p>
              </div>
            )}

            {item.contactMethod && (isOwner || isAdmin) && (
              <div className="details-section">
                <h3>📞 Contact Preference</h3>
                <p>{item.contactMethod}</p>
              </div>
            )}

            <div className="divider" />

            {/* Action buttons */}
            <div className="details-actions">
              {canClaim && (
                <button className="btn btn-primary btn-lg" onClick={() => setClaimModal(true)}>
                  ✋ Submit a Claim
                </button>
              )}
              {!user && item.status === 'active' && (
                <Link to="/login" className="btn btn-primary btn-lg">Login to Claim</Link>
              )}
              {(isOwner || isAdmin) && (
                <div className="owner-actions">
                  <Link to={`/browse`} className="btn btn-ghost btn-sm">← Back</Link>
                  {item.status === 'active' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleStatusUpdate('returned')}>
                      Mark Returned
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(true)}>Delete</button>
                </div>
              )}
              {user && !isOwner && (
                <button className="btn btn-ghost btn-sm report-btn" onClick={() => setReportModal(true)}>
                  🚩 Report this listing
                </button>
              )}
            </div>

            {/* Safety note */}
            <div className="safety-note">
              <span>🛡️</span>
              <p>Never share sensitive personal details or full identification numbers publicly. Verify ownership through a trusted process before handing over items.</p>
            </div>
          </div>
        </div>

        {/* Claims section (owner/admin) */}
        {(isOwner || isAdmin) && claims.length > 0 && (
          <div className="claims-section">
            <h2>Claims Received ({claims.length})</h2>
            <div className="claims-list">
              {claims.map(claim => (
                <ClaimCard key={claim._id} claim={claim} onReview={reviewClaim} isOwner={isOwner} />
              ))}
            </div>
          </div>
        )}

        {/* Similar items */}
        {similar.length > 0 && (
          <div className="similar-section">
            <h2>Similar Listings</h2>
            <div className="grid grid-auto">
              {similar.map(s => <ItemCard key={s._id} item={s} />)}
            </div>
          </div>
        )}
      </div>

      {/* ─── Claim Modal ─────────────────────────────────────────────────── */}
      {claimModal && (
        <div className="modal-overlay" onClick={() => setClaimModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✋ Submit a Claim</h3>
              <button className="modal-close" onClick={() => setClaimModal(false)}>✕</button>
            </div>
            <div className="alert alert-warning">
              <strong>⚠️ Important:</strong> Provide honest details that only the true owner would know. False claims are taken seriously.
            </div>
            <form onSubmit={submitClaim}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Why is this item yours? *</label>
                <textarea
                  className={`form-control ${claimData.description.length > 0 && claimData.description.length < 20 ? 'error' : ''}`}
                  rows={4}
                  placeholder="Describe how the item is yours — color details, contents, purchase history, etc."
                  value={claimData.description}
                  onChange={e => setClaimData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
                {claimData.description.length > 0 && claimData.description.length < 20 && (
                  <p className="form-error">Please provide at least 20 characters</p>
                )}
                <p className="form-hint">{claimData.description.length}/1000</p>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Private verification details (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Any unique identifying features, serial numbers, or proof of ownership (shared only with reviewers)"
                  value={claimData.verificationDetails}
                  onChange={e => setClaimData(prev => ({ ...prev, verificationDetails: e.target.value }))}
                />
                <p className="form-hint">This is kept private and only shown to authorized reviewers.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setClaimModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Report Modal ─────────────────────────────────────────────────── */}
      {reportModal && (
        <div className="modal-overlay" onClick={() => setReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚩 Report Listing</h3>
              <button className="modal-close" onClick={() => setReportModal(false)}>✕</button>
            </div>
            <form onSubmit={submitReport}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reason *</label>
                <select className="form-control" value={reportData.reason} onChange={e => setReportData(p => ({ ...p, reason: e.target.value }))}>
                  <option value="spam">Spam</option>
                  <option value="fake">Fake listing</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="duplicate">Duplicate listing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Details (optional)</label>
                <textarea className="form-control" rows={3} placeholder="Additional details…" value={reportData.details} onChange={e => setReportData(p => ({ ...p, details: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setReportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={submitting}>{submitting ? '…' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ───────────────────────────────────────────────── */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>⚠️ Delete Item</h3><button className="modal-close" onClick={() => setDeleteModal(false)}>✕</button></div>
            <p style={{ marginBottom: '1.5rem' }}>Are you sure you want to delete <strong>{item.title}</strong>? This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>{submitting ? '…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimCard({ claim, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', under_review: 'badge-under_review', returned: 'badge-returned' };

  return (
    <div className="claim-card">
      <div className="claim-card-header">
        <div>
          <p className="claim-claimant">{claim.claimant?.name}</p>
          <p className="claim-date">{new Date(claim.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`badge ${statusBadge[claim.status] || 'badge-pending'}`}>{claim.status.replace('_', ' ')}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(v => !v)}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>
      {expanded && (
        <div className="claim-card-body">
          <p className="claim-desc-label">Claim Description:</p>
          <p className="claim-desc">{claim.description}</p>
          {claim.verificationDetails && (
            <>
              <p className="claim-desc-label" style={{ marginTop: '0.75rem' }}>Private Verification:</p>
              <p className="claim-desc">{claim.verificationDetails}</p>
            </>
          )}
          {claim.status === 'pending' && (
            <div className="claim-review-actions">
              <input
                className="form-control"
                placeholder="Review notes (optional)…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ marginBottom: '0.75rem' }}
              />
              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-sm" style={{ background: '#dbeafe', color: '#1d4ed8' }} onClick={() => onReview(claim._id, 'under_review', notes)}>Mark Under Review</button>
                <button className="btn btn-sm btn-primary" onClick={() => onReview(claim._id, 'approved', notes)}>✅ Approve</button>
                <button className="btn btn-sm" style={{ background: '#ede9fe', color: '#7c3aed' }} onClick={() => onReview(claim._id, 'returned', notes)}>🎉 Mark Returned</button>
                <button className="btn btn-sm btn-danger" onClick={() => onReview(claim._id, 'rejected', notes)}>❌ Reject</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
