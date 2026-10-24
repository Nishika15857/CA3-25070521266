import React from 'react';

export default function LoadingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--background)' }}>
      <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🔁</div>
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading CampusLoop…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
