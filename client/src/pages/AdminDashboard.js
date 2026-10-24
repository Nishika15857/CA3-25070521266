import React, { useState, useEffect } from 'react';
import { adminService, claimService, itemService } from '../services/services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const COLORS = ['#16a34a','#ef4444','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [claimFilter, setClaimFilter] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    else if (tab === 'items') fetchItems();
    else if (tab === 'claims') fetchClaims();
    else if (tab === 'reports') fetchReports();
    else if (tab === 'messages') fetchMessages();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    setLoading(true);
    try { const res = await adminService.getStats(); setStats(res.data.stats); }
    catch { toast.error('Could not load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const res = await adminService.getUsers({ search: searchUser, limit: 50 }); setUsers(res.data.users || []); }
    catch { toast.error('Could not load users'); }
  };

  const fetchItems = async () => {
    try { const res = await adminService.getItems({ search: searchItem, limit: 50 }); setItems(res.data.items || []); }
    catch { toast.error('Could not load items'); }
  };

  const fetchClaims = async () => {
    try { const res = await claimService.getAllClaims({ status: claimFilter, limit: 50 }); setClaims(res.data.claims || []); }
    catch { toast.error('Could not load claims'); }
  };

  const fetchReports = async () => {
    try { const res = await adminService.getContentReports({ limit: 50 }); setReports(res.data.reports || []); }
    catch {}
  };

  const fetchMessages = async () => {
    try { const res = await adminService.getContactMessages({ limit: 50 }); setMessages(res.data.messages || []); }
    catch {}
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      await adminService.updateUser(userId, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleUserActive = async (userId, isActive) => {
    try {
      await adminService.updateUser(userId, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const toggleItemVisibility = async (itemId, isVisible) => {
    try {
      await itemService.updateItem(itemId, { isVisible: !isVisible });
      toast.success(`Item ${isVisible ? 'hidden' : 'shown'}`);
      fetchItems();
    } catch { toast.error('Failed'); }
  };

  const reviewClaim = async (claimId, status) => {
    try {
      await claimService.reviewClaim(claimId, { status });
      toast.success('Claim updated');
      fetchClaims();
    } catch { toast.error('Failed'); }
  };

  const reviewReport = async (reportId, status) => {
    try {
      await adminService.reviewContentReport(reportId, { status });
      toast.success('Report updated');
      fetchReports();
    } catch { toast.error('Failed'); }
  };

  const updateMessageStatus = async (id, status) => {
    try {
      await adminService.updateContactMessage(id, { status });
      toast.success('Updated');
      fetchMessages();
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="page-wrapper loading-center">
      <div className="spinner" /><p>Loading admin dashboard…</p>
    </div>
  );

  return (
    <div className="admin-page page-wrapper">
      <div className="admin-header">
        <div className="container">
          <h1>🛡️ Admin Dashboard</h1>
          <p>Manage users, items, claims and content moderation</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'users', label: `👥 Users ${stats ? `(${stats.totalUsers})` : ''}` },
            { key: 'items', label: `📋 Items ${stats ? `(${stats.totalItems})` : ''}` },
            { key: 'claims', label: `✋ Claims ${stats ? `(${stats.totalClaims})` : ''}` },
            { key: 'reports', label: `🚩 Reports ${stats?.contentReports > 0 ? `(${stats.contentReports})` : ''}` },
            { key: 'messages', label: `💬 Messages ${stats?.contactMessages > 0 ? `(${stats.contactMessages})` : ''}` },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              {[
                { icon: '👥', label: 'Total Users', value: stats.totalUsers, sub: `+${stats.newUsers30d} last 30d` },
                { icon: '📋', label: 'Total Items', value: stats.totalItems, sub: `+${stats.newItems30d} last 30d` },
                { icon: '🔴', label: 'Lost Items', value: stats.lostItems },
                { icon: '🟢', label: 'Found Items', value: stats.foundItems },
                { icon: '✅', label: 'Recovered', value: stats.totalReturned },
                { icon: '⏳', label: 'Pending Claims', value: stats.pendingClaims },
                { icon: '🚩', label: 'Pending Reports', value: stats.contentReports },
                { icon: '💬', label: 'New Messages', value: stats.contactMessages },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <span className="stat-icon">{s.icon}</span>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                  {s.sub && <span className="stat-change">{s.sub}</span>}
                </div>
              ))}
            </div>

            <div className="charts-grid">
              {/* Daily items chart */}
              {stats.dailyItems?.length > 0 && (
                <div className="chart-card">
                  <h3>Items Reported (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.dailyItems} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="lost" fill="#ef4444" name="Lost" radius={[3,3,0,0]} />
                      <Bar dataKey="found" fill="#16a34a" name="Found" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category pie chart */}
              {stats.categoryStats?.length > 0 && (
                <div className="chart-card">
                  <h3>Items by Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={stats.categoryStats} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id?.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {stats.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Lost vs Found */}
              <div className="chart-card">
                <h3>Lost vs Found Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={[{ name: 'Lost', value: stats.lostItems }, { name: 'Found', value: stats.foundItems }]}
                      dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                      <Cell fill="#ef4444" /><Cell fill="#16a34a" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div>
            <div className="admin-filter-row">
              <input className="form-control" style={{ maxWidth: 300 }} placeholder="Search users…"
                value={searchUser} onChange={e => { setSearchUser(e.target.value); fetchUsers(); }} />
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="font-semibold">{u.name}</td>
                      <td className="text-sm">{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-active'}`}>{u.role}</span></td>
                      <td className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-found' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleUserRole(u._id, u.role)}>
                            {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleUserActive(u._id, u.isActive)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3></div>}
            </div>
          </div>
        )}

        {/* Items tab */}
        {tab === 'items' && (
          <div>
            <div className="admin-filter-row">
              <input className="form-control" style={{ maxWidth: 300 }} placeholder="Search items…"
                value={searchItem} onChange={e => { setSearchItem(e.target.value); fetchItems(); }} />
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>Reporter</th><th>Status</th><th>Visible</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      <td className="font-semibold">{item.title}</td>
                      <td><span className={`badge badge-${item.type}`}>{item.type}</span></td>
                      <td className="text-sm">{item.category}</td>
                      <td className="text-sm">{item.reporter?.name}</td>
                      <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                      <td><span className={`badge ${item.isVisible ? 'badge-found' : 'badge-rejected'}`}>{item.isVisible ? 'Yes' : 'Hidden'}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <a href={`/items/${item._id}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
                          <button className={`btn btn-sm ${item.isVisible ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => toggleItemVisibility(item._id, item.isVisible)}>
                            {item.isVisible ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No items found</h3></div>}
            </div>
          </div>
        )}

        {/* Claims tab */}
        {tab === 'claims' && (
          <div>
            <div className="admin-filter-row">
              <select className="form-control" style={{ maxWidth: 200 }} value={claimFilter}
                onChange={e => { setClaimFilter(e.target.value); setTimeout(fetchClaims, 0); }}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Item</th><th>Claimant</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim._id}>
                      <td className="font-semibold">{claim.item?.title}</td>
                      <td className="text-sm">{claim.claimant?.name}<br/><span className="text-muted">{claim.claimant?.email}</span></td>
                      <td><span className={`badge badge-${claim.status}`}>{claim.status.replace('_',' ')}</span></td>
                      <td className="text-sm">{new Date(claim.createdAt).toLocaleDateString()}</td>
                      <td>
                        {claim.status === 'pending' && (
                          <div className="flex gap-1">
                            <button className="btn btn-sm btn-primary" onClick={() => reviewClaim(claim._id, 'approved')}>Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => reviewClaim(claim._id, 'rejected')}>Reject</button>
                          </div>
                        )}
                        {claim.status === 'approved' && (
                          <button className="btn btn-sm" style={{ background: '#ede9fe', color: '#7c3aed' }} onClick={() => reviewClaim(claim._id, 'returned')}>Mark Returned</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {claims.length === 0 && <div className="empty-state"><div className="empty-state-icon">✋</div><h3>No claims found</h3></div>}
            </div>
          </div>
        )}

        {/* Content Reports tab */}
        {tab === 'reports' && (
          <div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Item</th><th>Reported By</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r._id}>
                      <td>{r.item?.title}</td>
                      <td className="text-sm">{r.reportedBy?.name}</td>
                      <td><span className="badge badge-pending">{r.reason}</span></td>
                      <td><span className={`badge ${r.status === 'pending' ? 'badge-pending' : 'badge-approved'}`}>{r.status}</span></td>
                      <td className="text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        {r.status === 'pending' && (
                          <div className="flex gap-1">
                            <button className="btn btn-sm btn-danger" onClick={() => reviewReport(r._id, 'reviewed')}>Review</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => reviewReport(r._id, 'dismissed')}>Dismiss</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.length === 0 && <div className="empty-state"><div className="empty-state-icon">🚩</div><h3>No reports</h3></div>}
            </div>
          </div>
        )}

        {/* Messages tab */}
        {tab === 'messages' && (
          <div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>From</th><th>Subject</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m._id}>
                      <td><p className="font-semibold">{m.name}</p><p className="text-xs text-muted">{m.email}</p></td>
                      <td className="font-semibold text-sm">{m.subject}</td>
                      <td className="text-sm" style={{ maxWidth: 300 }}><p style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.message}</p></td>
                      <td><span className={`badge ${m.status === 'new' ? 'badge-pending' : m.status === 'replied' ? 'badge-approved' : 'badge-active'}`}>{m.status}</span></td>
                      <td className="text-sm">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select className="form-control" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                          value={m.status} onChange={e => updateMessageStatus(m._id, e.target.value)}>
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {messages.length === 0 && <div className="empty-state"><div className="empty-state-icon">💬</div><h3>No messages</h3></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
