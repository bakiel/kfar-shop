import { notFound } from 'next/navigation';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { getEnrichedBundle, getAllBundles } from '@/lib/services/landing-data-service';
import BundleDetail from './BundleDetail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await getEnrichedBundle(id);

  if (!bundle) {
    return { title: 'Bundle Not Found | KFAR Marketplace' };
  }

  return {
    title: `${bundle.name} | KFAR Marketplace`,
    description: bundle.description,
  };
}

export default async function BundleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [bundle, allBundles] = await Promise.all([
    getEnrichedBundle(id),
    getAllBundles(),
  ]);

  if (!bundle) {
    notFound();
  }

  // Get related bundles (excluding the current one)
  const relatedBundles = allBundles.filter(b => b.id !== id).slice(0, 3);

  return (
    <EnhancedLayout>
      <BundleDetail bundle={bundle} relatedBundles={relatedBundles} />
    </EnhancedLayout>
  );
}
