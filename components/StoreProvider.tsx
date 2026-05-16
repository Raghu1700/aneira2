'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, inr, type Product } from '@/lib/products';

export type CartLine = { id: string; qty: number; size?: string };
export type DrawerName = 'cart' | 'wishlist' | 'mobile' | null;

type StoreContextValue = {
  cart: CartLine[];
  wishlist: Set<string>;
  drawer: DrawerName;
  toastMessage: string | null;
  cartBump: number;
  addToCart: (id: string, qty?: number, size?: string) => void;
  changeCartQty: (key: string, delta: number) => void;
  removeFromCart: (key: string) => void;
  toggleWishlist: (id: string) => void;
  openDrawer: (name: Exclude<DrawerName, null>) => void;
  closeDrawers: () => void;
  showToast: (msg: string) => void;
  isWished: (id: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const lineKey = (l: CartLine) => (l.size ? l.id + ':' + l.size : l.id);

const STORAGE_KEYS = { cart: 'aneira.cart', wishlist: 'aneira.wishlist' };

const loadJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set());
  const [drawer, setDrawer] = useState<DrawerName>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartBump, setCartBump] = useState(0);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setCart(loadJSON<CartLine[]>(STORAGE_KEYS.cart, []));
    setWishlist(new Set(loadJSON<string[]>(STORAGE_KEYS.wishlist, [])));
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.wishlist,
        JSON.stringify([...wishlist])
      );
    } catch {}
  }, [wishlist]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2400);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // body scroll lock when any drawer is open
  useEffect(() => {
    if (drawer) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
  }, [drawer]);

  // ESC closes drawers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawer(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const addToCart = useCallback(
    (id: string, qty = 1, size?: string) => {
      const p = getProduct(id);
      if (!p) return;
      setCart((prev) => {
        const key = size ? id + ':' + size : id;
        const found = prev.find((l) => lineKey(l) === key);
        if (found) {
          return prev.map((l) => (l === found ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { id, qty, size }];
      });
      setCartBump((n) => n + 1);
      setDrawer('cart');
      showToast(p.name + ' added');

      // Best-effort server sync — silent on failure (works once DB is wired)
      import('@/actions/cart')
        .then((m) => m.addToCart({ productId: id, quantity: qty }))
        .catch(() => {});
    },
    [showToast]
  );

  const changeCartQty = useCallback((key: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          showToast('Removed from wishlist');
        } else {
          next.add(id);
          const p = getProduct(id);
          if (p) showToast(p.name + ' saved');
        }
        return next;
      });

      // Best-effort server sync (requires auth + real product id; safe to fail)
      import('@/actions/wishlist')
        .then((m) => m.toggleWishlist({ productId: id }))
        .catch(() => {});
    },
    [showToast]
  );

  const openDrawer = useCallback((name: Exclude<DrawerName, null>) => setDrawer(name), []);
  const closeDrawers = useCallback(() => setDrawer(null), []);
  const isWished = useCallback((id: string) => wishlist.has(id), [wishlist]);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      wishlist,
      drawer,
      toastMessage,
      cartBump,
      addToCart,
      changeCartQty,
      removeFromCart,
      toggleWishlist,
      openDrawer,
      closeDrawers,
      showToast,
      isWished
    }),
    [
      cart,
      wishlist,
      drawer,
      toastMessage,
      cartBump,
      addToCart,
      changeCartQty,
      removeFromCart,
      toggleWishlist,
      openDrawer,
      closeDrawers,
      showToast,
      isWished
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export function cartSubtotal(cart: CartLine[]): number {
  return cart.reduce((s, l) => {
    const p = getProduct(l.id);
    return p ? s + p.price * l.qty : s;
  }, 0);
}

export { lineKey, inr };
export type { Product };
