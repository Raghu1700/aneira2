'use client';

import Link from 'next/link';
import { useStore } from './StoreProvider';
import { inr } from '@/lib/products';
import type { FEProduct } from '@/lib/catalog-adapter';

export default function ProductCard({ product, delay }: { product: FEProduct; delay?: number }) {
  const { isWished, toggleWishlist } = useStore();
  const fav = isWished(product.id);

  return (
    <Link
      className="product-card reveal"
      data-delay={delay ?? undefined}
      style={delay ? ({ ['--stagger' as string]: delay } as React.CSSProperties) : undefined}
      href={'/product/' + product.id}
    >
      <div className="product-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="product-img-a" src={product.images[0]} alt={product.name} loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="product-img-b" src={product.images[1]} alt="" loading="lazy" />
        <button
          className={'product-wishlist' + (fav ? ' active' : '')}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 14s-6-4-6-8.5A3.5 3.5 0 0 1 8 3a3.5 3.5 0 0 1 6 2.5C14 10 8 14 8 14Z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </button>
      </div>
      <div className="product-collection">{product.collection}</div>
      <div className="product-meta">
        <div className="product-name">{product.name}</div>
        <div className="product-price">{inr(product.price)}</div>
      </div>
    </Link>
  );
}
