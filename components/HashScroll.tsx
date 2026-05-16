'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || hash === '#') return;

    // wait a tick for the page to render before scrolling
    const id = hash.slice(1);
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts++ < 20) requestAnimationFrame(tryScroll);
    };
    tryScroll();
  }, [pathname]);

  // also handle in-page hash clicks (smooth scroll without jump)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#') return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
