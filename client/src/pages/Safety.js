import React from 'react';
import { Link } from 'react-router-dom';

export default function Safety() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--background)' }}>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)' }}>
        <div className="container"><h1>🛡️ Safety Guidelines</h1><p>Keeping our community safe during the lost &amp; found process</p></div>
      </div>
      <div className="container" style={{ maxWidth: 800, padding: '3rem 1.5rem' }}>
        {[
          {
            icon: '📋', title: 'When Reporting a Found Item',
            items: [
              'Do not publicly share serial numbers, ID numbers, or complete card numbers.',
              'Only describe enough to help the owner recognize their item.',
              'Store the item safely until it can be returned.',
              'Use safe identifying details to verify claims.',
              'Contact the admin office if you are unsure about an item.',
            ]
          },
          {
            icon: '🔍', title: 'When Searching for a Lost Item',
            items: [
              'Be honest about ownership — false claims are a violation of these terms.',
              'Provide genuine proof of ownership in your claim.',
              'Do not pressure item reporters for immediate handover.',
              'Use the in-app claim system rather than direct contact.',
              'Report any suspicious listings to our moderation team.',
            ]
          },
          {
            icon: '🤝', title: 'Safe Item Handover',
            items: [
              'Meet in a public, well-lit location.',
              'Bring a college ID or other identification.',
              'Do not share your home address.',
              'Coordinate through the admin office if preferred.',
              'Take a photo when handing over the item.',
            ]
          },
          {
            icon: '🔒', title: 'Privacy & Data Safety',
            items: [
              'Your email is never displayed publicly.',
              'Private claim details are only visible to reviewers.',
              'Do not share passwords or authentication details.',
              'Report any privacy concerns to support immediately.',
            ]
          },
          {
            icon: '🚩', title: 'Reporting Problems',
            items: [
              'Use the "Report Listing" button on any suspicious item.',
              'Contact us if you suspect fraud or harassment.',
              'Our team reviews all reports within 24 hours.',
            ]
          },
        ].map((section, i) => (
          <div className="card" key={i} style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem' }}>{section.icon} {section.title}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {section.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.9rem', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green-600)', fontWeight: 700, marginTop: '1px', flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/contact" className="btn btn-primary">Report a Safety Concern</Link>
        </div>
      </div>
    </div>
  );
}
