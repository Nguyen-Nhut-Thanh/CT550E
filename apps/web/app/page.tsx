import SearchBar from "@/components/common/form_controls/SearchBar";
import AboutUsSection from "@/components/about/about_us/AboutUsSection";
import DomesticToursSection from "@/components/tour_cards/domestic/UserDomesticToursSection";
import FavoriteDestinationsSection from "@/components/locations/destinations/UserFavoriteDestinationsSection";
import FeaturedToursSection from "@/components/tour_cards/featured/UserFeaturedToursSection";
import FlashDealsSection from "@/components/tour_cards/flash_deal/UserFlashDealsSection";
import OutboundToursSection from "@/components/tour_cards/outbound/UserOutboundToursSection";
import HeroBanner from "@/components/banners/hero_banner/UserHeroBanner";
import WhyChooseSection from "@/components/about/why_choose_us/WhyChooseSection";
import { SeasonalHomeContainer } from "@/components/banners/seasonal_theme/UserSeasonalHomeContainer";
import { HomeVoucherSection } from "@/components/vouchers/home_vouchers/UserHomeVoucherSection";
import { getPublicBanners, getPublicHomeVouchers, getPublicSeasonalTheme } from "@/lib/home/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <OutboundToursSection />
      <FavoriteDestinationsSection />
      <FeaturedToursSection />
    </SeasonalHomeContainer>
  );
}

