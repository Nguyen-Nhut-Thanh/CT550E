import Image from "next/image";
import { ArrowRight, Plane } from "lucide-react";

export function Wave({ top = false }: { top?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={
        top
          ? "pointer-events-none absolute top-[-1px] bottom-auto rotate-180 left-0 z-[3] h-[58px] w-full text-white"
          : "pointer-events-none absolute bottom-[-1px] left-0 z-[3] h-[58px] w-full text-white"
      }
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <path
        d="M0 62C175-12 255 118 500 58S758 28 946 55s306-61 494-16v61H0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Flight({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute h-[120px] w-[230px] text-[#75ceff] [&_svg:first-child]:h-full [&_svg:first-child]:w-full [&>svg:last-child]:absolute [&>svg:last-child]:top-px [&>svg:last-child]:right-[7px] [&>svg:last-child]:rotate-12 ${className}`}
    >
      <svg viewBox="0 0 260 130" fill="none">
        <path
          d="M0 115C40 100 100 60 104 90s-52 19-21-19S170 51 235 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="7 7"
          strokeLinecap="round"
        />
      </svg>
      <Plane size={34} fill="currentColor" strokeWidth={1} />
    </div>
  );
}

export function AboutHeroSection() {
  return (
    <section
      className="relative min-h-[440px] bg-[linear-gradient(115deg,#edfaff,#dff5ff_60%,#b4e0fa)] min-[1500px]:min-h-[520px] max-[700px]:flex max-[700px]:min-h-0 max-[700px]:flex-col max-[700px]:pb-0 max-[700px]:[&>svg]:h-[35px]"
      aria-labelledby="about-title"
    >
      <div className="absolute inset-y-0 right-0 left-[43%] overflow-hidden rounded-[42%_0_0_19%/55%_0_0_40%] [&_img]:object-[68%_center] min-[1500px]:left-[45%] max-[1000px]:left-[40%] min-[701px]:max-[1000px]:left-[45%] max-[700px]:relative max-[700px]:inset-auto max-[700px]:order-1 max-[700px]:h-[275px] max-[700px]:w-full max-[700px]:rounded-[38%_0_0_0/20%_0_0_0] max-[700px]:[&_img]:object-[center_52%]">
        <Image
          src="/images/about/hero-bay-traveler.png"
          alt="Du khách dang tay đón hành trình khám phá vịnh Hạ Long"
          fill
          priority
          sizes="(max-width: 700px) 100vw, 60vw"
          className="object-cover"
        />
        <span className="[font-family:'Caveat',cursive] text-[32px] font-bold leading-[1.05] absolute bottom-[85px] left-[13%] -rotate-12 text-white [text-shadow:0_2px_12px_#18456c44] max-[700px]:bottom-[55px] max-[700px]:left-[8%] max-[700px]:text-[28px]">
          JourniTrip More
          <br />
          Live Brighter ♡
        </span>
      </div>
      <Flight className="top-[21px] left-[33%] z-[2] max-[1000px]:left-[29%] max-[1000px]:scale-[.8] min-[701px]:max-[1000px]:left-[31%] max-[700px]:top-2 max-[700px]:right-0 max-[700px]:left-auto max-[700px]:w-[150px] max-[700px]:opacity-[.65]" />
      <div className="mx-auto w-[min(1180px,90%)] pointer-events-none relative py-0 pt-[62px] pb-[84px] [&>*]:pointer-events-auto min-[1500px]:pt-[90px] min-[1500px]:pb-[110px] max-[700px]:order-0 max-[700px]:pt-[38px] max-[700px]:pb-[27px]">
        <p className="mb-[13px] flex items-center gap-[9px] text-[10px]! font-extrabold tracking-[.17em] text-[var(--teal)] uppercase max-w-[420px] max-[1000px]:max-w-[350px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-full before:h-px before:w-6 before:bg-[var(--teal)] before:content-[''] after:h-px after:w-6 after:bg-[var(--teal)] after:content-['']">
          Về chúng tôi
        </p>
        <h1
          id="about-title"
          className="font-extrabold tracking-[-.045em]! max-w-[420px] max-[1000px]:max-w-[350px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-full mb-[18px] text-[clamp(42px,4.8vw,64px)] leading-[1.03] max-[700px]:text-[46px]"
        >
          Chúng tôi là
          <br />
          JourniTrip
        </h1>
        <p className="mb-5 max-w-[390px] text-[16px] leading-[1.65] text-[#405779] max-[1000px]:max-w-[350px] max-[1000px]:text-[14px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-[400px]">
          Đồng hành cùng bạn trên mọi hành trình khám phá thế giới, mang đến
          những trải nghiệm du lịch đáng nhớ và ý nghĩa.
        </p>
        <a
          href="#cau-chuyen"
          className="inline-flex items-center justify-center gap-3 rounded-[40px] bg-[var(--blue)] px-[25px] py-[13px] text-[12px] font-[750] text-white no-underline shadow-[0_7px_16px_#0064ff26] transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-[#004ed1] focus-visible:outline-[3px] focus-visible:outline-[#04acc1] focus-visible:outline-offset-[5px] max-[700px]:px-[19px] max-[700px]:py-3 max-[700px]:text-[11px] motion-reduce:transition-none max-w-[420px] max-[1000px]:max-w-[350px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-full min-[701px]:max-[1000px]:max-w-[340px]! min-[701px]:max-[1000px]:px-5 min-[701px]:max-[1000px]:text-[11px]"
        >
          Khám phá câu chuyện của chúng tôi <ArrowRight size={17} />
        </a>
      </div>
      <Wave />
    </section>
  );
}

