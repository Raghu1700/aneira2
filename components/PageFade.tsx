'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('page-fade-in');
    // force reflow so animation restarts
    void el.offsetWidth;
    el.classList.add('page-fade-in');
  }, [pathname]);

  return (
    <div ref={ref} className="page-fade-in" key={pathname}>
      {children}
    </div>
  );
}
