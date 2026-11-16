import Image from "next/image";
import { BriefcaseBusiness, MapPin, Star, Users } from "lucide-react";
import { Wave } from "@/components/about/about_overview/AboutHeroSection";

export const stats = [
  {
    icon: BriefcaseBusiness,
    value: "10+",
    label: "Năm kinh nghiệm\ntrong ngành du lịch",
  },
  { icon: Users, value: "50.000+", label: "Khách hàng\nđã đồng hành" },
  { icon: MapPin, value: "1.000+", label: "Tour trong nước\nvà quốc tế" },
  { icon: Star, value: "100%", label: "Khách hàng hài lòng\nvới dịch vụ" },
];

export function AboutStatsSection() {
  return (
    <section
      className="relative isolate min-h-[390px] bg-[#ddf5ff] min-[1500px]:min-h-[450px] max-[700px]:min-h-0 max-[700px]:[&>svg]:h-[30px]"
      aria-labelledby="stats-title"
    >
      <Image
        src="/images/about/hero-bay-traveler.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-[2] object-cover object-[center_58%]"
      />
      <div className="absolute inset-0 -z-[1] [background:linear-gradient(90deg,#dbf4fff5_0%,#e5f7fff2_34%,#e8f7ffb0_58%,#c5edff10_85%)] max-[700px]:[background:#e1f5ffdb]" />
      <Wave top />
      <div className="mx-auto w-[min(1180px,90%)] pt-[88px] pb-[85px] [&>p]:mt-[9px] [&>p]:text-[13px] [&>p]:text-[#687e9b] min-[1500px]:py-[105px] max-[700px]:pt-[65px] max-[700px]:pb-[70px]">
        <h2
          id="stats-title"
          className="font-extrabold tracking-[-.045em]! text-[clamp(26px,2.7vw,36px)] leading-[1.22] max-[700px]:text-[26px]"
        >
          Những con số biết nói
        </h2>
        <p>Sự tin tưởng của bạn là động lực để chúng tôi không ngừng phát triển.</p>
        <div className="mt-[25px] grid max-w-[760px] grid-cols-[repeat(4,1fr)] gap-[14px] max-[1000px]:max-w-[72%] max-[1000px]:gap-2.5 max-[700px]:mt-[22px] max-[700px]:max-w-full max-[700px]:grid-cols-[repeat(2,1fr)] max-[700px]:gap-3">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={value}
              className="rounded-[17px] bg-[#ffffffdc] px-2.5 pt-[17px] pb-5 text-center backdrop-blur-[6px] [&>span]:mx-auto [&>span]:mb-2.5 [&>span]:grid [&>span]:size-[43px] [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-[#ddf4ff] [&>span]:text-[#0099ff] [&_strong]:text-[29px] [&_strong]:leading-[1.4] [&_strong]:tracking-[-.04em] [&_p]:mt-1 [&_p]:text-[12px] [&_p]:leading-[1.65] [&_p]:whitespace-pre-line [&_p]:text-[#71829c] max-[1000px]:[&_strong]:text-[25px] max-[1000px]:[&_p]:text-[11px] max-[700px]:px-2 max-[700px]:py-4 max-[700px]:[&_p]:text-[12px]"
            >
              <span>
                <Icon size={27} strokeWidth={1.7} />
              </span>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
      <span className="[font-family:'Caveat',cursive] text-[32px] font-bold leading-[1.05] absolute top-[110px] right-[6%] -rotate-12 text-white [text-shadow:0_2px_9px_#12496d66] max-[700px]:hidden">
        Good Trips
        <br />
        Better People ♡
      </span>
      <Wave />
    </section>
  );
}

