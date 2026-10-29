import SearchBar from "@/components/common/search/SearchBar";
import AboutUsSection from "@/components/home/about/AboutUsSection";
import FavoriteDestinationsSection from "@/components/home/destinations/FavoriteDestinationsSection";
import FeaturedToursSection from "@/components/home/featured-tours/FeaturedToursSection";
import FlashDealsSection from "@/components/home/flash-deals/FlashDealsSection";
import HeroBanner from "@/components/home/hero/HeroBanner";
import WhyChooseSection from "@/components/home/why-choose/WhyChooseSection";
import { getPublicBanners } from "@/lib/home/api";

export default async function HomePage() {
  const banners = await getPublicBanners();

  return (
    <main className="min-h-screen bg-white">
      <HeroBanner banners={banners} />
      <SearchBar />
      <AboutUsSection />
      <WhyChooseSection />
      <FlashDealsSection />
      <FavoriteDestinationsSection />
      <FeaturedToursSection />
    </main>
  );
}

