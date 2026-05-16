import ShopView from '@/components/ShopView';
import { loadAllProducts } from '@/lib/catalog-adapter';

export const metadata = {
  title: 'Collections — Aneira',
  description: 'Browse the full Aneira collection.'
};

export default async function ShopPage() {
  const products = await loadAllProducts();
  return <ShopView filter="all" products={products} />;
}
