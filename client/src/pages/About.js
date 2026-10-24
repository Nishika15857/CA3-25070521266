import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--background)' }}>
      <div className="page-header">
        <div className="container"><h1>About CampusLoop</h1><p>The story behind the smart campus lost &amp; found portal</p></div>
      </div>
      <div className="container" style={{ maxWidth: 860, padding: '3rem 1.5rem' }}>

        {/* Mission */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h2 style={{ marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1rem' }}>
              CampusLoop exists to solve a universal problem — the frustration of losing something important and having no efficient way to find it.
            </p>
            <p>
              By creating a centralized, secure and easy-to-use platform, we connect people who have lost belongings with those who have found them.
              The recovery process is transparent, safe and verifiable — no more scattered WhatsApp messages or paper notices that nobody reads.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h2 style={{ marginBottom: '1.5rem' }}>How the Recovery Process Works</h2>
            {[
              { step: 1, icon: '📝', title: 'Report', desc: 'Submit a lost or found item report with photographs and a detailed description.' },
              { step: 2, icon: '🔍', title: 'Search & Match', desc: 'Our smart matching algorithm compares category, keywords, location and dates to surface potential matches.' },
              { step: 3, icon: '✋', title: 'Claim', desc: 'If you recognize your item, submit a claim with proof of ownership details. These remain private.' },
              { step: 4, icon: '🔒', title: 'Verify', desc: 'The item reporter or an administrator reviews the claim. They may request additional verification.' },
              { step: 5, icon: '🎉', title: 'Recover', desc: 'Once verified, coordinate a safe pickup and the item is marked as returned. Statistics update automatically.' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 40, height: 40, background: 'var(--green-600)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>{s.step}</div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{s.icon} {s.title}</p>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart matching */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h2 style={{ marginBottom: '1rem' }}>Smart Matching — How It Works</h2>
            <p style={{ marginBottom: '1rem' }}>
              CampusLoop uses a rule-based scoring algorithm to find potential matches between lost and found items.
              This is <strong>not</strong> artificial intelligence — it is a transparent, understandable scoring system.
            </p>
            <div style={{ background: 'var(--charcoal-50)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              {[
                { rule: 'Same Category', points: '+40 points', desc: 'Electronics matched with Electronics, etc.' },
                { rule: 'Title Keyword Overlap', points: 'Up to +30 points', desc: 'Common meaningful words in the item title.' },
                { rule: 'Description Keyword Overlap', points: 'Up to +20 points', desc: 'Common meaningful words in descriptions.' },
                { rule: 'Same Location', points: '+20 points', desc: 'Exact location match.' },
                { rule: 'Nearby Location', points: '+10 points', desc: 'Shared location keywords.' },
                { rule: 'Within 3 Days', points: '+15 points', desc: 'Dates within 3 days of each other.' },
                { rule: 'Within 7 Days', points: '+8 points', desc: 'Dates within 7 days of each other.' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--green-700)', minWidth: 80, fontSize: '0.85rem' }}>{r.points}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.rule}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Items with a score of 20 or above are shown as potential matches. Always verify ownership before handing over an item.</p>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <h2 style={{ marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
            {[
              { q: 'Is CampusLoop free to use?', a: 'Yes, CampusLoop is completely free for all users.' },
              { q: 'Who can see my contact details?', a: 'Your email and contact preferences are never displayed publicly. Only the item reporter and administrators can see claim details.' },
              { q: 'What if someone makes a false claim?', a: 'Claims require a description with ownership proof. Administrators and item owners review claims. False claims can be rejected.' },
              { q: 'Can I use this outside of a college?', a: 'Yes! CampusLoop is built to work in any institutional or community environment.' },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.375rem' }}>❓ {f.q}</p>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ marginRight: '1rem' }}>Get Started</Link>
          <Link to="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
