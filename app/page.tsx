import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { getLandingPageData } from '@/lib/services/landing-data-service';
import LandingHero from '@/components/landing/LandingHero';
import PromoBundles from '@/components/landing/PromoBundles';
import FeaturesBar from '@/components/landing/FeaturesBar';
import CTABanners from '@/components/landing/CTABanners';
import CommunityStory from '@/components/landing/CommunityStory';
import Testimonials from '@/components/landing/Testimonials';
import RewardsPromo from '@/components/landing/RewardsPromo';
import FlashDeals from '@/components/landing/FlashDeals';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getLandingPageData();

  return (
    <EnhancedLayout>
      <main className="min-h-screen">
        {/* Hero: Clean headline + rotating hero image + stats */}
        <LandingHero
          featuredProducts={data.featuredProducts}
          vendors={data.vendors}
          stats={data.stats}
        />

        {/* Bundles — key value prop, right after hero */}
        <PromoBundles bundles={data.bundles} featuredProducts={data.featuredProducts} />

        {/* Flash deals with countdown (hidden if none) */}
        <FlashDeals deals={data.flashDeals} />

        {/* Trust strip: features with icons */}
        <FeaturesBar />

        {/* Shop / Become a Vendor / Become a Driver CTAs */}
        <CTABanners />

        {/* Community story: photo masonry, heritage narrative, value cards */}
        <CommunityStory />

        {/* Social proof: testimonials */}
        <Testimonials />

        {/* Always-visible rewards/incentive section */}
        <RewardsPromo promotions={data.promotions} />
      </main>
    </EnhancedLayout>
  );
}
