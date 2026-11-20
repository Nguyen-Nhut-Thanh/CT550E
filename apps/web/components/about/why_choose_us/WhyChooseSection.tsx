import { Gem, ShieldCheck, TicketPercent } from "lucide-react";
import { TopWaveDivider, BottomWaveDivider } from "@/components/common/dividers";
import WhyChooseBackdrop from "./WhyChooseBackdrop";
import WhyChooseCard from "./WhyChooseCard";

const WHY_CHOOSE_ITEMS = [
  {
    title: "An Toàn Tuyệt Đối",
    description: "Chúng tôi cam kết tiêu chuẩn an toàn cao nhất, đảm bảo mọi hành trình của bạn luôn được bảo vệ và hỗ trợ kịp thời.",
    icon: ShieldCheck,
    theme: "teal",
    tag: "HỖ TRỢ 24/7",
    benefits: [
      "Bảo hiểm du lịch toàn diện",
      "Đội ngũ cứu hộ & hỗ trợ 24/7",
      "Đối tác vận chuyển kiểm định nghiêm ngặt",
    ],
  },
  {
    title: "Dịch Vụ Đẳng Cấp",
    description: "Tận hưởng những dịch vụ cao cấp được thiết kế riêng biệt, mang lại sự thoải mái và hài lòng tối đa cho du khách.",
    icon: Gem,
    theme: "blue",
    tag: "CHUẨN 5 SAO",
    benefits: [
      "Lịch trình cá nhân hóa 1-1",
      "Lưu trú resort & khách sạn cao cấp",
      "Hướng dẫn viên bản địa chuyên nghiệp",
    ],
  },
  {
    title: "Tiết Kiệm Chi Phí",
    description: "Cung cấp mức giá cạnh tranh nhất cùng nhiều ưu đãi hấp dẫn giúp bạn có chuyến đi trong mơ với chi phí hợp lý.",
    icon: TicketPercent,
    theme: "gold",
    tag: "TIẾT KIỆM TỚI 30%",
    benefits: [
      "Cam kết giá tốt nhất thị trường",
      "Không phụ phí ẩn phát sinh",
      "Tích điểm & ưu đãi thành viên VIP",
    ],
  },
] as const;

export default function WhyChooseSection() {
  return (
    <section
      aria-labelledby="why-choose-heading"
      className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_72%_12%,#0d325c_0%,#071933_48%,#040b18_100%)] px-4 py-10 text-white sm:px-8 lg:px-14 lg:py-12"
    >
      <TopWaveDivider
        fillColor="#f7fcff"
        heightClassName="h-6 w-full sm:h-8 lg:h-10"
      />
      <WhyChooseBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="mb-10 sm:mb-12">
          <h2
            id="why-choose-heading"
            className="max-w-2xl text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-tight text-white"
          >
            Những lý do khiến bạn{" "}
            <span className="relative inline-block mt-1 sm:mt-0">
              <span className="font-serif italic bg-[linear-gradient(90deg,#5eead4_0%,#93c5fd_42%,#fcd34d_78%,#f59e0b_100%)] bg-clip-text text-transparent font-bold pr-1">
                tin tưởng chúng tôi
              </span>
              <span className="block w-full h-[3px] rounded-full bg-[linear-gradient(90deg,#2dd4bf_0%,#60a5fa_45%,#fbbf24_85%,#f59e0b_100%)] shadow-[0_0_12px_rgba(251,191,36,0.55)] mt-1"></span>
            </span>
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-12 pt-4 md:grid-cols-3 md:gap-6 lg:gap-8">
          {WHY_CHOOSE_ITEMS.map((item) => (
            <WhyChooseCard key={item.theme} {...item} />
          ))}
        </div>
      </div>
      <BottomWaveDivider
        fillColor="#eef8ff"
        heightClassName="h-6 w-full sm:h-8 lg:h-10"
      />
    </section>
  );
}
