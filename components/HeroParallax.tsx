'use client';

import { useEffect } from 'react';

export default function HeroParallax() {
  useEffect(() => {
    let raf = 0;
    const el = document.querySelector<HTMLElement>('.hero-bg');
    if (!el) return;

    const update = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      el.style.setProperty('--parallax', (y * 0.25).toFixed(1) + 'px');
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
