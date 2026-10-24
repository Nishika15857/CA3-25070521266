import React from 'react';
import { Link } from 'react-router-dom';
import './ItemCard.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop&auto=format';

const CATEGORY_ICONS = {
  'Electronics': '💻', 'Books & Stationery': '📚', 'Bags & Luggage': '🎒',
  'Clothing & Accessories': '👕', 'ID & Documents': '🪪', 'Keys': '🔑',
  'Wallet & Money': '👛', 'Water Bottle': '🍶', 'Headphones & Earbuds': '🎧',
  'Spectacles': '👓', 'Sports Equipment': '⚽', 'Jewellery': '💍', 'Other': '📦'
};

export default function ItemCard({ item }) {
  const imgSrc = item.images?.[0]?.url || PLACEHOLDER;
  const icon = CATEGORY_ICONS[item.category] || '📦';
  const isLost = item.type === 'lost';

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Link to={`/items/${item._id}`} className="item-card-link">
      <div className="item-card">
        <div className="item-card-img-wrap">
          <img
            src={imgSrc}
            alt={item.title}
            className="item-card-img"
            onError={e => { e.target.src = PLACEHOLDER; }}
          />
          <span className={`item-type-badge ${isLost ? 'lost' : 'found'}`}>
            {isLost ? '🔴 Lost' : '🟢 Found'}
          </span>
          {item.status !== 'active' && (
            <span className={`item-status-badge status-${item.status}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          )}
        </div>

        <div className="item-card-body">
          <div className="item-card-header">
            <span className="item-category-icon">{icon}</span>
            <span className="item-category">{item.category}</span>
          </div>

          <h3 className="item-card-title">{item.title}</h3>
          <p className="item-card-desc">{item.description}</p>

          <div className="item-card-meta">
            <div className="item-meta-row">
              <span className="meta-icon">📍</span>
              <span>{item.location}</span>
            </div>
            <div className="item-meta-row">
              <span className="meta-icon">📅</span>
              <span>{formatDate(item.date)}</span>
            </div>
            {item.reporter?.name && (
              <div className="item-meta-row">
                <span className="meta-icon">👤</span>
                <span>By {item.reporter.name}</span>
              </div>
            )}
          </div>

          <div className="item-card-footer">
            <span className="view-details">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
