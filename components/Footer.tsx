'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="logo" aria-label="Aneira">
              <span className="logo-img logo-img--footer is-white" />
            </Link>
            <p>A Chennai atelier of fine jewellery, crafted by master artisans since 1986.</p>
          </div>
          <div className="footer-col">
            <h5>Explore</h5>
            <ul>
              <li><Link href="/shop">Collections</Link></li>
              <li><Link href="/shop/lab-diamond">Lab-Grown Diamonds</Link></li>
              <li><Link href="/#story">Our Story</Link></li>
              <li><Link href="/#atelier-section">Atelier Visits</Link></li>
              <li><Link href="/#trust-section">Reviews &amp; Trust</Link></li>
              <li><a href="mailto:hello@aneira.co?subject=Custom%20Design%20Enquiry">Custom Design</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Help</h5>
            <ul>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns &amp; Exchange</a></li>
              <li><a href="#">Jewellery Care</a></li>
              <li><a href="mailto:hello@aneira.co">Contact</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Visit Us</h5>
            <ul>
              <li><a target="_blank" rel="noreferrer" href="https://maps.google.com/?q=Adambakkam+Chennai">Adambakkam (Flagship)</a></li>
              <li><a target="_blank" rel="noreferrer" href="https://maps.google.com/?q=Alandhur+Chennai">Alandhur</a></li>
              <li><a target="_blank" rel="noreferrer" href="https://maps.google.com/?q=Kovilambakkam+Chennai">Kovilambakkam</a></li>
              <li><a href="tel:+919000000000">+91 90000 00000</a></li>
              <li><a href="mailto:hello@aneira.co">hello@aneira.co</a></li>
            </ul>
          </div>
          <div className="footer-col footer-newsletter">
            <h5>Stay in Touch</h5>
            {subscribed ? (
              <>
                <h5 style={{ color: 'var(--gold-soft)' }}>You&apos;re in.</h5>
                <p style={{ marginTop: 16, color: 'rgba(250,247,242,.85)', fontSize: 14, lineHeight: 1.6 }}>
                  Your 10% off code{' '}
                  <strong style={{ color: 'var(--cream)', letterSpacing: '.18em' }}>ANEIRA10</strong>{' '}
                  is on its way. Look for our first quiet letter on Sunday.
                </p>
              </>
            ) : (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                >
                  <input type="email" placeholder="Your email" required />
                  <button type="submit">Subscribe <span>→</span></button>
                </form>
                <p>
                  <span className="offer">Enjoy 10% off your first piece</span> when you subscribe.
                  First access to new collections, atelier events, and the slow stories behind the craft.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Aneira by Lalitha Thanga Maaligai. All rights reserved.</div>
          <div className="footer-policies">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
          <div className="footer-social">
            <a target="_blank" rel="noreferrer" href="https://instagram.com/aneira.bytm" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="12" cy="4" r=".8" fill="currentColor" />
              </svg>
            </a>
            <a target="_blank" rel="noreferrer" href="https://pinterest.com/aneira" aria-label="Pinterest">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M7 5.5c0-1 .8-1.8 2-1.8s2.2.9 2.2 2.3c0 1.8-1 3.3-2.4 3.3-.7 0-1.3-.4-1.5-.9l-.5 2.2-.4 1.4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
