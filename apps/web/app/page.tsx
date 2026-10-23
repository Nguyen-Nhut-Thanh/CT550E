import SearchBar from "@/components/common/SearchBar";
import AboutUsSection from "@/components/home/AboutUsSection";
import FavoriteDestinationsSection from "@/components/home/FavoriteDestinationsSection";
import FeaturedToursSection from "@/components/home/FeaturedToursSection";
import FlashDealsSection from "@/components/home/FlashDealsSection";
import HeroBanner from "@/components/home/HeroBanner";
import WhyChooseSection from "@/components/home/WhyChooseSection";
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

