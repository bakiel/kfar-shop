import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { getLandingPageData } from '@/lib/services/landing-data-service';
import LandingHero from '@/components/landing/LandingHero';
import FeaturedCategories from '@/components/landing/FeaturedCategories';
import CTABanners from '@/components/landing/CTABanners';
import PromoBundles from '@/components/landing/PromoBundles';
import FlashDeals from '@/components/landing/FlashDeals';
import VendorShowcaseV2 from '@/components/landing/VendorShowcaseV2';
import FeaturesBar from '@/components/landing/FeaturesBar';
import RewardsPromo from '@/components/landing/RewardsPromo';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getLandingPageData();

  return (
    <EnhancedLayout>
      <main className="min-h-screen">
        {/* Hero: Community headline, stats, product grid, delivery toggle */}
        <LandingHero
          featuredProducts={data.featuredProducts}
          vendors={data.vendors}
          stats={data.stats}
        />

        {/* Category pills - horizontal scroll */}
        <FeaturedCategories categories={data.categories} />

        {/* Become a Vendor / Become a Driver CTAs */}
        <CTABanners />

        {/* Promotional bundles or Popular This Week */}
        <PromoBundles bundles={data.bundles} featuredProducts={data.featuredProducts} />

        {/* Flash deals with countdown (hidden if none) */}
        <FlashDeals deals={data.flashDeals} />

        {/* Vendor cards + community values */}
        <VendorShowcaseV2 vendors={data.vendors} />

        {/* QR Code, Voice, Delivery, Points strip */}
        <FeaturesBar />

        {/* Always-visible rewards/incentive section */}
        <RewardsPromo promotions={data.promotions} />
      </main>
    </EnhancedLayout>
  );
}
