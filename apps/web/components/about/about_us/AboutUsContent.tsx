"use client";

import {
  ArrowRight,
  Compass,
  HeartHandshake,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";

export const benefits = [
  {
    title: "Tour được chọn lọc",
    description: "Lịch trình rõ ràng, minh bạch và phù hợp nhiều nhu cầu.",
    icon: MapPinned,
    iconColor: "text-sky-300",
    glow: "from-sky-500/25 to-blue-600/25",
    border: "border-sky-400/40",
  },
  {
    title: "Tư vấn thông minh",
    description: "Gợi ý hành trình theo ngân sách và sở thích cá nhân.",
    icon: ShieldCheck,
    iconColor: "text-indigo-300",
    glow: "from-indigo-500/25 to-purple-600/25",
    border: "border-indigo-400/40",
  },
  {
    title: "Hỗ trợ tận tâm",
    description: "Đồng hành cùng bạn trong suốt hành trình.",
    icon: HeartHandshake,
    iconColor: "text-emerald-300",
    glow: "from-emerald-500/25 to-teal-600/25",
    border: "border-emerald-400/40",
  },
  {
    title: "Trải nghiệm đa dạng",
    description: "Từ nghỉ dưỡng đến khám phá văn hóa bản địa.",
    icon: Star,
    iconColor: "text-amber-300",
    glow: "from-amber-500/25 to-orange-600/25",
    border: "border-amber-400/40",
  },
];

function SparkleDecoration() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Sparkles className="about-twinkle absolute -left-7 -top-3 h-5 w-5 text-cyan-300" />
      <Sparkles className="about-twinkle-delayed absolute -right-6 -top-4 h-4 w-4 text-amber-300" />
      <span className="absolute -bottom-1 -left-3 h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_#7dd3fc]" />
    </span>
  );
}

interface AboutUsContentProps {
  activeFeature: number | null;
  onFeatureChange: (index: number | null) => void;
}

export function AboutUsContent({
  activeFeature,
  onFeatureChange,
}: AboutUsContentProps) {
  return (
    <div className="space-y-4 lg:col-span-6">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/35 bg-sky-950/70 px-4 py-1.5 shadow-[0_0_25px_rgba(34,211,238,.2)] backdrop-blur-md">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
          <Compass className="about-compass h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-[.14em] text-cyan-200">
          Về chúng tôi
        </span>
      </div>

      <h2 className="text-[28px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[32px] lg:text-[34px] xl:text-[36px]">
        Kiến tạo những hành trình{" "}
        <span className="relative inline-block">
          <SparkleDecoration />
          <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,.45)]">
            diệu kỳ
          </span>
        </span>{" "}
        cho riêng bạn
      </h2>

      <p className="max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-[17px]">
        Chúng tôi không chỉ bán tour mà còn tạo ra những trải nghiệm đáng nhớ.
        Với hệ thống đặt tour thông minh và đội ngũ hỗ trợ tận tâm,{" "}
        <span className="font-semibold text-white">JourniTrip</span> đồng hành
        cùng bạn trong mọi chuyến đi.
      </p>

      <div className="grid grid-cols-1 gap-x-4 gap-y-2 pt-1 sm:grid-cols-2">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          const isActive = activeFeature === index;
          return (
            <button
              key={benefit.title}
              type="button"
              aria-pressed={isActive}
              onMouseEnter={() => onFeatureChange(index)}
              onMouseLeave={() => onFeatureChange(null)}
              onFocus={() => onFeatureChange(index)}
              onBlur={() => onFeatureChange(null)}
              onClick={() => onFeatureChange(isActive ? null : index)}
              className={`group/card cursor-pointer rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                isActive
                  ? "-translate-y-0.5 border-cyan-400/45 bg-white/[.08] shadow-[0_10px_30px_rgba(6,182,212,.18)]"
                  : "border-white/10 bg-white/[.025] hover:border-white/20 hover:bg-white/[.06]"
              }`}
            >
              <span className="flex items-start gap-3.5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-gradient-to-br ${benefit.glow} ${benefit.border} transition-transform duration-300 group-hover/card:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${benefit.iconColor}`} />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-white transition-colors group-hover/card:text-cyan-200">
                    {benefit.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-300/80 sm:text-[13px]">
                    {benefit.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <Link
          href="/about"
          className="about-cta group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#2563eb] via-[#0ea5e9] to-[#22d3ee] px-6 py-4 text-sm font-bold text-white shadow-[0_10px_35px_rgba(14,165,233,.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_45px_rgba(34,211,238,.55)] active:translate-y-0 sm:px-7 sm:text-[15px]"
        >
          <span className="about-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <Plane className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span>Khám phá thêm về JourniTrip</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  );
}

export default AboutUsContent;

