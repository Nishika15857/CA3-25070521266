import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/services';
import toast from 'react-hot-toast';
import './Navbar.css';

const BellIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Fetch unread count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data.count || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 8 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  const handleNotifOpen = () => {
    setNotifOpen(v => !v);
    setDropOpen(false);
    if (!notifOpen) fetchNotifications();
  };

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {}
  };

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    setMenuOpen(false);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const notifTypeIcon = (type) => {
    const icons = {
      claim_submitted: '📩', claim_approved: '✅', claim_rejected: '❌',
      claim_under_review: '🔍', additional_info_requested: '💬',
      item_returned: '🎉', match_found: '🔗', system: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">🔁</span>
            <span className="logo-text">Campus<span className="logo-accent">Loop</span></span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Browse</NavLink>
            <NavLink to="/report-lost" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Report Lost</NavLink>
            <NavLink to="/report-found" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Report Found</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
          </div>

          {/* Right side */}
          <div className="nav-right">
            {user ? (
              <>
                {/* Notification bell */}
                <div className="notif-wrapper" ref={notifRef}>
                  <button className="notif-btn" onClick={handleNotifOpen} aria-label="Notifications">
                    <BellIcon />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>

                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <span className="font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                          <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
                        )}
                      </div>
                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n._id}
                              className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                              onClick={() => markRead(n._id)}
                            >
                              <span className="notif-icon">{notifTypeIcon(n.type)}</span>
                              <div className="notif-content">
                                <p className="notif-title">{n.title}</p>
                                <p className="notif-msg">{n.message}</p>
                                <p className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</p>
                              </div>
                              {!n.isRead && <span className="notif-dot" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="user-menu" ref={dropRef}>
                  <button className="user-btn" onClick={() => { setDropOpen(v => !v); setNotifOpen(false); }}>
                    <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                    <span className="user-name">{user.name?.split(' ')[0]}</span>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropOpen && (
                    <div className="user-dropdown">
                      <div className="drop-user-info">
                        <div className="drop-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-semibold" style={{ fontSize: '0.9rem' }}>{user.name}</p>
                          <p className="text-muted text-xs">{user.email}</p>
                        </div>
                      </div>
                      <div className="drop-divider" />
                      <Link to="/dashboard" className="drop-item" onClick={() => setDropOpen(false)}>
                        📊 My Dashboard
                      </Link>
                      <Link to="/profile" className="drop-item" onClick={() => setDropOpen(false)}>
                        👤 Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="drop-item admin-link" onClick={() => setDropOpen(false)}>
                          🛡️ Admin Panel
                        </Link>
                      )}
                      <div className="drop-divider" />
                      <button className="drop-item logout-item" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <NavLink to="/browse" className="mobile-link" onClick={() => setMenuOpen(false)}>Browse Items</NavLink>
            <NavLink to="/report-lost" className="mobile-link" onClick={() => setMenuOpen(false)}>Report Lost</NavLink>
            <NavLink to="/report-found" className="mobile-link" onClick={() => setMenuOpen(false)}>Report Found</NavLink>
            <NavLink to="/about" className="mobile-link" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact</NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</NavLink>
                {isAdmin && <NavLink to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin Panel</NavLink>}
                <button className="mobile-link logout-mobile" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <div className="mobile-auth">
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
