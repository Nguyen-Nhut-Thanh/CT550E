import { Sparkles } from "lucide-react";
import WhyChooseCard from "./WhyChooseCard";

const WHY_CHOOSE_ITEMS = [
  {
    title: "An Toàn Tuyệt Đối",
    description:
      "Chúng tôi cam kết tiêu chuẩn an toàn cao nhất, đảm bảo mọi hành trình của bạn luôn được bảo vệ và hỗ trợ kịp thời.",
    icon: "https://cdn-icons-png.flaticon.com/512/784/784306.png",
    rotate: "-rotate-[15deg]",
  },
  {
    title: "Dịch Vụ Đẳng Cấp",
    description:
      "Tận hưởng những dịch vụ cao cấp được thiết kế riêng biệt, mang lại sự thoải mái và hài lòng tối đa cho du khách.",
    icon: "https://cdn-icons-png.flaticon.com/512/1042/1042339.png",
    rotate: "rotate-[10deg]",
  },
  {
    title: "Tiết Kiệm Chi Phí",
    description:
      "Cung cấp mức giá cạnh tranh nhất cùng nhiều ưu đãi hấp dẫn giúp bạn có chuyến đi trong mơ với chi phí hợp lý.",
    icon: "https://cdn-icons-png.flaticon.com/512/2721/2721091.png",
    rotate: "",
  },
];

export default function WhyChooseSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#f7fcff] px-4 py-20 sm:px-6 lg:px-10 xl:px-20"
      style={{
        backgroundImage: "url('/images/why-choose-bg.png')",
        backgroundRepeat: "no-repeat",

        // Cắt phần trời phía trên,
        // kéo phần phong cảnh phía dưới lên gần nội dung hơn
        backgroundSize: "100% 145%",
        backgroundPosition: "center 72%",
      }}
    >
      {/* Làm nền dịu hơn */}
      <div className="pointer-events-none absolute inset-0 bg-white/40" />

      <div className="relative z-10 mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="mb-14 max-w-3xl text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100/70 px-5 py-2">
            <Sparkles className="h-4 w-4 text-amber-400" />

            <span className="text-xs font-black uppercase tracking-[0.16em] text-sky-500">
              Tại sao nên chọn JourniTrip
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#123d78] md:text-4xl">
            Những lý do khiến bạn{" "}
            <span className="relative inline-block font-serif italic text-sky-500">
              tin tưởng chúng tôi

              <span className="absolute -bottom-2 left-0 h-[3px] w-full rotate-[-1deg] rounded-full bg-amber-400" />
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
            Chúng tôi cam kết mang đến trải nghiệm du lịch an toàn, tiện lợi và
            đáng nhớ với những dịch vụ chất lượng nhất.
          </p>
        </div>

        {/* 3 ITEMS - KHÔNG CÓ CARD BACKGROUND */}
        <div className="relative grid grid-cols-1 gap-10 pb-10 md:grid-cols-3 md:gap-12">
          {WHY_CHOOSE_ITEMS.map((item, index) => (
            <div
              key={index}
              className="flex justify-center"
            >
              <WhyChooseCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                rotate={item.rotate}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}