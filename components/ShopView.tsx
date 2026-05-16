'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { COLLECTION_LABELS, FILTERS, type FEProduct } from '@/lib/catalog-adapter';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function ShopView({
  filter,
  products
}: {
  filter: string;
  products: FEProduct[];
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>('featured');

  const sorted = useMemo(() => {
    const base = [...products];
    if (sort === 'price-asc') base.sort((x, y) => x.price - y.price);
    else if (sort === 'price-desc') base.sort((x, y) => y.price - x.price);
    return base;
  }, [products, sort]);

  const title = COLLECTION_LABELS[filter] ?? 'All Pieces';

  return (
    <div id="view-shop" className="view">
      <button
        className="back-link"
        onClick={() => router.push('/')}
        aria-label="Back"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M9 2 4 7l5 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Back</span>
      </button>
      <section className="shop-hero">
        <span className="label">The Collection</span>
        <h1>{title}</h1>
        <div className="count">
          {sorted.length} {sorted.length === 1 ? 'piece' : 'pieces'}
        </div>
      </section>

      <div className="shop-toolbar">
        <div className="filter-chips">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/shop' : '/shop/' + f.key}
              className={'filter-chip' + (filter === f.key ? ' active' : '')}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="sort-wrap">
          <label htmlFor="sort-select">Sort</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="shop-wrap">
        <div className="shop-grid">
          {sorted.length === 0 ? (
            <div className="shop-empty" style={{ gridColumn: '1/-1' }}>
              <p>Nothing here yet.</p>
              <Link className="link" href="/shop">
                View All Pieces →
              </Link>
            </div>
          ) : (
            sorted.map((p, i) => <ProductCard key={p.id} product={p} delay={(i % 4) + 1} />)
          )}
        </div>
      </div>
    </div>
  );
}
