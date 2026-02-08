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
import CommunityStory from '@/components/landing/CommunityStory';
import Testimonials from '@/components/landing/Testimonials';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getLandingPageData();

  return (
    <EnhancedLayout>
      <main className="min-h-screen">
        {/* Hero: Gradient bg, bigger type, hero product spotlight, glass stats */}
        <LandingHero
          featuredProducts={data.featuredProducts}
          vendors={data.vendors}
          stats={data.stats}
        />

        {/* Category pills - horizontal scroll + tilt hover */}
        <FeaturedCategories categories={data.categories} />

        {/* Become a Vendor / Become a Driver CTAs + parallax images */}
        <CTABanners />

        {/* Promotional bundles or Popular This Week + tilt hover */}
        <PromoBundles bundles={data.bundles} featuredProducts={data.featuredProducts} />

        {/* Flash deals with countdown (hidden if none) */}
        <FlashDeals deals={data.flashDeals} />

        {/* Vendor cards + community values + tilt hover */}
        <VendorShowcaseV2 vendors={data.vendors} />

        {/* Community story: photo masonry, heritage narrative, value cards */}
        <CommunityStory />

        {/* Trust strip: 6 features with icons */}
        <FeaturesBar />

        {/* Always-visible rewards/incentive section */}
        <RewardsPromo promotions={data.promotions} />

        {/* Social proof: 6 testimonials */}
        <Testimonials />
      </main>
    </EnhancedLayout>
  );
}
