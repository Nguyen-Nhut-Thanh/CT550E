import {
  AboutCtaSection,
  AboutHeroSection,
  AboutStatsSection,
  AboutStorySection,
  AboutValuesSection,
} from "@/components/about";

export const metadata = {
  title: "Về chúng tôi - JourniTrip",
  description:
    "Từ đam mê du lịch đến sứ mệnh kết nối thế giới. Khám phá câu chuyện, con người và những giá trị của JourniTrip.",
};

export default function AboutPage() {
  return (
    <div className="[--navy:#092c59] [--blue:#0064ff] [--teal:#0094a9] overflow-hidden bg-white text-[var(--navy)]">
      <AboutHeroSection />
      <AboutStorySection />
      <AboutStatsSection />
      <AboutValuesSection />
      <AboutCtaSection />
    </div>
  );
}
