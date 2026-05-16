'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ProductCard from './ProductCard';
import { useStore } from './StoreProvider';
import { inr } from '@/lib/products';
import type { FEProduct } from '@/lib/catalog-adapter';

const HEART = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 16s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 16 6c0 5.5-7 10-7 10Z"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

export default function PDPView({
  product,
  related = []
}: {
  product: FEProduct;
  related?: FEProduct[];
}) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWished } = useStore();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [accordion, setAccordion] = useState<Record<string, boolean>>({
    specs: true,
    shipping: false
  });

  const fav = isWished(product.id);

  return (
    <div id="view-pdp" className="view">
      <button
        className="back-link"
        onClick={() => router.push('/shop/' + product.collectionKey)}
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
      <section className="pdp">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/shop">Collections</Link>
          <span className="sep">/</span>
          <Link href={'/shop/' + product.collectionKey}>{product.collection}</Link>
          <span className="sep">/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="pdp-grid">
          <div className="pdp-gallery">
            {product.images.map((img, i) => (
              <div className="pdp-img-wrap" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${product.name} — view ${i + 1}`}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  onClick={() => window.open(img, '_blank')}
                />
              </div>
            ))}
          </div>
          <div className="pdp-info">
            <div className="pdp-collection">{product.collection}</div>
            <h1 className="pdp-name">{product.name}</h1>
            <div className="pdp-price">{inr(product.price)}</div>
            <p className="pdp-desc">{product.description}</p>

            {product.sizes && (
              <div className="pdp-size">
                <div className="pdp-size-label">
                  <span>Size</span>
                  <a className="remove-link" href="mailto:hello@aneira.co?subject=Size%20guide">
                    Size guide
                  </a>
                </div>
                <div className="pdp-size-options">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={'pdp-size-opt' + (selectedSize === s ? ' active' : '')}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-actions">
              <button
                className="btn btn--primary"
                onClick={() => addToCart(product.id, 1, selectedSize)}
              >
                Add to Cart <span className="arrow">→</span>
              </button>
              <button
                className={'pdp-wishlist-btn' + (fav ? ' active' : '')}
                onClick={() => toggleWishlist(product.id)}
                aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {HEART}
              </button>
            </div>
            <a
              className="pdp-enquire"
              href={`mailto:hello@aneira.co?subject=Enquiry%20about%20${encodeURIComponent(
                product.name
              )}`}
            >
              Enquire about this piece →
            </a>

            <div className="accordion">
              <div className={'accordion-item' + (accordion.specs ? ' open' : '')}>
                <button
                  className="accordion-trigger"
                  onClick={() => setAccordion((a) => ({ ...a, specs: !a.specs }))}
                >
                  Specifications
                  <span className="plus" />
                </button>
                <div className="accordion-content">
                  <div className="accordion-inner">
                    <table className="specs-table">
                      <tbody>
                        {product.specs.map((s) => (
                          <tr key={s.label}>
                            <td>{s.label}</td>
                            <td>{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className={'accordion-item' + (accordion.shipping ? ' open' : '')}>
                <button
                  className="accordion-trigger"
                  onClick={() => setAccordion((a) => ({ ...a, shipping: !a.shipping }))}
                >
                  Shipping &amp; Care
                  <span className="plus" />
                </button>
                <div className="accordion-content">
                  <div className="accordion-inner">
                    <div className="trust-line">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M8 1 2 4v4c0 4 2.5 6.5 6 7.5 3.5-1 6-3.5 6-7.5V4L8 1Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                      <span>BIS hallmarked. All certifications shipped with the piece.</span>
                    </div>
                    <div className="trust-line">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect
                          x="1"
                          y="4"
                          width="10"
                          height="7"
                          rx="0.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path d="M11 6h2.5L15 8v3h-4" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      <span>Free insured shipping across India. International from ₹2,500.</span>
                    </div>
                    <div className="trust-line">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M2 8a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      <span>15-day exchange policy.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related">
            <h3>
              You may also <em>like</em>
            </h3>
            <div className="related-grid products-grid">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={i + 1} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
