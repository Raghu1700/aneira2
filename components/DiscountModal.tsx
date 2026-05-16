'use client';

import { useEffect, useRef, useState } from 'react';

type Status = 'hidden' | 'visible' | 'success' | 'dismissed';

const DISMISS_KEY = 'aneira.discountDismissed';

export default function DiscountModal() {
  const [status, setStatus] = useState<Status>('hidden');
  const [email, setEmail] = useState('');
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(DISMISS_KEY)) {
      dismissedRef.current = true;
      setStatus('dismissed');
      return;
    }
    const show = () => {
      if (dismissedRef.current) return;
      setStatus((s) => (s === 'hidden' ? 'visible' : s));
    };

    let scrollFired = false;
    const onScroll = () => {
      if (scrollFired || dismissedRef.current) return;
      const pct =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (pct > 0.65) {
        scrollFired = true;
        show();
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      if (dismissedRef.current) return;
      if (e.clientY <= 0 && !e.relatedTarget) show();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.matchMedia('(min-width: 768px)').matches) {
      document.addEventListener('mouseout', onMouseOut);
    }
    const timer = setTimeout(show, 45000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (status === 'visible' || status === 'success') {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'success') return;
    const t = setTimeout(() => {
      dismissedRef.current = true;
      setStatus('dismissed');
    }, 4500);
    return () => clearTimeout(t);
  }, [status]);

  const dismiss = () => {
    dismissedRef.current = true;
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setStatus('dismissed');
  };

  if (status === 'hidden' || status === 'dismissed') return null;

  return (
    <>
      <div className="overlay show" onClick={dismiss} />
      <div
        className="discount-modal show"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-title"
      >
        <div className="discount-modal-grid">
          <div className="discount-modal-visual" aria-hidden="true" />
          <div className="discount-modal-content">
            <button
              className="discount-modal-close"
              onClick={dismiss}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 2l12 12M2 14 14 2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            {status === 'visible' ? (
              <>
                <span className="label">First Piece</span>
                <h3 id="discount-title">
                  10% lighter,
                  <br />
                  your <em>first piece</em>.
                </h3>
                <p className="discount-modal-lede">
                  Join the quiet list. We&apos;ll send first access to new collections, slow stories
                  from the atelier, and a code for 10% off your first piece.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStatus('success');
                  }}
                >
                  <input
                    className="discount-modal-input"
                    type="email"
                    placeholder="Your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="discount-modal-input"
                    type="tel"
                    placeholder="Phone (optional)"
                  />
                  <button className="btn btn--primary" type="submit">
                    Send My Code <span className="arrow">→</span>
                  </button>
                </form>
                <button className="discount-modal-no" type="button" onClick={dismiss}>
                  No thank you
                </button>
                <p className="discount-modal-fineprint">
                  One-time use · Valid 30 days · We never share your details.
                </p>
              </>
            ) : (
              <>
                <span className="label" style={{ color: 'var(--gold)' }}>
                  Welcome to the list
                </span>
                <h3 style={{ marginTop: 14 }}>
                  You&apos;re <em>in</em>.
                </h3>
                <p className="discount-modal-lede">
                  Your code{' '}
                  <strong
                    style={{
                      color: 'var(--navy)',
                      letterSpacing: '.18em',
                      fontFamily: 'var(--sans)',
                      fontSize: 14
                    }}
                  >
                    ANEIRA10
                  </strong>{' '}
                  is on its way to <strong style={{ color: 'var(--ink)' }}>{email}</strong>. Enjoy
                  10% off your first piece.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
