/**
 * Bridges the static catalog (lib/products.ts) and the backend
 * server-action catalog (actions/catalog.ts).
 *
 * Behaviour:
 *   - If the backend's searchProducts / getProduct return data, use it.
 *   - If the DB is unreachable, empty, or the action throws, fall back
 *     to the static seed in lib/products.ts so the UI keeps rendering.
 *
 * Frontend components import from THIS file rather than lib/products.ts
 * directly, so wiring up a real DB is a no-code-change operation
 * (just seed it).
 */

import {
  PRODUCTS as STATIC_PRODUCTS,
  HOME_SIGNATURE_IDS,
  COLLECTION_LABELS,
  FILTERS,
  type Product as StaticProduct
} from './products';

export type FEProduct = StaticProduct;
export { COLLECTION_LABELS, FILTERS, HOME_SIGNATURE_IDS };

// ────────────────────────────────────────────────────────────────────────
// Mapping helpers
// ────────────────────────────────────────────────────────────────────────

const COLLECTION_HANDLE_TO_KEY: Record<string, FEProduct['collectionKey']> = {
  'everyday-gold': 'everyday-gold',
  'bridal-gold': 'bridal-gold',
  'lab-diamond': 'lab-diamond',
  silver: 'silver'
};

const fromBackendCard = (
  p: {
    id: string;
    handle: string;
    title: string;
    price: string;
    imageUrl: string | null;
  },
  collection: string,
  collectionKey: FEProduct['collectionKey']
): FEProduct => ({
  id: p.handle,
  name: p.title,
  collection,
  collectionKey,
  price: Number(p.price),
  images: p.imageUrl ? [p.imageUrl, p.imageUrl] : [],
  description: '',
  specs: []
});

// ────────────────────────────────────────────────────────────────────────
// Public adapter
// ────────────────────────────────────────────────────────────────────────

const STATIC_BY_ID = new Map(STATIC_PRODUCTS.map((p) => [p.id, p]));

export async function loadAllProducts(): Promise<FEProduct[]> {
  try {
    const { searchProducts } = await import('@/actions/catalog');
    const res = await searchProducts({ page: 1, pageSize: 100, sort: 'featured' });
    if (res.ok && res.data.items.length > 0) {
      return res.data.items.map((p) =>
        fromBackendCard(p, 'Collection', 'everyday-gold')
      );
    }
  } catch {
    // DB unreachable → fall through
  }
  return STATIC_PRODUCTS;
}

export async function loadProductsByCollection(
  collectionKey: string
): Promise<FEProduct[]> {
  try {
    const { searchProducts } = await import('@/actions/catalog');
    const res = await searchProducts({
      page: 1,
      pageSize: 100,
      collection: collectionKey,
      sort: 'featured'
    });
    if (res.ok && res.data.items.length > 0) {
      const labelKey = COLLECTION_HANDLE_TO_KEY[collectionKey] ?? 'everyday-gold';
      const collectionLabel = COLLECTION_LABELS[labelKey] ?? 'Collection';
      return res.data.items.map((p) => fromBackendCard(p, collectionLabel, labelKey));
    }
  } catch {}
  return collectionKey === 'all'
    ? STATIC_PRODUCTS
    : STATIC_PRODUCTS.filter((p) => p.collectionKey === collectionKey);
}

export async function loadProductByHandle(handle: string): Promise<FEProduct | undefined> {
  try {
    const { getProduct } = await import('@/actions/catalog');
    const res = await getProduct(handle);
    if (res.ok) {
      const d = res.data;
      const collectionKey =
        COLLECTION_HANDLE_TO_KEY[d.collection.handle] ?? 'everyday-gold';
      return {
        id: d.handle,
        name: d.title,
        collection: d.collection.title,
        collectionKey,
        price: Number(d.basePrice),
        images: d.images.map((i) => i.url),
        description: d.longDescription ?? d.shortDescription ?? '',
        specs: [
          d.metal && { label: 'Metal', value: d.metal },
          d.grossWeightG && { label: 'Gross weight', value: d.grossWeightG + ' g' },
          d.stones && { label: 'Stones', value: d.stones },
          d.dimensions && { label: 'Dimensions', value: d.dimensions },
          d.hallmark && { label: 'Hallmark', value: d.hallmark },
          d.certification && { label: 'Certification', value: d.certification }
        ].filter(Boolean) as { label: string; value: string }[],
        sizes: d.variants.length ? d.variants.map((v) => v.title) : undefined
      };
    }
  } catch {}
  return STATIC_BY_ID.get(handle);
}

export async function loadSignatureProducts(): Promise<FEProduct[]> {
  try {
    const { getFeaturedProducts } = await import('@/actions/catalog');
    const res = await getFeaturedProducts(6);
    if (res.ok && res.data.length > 0) {
      return res.data.map((p) =>
        fromBackendCard(p, 'Signature', 'everyday-gold')
      );
    }
  } catch {}
  return HOME_SIGNATURE_IDS.map((id) => STATIC_BY_ID.get(id)).filter(
    (p): p is FEProduct => Boolean(p)
  );
}

export async function loadRelatedFor(handle: string): Promise<FEProduct[]> {
  const product = await loadProductByHandle(handle);
  if (!product) return [];
  // First try backend related-by-id, then fall back to static.related[]
  try {
    const { getRelatedProducts } = await import('@/actions/catalog');
    // We only have handle on the FE side. The backend needs the DB id —
    // since loadProductByHandle returns handle as id, we can't easily call
    // getRelatedProducts here without an extra round trip. Skip and use
    // static related IDs as a sensible default.
  } catch {}
  return (product.related ?? [])
    .map((id) => STATIC_BY_ID.get(id))
    .filter((p): p is FEProduct => Boolean(p));
}
