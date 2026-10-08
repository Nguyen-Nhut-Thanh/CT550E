import {
  AboutUsSection,
  FavoriteDestinationsSection,
  FeaturedToursSection,
  FlashDealsSection,
  HeroBanner,
  SearchBar,
  WhyChooseSection,
} from "@/components/home";
import { getPublicBanners } from "@/lib/client/api/bannerApi";

export default async function HomePage() {
  const banners = await getPublicBanners();
  const seasonalShowcase = {
    showcase_id: 1,
    slug: "tan-cuong-mua-dong",
    eyebrow: "MÙA ĐÔNG · TÂN CƯƠNG",
    title: "Tân Cương mùa tuyết trắng",
    subtitle: "Hành trình chạm vào miền cổ tích phương Bắc",
    description:
      "Khám phá hồ Kanas, Altay và những ngôi làng Kazakh giữa khung cảnh tuyết trắng nguyên sơ.",
    image_urls: [
      "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1517825738774-7de9363ef735?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1548777123-4e8f7f1c8c2d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85",
    ],
    link_to: "/tours?location=tan-cuong",
    status: 1,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-white">
      <HeroBanner banners={banners} />
      <SearchBar />
      <AboutUsSection />
      {/* <SeasonalShowcase showcase={seasonalShowcase} /> */}
      <WhyChooseSection />
      <FlashDealsSection />
      <FavoriteDestinationsSection />
      <FeaturedToursSection />
    </main>
  );
}

