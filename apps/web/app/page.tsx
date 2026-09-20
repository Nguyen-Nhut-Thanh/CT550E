import HeroBanner from "@/components/home/Hero/HeroBanner";
import SearchBar from "@/components/home/SearchBar/SearchBar";
import AboutUsSection from "@/components/home/AboutUs/AboutUsSection";
import FlashDealsSection from "@/components/home/FlashDeals/FlashDealsSection";
import { getPublicBanners } from "@/lib/client/bannerApi";

export default async function HomePage() {
  const banners = await getPublicBanners();

  return (
    <main className="min-h-screen bg-white">
      <HeroBanner banners={banners} />
      <SearchBar />
      <AboutUsSection />
      <FlashDealsSection />
    </main>
  );
}
