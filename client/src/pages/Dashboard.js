import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, itemService, notificationService } from '../services/services';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';
import './Dashboard.css';

const CLAIM_STATUS_BADGE = {
  pending: 'badge-pending', under_review: 'badge-under_review',
  approved: 'badge-approved', rejected: 'badge-rejected', returned: 'badge-returned'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashData, setDashData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dash, notifs] = await Promise.all([
        userService.getDashboard(),
        notificationService.getNotifications({ limit: 10 })
      ]);
      setDashData(dash.data);
      setNotifications(notifs.data.notifications || []);
    } catch { toast.error('Could not load dashboard'); }
    finally { setLoading(false); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await itemService.deleteItem(itemId);
      toast.success('Item deleted');
      fetchDashboard();
    } catch { toast.error('Could not delete item'); }
  };

  const markNotifRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  if (loading) return (
    <div className="page-wrapper loading-center">
      <div className="spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  const { stats, myItems, myClaims } = dashData || {};

  return (
    <div className="dashboard-page page-wrapper">
      {/* Header */}
      <div className="dash-header">
        <div className="container">
          <div className="dash-header-inner">
            <div className="dash-welcome">
              <div className="dash-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p>{user?.email} · Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="dash-quick-links">
              <Link to="/report-lost" className="btn btn-primary btn-sm">+ Report Lost</Link>
              <Link to="/report-found" className="btn btn-secondary btn-sm">+ Report Found</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="dash-stats-grid">
          {[
            { icon: '📋', label: 'Total Reports', value: stats?.totalReports || 0 },
            { icon: '🔴', label: 'Lost Reports', value: stats?.lostReports || 0 },
            { icon: '🟢', label: 'Found Reports', value: stats?.foundReports || 0 },
            { icon: '✋', label: 'Claims Made', value: stats?.totalClaims || 0 },
            { icon: '⏳', label: 'Pending Claims', value: stats?.pendingClaims || 0 },
            { icon: '✅', label: 'Approved Claims', value: stats?.approvedClaims || 0 },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'lost', label: '🔴 My Lost Reports' },
            { key: 'found', label: '🟢 My Found Reports' },
            { key: 'claims', label: `✋ My Claims ${stats?.totalClaims > 0 ? `(${stats.totalClaims})` : ''}` },
            { key: 'notifications', label: '🔔 Notifications' },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="dash-tab-content">
            <h3 style={{ marginBottom: '1.25rem' }}>Recent Activity</h3>
            {myItems?.length === 0 && myClaims?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No activity yet</h3>
                <p>Start by reporting a lost or found item.</p>
                <div className="flex gap-2" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                  <Link to="/report-lost" className="btn btn-primary">Report Lost Item</Link>
                  <Link to="/report-found" className="btn btn-secondary">Report Found Item</Link>
                </div>
              </div>
            ) : (
              <>
                {myItems?.slice(0, 3).map(item => (
                  <div key={item._id} className="activity-row">
                    <span className={`badge badge-${item.type}`}>{item.type}</span>
                    <div className="activity-info">
                      <p className="activity-title">{item.title}</p>
                      <p className="activity-meta">{item.location} · {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                    <Link to={`/items/${item._id}`} className="btn btn-ghost btn-sm">View</Link>
                  </div>
                ))}
                {myClaims?.slice(0, 3).map(claim => (
                  <div key={claim._id} className="activity-row">
                    <span className="badge badge-claimed">Claim</span>
                    <div className="activity-info">
                      <p className="activity-title">{claim.item?.title}</p>
                      <p className="activity-meta">Submitted {new Date(claim.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${CLAIM_STATUS_BADGE[claim.status]}`}>{claim.status.replace('_', ' ')}</span>
                    <Link to={`/items/${claim.item?._id}`} className="btn btn-ghost btn-sm">View</Link>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Tab: Lost Reports */}
        {activeTab === 'lost' && (
          <div className="dash-tab-content">
            {myItems?.filter(i => i.type === 'lost').length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔴</div>
                <h3>No lost item reports</h3>
                <Link to="/report-lost" className="btn btn-primary">Report a Lost Item</Link>
              </div>
            ) : (
              <div className="my-items-grid">
                {myItems?.filter(i => i.type === 'lost').map(item => (
                  <div key={item._id} className="my-item-card">
                    <ItemCard item={item} />
                    <div className="my-item-actions">
                      <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Found Reports */}
        {activeTab === 'found' && (
          <div className="dash-tab-content">
            {myItems?.filter(i => i.type === 'found').length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🟢</div>
                <h3>No found item reports</h3>
                <Link to="/report-found" className="btn btn-primary">Report a Found Item</Link>
              </div>
            ) : (
              <div className="my-items-grid">
                {myItems?.filter(i => i.type === 'found').map(item => (
                  <div key={item._id} className="my-item-card">
                    <ItemCard item={item} />
                    <div className="my-item-actions">
                      <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Claims */}
        {activeTab === 'claims' && (
          <div className="dash-tab-content">
            {myClaims?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✋</div>
                <h3>No claims submitted</h3>
                <p>Browse found items and submit a claim if you spot your lost item.</p>
                <Link to="/browse?type=found" className="btn btn-primary">Browse Found Items</Link>
              </div>
            ) : (
              <div className="claims-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClaims?.map(claim => (
                      <tr key={claim._id}>
                        <td>
                          <p className="font-semibold">{claim.item?.title}</p>
                          <p className="text-xs text-muted">{claim.item?.location}</p>
                        </td>
                        <td><span className={`badge badge-${claim.item?.type}`}>{claim.item?.type}</span></td>
                        <td>
                          <span className={`badge ${CLAIM_STATUS_BADGE[claim.status]}`}>{claim.status.replace('_', ' ')}</span>
                          {claim.reviewNotes && <p className="text-xs text-muted" style={{ marginTop: '4px' }}>{claim.reviewNotes}</p>}
                        </td>
                        <td className="text-sm">{new Date(claim.createdAt).toLocaleDateString()}</td>
                        <td><Link to={`/items/${claim.item?._id}`} className="btn btn-ghost btn-sm">View Item</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === 'notifications' && (
          <div className="dash-tab-content">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3>Notifications</h3>
              {notifications.some(n => !n.isRead) && (
                <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <h3>No notifications yet</h3>
                <p>You'll be notified about claim updates, matches, and more.</p>
              </div>
            ) : (
              <div className="notif-feed">
                {notifications.map(n => (
                  <div key={n._id} className={`notif-feed-item ${!n.isRead ? 'unread' : ''}`} onClick={() => markNotifRead(n._id)}>
                    <div className="notif-feed-icon">
                      {n.type === 'claim_approved' ? '✅' : n.type === 'claim_rejected' ? '❌' : n.type === 'item_returned' ? '🎉' : n.type === 'match_found' ? '🔗' : '🔔'}
                    </div>
                    <div className="notif-feed-body">
                      <p className="notif-feed-title">{n.title}</p>
                      <p className="notif-feed-msg">{n.message}</p>
                      <p className="notif-feed-time">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.isRead && <span className="notif-dot" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
