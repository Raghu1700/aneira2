'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cartSubtotal, inr, lineKey, useStore } from './StoreProvider';
import { getProduct } from '@/lib/products';

export default function Drawers() {
  const {
    drawer,
    cart,
    wishlist,
    closeDrawers,
    changeCartQty,
    removeFromCart,
    addToCart,
    toggleWishlist,
    showToast
  } = useStore();
  const router = useRouter();

  const cartQty = cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = cartSubtotal(cart);

  const goToProduct = (id: string) => {
    closeDrawers();
    router.push('/product/' + id);
  };

  return (
    <>
      <aside className={'drawer-mobile' + (drawer === 'mobile' ? ' open' : '')} id="drawer-mobile">
        <div className="drawer-mobile-head">
          <Link href="/" onClick={closeDrawers} className="logo" aria-label="Aneira">
            <span className="logo-img logo-img--drawer" />
          </Link>
          <button
            className="drawer-mobile-close"
            onClick={closeDrawers}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 3l14 14M3 17 17 3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        <nav className="drawer-mobile-nav">
          <Link href="/shop" onClick={closeDrawers}>Collections</Link>
          <Link href="/shop/lab-diamond" onClick={closeDrawers}><em>Lab-Grown</em></Link>
          <Link href="/#story" onClick={closeDrawers}>Story</Link>
          <Link href="/#atelier-section" onClick={closeDrawers}>Atelier</Link>
          <Link href="/#trust-section" onClick={closeDrawers}>Trust</Link>
        </nav>
        <div className="drawer-mobile-foot">
          <a href="tel:+919000000000">+91 90000 00000</a>
          <a href="mailto:hello@aneira.co">hello@aneira.co</a>
        </div>
      </aside>

      <aside
        className={'drawer-side' + (drawer === 'cart' ? ' open' : '')}
        id="drawer-cart"
        aria-label="Shopping cart"
      >
        <div className="drawer-side-head">
          <h3>Cart</h3>
          <span className="count">{cartQty + (cartQty === 1 ? ' item' : ' items')}</span>
          <button className="drawer-side-close" onClick={closeDrawers} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M2 2l14 14M2 16 16 2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        <div className="drawer-side-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M8 14h32l-3 28a2 2 0 0 1-2 1.8H13a2 2 0 0 1-2-1.8L8 14Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M16 14V9a8 8 0 0 1 16 0v5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
              <p>Your cart is quiet for now.</p>
              <div className="sub">Begin with a single piece.</div>
              <Link href="/shop" onClick={closeDrawers} className="btn btn--primary">
                Browse Collections <span className="arrow">→</span>
              </Link>
            </div>
          ) : (
            cart.map((line) => {
              const p = getProduct(line.id);
              if (!p) return null;
              const key = lineKey(line);
              return (
                <div className="cart-line" key={key}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="cart-line-img"
                    src={p.images[0]}
                    alt={p.name}
                    onClick={() => goToProduct(p.id)}
                  />
                  <div className="cart-line-info">
                    <div>
                      <div className="cart-line-name" onClick={() => goToProduct(p.id)}>
                        {p.name}
                      </div>
                      <div className="cart-line-collection">
                        {p.collection}
                        {line.size ? ' · Size ' + line.size : ''}
                      </div>
                    </div>
                    <div className="qty">
                      <button onClick={() => changeCartQty(key, -1)} aria-label="Decrease">
                        −
                      </button>
                      <span>{line.qty}</span>
                      <button onClick={() => changeCartQty(key, 1)} aria-label="Increase">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-right">
                    <div className="cart-line-price">{inr(p.price * line.qty)}</div>
                    <button className="remove-link" onClick={() => removeFromCart(key)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-side-foot">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span className="amount">{inr(subtotal)}</span>
            </div>
            <button
              className="btn btn--primary btn--block cart-checkout"
              onClick={() => showToast('Checkout will open with Razorpay')}
            >
              Proceed to Checkout <span className="arrow">→</span>
            </button>
            <p className="cart-note">Secure checkout · GST inclusive · Insured shipping</p>
          </div>
        )}
      </aside>

      <aside
        className={'drawer-side' + (drawer === 'wishlist' ? ' open' : '')}
        id="drawer-wishlist"
        aria-label="Wishlist"
      >
        <div className="drawer-side-head">
          <h3>Wishlist</h3>
          <span className="count">{wishlist.size} saved</span>
          <button className="drawer-side-close" onClick={closeDrawers} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M2 2l14 14M2 16 16 2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        <div className="drawer-side-body">
          {wishlist.size === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 42s-18-11-18-25a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 14-18 25-18 25Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
              <p>No saved pieces yet.</p>
              <div className="sub">Tap the heart on any piece to save it here.</div>
              <Link href="/shop" onClick={closeDrawers} className="btn btn--primary">
                Browse Pieces <span className="arrow">→</span>
              </Link>
            </div>
          ) : (
            [...wishlist].map((id) => {
              const p = getProduct(id);
              if (!p) return null;
              return (
                <div className="wishlist-line" key={id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="wishlist-line-img"
                    src={p.images[0]}
                    alt={p.name}
                    onClick={() => goToProduct(p.id)}
                  />
                  <div className="wishlist-line-info">
                    <div>
                      <div
                        className="wishlist-line-name cart-line-name"
                        onClick={() => goToProduct(p.id)}
                      >
                        {p.name}
                      </div>
                      <div className="cart-line-collection">{p.collection}</div>
                    </div>
                  </div>
                  <div className="wishlist-line-actions">
                    <div className="wishlist-line-price">{inr(p.price)}</div>
                    <button
                      className="wishlist-line-add"
                      onClick={() => {
                        addToCart(p.id);
                        toggleWishlist(p.id);
                      }}
                    >
                      Add to Cart
                    </button>
                    <button className="remove-link" onClick={() => toggleWishlist(p.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <div
        className={'overlay' + (drawer ? ' show' : '')}
        onClick={closeDrawers}
      />
    </>
  );
}
