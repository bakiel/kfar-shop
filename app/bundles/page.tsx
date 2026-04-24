import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { getAllBundles } from '@/lib/services/landing-data-service';
import BundlesShowcase from './BundlesShowcase';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bundles & Save | KFAR Marketplace',
  description: 'Curated bundle deals from the Village of Peace. Buy together, save more.',
};

export default async function BundlesPage() {
  const bundles = await getAllBundles();

  return (
    <EnhancedLayout>
      <BundlesShowcase bundles={bundles} />
    </EnhancedLayout>
  );
}
