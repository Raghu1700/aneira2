'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStore } from './StoreProvider';

export default function Nav() {
  const { cart, wishlist, openDrawer, showToast, cartBump } = useStore();
  const [shrunk, setShrunk] = useState(false);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartBump === 0) return;
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 600);
    return () => clearTimeout(t);
  }, [cartBump]);

  const cartQty = cart.reduce((s, l) => s + l.qty, 0);
  const wlQty = wishlist.size;

  return (
    <nav className={'nav' + (shrunk ? ' shrunk' : '')} id="nav">
      <div className="nav-inner">
        <button
          className="mobile-toggle"
          aria-label="Menu"
          onClick={() => openDrawer('mobile')}
        >
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
            <path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        <div className="nav-links">
          <Link href="/shop">Collections</Link>
          <Link href="/shop/lab-diamond">Lab-Grown</Link>
          <Link href="/#story">Story</Link>
          <Link href="/#atelier-section">Atelier</Link>
          <Link href="/#trust-section">Trust</Link>
        </div>

        <Link
          href="/"
          className="logo logo-wrap"
          aria-label="Aneira by Lalitha Thanga Maaligai — Home"
        >
          <span className="logo-img logo-img--nav is-white" />
          <span className="sr-only">Aneira by Lalitha Thanga Maaligai</span>
        </Link>

        <div className="nav-actions">
          <button aria-label="Search" onClick={() => showToast('Search coming with the backend')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button aria-label="Account" onClick={() => showToast('Account coming with the backend')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 17c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button aria-label="Wishlist" onClick={() => openDrawer('wishlist')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M9 16s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 16 6c0 5.5-7 10-7 10Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            <span className={'icon-count' + (wlQty > 0 ? ' show' : '')}>{wlQty}</span>
          </button>
          <button
            aria-label="Cart"
            className={bumping ? 'cart-bumping' : undefined}
            onClick={() => openDrawer('cart')}
          >
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
              <path
                d="M2 6h14l-1.5 12.5a1 1 0 0 1-1 .9H4.5a1 1 0 0 1-1-.9L2 6Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M6 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className={'icon-count' + (cartQty > 0 ? ' show' : '')}>{cartQty}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
