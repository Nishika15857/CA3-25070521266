import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService } from '../services/services';
import ItemCard from '../components/ItemCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Books & Stationery', icon: '📚' },
  { name: 'Bags & Luggage', icon: '🎒' },
  { name: 'ID & Documents', icon: '🪪' },
  { name: 'Keys', icon: '🔑' },
  { name: 'Wallet & Money', icon: '👛' },
  { name: 'Headphones & Earbuds', icon: '🎧' },
  { name: 'Water Bottle', icon: '🍶' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📝', title: 'Report It', desc: 'Submit a lost or found item report with photos and details in under 2 minutes.' },
  { step: '02', icon: '🔍', title: 'Search & Match', desc: 'Our smart matching system finds potential matches based on category, location and keywords.' },
  { step: '03', icon: '✋', title: 'Submit a Claim', desc: 'Identified your item? Submit a claim with proof of ownership details.' },
  { step: '04', icon: '✅', title: 'Recover Safely', desc: 'Once verified, coordinate a safe pickup and the item is marked as returned.' },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState({ recentLost: [], recentFound: [], recentReturned: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([itemService.getStats(), itemService.getRecent()])
      .then(([statsRes, recentRes]) => {
        setStats(statsRes.data.stats);
        setRecent(recentRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="home-page page-wrapper">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-pattern" aria-hidden />
        <div className="container">
          <div className="hero-content">
            <div className="hero-label">🎓 Smart Campus Lost & Found</div>
            <h1 className="hero-title">
              Lost Something?<br />
              <span className="hero-accent">Let's Bring It Back.</span>
            </h1>
            <p className="hero-subtitle">
              CampusLoop connects people who've lost belongings with those who've found them.
              Report, search, claim and recover — all in one secure place.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for lost or found items…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="hero-search-input"
                aria-label="Search items"
              />
              <button type="submit" className="btn btn-primary hero-search-btn">Search</button>
            </form>

            <div className="hero-cta">
              <Link to="/report-lost" className="btn btn-primary btn-lg">
                🔴 Report Lost Item
              </Link>
              <Link to="/report-found" className="btn btn-secondary btn-lg">
                🟢 Report Found Item
              </Link>
            </div>

            {/* Quick stats */}
            {!loading && stats && (
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value">{stats.total}</span>
                  <span className="hero-stat-label">Total Reports</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">{stats.returned}</span>
                  <span className="hero-stat-label">Items Recovered</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-value">{stats.active}</span>
                  <span className="hero-stat-label">Active Listings</span>
                </div>
              </div>
            )}
            {!loading && !stats && (
              <div className="hero-empty-stat">
                🚀 Be the first to report a lost or found item!
              </div>
            )}
          </div>

          <div className="hero-image-grid" aria-hidden>
            <div className="hero-img-card">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop" alt="Campus students" />
            </div>
            <div className="hero-img-card shift">
              <img src="https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=300&h=200&fit=crop" alt="Lost items" />
            </div>
            <div className="hero-img-card">
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop" alt="Found bag" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="section-sm categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse by Category</span>
            <h2>What did you lose?</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECENT LOST ──────────────────────────────────────────────────── */}
      <section className="section recent-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-label">Recently Reported</span>
              <h2>Lost Items</h2>
            </div>
            <Link to="/browse?type=lost" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : recent.recentLost.length > 0 ? (
            <div className="grid grid-auto">
              {recent.recentLost.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No lost items reported yet</h3>
              <p>Be the first to report a lost item.</p>
              <Link to="/report-lost" className="btn btn-primary">Report Lost Item</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── RECENT FOUND ─────────────────────────────────────────────────── */}
      <section className="section recent-section bg-alt">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-label">Recently Reported</span>
              <h2>Found Items</h2>
            </div>
            <Link to="/browse?type=found" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : recent.recentFound.length > 0 ? (
            <div className="grid grid-auto">
              {recent.recentFound.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No found items reported yet</h3>
              <p>Found something? Report it to help reunite it with its owner.</p>
              <Link to="/report-found" className="btn btn-primary">Report Found Item</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Simple Process</span>
            <h2>How CampusLoop Works</h2>
            <p>Reuniting belongings with their owners in four easy steps.</p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="how-card">
                <div className="how-step">{step.step}</div>
                <div className="how-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECENTLY RETURNED ────────────────────────────────────────────── */}
      {recent.recentReturned?.length > 0 && (
        <section className="section returned-section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Success Stories</span>
              <h2>Recently Recovered 🎉</h2>
              <p>These items found their way back home through CampusLoop.</p>
            </div>
            <div className="grid grid-auto">
              {recent.recentReturned.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRUST & SAFETY ───────────────────────────────────────────────── */}
      <section className="section trust-section">
        <div className="container">
          <div className="trust-inner">
            <div className="trust-text">
              <span className="section-label">Trust & Safety</span>
              <h2>Your Safety is Our Priority</h2>
              <p>CampusLoop is designed to make item recovery safe and straightforward.</p>
              <ul className="trust-list">
                <li>🔒 Private verification details are never publicly displayed</li>
                <li>🛡️ Claims are reviewed before items are marked as returned</li>
                <li>👮 Report suspicious listings to our moderation team</li>
                <li>📋 Clear guidelines for safe item handover</li>
              </ul>
              <Link to="/safety" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Read Safety Guidelines
              </Link>
            </div>
            <div className="trust-image">
              <img src="https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=500&h=400&fit=crop" alt="Safe campus environment" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2>Ready to find your lost item?</h2>
            <p>Join CampusLoop and browse thousands of reports.</p>
            <div className="cta-btns">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/browse" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
                Browse All Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
