import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const benefits = [
  {
    title: "Tour được chọn lọc",
    description: "Lịch trình rõ ràng, minh bạch và phù hợp nhiều nhu cầu.",
    icon: Sparkles,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    title: "Tư vấn thông minh",
    description: "Gợi ý hành trình theo ngân sách và sở thích cá nhân.",
    icon: WandSparkles,
    iconClass: "bg-purple-50 text-purple-600",
  },
  {
    title: "Hỗ trợ tận tâm",
    description: "Đồng hành cùng bạn trong suốt hành trình.",
    icon: ShieldCheck,
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    title: "Trải nghiệm đa dạng",
    description: "Từ nghỉ dưỡng đến khám phá văn hóa bản địa.",
    icon: Globe2,
    iconClass: "bg-amber-50 text-amber-600",
  },
];

const primaryImage =
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85";
const secondaryImage =
  "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=700&q=85";

export default function AboutUsSection() {
  return (
    <section className="overflow-hidden bg-white px-4 pb-12 pt-16 sm:px-6 lg:px-20 lg:pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-red-50 px-4 py-1.5 text-[12px] font-black uppercase tracking-[2px] text-red-600">
              Về chúng tôi
            </span>
            <h2 className="text-[32px] font-black leading-[1.1] tracking-tight text-slate-900 md:text-[42px]">
              Kiến tạo những hành trình{" "}
              <span className="text-red-600">diệu kỳ</span> cho riêng bạn
            </h2>
            <p className="max-w-xl text-[16px] leading-relaxed text-slate-500">
              Chúng tôi không chỉ bán tour mà còn tạo ra những trải nghiệm đáng
              nhớ. Với hệ thống đặt tour thông minh và đội ngũ hỗ trợ tận tâm,
              Travol đồng hành cùng bạn trong mọi chuyến đi.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.title} className="group flex gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 ${benefit.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-slate-800">
                      {benefit.title}
                    </h3>
                    <p className="text-[13px] leading-normal text-slate-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/about"
            className="group inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-[14px] font-bold text-white transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-100 active:scale-95"
          >
            <span>Khám phá thêm về Travol</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative min-h-[500px]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-50 opacity-60 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-blue-50 opacity-60 blur-3xl" />

          <div className="relative grid grid-cols-12 items-center gap-4">
            <div className="relative z-10 col-span-8">
              <div className="rotate-[-2deg] overflow-hidden rounded-[40px] border-[8px] border-white shadow-2xl">
                <img
                  src={primaryImage}
                  alt="Trải nghiệm du lịch"
                  className="h-[450px] w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="translate-x-[-20px] translate-y-5 rotate-[4deg] overflow-hidden rounded-[30px] border-[6px] border-white shadow-xl">
                <img
                  src={secondaryImage}
                  alt="Điểm đến nổi bật"
                  className="h-[200px] w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="translate-x-[-40px] space-y-2 rounded-[30px] bg-red-600 p-6 text-white shadow-xl">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Sparkles key={index} className="h-3 w-3" fill="currentColor" />
                  ))}
                </div>
                <p className="text-[24px] font-black leading-none">10k+</p>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                  Khách hàng tin tưởng
                </p>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur-md md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900">Đã kiểm chứng</p>
                <p className="text-[11px] text-slate-500">100% tour chất lượng cao</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
