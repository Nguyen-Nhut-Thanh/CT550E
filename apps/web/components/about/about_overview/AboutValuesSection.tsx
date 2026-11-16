import Image from "next/image";
import { Globe2, Heart, Leaf, Quote, Send, ShieldCheck, Users } from "lucide-react";
import { Flight } from "@/components/about/about_overview/AboutHeroSection";

export const values = [
  {
    icon: ShieldCheck,
    title: "An toàn là ưu tiên",
    desc: "Luôn đặt sự an toàn của khách hàng lên hàng đầu trong mọi hành trình.",
  },
  {
    icon: Users,
    title: "Đội ngũ chuyên nghiệp",
    desc: "Hướng dẫn viên giàu kinh nghiệm, nhiệt tình, am hiểu văn hóa địa phương.",
  },
  {
    icon: Leaf,
    title: "Trải nghiệm độc đáo",
    desc: "Thiết kế tour riêng biệt, khám phá những điểm đến ít người biết đến.",
  },
  {
    icon: Heart,
    title: "Dịch vụ tận tâm",
    desc: "Hỗ trợ 24/7, đồng hành cùng bạn từ lúc đặt tour đến khi trở về.",
  },
  {
    icon: Globe2,
    title: "Kết nối bền vững",
    desc: "Góp phần phát triển du lịch có trách nhiệm với cộng đồng và môi trường.",
  },
];

export function AboutValuesSection() {
  return (
    <section
      id="gia-tri"
      className="relative scroll-mt-[95px] bg-[linear-gradient(125deg,#fff_40%,#e7f8ff)] pt-5 pb-[30px] min-[1500px]:pt-[30px] max-[700px]:pt-5"
      aria-labelledby="values-title"
    >
      <Flight className="top-0 left-[-30px] scale-[.8] max-[700px]:top-[-5px] max-[700px]:w-[140px] max-[700px]:opacity-50" />
      <div className="mx-auto w-[min(1180px,90%)]">
        <div className="text-center">
          <p className="mb-[13px] flex items-center gap-[9px] text-[10px]! font-extrabold tracking-[.17em] text-[var(--teal)] uppercase justify-center">
            Vì sao chọn JourniTrip
          </p>
          <h2
            id="values-title"
            className="font-extrabold tracking-[-.045em]! text-[clamp(26px,2.7vw,36px)] leading-[1.22]"
          >
            Giá trị chúng tôi mang lại
          </h2>
        </div>
        <div className="mt-[30px] grid grid-cols-[repeat(5,1fr)] max-[700px]:grid-cols-[repeat(2,1fr)] max-[700px]:gap-x-0 max-[700px]:gap-y-[27px]">
          {values.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="border-r border-[#e3edf4] px-[19px] text-center last:border-0 [&_p]:text-[12px] [&_p]:leading-[1.75] [&_p]:text-[#78879f] max-[1000px]:px-2.5 max-[700px]:px-[15px] max-[700px]:even:border-0 max-[700px]:last:col-span-full max-[700px]:last:max-w-[260px] max-[700px]:last:justify-self-center"
            >
              <span className="mx-auto mb-[17px] grid size-[68px] place-items-center rounded-full bg-[#e1f6f9] text-[#0099ae] max-[700px]:size-[60px]">
                <Icon size={31} strokeWidth={1.7} />
              </span>
              <h3 className="mb-[9px] text-[13px] font-extrabold tracking-[-.02em]! max-[1000px]:text-[12px] max-[700px]:text-[13px]">
                {title}
              </h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid grid-cols-[1.05fr_1fr] items-center gap-10 max-[1000px]:gap-5 max-[700px]:mt-[27px] max-[700px]:grid-cols-1 max-[700px]:gap-[15px]">
          <div className="relative h-[230px] -rotate-[3deg] overflow-hidden rounded-[60%_22%_47%_25%/25%_32%_22%_35%] border-8 border-white [&_img]:rotate-[3deg] [&_img]:scale-[1.06] [&_img]:object-[center_65%] max-[700px]:h-[220px]">
            <Image
              src="/images/about/hero-bay-traveler.png"
              alt="Tìm cảm hứng giữa thiên nhiên và những hành trình mới"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <blockquote className="relative m-0 rounded-3xl bg-[#ffffffed] px-[35px] py-[30px] [&>svg:first-child]:absolute [&>svg:first-child]:top-2.5 [&>svg:first-child]:left-5 [&>svg:first-child]:rotate-180 [&>svg:first-child]:text-[#8fc5ff] [&_p]:relative [&_p]:mt-[9px] [&_p]:mb-2.5 [&_p]:text-[15px] [&_p]:leading-[1.8] [&_p]:text-[#405779] [&_cite]:text-[12px] [&_cite]:text-[#244d6a] [&_cite]:not-italic max-[1000px]:p-7 max-[700px]:px-[25px] max-[700px]:py-[30px] max-[700px]:[&_p]:text-[14px]">
            <Quote aria-hidden="true" size={36} fill="currentColor" />
            <p>
              Chúng tôi tin rằng du lịch không chỉ giúp bạn nhìn thấy thế giới,
              mà còn giúp bạn nhìn thấy một phiên bản tốt hơn của chính mình.
            </p>
            <cite>— Đội ngũ JourniTrip</cite>
            <Send
              aria-hidden="true"
              className="absolute right-[-38px] bottom-[-12px] rotate-[8deg] text-[#00a1be] max-[700px]:right-[-8px] max-[700px]:bottom-[-16px] max-[700px]:w-[35px]"
              size={49}
              strokeWidth={1}
            />
          </blockquote>
        </div>
      </div>
    </section>
  );
}

