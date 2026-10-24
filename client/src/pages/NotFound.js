import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-wrapper flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '5rem' }}>🔁</div>
      <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--charcoal-200)', lineHeight: 1 }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ maxWidth: 400 }}>The page you're looking for doesn't exist or may have been moved.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/browse" className="btn btn-secondary btn-lg">Browse Items</Link>
      </div>
    </div>
  );
}
