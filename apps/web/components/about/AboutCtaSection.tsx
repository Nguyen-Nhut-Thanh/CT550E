import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wave } from "./AboutHeroSection";

export function AboutCtaSection() {
  return (
    <section
      className="relative isolate min-h-[300px] [&>img]:-z-[2] [&>img]:object-[center_62%] max-[700px]:min-h-[390px] max-[700px]:[&>svg]:h-[28px]"
      aria-labelledby="cta-title"
    >
      <Image
        src="/images/about/travel-dreams-banner.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 -z-[1] bg-[linear-gradient(#effaffee,#e8f6ffb0_58%,#e7f6ff18)]" />
      <Wave top />
      <div className="mx-auto w-[min(1180px,90%)] relative px-[110px] pt-[65px] pb-20 text-center [&>p]:mb-[5px] [&>p]:text-[18px] [&>span]:mt-2.5 [&>span]:mb-[19px] [&>span]:block [&>span]:text-[12px] [&>span]:text-[#637b98] max-[1000px]:px-[90px] max-[700px]:px-0 max-[700px]:pt-[66px] max-[700px]:pb-[135px] max-[700px]:[&>p]:text-[17px] max-[700px]:[&>span]:mx-auto max-[700px]:[&>span]:mt-3 max-[700px]:[&>span]:mb-5 max-[700px]:[&>span]:max-w-[300px] max-[700px]:[&>span]:leading-[1.7]">
        <p>Hãy cùng chúng tôi</p>
        <h2
          id="cta-title"
          className="font-extrabold tracking-[-.045em]! text-[clamp(24px,2.3vw,31px)] leading-[1.22] max-[700px]:text-[27px]"
        >
          biến những ước mơ du lịch thành hiện thực
        </h2>
        <span>
          Khám phá thế giới, tạo nên những hành trình đáng nhớ cùng JourniTrip.
        </span>
        <Link
          href="/tours"
          className="inline-flex items-center justify-center gap-3 rounded-[40px] bg-[var(--blue)] px-[25px] py-[13px] text-[12px] font-[750] text-white no-underline shadow-[0_7px_16px_#0064ff26] transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-[#004ed1] focus-visible:outline-[3px] focus-visible:outline-[#04acc1] focus-visible:outline-offset-[5px] max-[700px]:px-[19px] max-[700px]:py-3 max-[700px]:text-[11px] motion-reduce:transition-none"
        >
          Khám phá tour ngay <ArrowRight size={17} />
        </Link>
      </div>
      <div
        aria-hidden="true"
        className="absolute right-[5%] bottom-[5px] flex rotate-[6deg] flex-col items-center gap-1.5 pb-[18px] before:absolute before:inset-y-0 before:-z-[1] before:w-[9px] before:bg-[#80604a] before:content-[''] [&_span]:min-w-[118px] [&_span]:bg-[linear-gradient(10deg,#b5916d,#e7c9a1_55%,#bd9671)] [&_span]:px-4 [&_span]:py-[7px] [&_span]:text-center [&_span]:text-[14px] [&_span]:font-semibold [&_span]:text-[#5b422e] [&_span]:shadow-[1px_3px_4px_#49372233] [&_span]:[clip-path:polygon(7%_0,100%_0,96%_80%,0_100%,0_20%)] [&_span:nth-child(even)]:-rotate-[9deg] max-[1000px]:right-[2%] max-[1000px]:origin-bottom-right max-[1000px]:scale-[.8] max-[700px]:scale-[.65]"
      >
        <span>New Places</span>
        <span>New Friends</span>
        <span>New Stories</span>
        <span>
          Same You
          <br />
          Happier
        </span>
      </div>
    </section>
  );
}

