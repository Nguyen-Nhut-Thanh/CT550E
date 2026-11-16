"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { BadgeCheck, Plane, Star } from "lucide-react";
import Image from "next/image";

const primaryImage = "/images/home/about-introduction-landscape.jpg";
const secondaryImage = "/images/home/about-introduction-city.jpg";

function CountUpMetric() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setCount(10);
      return;
    }

    let startTime: number | undefined;
    let frame = 0;
    const duration = 1800;
    const animate = (timestamp: number) => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 4)) * 10));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <>{count}k+</>;
}

interface AboutUsPhotoCollageProps {
  activeFeature: number | null;
}

export function AboutUsPhotoCollage({
  activeFeature,
}: AboutUsPhotoCollageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTilt({
      x:
        ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4,
      y: ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="[perspective:1000px] relative mx-auto w-full max-w-[580px] select-none"
    >
      <div
        className="[transform-style:preserve-3d] relative aspect-[1.12/1] transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        {/* Ánh sáng nền và các điểm sáng nhỏ quanh collage */}
        <div className="pointer-events-none absolute left-[15%] top-[15%] h-[70%] w-[70%] rounded-full bg-gradient-to-tr from-blue-500/30 via-cyan-400/20 to-indigo-400/30 blur-3xl" />
        <div className="about-float-slow pointer-events-none absolute left-[78%] top-[5%] h-8 w-8 rounded-full bg-emerald-300/40 blur-[3px] shadow-[0_0_20px_rgba(110,231,183,.45)]" />
        <span className="absolute left-[54%] top-[12%] h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_8px_#fff]" />
        <span className="absolute left-[91%] top-[16%] h-1.5 w-1.5 rounded-full bg-cyan-200/80 shadow-[0_0_8px_#bae6fd]" />

        {/* Các nét bay, bốn máy bay giấy và diều trên quỹ đạo riêng */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
          viewBox="0 0 580 518"
          fill="none"
        >
          <defs>
            <path
              id="about-collage-top-loop"
              d="M215 80c45-25 100-64 170-48s27 44 3 34-6-32 34-22 66 24 93 40"
            />
            <path
              id="about-collage-left-arc"
              d="M245 86c-70-41-167-31-209 39-24 40-14 100 6 143"
            />
            <path
              id="about-collage-bottom-arc"
              d="M52 385c-6 73 50 119 126 101 37-9 67-28 90-44"
            />
            <path
              id="about-collage-kite-orbit"
              d="M488 22c37-14 70 14 56 52-10 28-42 22-30-4 10-22 42-16 60 8"
            />
          </defs>
          <use
            href="#about-collage-top-loop"
            className="about-dash"
            stroke="rgba(255,255,255,.62)"
            strokeWidth="1.6"
            strokeDasharray="4 5"
          />
          <use
            href="#about-collage-left-arc"
            className="about-dash"
            stroke="rgba(186,230,253,.45)"
            strokeWidth="1.4"
            strokeDasharray="3.5 5.5"
          />
          <use
            href="#about-collage-bottom-arc"
            className="about-dash"
            stroke="rgba(255,255,255,.55)"
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
          <use
            href="#about-collage-kite-orbit"
            className="about-dash"
            stroke="rgba(125,211,252,.48)"
            strokeWidth="1.3"
            strokeDasharray="3 5"
          />
          <g>
            <g transform="translate(-18 -13)">
              <path d="m0 5 36 9-24 10 3-9L0 5Z" fill="#fff" />
              <path d="m36 14-21 1 2 10 19-11Z" fill="#cbd5e1" />
              <path d="m12 24 3-10 2 11-5-1Z" fill="#94a3b8" />
            </g>
            <animateMotion dur="9.5s" repeatCount="indefinite" rotate="auto">
              <mpath href="#about-collage-top-loop" />
            </animateMotion>
          </g>
          <g>
            <g transform="translate(-15 -11)">
              <path d="m0 4 30 8-20 8 2-7L0 4Z" fill="#e0f2fe" />
              <path d="m30 12-18 1 2 8 16-9Z" fill="#7dd3fc" />
              <path d="m10 20 2-7 2 8-4-1Z" fill="#38bdf8" />
            </g>
            <animateMotion
              dur="9.5s"
              begin="-4.75s"
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href="#about-collage-top-loop" />
            </animateMotion>
          </g>
          <g>
            <g transform="translate(-16 -11)">
              <path d="m0 4 32 8-21 9 2-8L0 4Z" fill="#fff" />
              <path d="m32 12-19 1 2 9 17-10Z" fill="#cbd5e1" />
              <path d="m11 21 2-8 2 9-4-1Z" fill="#94a3b8" />
            </g>
            <animateMotion dur="8.5s" repeatCount="indefinite" rotate="auto">
              <mpath href="#about-collage-left-arc" />
            </animateMotion>
          </g>
          <g>
            <g transform="translate(-16 -11)">
              <path d="m0 4 32 8-21 9 2-8L0 4Z" fill="#fff" />
              <path d="m32 12-19 1 2 9 17-10Z" fill="#cbd5e1" />
              <path d="m11 21 2-8 2 9-4-1Z" fill="#94a3b8" />
            </g>
            <animateMotion dur="7.5s" repeatCount="indefinite" rotate="auto">
              <mpath href="#about-collage-bottom-arc" />
            </animateMotion>
          </g>
          <g>
            <g transform="translate(-12 -16) rotate(35)">
              <path
                d="m12 0 11 12-11 16L1 12 12 0Z"
                fill="rgba(56,189,248,.38)"
                stroke="#bae6fd"
                strokeWidth="1.5"
              />
              <path
                d="M12 0v28M1 12q11-4 22 0M12 28q-5 9 2 17t-4 15"
                stroke="#fff"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path d="m8 39 6 2-6 2 6-2Zm1 11 6 2-6 2 6-2Z" fill="#fde047" />
            </g>
            <animateMotion
              dur="11s"
              repeatCount="indefinite"
              keyPoints="0;1;0"
              keyTimes="0;.5;1"
              calcMode="spline"
              keySplines=".45 0 .55 1;.45 0 .55 1"
            >
              <mpath href="#about-collage-kite-orbit" />
            </animateMotion>
          </g>
        </svg>

        {/* Diều thứ hai lượn quanh thẻ khách hàng ở góc dưới */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30"
        >
          <div className="about-kite-runner">
            <svg
              className="h-14 w-8 overflow-visible drop-shadow-[0_0_10px_rgba(56,189,248,.65)]"
              viewBox="0 0 32 64"
              fill="none"
            >
              <path
                d="m16 2 13 14-13 18L3 16 16 2Z"
                fill="rgba(34,211,238,.35)"
                stroke="#a5f3fc"
                strokeWidth="1.6"
              />
              <path
                d="M16 2v32M3 16q13-5 26 0M16 34q-6 10 2 18t-4 12"
                stroke="#fff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path d="m11 45 7 2-7 2 7-2Zm2 10 7 2-7 2 7-2Z" fill="#facc15" />
            </svg>
          </div>
        </div>

        <div
          className="about-float pointer-events-none absolute left-[88.5%] top-[22%] z-30 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,.85)]"
          aria-hidden="true"
        >
          <Plane className="h-6 w-6 -rotate-12 stroke-[2]" />
        </div>

        {/* Ảnh chính: lớn, lệch nhẹ, nằm phía sau các thẻ */}
        <div
          className={`absolute left-[11%] top-[13%] z-10 h-[76%] w-[56%] -rotate-[3.5deg] rounded-[28px] border-[3px] bg-white/10 p-[2.5px] shadow-[0_25px_60px_rgba(6,14,38,.65)] transition-all duration-500 sm:rounded-[30px] ${
            activeFeature === 0
              ? "scale-[1.015] border-cyan-300 shadow-[0_0_40px_rgba(56,189,248,.5)]"
              : "border-white/40"
          }`}
        >
          <div className="group relative h-full w-full overflow-hidden rounded-[22px] sm:rounded-[26px]">
            <Image
              src={primaryImage}
              alt="Vẻ đẹp Vịnh Hạ Long cùng JourniTrip"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 50vw, 325px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051025]/65 via-transparent to-cyan-300/10" />
            <span className="absolute bottom-3.5 left-4 z-10 text-[10px] font-medium tracking-wide text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,.85)] sm:text-[11px]">
              Vietnam&apos;s beauties
            </span>
          </div>
        </div>

        <div className="about-float-slow pointer-events-none absolute left-[4.2%] top-[59.5%] z-20 aspect-square w-[13.5%] rounded-full bg-gradient-to-tr from-blue-700/90 via-sky-400/90 to-sky-100 shadow-[0_0_28px_rgba(56,189,248,.55)]" />

        {/* Ảnh phụ trên phải */}
        <div
          className={`absolute left-[57.5%] top-[20.5%] z-10 h-[36.5%] w-[31%] rotate-[2.5deg] rounded-[23px] border-[2.5px] bg-white/10 p-[2px] shadow-[0_18px_40px_rgba(6,14,38,.55)] transition-all duration-500 sm:rounded-[25px] ${
            activeFeature === 1
              ? "scale-[1.03] border-indigo-300 shadow-[0_0_32px_rgba(129,140,248,.5)]"
              : "border-white/45"
          }`}
        >
          <div className="group relative h-full w-full overflow-hidden rounded-[19px] sm:rounded-[21px]">
            <Image
              src={secondaryImage}
              alt="Điểm đến thành phố nổi bật"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 1024px) 28vw, 180px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
          </div>
        </div>

        {/* Ảnh vuông nhỏ bên phải */}
        <div
          className={`absolute left-[78.5%] top-[50.5%] z-20 aspect-square w-[15.5%] rotate-[3deg] rounded-[17px] border-2 bg-white/15 p-[1.5px] shadow-[0_14px_30px_rgba(6,14,38,.6)] transition-all duration-500 sm:rounded-[18px] ${
            activeFeature === 3
              ? "scale-[1.05] border-amber-300 shadow-[0_0_25px_rgba(251,191,36,.5)]"
              : "border-white/50"
          }`}
        >
          <div className="group relative h-full w-full overflow-hidden rounded-[13px] sm:rounded-[15px]">
            <Image
              src="/images/shared/default-tour-beach.jpg"
              alt="Bãi biển nhiệt đới"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="100px"
            />
          </div>
        </div>

        {/* Thẻ xác nhận ở giữa chồng lên hai ảnh */}
        <div
          className={`absolute left-[41%] top-[49%] z-30 flex w-[41%] items-center gap-2.5 rounded-[18px] border bg-gradient-to-r from-white/90 via-white/80 to-white/65 px-3 py-2.5 shadow-[0_16px_36px_rgba(6,14,38,.45)] backdrop-blur-xl transition-all duration-500 sm:gap-3.5 sm:rounded-[20px] sm:px-4 sm:py-3 ${
            activeFeature === 2
              ? "scale-[1.03] border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,.55)]"
              : "border-white/50"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,.65)] sm:h-10 sm:w-10">
            <BadgeCheck className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight text-slate-900 sm:text-[14px]">
              Đã kiểm chứng
            </p>
            <p className="mt-0.5 truncate text-[9px] font-medium text-slate-700 sm:text-[11px]">
              100% tour chất lượng cao
            </p>
          </div>
        </div>

        {/* Ảnh ngang nhỏ chồng mép dưới ảnh lớn */}
        <div
          className={`absolute left-[33%] top-[81%] z-30 h-[14.5%] w-[24.5%] overflow-hidden rounded-[14px] border-2 shadow-[0_14px_32px_rgba(6,14,38,.65)] transition-all duration-500 sm:rounded-[16px] ${
            activeFeature === 3
              ? "scale-[1.04] border-amber-300 shadow-[0_0_26px_rgba(251,191,36,.5)]"
              : "border-white/45"
          }`}
        >
          <div className="group relative h-full w-full">
            <Image
              src="/images/blog/featured-da-nang.jpg"
              alt="Khám phá Đà Nẵng"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="145px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
            <span className="absolute inset-x-1 bottom-1 truncate text-center text-[9px] font-medium tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.95)] sm:bottom-1.5 sm:text-[10px]">
              Cầu Vàng, Đà Nẵng
            </span>
          </div>
        </div>

        {/* Thẻ 10k+ ở góc dưới phải */}
        <div className="absolute left-[62.5%] top-[67%] z-30 flex h-[23.5%] w-[27%] flex-col justify-center overflow-hidden rounded-[20px] border border-cyan-300/45 bg-gradient-to-br from-[#2b86ff] via-[#1264f2] to-[#0846c4] p-3 text-white shadow-[0_20px_45px_rgba(18,100,242,.55),inset_0_1px_1px_rgba(255,255,255,.45)] sm:rounded-[22px] sm:p-4">
          <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-cyan-300/35 blur-xl" />
          <span className="about-ping absolute right-[16%] top-[26%] h-1 w-1 rounded-full bg-white shadow-[0_0_8px_#fff]" />
          <span className="absolute right-[26%] top-[48%] h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_8px_#bae6fd]" />
          <svg
            aria-hidden="true"
            className="about-twinkle-delayed pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 text-white/80"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1 14.5 9.5 23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5L12 1Z" />
          </svg>
          <div className="relative mb-1 flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-2.5 w-2.5 fill-[#facc15] text-[#facc15] drop-shadow-[0_0_5px_rgba(250,204,21,.75)] sm:h-3.5 sm:w-3.5"
              />
            ))}
          </div>
          <div className="relative text-xl font-extrabold leading-none tracking-tight sm:text-[28px]">
            <CountUpMetric />
          </div>
          <p className="relative mt-1 text-[8px] font-bold uppercase leading-tight tracking-wider text-blue-50/95 sm:text-[10px]">
            Khách hàng tin tưởng
          </p>
        </div>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-[82.5%] top-[85%] z-20 h-7 w-7 text-white/25 sm:h-8 sm:w-8"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0 14.8 9.2 24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8L12 0Z" />
        </svg>
        <div className="pointer-events-none absolute left-[80%] top-[90.5%] z-20 text-xs font-semibold italic leading-tight tracking-tight text-sky-200/75 sm:text-sm">
          <div>Go</div>
          <div className="flex items-center gap-0.5">
            <span>Further</span>
            <span className="text-[11px] not-italic">↗</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPhotoCollage;

