import { notFound } from 'next/navigation';
import ShopView from '@/components/ShopView';
import { COLLECTION_LABELS, loadProductsByCollection } from '@/lib/catalog-adapter';

const VALID = new Set(['everyday-gold', 'bridal-gold', 'lab-diamond', 'silver']);

export function generateStaticParams() {
  return [...VALID].map((filter) => ({ filter }));
}

type Params = { filter: string };

export function generateMetadata({ params }: { params: Params }) {
  const label = COLLECTION_LABELS[params.filter];
  return label
    ? { title: `${label} — Aneira` }
    : { title: 'Collection — Aneira' };
}

export default async function ShopFilterPage({ params }: { params: Params }) {
  if (!VALID.has(params.filter)) notFound();
  const products = await loadProductsByCollection(params.filter);
  return <ShopView filter={params.filter} products={products} />;
}
