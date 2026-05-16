import { notFound } from 'next/navigation';
import PDPView from '@/components/PDPView';
import { PRODUCTS } from '@/lib/products';
import { loadProductByHandle, loadRelatedFor } from '@/lib/catalog-adapter';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }) {
  const p = await loadProductByHandle(params.id);
  return p
    ? { title: `${p.name} — Aneira`, description: p.description }
    : { title: 'Aneira' };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await loadProductByHandle(params.id);
  if (!product) notFound();
  const related = await loadRelatedFor(params.id);
  return <PDPView product={product} related={related} />;
}
