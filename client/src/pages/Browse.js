import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemService } from '../services/services';
import ItemCard from '../components/ItemCard';
import './Browse.css';

const CATEGORIES = [
  'Electronics','Books & Stationery','Bags & Luggage','Clothing & Accessories',
  'ID & Documents','Keys','Wallet & Money','Water Bottle',
  'Headphones & Earbuds','Spectacles','Sports Equipment','Jewellery','Other'
];

const STATUSES = ['active','claimed','returned','expired'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    location: '',
    status: 'active',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
  });

  const fetchItems = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await itemService.getItems(params);
      setItems(res.data.items || []);
      setPagination(res.data.pagination || { total: 0, pages: 1, page: 1 });
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(filters); }, [filters, fetchItems]);

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val, page: key !== 'page' ? 1 : val }));
  };

  const resetFilters = () => {
    setFilters({ search:'', type:'', category:'', location:'', status:'', dateFrom:'', dateTo:'', sortBy:'createdAt', order:'desc', page:1 });
    setSearchParams({});
  };

  const handleSearch = (e) => { e.preventDefault(); fetchItems(filters); };

  const activeFiltersCount = [filters.type, filters.category, filters.location, filters.status, filters.dateFrom, filters.dateTo]
    .filter(Boolean).length;

  return (
    <div className="browse-page page-wrapper">
      <div className="page-header">
        <div className="container">
          <h1>Browse Lost &amp; Found Items</h1>
          <p>Search through all reported items to find what you're looking for</p>
        </div>
      </div>

      <div className="container">
        <div className="browse-layout">
          {/* ─── Sidebar filters ─────────────────────────────────────────── */}
          <aside className="filter-sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              {activeFiltersCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Type */}
            <div className="filter-group">
              <label className="filter-label">Report Type</label>
              <div className="type-toggle">
                {['', 'lost', 'found'].map(t => (
                  <button
                    key={t}
                    className={`type-btn ${filters.type === t ? 'active' : ''} ${t}`}
                    onClick={() => updateFilter('type', t)}
                  >
                    {t === '' ? 'All' : t === 'lost' ? '🔴 Lost' : '🟢 Found'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select className="form-control" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Location */}
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Library, Block A"
                value={filters.location}
                onChange={e => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select className="form-control" value={filters.status} onChange={e => updateFilter('status', e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>

            {/* Date range */}
            <div className="filter-group">
              <label className="filter-label">Date From</label>
              <input className="form-control" type="date" value={filters.dateFrom} onChange={e => updateFilter('dateFrom', e.target.value)} />
            </div>
            <div className="filter-group">
              <label className="filter-label">Date To</label>
              <input className="form-control" type="date" value={filters.dateTo} onChange={e => updateFilter('dateTo', e.target.value)} />
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select className="form-control" value={`${filters.sortBy}-${filters.order}`}
                onChange={e => {
                  const [sortBy, order] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, order, page: 1 }));
                }}>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="date-desc">Report Date (Newest)</option>
                <option value="date-asc">Report Date (Oldest)</option>
              </select>
            </div>
          </aside>

          {/* ─── Main content ─────────────────────────────────────────────── */}
          <div className="browse-main">
            {/* Search bar */}
            <form className="browse-search" onSubmit={handleSearch}>
              <span className="browse-search-icon">🔍</span>
              <input
                type="text"
                className="browse-search-input"
                placeholder="Search by name, description, location…"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>

            {/* Results count */}
            <div className="results-bar">
              <p className="results-count">
                {loading ? 'Loading…' : `${pagination.total} item${pagination.total !== 1 ? 's' : ''} found`}
              </p>
              <div className="active-tags">
                {filters.type && <span className="filter-tag">{filters.type} <button onClick={() => updateFilter('type', '')}>×</button></span>}
                {filters.category && <span className="filter-tag">{filters.category} <button onClick={() => updateFilter('category', '')}>×</button></span>}
                {filters.status && filters.status !== 'active' && <span className="filter-tag">{filters.status} <button onClick={() => updateFilter('status', 'active')}>×</button></span>}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="loading-center" style={{ minHeight: 300 }}>
                <div className="spinner" />
                <p>Finding items…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No items found</h3>
                <p>Try adjusting your search terms or filters.</p>
                <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
              </div>
            ) : (
              <div className="grid grid-auto">
                {items.map(item => <ItemCard key={item._id} item={item} />)}
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                >← Prev</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - filters.page) <= 2)
                  .map(p => (
                    <button
                      key={p}
                      className={`page-btn ${p === filters.page ? 'active' : ''}`}
                      onClick={() => updateFilter('page', p)}
                    >{p}</button>
                  ))
                }
                <button
                  className="page-btn"
                  disabled={filters.page >= pagination.pages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                >Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
