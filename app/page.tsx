import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import HeroParallax from '@/components/HeroParallax';
import { loadSignatureProducts } from '@/lib/catalog-adapter';

const StarRow = ({ size = 14 }: { size?: number }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 18 18" fill="#C9A961">
        <path d="m9 1 2.5 5.2 5.7.5-4.3 3.8 1.3 5.6L9 13.2 3.8 16l1.3-5.6L.8 6.7l5.7-.5L9 1Z" />
      </svg>
    ))}
  </>
);

export default async function HomePage() {
  const signature = await loadSignatureProducts();

  return (
    <div id="view-home" className="view">
      <HeroParallax />
      <header className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-logo">
              <span className="logo-img logo-img--hero is-white" />
            </div>
            <div className="hero-label label" style={{ color: 'var(--gold-soft)' }}>
              Since 1986 · Chennai
            </div>
            <h1 className="h-display hero-title">
              A <em>quiet</em>
              <br />
              language of luxury.
            </h1>
            <div className="hero-cta-row">
              <Link className="btn btn--on-dark-fill" href="/shop">
                Explore the Collection <span className="arrow">→</span>
              </Link>
              <Link className="btn btn--on-dark" href="/#story">
                Our Story
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          Scroll
        </div>
      </header>

      <section className="collections">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="label">The Collections</span>
              <h2 className="h-display">
                Four <em>edits</em>, each its own world.
              </h2>
            </div>
            <Link className="link" href="/shop">
              View All <span>→</span>
            </Link>
          </div>

          <div className="collections-grid collections-grid--four">
            <Link className="col-card reveal" data-delay="1" href="/shop/everyday-gold">
              <div
                className="col-card-img"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80&auto=format&fit=crop')"
                }}
              />
              <div className="col-card-overlay" />
              <div className="col-card-content">
                <div className="col-card-eyebrow">No. 01</div>
                <h3 className="col-card-title">
                  <em>Everyday</em> Gold
                </h3>
                <span className="col-card-cta">
                  Shop Everyday <span>→</span>
                </span>
              </div>
            </Link>
            <Link className="col-card reveal" data-delay="2" href="/shop/bridal-gold">
              <div
                className="col-card-img"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1400&q=80&auto=format&fit=crop')"
                }}
              />
              <div className="col-card-overlay" />
              <div className="col-card-content">
                <div className="col-card-eyebrow">No. 02</div>
                <h3 className="col-card-title">
                  <em>Bridal</em> Lightweight
                </h3>
                <span className="col-card-cta">
                  Shop Bridal <span>→</span>
                </span>
              </div>
            </Link>
            <Link className="col-card reveal" data-delay="2" href="/shop/lab-diamond">
              <div
                className="col-card-img"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1400&q=80&auto=format&fit=crop')"
                }}
              />
              <div className="col-card-overlay" />
              <div className="col-card-content">
                <div className="col-card-eyebrow">No. 03</div>
                <h3 className="col-card-title">
                  <em>Lab-Grown</em> Diamonds
                </h3>
                <span className="col-card-cta">
                  Shop Diamonds <span>→</span>
                </span>
              </div>
            </Link>
            <Link className="col-card reveal" data-delay="3" href="/shop/silver">
              <div
                className="col-card-img"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=80&auto=format&fit=crop')"
                }}
              />
              <div className="col-card-overlay" />
              <div className="col-card-content">
                <div className="col-card-eyebrow">No. 04</div>
                <h3 className="col-card-title">
                  <em>92.5</em> Silver
                </h3>
                <span className="col-card-cta">
                  Shop Silver <span>→</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="container">
          <div className="story-grid">
            <div className="story-text reveal">
              <span className="label">Our Story</span>
              <h2 className="h-display">
                Crafting since <em>1986</em>.
              </h2>
              <p>
                For four decades, the artisans of Lalitha Thanga Maaligai have shaped jewellery the
                slow way — by hand, in our Chennai workshop, for families who pass each piece down.
                Aneira is the same atelier, with a quieter, more modern voice.
              </p>
              <Link className="btn btn--secondary" href="/#atelier-section">
                Visit the Atelier <span className="arrow">→</span>
              </Link>
            </div>
            <div className="story-spacer" aria-hidden="true" />
            <div className="story-visual reveal" data-delay="2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1000&q=85&auto=format&fit=crop"
                alt="A master artisan at work in the Aneira atelier"
                loading="lazy"
              />
              <div className="story-since">
                <div className="story-since-num">1986</div>
                <div className="story-since-label">Established</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="signature">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="label">Signature Pieces</span>
              <h2 className="h-display">
                Chosen by hand,
                <br />
                made to <em>outlast</em>.
              </h2>
            </div>
            <Link className="link" href="/shop">
              View All Pieces <span>→</span>
            </Link>
          </div>
          <div className="products-grid" id="home-signature-grid">
            {signature.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={(i % 3) + 1} />
            ))}
          </div>
          <div className="signature-cta reveal">
            <Link className="btn btn--secondary" href="/shop">
              View All Pieces <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="labgrown" id="labgrown-section">
        <div className="labgrown-bg" aria-hidden="true" />
        <div className="container labgrown-container">
          <div className="labgrown-grid">
            <div className="labgrown-visual reveal">
              <div className="labgrown-diamond" aria-hidden="true">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="dia-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#FAF7F2" stopOpacity=".95" />
                      <stop offset="0.5" stopColor="#E0CE9C" stopOpacity=".7" />
                      <stop offset="1" stopColor="#334F65" stopOpacity=".4" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="100,40 160,80 100,170 40,80"
                    fill="url(#dia-grad)"
                    stroke="#FAF7F2"
                    strokeWidth="1"
                    strokeOpacity=".7"
                  />
                  <line x1="40" y1="80" x2="160" y2="80" stroke="#FAF7F2" strokeWidth="1" strokeOpacity=".5" />
                  <line x1="100" y1="40" x2="100" y2="170" stroke="#FAF7F2" strokeWidth="1" strokeOpacity=".3" />
                  <line x1="40" y1="80" x2="100" y2="170" stroke="#FAF7F2" strokeWidth="1" strokeOpacity=".4" />
                  <line x1="160" y1="80" x2="100" y2="170" stroke="#FAF7F2" strokeWidth="1" strokeOpacity=".4" />
                  <line x1="70" y1="60" x2="100" y2="80" stroke="#FAF7F2" strokeWidth=".5" strokeOpacity=".5" />
                  <line x1="130" y1="60" x2="100" y2="80" stroke="#FAF7F2" strokeWidth=".5" strokeOpacity=".5" />
                </svg>
              </div>
            </div>
            <div className="labgrown-text reveal" data-delay="1">
              <span className="label" style={{ color: 'var(--gold-soft)' }}>
                Lab-Grown Diamonds
              </span>
              <h2 className="h-display">
                Same fire. Same forever.
                <br />
                <em>None of the cost.</em>
              </h2>
              <p className="labgrown-lede">
                Lab-grown diamonds are chemically, optically, and physically identical to mined ones
                — only the origin differs. Grown in a controlled environment over weeks instead of
                formed over a billion years underground. Same carbon. Same brilliance. Less than
                half the price.
              </p>

              <div className="labgrown-points">
                <div className="labgrown-point">
                  <div className="labgrown-point-num">01</div>
                  <div>
                    <h4>Identical, by chemistry</h4>
                    <p>
                      Pure crystallised carbon. Indistinguishable from mined diamonds without
                      specialised equipment.
                    </p>
                  </div>
                </div>
                <div className="labgrown-point">
                  <div className="labgrown-point-num">02</div>
                  <div>
                    <h4>Lighter on the earth</h4>
                    <p>
                      No mining, dramatically less land disturbed and water consumed per carat.
                    </p>
                  </div>
                </div>
                <div className="labgrown-point">
                  <div className="labgrown-point-num">03</div>
                  <div>
                    <h4>IGI &amp; GIA certified</h4>
                    <p>
                      Every stone above 0.30ct ships with an independent grading report — clarity,
                      colour, cut, carat.
                    </p>
                  </div>
                </div>
                <div className="labgrown-point">
                  <div className="labgrown-point-num">04</div>
                  <div>
                    <h4>Better value, lasting</h4>
                    <p>
                      Roughly 40–60% less than a comparable mined diamond. The savings stay with
                      you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="labgrown-cta-row">
                <Link className="btn btn--on-dark-fill" href="/shop/lab-diamond">
                  Shop Lab-Grown <span className="arrow">→</span>
                </Link>
                <a
                  className="btn btn--on-dark"
                  href="mailto:hello@aneira.co?subject=Lab-Grown%20Diamond%20Consultation"
                >
                  Talk to a Consultant
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="journal">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <span className="label">The Aneira Journal</span>
              <h2 className="h-display">
                Notes from the <em>atelier</em>.
              </h2>
            </div>
            <a className="link">All Stories <span>→</span></a>
          </div>

          <div className="journal-grid">
            {[
              {
                tag: 'Bridal Guide',
                read: '12 min read',
                img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
                title: 'How to layer lightweight gold for the modern wedding day.',
                excerpt:
                  "Why the heaviest haar isn't always the right one — a stylist's breakdown of layering, lightness, and what the camera actually loves."
              },
              {
                tag: 'Diamond Education',
                read: '8 min read',
                img: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1000&q=80&auto=format&fit=crop',
                title: 'Lab-grown vs mined: a clear-eyed comparison.',
                excerpt:
                  "A plain-language guide to what's the same, what's different, and what the difference actually means for your ring."
              },
              {
                tag: 'Jewellery Care',
                read: '6 min read',
                img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop',
                title: 'The five-minute monthly ritual every gold piece needs.',
                excerpt:
                  "A simple, atelier-tested cleaning routine that keeps gold luminous and silver tarnish-free — using what's already in your kitchen."
              }
            ].map((j, i) => (
              <article key={i} className="journal-card reveal" data-delay={i + 1}>
                <div className="journal-img" style={{ backgroundImage: `url('${j.img}')` }} />
                <div className="journal-meta">
                  <span className="journal-tag">{j.tag}</span>
                  <span className="journal-date">{j.read}</span>
                </div>
                <h3 className="journal-title">{j.title}</h3>
                <p className="journal-excerpt">{j.excerpt}</p>
                <span className="journal-read">
                  Read the story <span>→</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="atelier" id="atelier-section">
        <div className="atelier-bg" aria-hidden="true" />
        <div className="atelier-overlay" aria-hidden="true" />
        <div className="atelier-content">
          <div className="reveal">
            <span className="label">Visit the Atelier</span>
            <h2 className="h-display">
              Some pieces are chosen
              <br />
              <em>in person</em>.
            </h2>
            <p>
              Private consultations at our Adambakkam flagship, video appointments worldwide, or by
              request at home.
            </p>
            <div className="btn-row">
              <a
                className="btn btn--on-dark-fill"
                href="mailto:hello@aneira.co?subject=Atelier%20Visit%20Booking"
              >
                Book a Visit <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="trust" id="trust-section">
        <div className="container">
          <div
            className="section-head reveal"
            style={{
              textAlign: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span className="label">Quietly Promised</span>
            <h2 className="h-display" style={{ textAlign: 'center' }}>
              Built on <em>four decades</em> of trust.
            </h2>
          </div>
          <div className="trust-grid">
            <div className="trust-item reveal" data-delay="1">
              <div className="trust-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M18 3 6 8v8c0 8 5.5 13.5 12 16 6.5-2.5 12-8 12-16V8L18 3Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path d="m13 18 4 4 8-9" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <h4>BIS Hallmarked</h4>
              <p>Every gold gram government-certified for purity.</p>
            </div>
            <div className="trust-item reveal" data-delay="2">
              <div className="trust-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <polygon points="18,4 30,12 18,32 6,12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="6" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="18" y1="12" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="18" y1="12" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <h4>IGI &amp; GIA Certified</h4>
              <p>Every diamond above 0.30ct independently graded.</p>
            </div>
            <div className="trust-item reveal" data-delay="3">
              <div className="trust-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M4 18a14 14 0 1 1 28 0 14 14 0 0 1-28 0Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M18 4v28M4 18h28"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeOpacity=".4"
                  />
                  <path d="m12 14 6 6 6-6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <h4>Lifetime Buyback</h4>
              <p>Trade in any piece toward a new purchase at fair value.</p>
            </div>
            <div className="trust-item reveal" data-delay="3">
              <div className="trust-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect
                    x="4"
                    y="9"
                    width="20"
                    height="14"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path d="M24 13h5l3 4v6h-8" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="10" cy="25" r="3" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="26" cy="25" r="3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <h4>Same-Day Delivery</h4>
              <p>Complimentary within Chennai, ordered before 2 PM.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <div className="testimonials-head reveal">
            <div className="google-rating">
              <div className="google-stars">
                <StarRow size={18} />
              </div>
              <div className="google-rating-text">
                <strong>4.9</strong> on Google · <span>over 1,200 reviews</span>
              </div>
            </div>
            <h2 className="h-display">
              Trusted across <em>four decades</em>.
            </h2>
          </div>

          <div className="testimonial-grid">
            {[
              {
                quote:
                  "My wedding choker was unlike anything I'd seen anywhere else in Chennai — and the team made the entire process feel intimate, never transactional. Three jewellers told me to come here. I see why.",
                avatar:
                  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&q=80&auto=format&fit=crop',
                name: 'Anika R.',
                context: 'Bridal Choker · 2024'
              },
              {
                quote:
                  'Switched to lab-grown for our anniversary band and got a noticeably better stone for less money. The IGI report was in the box, the explanation was patient, the ring is gorgeous.',
                avatar:
                  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&auto=format&fit=crop',
                name: 'Karthik & Meera S.',
                context: 'Lab-Grown Anniversary Band'
              },
              {
                quote:
                  "Ordered the Ila stack at 11am, delivered the same evening, gift-boxed and immaculate. My mother thought I'd flown to Chennai. Quietly the most thoughtful jewellery house in the city.",
                avatar:
                  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&q=80&auto=format&fit=crop',
                name: 'Divya N.',
                context: 'Everyday Gold · Same-day delivery'
              }
            ].map((t, i) => (
              <article key={i} className="testimonial reveal" data-delay={i + 1}>
                <div className="testimonial-stars" aria-label="5 stars">
                  <StarRow />
                </div>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-meta">
                  <div
                    className="testimonial-avatar"
                    style={{ backgroundImage: `url('${t.avatar}')` }}
                  />
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-context">{t.context}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="instagram">
        <div className="container">
          <div
            className="section-head reveal"
            style={{
              justifyContent: 'center',
              textAlign: 'center',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span className="label">Follow Along</span>
            <h2 className="h-display" style={{ textAlign: 'center' }}>
              <em>@aneira.bytm</em>
            </h2>
            <a
              className="link"
              href="https://instagram.com/aneira.bytm"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: 14 }}
            >
              Open Instagram <span>→</span>
            </a>
          </div>

          <div className="ig-grid">
            {[
              'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=80&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=700&q=80&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=700&q=80&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=700&q=80&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=80&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=700&q=80&auto=format&fit=crop'
            ].map((url, i) => (
              <a
                key={i}
                className="ig-tile reveal"
                data-delay={Math.floor(i / 2) + 1}
                href="https://instagram.com/aneira.bytm"
                target="_blank"
                rel="noreferrer"
                style={{ backgroundImage: `url('${url}')` }}
              >
                <div className="ig-tile-overlay">
                  {i % 2 === 0 ? (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect
                        x="2"
                        y="2"
                        width="18"
                        height="18"
                        rx="4"
                        stroke="white"
                        strokeWidth="1.4"
                      />
                      <circle cx="11" cy="11" r="4.2" stroke="white" strokeWidth="1.4" />
                      <circle cx="16.5" cy="5.5" r="1" fill="white" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <polygon points="9,7 16,11 9,15" fill="white" />
                      <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.4" />
                    </svg>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
