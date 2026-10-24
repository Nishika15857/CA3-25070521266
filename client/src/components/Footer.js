import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🔁</span>
              <span className="footer-logo-text">Campus<span>Loop</span></span>
            </div>
            <p className="footer-tagline">Lost Something? Let's Bring It Back.</p>
            <p className="footer-desc">
              CampusLoop helps students and staff recover lost belongings through a simple,
              secure and centralized platform.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/browse">Browse Items</Link></li>
              <li><Link to="/report-lost">Report Lost</Link></li>
              <li><Link to="/report-found">Report Found</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/safety">Safety Guidelines</Link></li>
              <li><Link to="/about#how-it-works">How It Works</Link></li>
              <li><Link to="/about#faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Get Started</h4>
            <ul>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/dashboard">My Dashboard</Link></li>
            </ul>
            <div className="footer-note">
              <span>🔒</span>
              <span>Your data is safe with us.</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CampusLoop. Built with ❤️ for students.</p>
          <p className="footer-stack">
            React · Node.js · Express · MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}
