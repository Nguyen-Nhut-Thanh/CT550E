import SearchBar from "@/components/common/search/SearchBar";
import AboutUsSection from "@/components/home/about/AboutUsSection";
import DomesticToursSection from "@/components/home/domestic-tours/DomesticToursSection";
import FavoriteDestinationsSection from "@/components/home/destinations/FavoriteDestinationsSection";
import FeaturedToursSection from "@/components/home/featured-tours/FeaturedToursSection";
import FlashDealsSection from "@/components/home/flash-deals/FlashDealsSection";
import InternationalToursSection from "@/components/home/international-tours/InternationalToursSection";
import HeroBanner from "@/components/home/hero/HeroBanner";
import WhyChooseSection from "@/components/home/why-choose/WhyChooseSection";
import { SeasonalHomeContainer } from "@/components/home/seasonal";
import { HomeVoucherSection } from "@/components/home/vouchers";
import { getPublicBanners, getPublicHomeVouchers, getPublicSeasonalTheme } from "@/lib/home/api";

export default async function HomePage() {
  const [banners, seasonalConfig, homeVouchersData] = await Promise.all([
    getPublicBanners(),
    getPublicSeasonalTheme(),
    getPublicHomeVouchers(),
  ]);

  return (
    <SeasonalHomeContainer initialConfig={seasonalConfig}>
      <HeroBanner banners={banners} />
      <SearchBar />
      <HomeVoucherSection initialData={homeVouchersData} />
      <DomesticToursSection />
      <AboutUsSection />
      <WhyChooseSection />
      <FlashDealsSection />
      <InternationalToursSection />
      <FavoriteDestinationsSection />
      <FeaturedToursSection />
    </SeasonalHomeContainer>
  );
}

